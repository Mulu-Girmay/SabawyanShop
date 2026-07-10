import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import CartItem from "../models/CartItem.js";
import Notification from "../models/Notification.js";
import { io } from "../app.js";
import logger from "../utils/logger.js";

export const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;

    const userId = req.user.id;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No items in order",
      });
    }

    // Validate items and calculate totals
    let subtotal = 0;
    const orderItems = [];
    const sellerId = items[0].sellerId; // Assuming single seller per order

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Product ${item.productId} not found`,
        });
      }

      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          error: `Product ${product.title} is no longer available`,
        });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Not enough stock for ${product.title}. Available: ${product.quantity}`,
        });
      }

      const price = product.discountPrice || product.price;
      const total = price * item.quantity;
      subtotal += total;

      orderItems.push({
        product: product._id,
        name: product.title,
        price,
        quantity: item.quantity,
        total,
        image: product.images[0],
      });

      // Update product stock
      product.quantity -= item.quantity;
      await product.save();

      // Remove from cart
      await CartItem.findOneAndDelete({
        user: userId,
        product: product._id,
      });
    }

    // Calculate shipping and tax
    const shippingCost = subtotal > 100 ? 0 : 10;
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + shippingCost + tax;

    // Generate order number
    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      buyer: userId,
      seller: sellerId,
      items: orderItems,
      subtotal,
      shippingCost,
      tax,
      total,
      shippingAddress,
      paymentMethod,
      notes,
      history: [
        {
          status: "pending",
          note: "Order created",
        },
      ],
    });

    const populatedOrder = await Order.findById(order._id)
      .populate("buyer", "username fullName email")
      .populate("seller", "username fullName email")
      .populate("items.product", "title images");

    // Notify seller
    await Notification.create({
      recipient: sellerId,
      sender: userId,
      type: "order",
      message: `New order #${orderNumber} received!`,
      data: { orderId: order._id, total: order.total },
    });

    // Emit socket event
    io.to(`user:${sellerId}`).emit("new-order", populatedOrder);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: populatedOrder,
    });
  } catch (error) {
    logger.error("Create order error:", error);
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      status,
      role = "buyer",
      limit = 20,
      page = 1,
      sort = "-createdAt",
    } = req.query;

    const query = {};

    if (role === "buyer") {
      query.buyer = userId;
    } else if (role === "seller") {
      query.seller = userId;
    }

    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .populate("buyer", "username fullName avatar")
      .populate("seller", "username fullName avatar")
      .populate("items.product", "title images")
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Get orders error:", error);
    next(error);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findById(id)
      .populate("buyer", "username fullName email phone addresses")
      .populate("seller", "username fullName email")
      .populate("items.product", "title description images");

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Check authorization
    if (
      order.buyer._id.toString() !== userId &&
      order.seller._id.toString() !== userId &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to view this order",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    logger.error("Get order error:", error);
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, note } = req.body;
    const userId = req.user.id;

    const order = await Order.findById(id)
      .populate("buyer", "username fullName email")
      .populate("seller", "username fullName email");

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Check authorization
    if (order.seller._id.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this order",
      });
    }

    const validTransitions = {
      pending: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["delivered", "cancelled"],
      delivered: [],
      cancelled: [],
    };

    if (
      !validTransitions[order.status].includes(status) &&
      order.status !== status
    ) {
      return res.status(400).json({
        success: false,
        error: `Cannot transition from ${order.status} to ${status}`,
      });
    }

    const updateData = {
      status,
      $push: {
        history: {
          status,
          note: note || `Status updated to ${status}`,
        },
      },
    };

    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }

    if (status === "shipped") {
      updateData.estimatedDelivery = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      );
    }

    if (status === "delivered") {
      updateData.deliveredAt = new Date();
    }

    if (status === "cancelled") {
      updateData.cancelledAt = new Date();
      // Restore product stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { quantity: item.quantity },
        });
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate("buyer", "username fullName email")
      .populate("seller", "username fullName email")
      .populate("items.product", "title images");

    // Notify buyer
    await Notification.create({
      recipient: order.buyer._id,
      sender: userId,
      type: "order",
      message: `Order #${order.orderNumber} status updated to ${status}`,
      data: { orderId: order._id, status },
    });

    // Emit socket event
    io.to(`user:${order.buyer._id}`).emit("order-updated", updatedOrder);

    res.json({
      success: true,
      message: "Order status updated",
      data: updatedOrder,
    });
  } catch (error) {
    logger.error("Update order status error:", error);
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    if (order.buyer._id.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to cancel this order",
      });
    }

    if (order.status !== "pending" && order.status !== "processing") {
      return res.status(400).json({
        success: false,
        error: "Order cannot be cancelled at this stage",
      });
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: item.quantity },
      });
    }

    order.status = "cancelled";
    order.cancelledAt = new Date();
    order.cancellationReason = reason || "Cancelled by user";
    order.history.push({
      status: "cancelled",
      note: `Order cancelled: ${reason || "No reason provided"}`,
    });

    await order.save();

    // Notify seller
    await Notification.create({
      recipient: order.seller,
      sender: userId,
      type: "order",
      message: `Order #${order.orderNumber} has been cancelled`,
      data: { orderId: order._id },
    });

    res.json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    logger.error("Cancel order error:", error);
    next(error);
  }
};

export const getOrderStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // For buyers
    const buyerStats = await Order.aggregate([
      { $match: { buyer: userId } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$total" },
          averageOrderValue: { $avg: "$total" },
        },
      },
    ]);

    // For sellers
    const sellerStats = await Order.aggregate([
      { $match: { seller: userId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          revenue: { $sum: "$total" },
        },
      },
    ]);

    const statusCounts = sellerStats.reduce((acc, curr) => {
      acc[curr._id] = {
        count: curr.count,
        revenue: curr.revenue,
      };
      return acc;
    }, {});

    const totalRevenue = sellerStats.reduce(
      (sum, curr) => sum + curr.revenue,
      0,
    );
    const totalOrders = sellerStats.reduce((sum, curr) => sum + curr.count, 0);

    res.json({
      success: true,
      data: {
        buyer: buyerStats[0] || {
          totalOrders: 0,
          totalSpent: 0,
          averageOrderValue: 0,
        },
        seller: {
          totalOrders,
          totalRevenue,
          statusCounts,
        },
      },
    });
  } catch (error) {
    logger.error("Get order stats error:", error);
    next(error);
  }
};

// Helper functions
const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `COLLAB-${year}${month}${day}-${random}`;
};
