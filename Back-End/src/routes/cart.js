const express = require("express");
const { Op } = require("sequelize");
const {
  Cart,
  CartItem,
  Product,
  ProductVariety,
  SubCategory,
  Category,
  Order,
  OrderItem,
  sequelize,
  User,
} = require("../models");
const { auth, adminAuth } = require("../middleware/auth");
const { getShippingCost } = require("../utils/shippingUtils");
const router = express.Router();

//get cart itemCount only for nav
router.get("/itemCount", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItemCount = await Cart.findOne({
      where: {
        userId,
        status: "pending",
      },
      include: [
        {
          model: CartItem,
          as: "items",
        },
      ],
    });

    const itemCount = cartItemCount ? cartItemCount.items.length : 0;
    return res.status(200).json({
      success: true,
      itemCount,
    });
  } catch (error) {
    console.error("Error fetching cart item count:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get user's cart
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({
      where: {
        userId: userId,
        status: "pending",
      },
      include: [
        {
          model: CartItem,
          as: "items",
          include: [
            {
              model: ProductVariety,
              as: "productVariety",
              attributes: ["id", "name", "stock", "preorderLevel"],
              include: [
                {
                  model: Product,
                  as: "product",
                  attributes: [
                    "id",
                    "name",
                    "price",
                    "originalPrice",
                    "brand",
                    "images",
                    "weight",
                  ],
                  include: [
                    {
                      model: SubCategory,
                      as: "subCategory",
                      attributes: ["id", "name"],
                      include: [
                        {
                          model: Category,
                          as: "category",
                          attributes: ["id", "name"],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        cartExists: false,
        message: "No active cart found",
      });
    }

    // Calculate cart summary
    const calculateCartTotals = (cartItems) => {
      let totalOriginal = 0;
      let totalCurrent = 0;
      let totalQuantity = 0;

      cartItems.forEach((item) => {
        const product = item.productVariety.product;
        const originalPrice = parseFloat(product.originalPrice) || 0;
        const currentPrice = parseFloat(product.price) || 0;
        const quantity = item.quantity;

        totalOriginal += originalPrice * quantity;
        totalCurrent += currentPrice * quantity;
        totalQuantity += quantity;
      });

      const totalSavings = totalOriginal - totalCurrent;
      const discountPercentage =
        totalOriginal > 0 ? (totalSavings / totalOriginal) * 100 : 0;

      return {
        totalCurrent: parseFloat(totalCurrent.toFixed(2)),
        totalOriginal: parseFloat(totalOriginal.toFixed(2)),
        totalSavings: parseFloat(totalSavings.toFixed(2)),
        discountPercentage: parseFloat(discountPercentage.toFixed(2)),
        totalQuantity,
      };
    };

    const cartTotals = calculateCartTotals(cart.items);

    // Prepare response data
    const cartSummary = {
      ...cart.toJSON(),
      itemCount: cart.items.length,
      totalQuantity: cartTotals.totalQuantity,
      calculatedTotal: cartTotals.totalCurrent,
      originalTotal: cartTotals.totalOriginal,
      totalSavings: cartTotals.totalSavings,
      discountPercentageGiven: cartTotals.discountPercentage,
    };
    const shippingCost = getShippingCost(cartSummary);
    cartSummary.shippingCost = shippingCost;

    return res.status(200).json({
      success: true,
      cartExists: true,
      data: cartSummary,
    });
  } catch (error) {
    console.error("Cart route error:", error);
    return res.status(500).json({
      success: false,
      cartExists: false,
      message: "Internal server error",
    });
  }
});

// Add item to cart
router.post("/add", auth, async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { productVarietyId, quantity = 1 } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!productVarietyId || quantity <= 0 || !Number.isInteger(quantity)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Invalid product variety ID or quantity",
      });
    }

    // Validate product variety exists (without stock filter)
    const productVariety = await ProductVariety.findOne({
      where: { id: productVarietyId },
      include: [
        {
          model: Product,
          as: "product",
          where: { isActive: true },
        },
      ],
      transaction,
    });

    if (!productVariety) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Product not found or inactive",
      });
    }

    // Calculate total quantity already in pending carts
    const totalInCarts =
      (await CartItem.sum("quantity", {
        where: { productVarietyId },
        include: [
          {
            model: Cart,
            as: "cart",
            where: { status: "pending" },
          },
        ],
        transaction,
      })) || 0;

    // Check available stock
    const availableStock = productVariety.stock - totalInCarts;

    // Find or create cart
    let cart = await Cart.findOne({
      where: { userId, status: "pending" },
      transaction,
    });

    if (!cart) {
      cart = await Cart.create(
        {
          userId,
          status: "pending",
        },
        { transaction },
      );
    }

    // Check for existing cart item
    let cartItem = await CartItem.findOne({
      where: {
        cartId: cart.id,
        productVarietyId,
      },
      transaction,
    });

    const currentUserCartQuantity = cartItem ? cartItem.quantity : 0;
    const newTotalQuantity = currentUserCartQuantity + quantity;

    // Validate sufficient stock
    if (availableStock < quantity) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${availableStock} items available`,
      });
    }

    if (cartItem) {
      // Update existing cart item
      cartItem.quantity = newTotalQuantity;
      cartItem.price = productVariety.product.price; // Update price
      await cartItem.save({ transaction });
    } else {
      // Create new cart item with price
      cartItem = await CartItem.create(
        {
          cartId: cart.id,
          productVarietyId,
          quantity,
          price: productVariety.product.price,
        },
        { transaction },
      );
    }

    await transaction.commit();

    return res.status(cartItem.quantity === quantity ? 201 : 200).json({
      success: true,
      message:
        cartItem.quantity === quantity
          ? "Item added to cart successfully"
          : "Cart item updated successfully",
      data: cartItem,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Add to cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Error adding item to cart",
    });
  }
});
//Update cart item
router.put("/update/:itemId", auth, async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { quantity } = req.body;
    const userId = req.user.id;
    const cartItemId = req.params.itemId;

    // Validate input plus or minus are legit
    // Validate input - accept positive or negative integers, but not zero
    if (
      !Number.isInteger(quantity) ||
      quantity === 0 ||
      quantity < -10 ||
      quantity > 10
    ) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message:
          "Invalid request. Quantity must be between -10 and +10 (excluding 0).",
      });
    }

    const cartItem = await CartItem.findOne({
      where: { id: cartItemId },
      include: [
        {
          model: Cart,
          as: "cart",
          where: { status: "pending", userId: userId },
        },
        {
          model: ProductVariety,
          as: "productVariety",
          include: [
            {
              model: Product,
              as: "product",
              where: { isActive: true },
            },
          ],
        },
      ],
      transaction,
    });

    if (!cartItem) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message:
          "Cart item not found or you do not have permission to modify it",
      });
    }

    const newQuantity = cartItem.quantity + quantity;

    // Handle item removal
    if (newQuantity <= 0) {
      await cartItem.destroy({ transaction });
      await transaction.commit();
      return res.status(200).json({
        success: true,
        message: "Cart item removed successfully",
      });
    }

    // Check maximum quantity limit
    if (newQuantity > 10) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Cannot add more than 10 items of the same product",
      });
    }

    // Calculate total quantity in other pending carts (excluding current user's cart)
    const totalInOtherCarts =
      (await CartItem.sum("quantity", {
        where: {
          productVarietyId: cartItem.productVarietyId,
          id: { [Op.ne]: cartItemId }, // Exclude current cart item
        },
        include: [
          {
            model: Cart,
            as: "cart",
            where: {
              status: "pending",
              userId: { [Op.ne]: userId }, // Exclude current user's cart
            },
          },
        ],
        transaction,
      })) || 0;

    // Check available stock
    const availableStock = cartItem.productVariety.stock - totalInOtherCarts;

    if (newQuantity > availableStock) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Only ${availableStock} items available (${totalInOtherCarts} items currently in other carts)`,
      });
    }

    // Update cart item quantity and price
    cartItem.quantity = newQuantity;
    cartItem.price = cartItem.productVariety.product.price; // Update price
    await cartItem.save({ transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      data: {
        id: cartItem.id,
        quantity: cartItem.quantity,
        price: cartItem.price,
        totalPrice: parseFloat(cartItem.price) * cartItem.quantity,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Update cart item error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating cart item",
    });
  }
});

