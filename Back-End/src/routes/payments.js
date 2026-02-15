const express = require("express");
const { Op } = require("sequelize");
const Stripe = require('stripe');
const {
  Payment,
  Cart,
  CartItem,
  Order,
  OrderItem, // Add this if missing
  ProductVariety,
  Product, // Add this missing import
  sequelize,
  User,
} = require("../models"); 
const { auth } = require("../middleware/auth");
const { sendOrderConfirmationEmail } = require("../Services/Email/emailService");

const router = express.Router();

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});


router.post("/createPaymentIntent", auth, async (req, res) => {
  console.log('Create payment intent request body:', req.body);
  const transaction = await sequelize.transaction();
  try {
    const { amount, metadata = {}, cartId, deliveryInfo = {} } = req.body;
    const currency = 'lkr';
    const userId = req.user.id;

    const actualDeliveryInfo = deliveryInfo.deliveryInfo || deliveryInfo;

    const validationErrors = validatePaymentRequest({
      ...req.body,
      deliveryInfo: actualDeliveryInfo
    });
    if (validationErrors.length > 0) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Validation failed', errors: validationErrors });
    }

    const cart = await Cart.findOne({
      where: { id: cartId, userId, status: 'pending' },
      transaction
    });
    if (!cart) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Cart not found or not pending' });
    }

    // Amount comes from client in minor units (cents/paisa) - e.g., 3607500 for 36075.00 LKR
    if (typeof amount !== 'number' || amount <= 0) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }
    
    // Convert from minor units to major units for database storage
    const amountInMajorUnits = amount / 100;
    
    //Since testing account set lower amount for Stripe
    let update_amount = 998;
    const stripeAmount = Math.round(update_amount * 100); // to minor units

    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: stripeAmount,
        currency,
        metadata: {
          ...metadata,
          userId: userId.toString(),
          cartId: cartId.toString(),
          orderType: 'ecommerce',
          environment: process.env.NODE_ENV || 'development'
        },
        automatic_payment_methods: { enabled: true },
        description: `E-commerce payment for cart ${cartId}`,
        receipt_email: req.user.email || undefined,
      });
    } catch (e) {
      await transaction.rollback();
      console.error('Stripe PI create error:', e);
      return res.status(500).json({ success: false, message: 'Payment service error' });
    }

    console.log('actualDeliveryInfo being saved:', actualDeliveryInfo);
    console.log('Full metadata being saved:', {
      ...metadata,
      deliveryInfo: actualDeliveryInfo,
      reservedAt: new Date().toISOString()
    });

    const payment = await Payment.create({
      userId,
      cartId,
      stripePaymentIntentId: paymentIntent.id,
      amount: amountInMajorUnits,  // Store in major units (e.g., 36075.00)
      currency,
      status: 'pending',
      metadata: JSON.stringify({
        ...metadata,
        deliveryInfo: actualDeliveryInfo,
        reservedAt: new Date().toISOString()
      })
    }, { transaction });

    await cart.update({
      status: 'processing',   // NOT completed yet
      processingStartedAt: new Date()
    }, { transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amountInMajorUnits,  // Return in major units
        currency,
        paymentId: payment.id,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      },
      message: 'Payment intent created successfully'
    });
  } catch (error) {
    try { if (transaction && !transaction.finished) await transaction.rollback(); } catch {}
    console.error('Payment intent creation error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});



/**
 * Validate payment request data
 */
const validatePaymentRequest = (body) => {
  const errors = [];
  const { amount, cartId, deliveryInfo = {} } = body;
  console.log('Delivery Info for validation:', deliveryInfo);

  // Amount validation (expecting minor units - cents/paisa)
  if (!amount || typeof amount !== 'number' || amount < 10000) {
    errors.push({
      field: 'amount',
      message: 'Invalid amount. Minimum is 10000 minor units (100.00 LKR)'
    });
  }

  // Cart ID validation - Fix: Accept string or number
  if (!cartId || (typeof cartId !== 'number' && typeof cartId !== 'string') || isNaN(Number(cartId))) {
    errors.push({
      field: 'cartId',
      message: 'Valid cart ID is required'
    });
  }

  // Delivery info validation
  const { address, postalCode, telephone } = deliveryInfo;
  
  if (!address || address.trim().length < 10) {
    errors.push({
      field: 'deliveryInfo.address',
      message: 'Delivery address must be at least 10 characters'
    });
  }

  if (!postalCode || !/^\d{5}$/.test(postalCode.toString())) {
    errors.push({
      field: 'deliveryInfo.postalCode',
      message: 'Valid 5-digit postal code is required'
    });
  }

  if (!telephone || !/^[0-9]{10,12}$/.test(telephone.toString().replace(/\D/g, ''))) {
    errors.push({
      field: 'deliveryInfo.telephone',
      message: 'Valid telephone number (10-12 digits) is required'
    });
  }

  return errors;
};

/**
 * Verify stock availability for cart items
 */
const verifyStockAvailability = async (cartItems, transaction) => {
  const unavailableItems = [];

  for (const item of cartItems) {
    // Get current reserved quantity for this product variety
    const reservedQuantity = await CartItem.sum('quantity', {
      where: { productVarietyId: item.productVariety.id },
      include: [{
        model: Cart,
        as: 'cart',
        where: { status: ['processing', 'pending'] }
      }],
      transaction
    }) || 0;

    const availableStock = item.productVariety.stock - reservedQuantity + item.quantity;

    if (availableStock < item.quantity) {
      unavailableItems.push({
        productId: item.productVariety.product.id,
        productName: item.productVariety.product.name,
        varietyName: item.productVariety.name,
        requested: item.quantity,
        available: Math.max(0, availableStock),
        totalStock: item.productVariety.stock
      });
    }
  }

  return {
    success: unavailableItems.length === 0,
    unavailableItems
  };
};

/**
 * Calculate total cart amount
 */
const calculateCartTotal = (cartItems) => {
  return cartItems.reduce((total, item) => {
    const itemTotal = parseFloat(item.price || 0) * parseInt(item.quantity || 0);
    return total + itemTotal;
  }, 0);
};

/**
 * Reserve stock for cart items
 */
const reserveCartStock = async (cartItems, transaction) => {
  // Mark items as reserved by updating cart timestamp
  // This prevents other users from purchasing the same items
  for (const item of cartItems) {
    await item.update({
      reservedAt: new Date(),
      reservedUntil: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
    }, { transaction });
  }
};

router.post('/complete', auth, async (req, res) => {
  const { paymentIntentId, delivery_Info } = req.body; // ← Remove deliveryInfo from destructuring
  if (!paymentIntentId) {
    return res.status(400).json({ success:false, message:'paymentIntentId required' });
  }
  const txn = await sequelize.transaction();
  try {
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (pi.status !== 'succeeded') {
      await txn.rollback();
      return res.status(400).json({ success:false, message:`PaymentIntent not succeeded (${pi.status})` });
    }

    const payment = await Payment.findOne({
      where: { stripePaymentIntentId: paymentIntentId, userId: req.user.id },
      transaction: txn
    });
    if (!payment) {
      await txn.rollback();
      return res.status(404).json({ success:false, message:'Payment record not found' });
    }

    // Idempotency: already completed?
    const existingOrder = await Order.findOne({ where: { paymentId: payment.id }, transaction: txn });
    if (existingOrder) {
      console.log('Payment already completed (idempotent).');
      //add delivery info update if needed
      await existingOrder.update({
        shippingAddress: JSON.stringify({
          address: delivery_Info.address || '',
          postalCode: delivery_Info.postalCode || '',
          telephone: delivery_Info.telephone || ''
        })
      }, { transaction: txn });
      await txn.commit();
      return res.json({ success:true, message:'Already completed', orderId: existingOrder.id });
    }

    const cart = await Cart.findOne({
      where: { id: payment.cartId, userId: payment.userId },
      include: [{
        model: CartItem,
        as: 'items',
        include: [{
          model: ProductVariety,
          as: 'productVariety',
          include: [{ model: Product, as: 'product' }]
        }]
      }],
      transaction: txn
    });
    if (!cart) {
      await txn.rollback();
      return res.status(404).json({ success:false, message:'Cart not found' });
    }

    // ✅ FIX: Get deliveryInfo from payment metadata (stored during createPaymentIntent)
    // Prefer delivery info from request params (deliveryInfo or delivery_Info).
    // If not present, fall back to deliveryInfo stored in payment.metadata.
    let deliveryInfo = {};
    const bodyDelivery = req.body.deliveryInfo || req.body.delivery_Info;
    if (bodyDelivery && Object.keys(bodyDelivery).length > 0) {
      deliveryInfo = {
      address: bodyDelivery.address || '',
      postalCode: bodyDelivery.postalCode || bodyDelivery.postal_code || '',
      telephone: bodyDelivery.telephone || bodyDelivery.phone || ''
      };
    } else {
      try {
      const meta = JSON.parse(payment.metadata || '{}');
      deliveryInfo = meta.deliveryInfo || {};
      } catch (e) {
      console.error('Failed to parse payment metadata:', e);
      deliveryInfo = {};
      }
    }

    await payment.update({
      status: 'completed',
      stripeChargeId: pi.latest_charge || (pi.charges?.data?.[0]?.id) || null,
      completedAt: new Date()
    }, { transaction: txn });

    const order = await Order.create({
      userId: payment.userId,
      paymentId: payment.id,
      orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      totalAmount: payment.amount,
      status: 'confirmed',
      shippingAddress: JSON.stringify({
        address: deliveryInfo.address || '',
        postalCode: deliveryInfo.postalCode || '',
        telephone: deliveryInfo.telephone || ''
      })
    }, { transaction: txn });

    for (const item of cart.items) {
      await OrderItem.create({
        orderId: order.id,
        productVarietyId: item.productVarietyId,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.price * item.quantity
      }, { transaction: txn });

      await ProductVariety.decrement('stock', {
        by: item.quantity,
        where: { id: item.productVarietyId },
        transaction: txn
      });
    }

    await cart.update({ status: 'completed', completedAt: new Date() }, { transaction: txn });

    await txn.commit();

    // Fire & forget email
    setImmediate(async () => {
      try {
        const user = await User.findByPk(payment.userId);
        if (user) {
          await sendOrderConfirmationEmail(
            user.email,
            user.firstName,
            {
              id: order.id,
              orderNumber: order.orderNumber,
              totalAmount: order.totalAmount,
              shippingAddress: deliveryInfo.address,
              postalCode: deliveryInfo.postalCode,
              phoneNumber: deliveryInfo.telephone,
              items: cart.items
            }
          );
        }
      } catch (e) { 
        console.error('Email failed:', e); 
      }
    });

    return res.json({
      success:true,
      message:'Order created',
      data:{ orderId: order.id, orderNumber: order.orderNumber }
    });

  } catch (e) {
    try { if (txn && !txn.finished) await txn.rollback(); } catch {}
    console.error('Complete error:', e);
    return res.status(500).json({ success:false, message:'Completion failed', error: e.message });
  }
});

router.get('/test', (req, res) => {
  res.json({ message: 'Payments route is working' });
});

// Webhook (ensure this route is mounted BEFORE any express.json() in app.js/server.js)
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('➡️  Received Stripe event:', event.type, event.id);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    res.json({received: true});
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({error: 'Webhook handler failed'});
  }
});

