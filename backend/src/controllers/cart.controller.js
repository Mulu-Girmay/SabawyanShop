import CartItem from "../models/CartItem.js";
import Product from "../models/Product.js";
import logger from "../utils/logger.js";

/**
 * GET /api/v1/cart
 * Returns the authenticated user's cart with populated product details.
 */
export const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const items = await CartItem.find({ user: userId })
      .populate(
        "product",
        "title price discountPrice images quantity isActive seller",
      )
      .sort({ createdAt: -1 });

    // Filter out items whose product was deleted / deactivated
    const activeItems = items.filter((item) => item.product?.isActive);

    // Calculate totals
    const subtotal = activeItems.reduce((sum, item) => {
      const price = item.product.discountPrice || item.product.price;
      return sum + price * item.quantity;
    }, 0);

    const shippingCost = subtotal > 100 ? 0 : subtotal > 0 ? 10 : 0;
    const tax = subtotal * 0.1;
    const total = subtotal + shippingCost + tax;

    res.json({
      success: true,
      data: {
        items: activeItems,
        summary: {
          itemCount: activeItems.reduce((sum, i) => sum + i.quantity, 0),
          subtotal,
          shippingCost,
          tax,
          total,
        },
      },
    });
  } catch (error) {
    logger.error("Get cart error:", error);
    next(error);
  }
};

/**
 * POST /api/v1/cart
 * Add a product to cart or increment its quantity if already present.
 * Body: { productId, quantity }
 */
export const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, error: "productId is required" });
    }

    if (quantity < 1) {
      return res.status(400).json({ success: false, error: "Quantity must be at least 1" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    if (!product.isActive) {
      return res.status(400).json({ success: false, error: "Product is no longer available" });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({
        success: false,
        error: `Only ${product.quantity} units available in stock`,
      });
    }

    // Upsert: increment if exists, create if not
    const existing = await CartItem.findOne({ user: userId, product: productId });

    let cartItem;
    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty > product.quantity) {
        return res.status(400).json({
          success: false,
          error: `Cannot add ${quantity} more — only ${product.quantity - existing.quantity} additional units available`,
        });
      }
      existing.quantity = newQty;
      cartItem = await existing.save();
    } else {
      cartItem = await CartItem.create({ user: userId, product: productId, quantity });
    }

    const populated = await cartItem.populate(
      "product",
      "title price discountPrice images quantity isActive seller",
    );

    res.status(201).json({
      success: true,
      message: "Added to cart",
      data: populated,
    });
  } catch (error) {
    logger.error("Add to cart error:", error);
    next(error);
  }
};

/**
 * PUT /api/v1/cart/:productId
 * Update the quantity of a cart item.
 * Body: { quantity }
 */
export const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, error: "Quantity must be at least 1" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({
        success: false,
        error: `Only ${product.quantity} units available in stock`,
      });
    }

    const cartItem = await CartItem.findOneAndUpdate(
      { user: userId, product: productId },
      { quantity },
      { new: true },
    ).populate("product", "title price discountPrice images quantity isActive seller");

    if (!cartItem) {
      return res.status(404).json({ success: false, error: "Cart item not found" });
    }

    res.json({
      success: true,
      message: "Cart updated",
      data: cartItem,
    });
  } catch (error) {
    logger.error("Update cart item error:", error);
    next(error);
  }
};

/**
 * DELETE /api/v1/cart/:productId
 * Remove a single item from cart.
 */
export const removeFromCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const deleted = await CartItem.findOneAndDelete({ user: userId, product: productId });

    if (!deleted) {
      return res.status(404).json({ success: false, error: "Cart item not found" });
    }

    res.json({ success: true, message: "Item removed from cart" });
  } catch (error) {
    logger.error("Remove from cart error:", error);
    next(error);
  }
};

/**
 * DELETE /api/v1/cart
 * Clear the entire cart.
 */
export const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await CartItem.deleteMany({ user: userId });

    res.json({ success: true, message: "Cart cleared" });
  } catch (error) {
    logger.error("Clear cart error:", error);
    next(error);
  }
};