//delete cart item
router.delete("/delete/:itemId", auth, async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const userId = req.user.id;
    const cartItemId = req.params.itemId;

    // Find and delete in one operation with ownership check
    const deletedCount = await CartItem.destroy({
      where: { id: cartItemId },
      include: [
        {
          model: Cart,
          as: "cart",
          where: { status: "pending", userId: userId },
        },
      ],
      transaction,
    });

    if (deletedCount === 0) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message:
          "Cart item not found or you do not have permission to delete it",
      });
    }

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Cart item removed successfully",
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Delete cart item error:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting cart item",
    });
  }
});

//delete cart
router.delete("/:cartId", auth, async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const userId = req.user.id;
    const cartId = req.params.cartId;

    // Find and delete in one operation with ownership check
    const deletedCount = await Cart.destroy({
      where: { id: cartId, userId: userId, status: "pending" },
      cascade: true,
      transaction,
    });

    if (deletedCount === 0) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Cart not found or you do not have permission to delete it",
      });
    }

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Cart removed successfully",
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Delete cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting cart",
    });
  }
});

//check product availability
router.get("/availability/:cartId", auth, async (req, res) => {
  const userId = req.user.id;
  const cartId = req.params.cartId;

  try {
    const cart = await Cart.findOne({
      where: {
        userId,
        id: cartId,
        status: "pending",
      },
      include: [
        {
          model: CartItem,
          as: "items",
          include: [
            {
              model: ProductVariety,
              as: "productVariety",
              attributes: ["id", "name", "stock", "preorderLevel"],
              include: [
                {
                  model: Product,
                  as: "product",
                  attributes: ["id", "name"],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }
    //FIND ITEMS WITH LOW STOCKS
    let low_stock_products = cart.items.filter(
      (item) => item.productVariety.stock < item.quantity,
    );

    if (low_stock_products.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Some items have insufficient stock",
        lowStockItems: low_stock_products.map((item) => ({
          id: item.id,
          name:
            item.productVariety.product.name + "-" + item.productVariety.name,
          requested: item.quantity,
          available: item.productVariety.stock,
        })),
      });
    }
    return res.status(200).json({
      success: true,
      message: "Cart is valid",
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching cart",
    });
  }
});

//get orders for the seller (single vendor - show ALL orders)
router.get("/seller/orders/:bool", adminAuth, async (req, res) => {
  try {
    // if bool is false, get all orders, else get only unviewed orders
    const bool = req.params.bool === "true";

    // Return ALL orders with their items (no seller filtering needed)
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: ProductVariety,
              as: "productVariety",
              attributes: ["id", "name"],
              include: [
                {
                  model: Product,
                  as: "product",
                  attributes: ["id", "name", "brand", "images", "weight"],
                },
              ],
            },
          ],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Map to clean JSON
    const formatted = orders.map((o) => {
      const json = o.toJSON();

      // Parse shipping address if it's stored as JSON string
      let shippingInfo = {};
      try {
        shippingInfo = JSON.parse(json.shippingAddress || "{}");
      } catch (e) {
        shippingInfo = { address: json.shippingAddress };
      }

      return {
        orderId: json.id,
        orderNumber: json.orderNumber,
        totalAmount: json.totalAmount,
        status: json.status,
        viewed: json.viewed,
        createdAt: json.createdAt,
        updatedAt: json.updatedAt,
        shippingAddress: shippingInfo.address,
        postalCode: shippingInfo.postalCode,
        telephone: shippingInfo.telephone,
        trackingNumber: json.trackingNumber,
        itemCount: json.items.length,
        customer: {
          id: json.user?.id,
          email: json.user?.email,
          name: `${json.user?.firstName || ""} ${json.user?.lastName || ""}`.trim(),
        },
        items: json.items.map((item) => ({
          orderItemId: item.id,
          quantity: item.quantity,
          price: item.price,
          totalPrice: item.totalPrice,
          product: {
            id: item.productVariety.product.id,
            name: item.productVariety.product.name,
            brand: item.productVariety.product.brand,
            images: item.productVariety.product.images,
            weight: item.productVariety.product.weight,
            variety: item.productVariety.name,
          },
        })),
      };
    });

    // Filter based on 'viewed' status if bool is true
    const result = bool
      ? formatted.filter((order) => !order.viewed)
      : formatted;

    return res.status(200).json({
      success: true,
      data: result,
      totalOrders: result.length,
    });
  } catch (error) {
    console.error("Seller orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.put("/seller/orders/:orderId/viewed", adminAuth, async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findByPk(orderId);
    if (!order) {
      console.error("Order not found:", orderId);
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    order.viewed = true;
    await order.save();
    return res
      .status(200)
      .json({ success: true, message: "Order marked as viewed" });
  } catch (error) {
    console.error("Error updating order viewed status:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});

// Update tracking number for an order
router.put("/seller/orders/:orderId/tracking", adminAuth, async (req, res) => {
  const { orderId } = req.params;
  const { trackingCode } = req.body;
  try {
    const order = await Order.findByPk(orderId);
    if (!order) {
      console.error("Order not found:", orderId);
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    order.trackingNumber = trackingCode;
    await order.save();
    return res.status(200).json({
      success: true,
      message: "Tracking number updated successfully",
    });
  } catch (error) {
    console.error("Error updating tracking number:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }});

  //consfirrm order (change status to confirmed)
  router.put("/seller/orders/:orderId/confirm", adminAuth, async (req, res) => {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }
    //check shipping address exists
    try {
      const order = await Order.findByPk(orderId);
      if (!order) {
        console.error("Order not found:", orderId);
        return res.status(404).json({ success: false, message: "Order not found" });
      }
      if (!order.trackingNumber) {
        console.error("Tracking number not found for order:", orderId);
        return res.status(400).json({ success: false, message: "Tracking number is required" });
      }
      order.status = "confirmed";
      await order.save();
      console.log("Order confirmed:", orderId);
      return res.status(200).json({ success: true, message: "Order confirmed successfully" });
    } catch (error) {
      console.error("Error confirming order:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  });


router.get(
  "/seller/orders/recent",
  adminAuth,
  async (req, res) => {
    try {
      // Last 24 hours
      const last24Hours = new Date();
      last24Hours.setHours(last24Hours.getHours() - 24);

      const recentOrders = await Order.findAll({
        where: {
          createdAt: {
            [Op.gte]: last24Hours,
          },
        },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "firstName", "lastName"],
            required: false, 
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: 10,
      });

      const formatted = recentOrders.map((order) => ({
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status,
        customer: order.user
          ? `${order.user.firstName} ${order.user.lastName}`.trim()
          : "Guest",
        createdAt: order.createdAt,
      }));

      return res.status(200).json({
        success: true,
        count: formatted.length,
        data: formatted,
      });
    } catch (error) {
      console.error("Error fetching recent orders:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch recent orders",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      });
    }
  }
);


module.exports = router;