// Idempotent success handler
const handlePaymentSuccess = async (paymentIntent) => {
  const transaction = await sequelize.transaction();
  try {
    const payment = await Payment.findOne({
      where: { stripePaymentIntentId: paymentIntent.id },
      transaction
    });
    if (!payment) throw new Error('Payment record not found');

    // Already processed?
    const existingOrder = await Order.findOne({ where: { paymentId: payment.id }, transaction });
    if (existingOrder) {
      console.log('Payment already processed, skipping (idempotent).');
      await transaction.commit();
      return;
    }

    await payment.update({
      status: 'completed',
      stripeChargeId: paymentIntent.latest_charge,
      completedAt: new Date(),
    }, { transaction });

    const cart = await Cart.findOne({
      where: { id: payment.cartId },
      include: [{
        model: CartItem,
        as: 'items',
        include: [{
          model: ProductVariety,
          as: 'productVariety',
          include: [{ model: Product, as: 'product' }]
        }]
      }],
      transaction
    });
    if (!cart) throw new Error('Cart not found');

    const meta = JSON.parse(payment.metadata || '{}');
    const deliveryInfo = meta.deliveryInfo || {};

    const order = await Order.create({
      userId: payment.userId,
      paymentId: payment.id,
      orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      totalAmount: payment.amount,
      status: 'confirmed',
      shippingAddress: JSON.stringify({
        address: deliveryInfo.address,
        postalCode: deliveryInfo.postalCode,
        telephone: deliveryInfo.telephone
      })
    }, { transaction });

    for (const cartItem of cart.items) {
      await OrderItem.create({
        orderId: order.id,
        productVarietyId: cartItem.productVarietyId,
        quantity: cartItem.quantity,
        price: cartItem.price,
        totalPrice: cartItem.price * cartItem.quantity,
      }, { transaction });

      await ProductVariety.decrement('stock', {
        by: cartItem.quantity,
        where: { id: cartItem.productVarietyId },
        transaction
      });
    }

    await cart.update({ status: 'completed', completedAt: new Date() }, { transaction });

    await transaction.commit();

    setImmediate(async () => {
      try {
        const user = await User.findByPk(payment.userId);
        await sendOrderConfirmationEmail(
          user.email,
          user.firstName,
          {
            id: order.id,
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount,
            shippingAddress: deliveryInfo.address,
            postalCode: deliveryInfo.postalCode,
            phoneNumber: deliveryInfo.telephone,
            items: cart.items
          }
        );
      } catch (e) {
        console.error('Email send failed:', e);
      }
    });

    console.log('Order created:', order.orderNumber);
  } catch (e) {
    await transaction.rollback();
    console.error('Error handling payment success:', e);
    throw e;
  }
};

// (Dev) Fallback finalize endpoint if webhook not working
router.post('/finalize', auth, async (req, res) => {
  const { paymentIntentId } = req.body;
  if (!paymentIntentId) return res.status(400).json({ success:false, message:'paymentIntentId required' });
  try {
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (pi.status !== 'succeeded') {
      return res.status(400).json({ success:false, message:`PaymentIntent not succeeded (${pi.status})` });
    }
    await handlePaymentSuccess(pi);
    res.json({ success:true, message:'Order finalized' });
  } catch (e) {
    res.status(500).json({ success:false, message:'Finalize failed', error:e.message });
  }
});

router.get('/status/:paymentIntentId', auth, async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findOne({
      where: {
        stripePaymentIntentId: paymentIntentId,
        userId: userId
      },
      include: [{
        model: Order,
        as: 'order',
        required: false
      }]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: {
        paymentId: payment.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        createdAt: payment.createdAt,
        completedAt: payment.completedAt,
        order: payment.order ? {
          id: payment.order.id,
          orderNumber: payment.order.orderNumber,
          status: payment.order.status
        } : null
      }
    });

  } catch (error) {
    console.error('Error getting payment status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payment status'
    });
  }
  }
);

module.exports = router;