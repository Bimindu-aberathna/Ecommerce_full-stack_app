const express = require("express");
const { Op } = require("sequelize");
const {
  Cart,
  CartItem,
  Product,
  ProductVariety,
  SubCategory,
  Category,
  sequelize,
} = require("../models");
const { auth } = require("../middleware/auth");
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
        userId,
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
                    "tags",
                    "ratingAverage",
                    "ratingCount",
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

    // Calculate cart summary - CLEANER VERSION
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
        { transaction }
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
        { transaction }
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
      include: [{
        model: Cart,
        as: "cart",
        where: { status: "pending", userId: userId },
      }],
      transaction,
    });
    

    if (deletedCount === 0) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Cart item not found or you do not have permission to delete it",
      });
    }

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Cart item removed successfully"
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
      message: "Cart removed successfully"
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

module.exports = router;
