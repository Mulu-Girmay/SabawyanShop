import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Post from "../models/Post.js";
import Notification from "../models/Notification.js";
import logger from "../utils/logger.js";
import GroupBuy from "../models/GroupBuy.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalSellers,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      recentOrders,
      activeGroupBuys,
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isSeller: true, isActive: true }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: "delivered" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.countDocuments({ status: "pending" }),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("buyer", "username fullName")
        .populate("seller", "username fullName"),
      GroupBuy.countDocuments({ status: "active" }),
    ]);

    // User growth (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Revenue by day (last 30 days)
    const revenueGrowth = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: "delivered",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          revenue: { $sum: "$total" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top products
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.total" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalSellers,
          totalProducts,
          totalOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
          pendingOrders,
          activeGroupBuys,
        },
        recentOrders,
        userGrowth,
        revenueGrowth,
        topProducts,
      },
    });
  } catch (error) {
    logger.error("Get dashboard stats error:", error);
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const {
      search,
      role,
      verified,
      active,
      limit = 20,
      page = 1,
      sort = "-createdAt",
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { fullName: { $regex: search, $options: "i" } },
      ];
    }

    if (role === "seller") query.isSeller = true;
    if (role === "buyer") query.isSeller = false;
    if (verified !== undefined) query.isVerified = verified === "true";
    if (active !== undefined) query.isActive = active === "true";

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select("-password -resetPasswordToken -resetPasswordExpire")
      .populate("followers", "username")
      .populate("following", "username")
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Get users error:", error);
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select("-password -resetPasswordToken -resetPasswordExpire")
      .populate("followers", "username fullName avatar")
      .populate("following", "username fullName avatar");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Get user stats
    const [productCount, orderCount, totalSpent] = await Promise.all([
      Product.countDocuments({ seller: id, isActive: true }),
      Order.countDocuments({ buyer: id }),
      Order.aggregate([
        { $match: { buyer: id, status: "delivered" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        stats: {
          productCount,
          orderCount,
          totalSpent: totalSpent[0]?.total || 0,
        },
      },
    });
  } catch (error) {
    logger.error("Get user error:", error);
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent password update here (use reset password flow)
    delete updates.password;

    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password -resetPasswordToken -resetPasswordExpire");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    logger.error("Update user error:", error);
    next(error);
  }
};

export const suspendUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (user.isAdmin) {
      return res.status(400).json({
        success: false,
        error: "Cannot suspend admin user",
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    // Notify user
    if (!user.isActive) {
      await Notification.create({
        recipient: user._id,
        sender: req.user.id,
        type: "system",
        title: "Account Suspended",
        message: `Your account has been suspended. Reason: ${reason || "Violation of terms"}`,
        priority: "high",
      });
    }

    res.json({
      success: true,
      message: `User ${user.isActive ? "activated" : "suspended"} successfully`,
      data: { isActive: user.isActive },
    });
  } catch (error) {
    logger.error("Suspend user error:", error);
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      status = "active",
      limit = 20,
      page = 1,
      sort = "-createdAt",
    } = req.query;

    const query = {};

    if (search) {
      query.$text = { $search: search };
    }

    if (category) query.category = category;

    if (status === "active") query.isActive = true;
    else if (status === "inactive") query.isActive = false;

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .populate("seller", "username fullName email")
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Get products error:", error);
    next(error);
  }
};

export const deleteProductAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Hard delete (admin only)
    await product.deleteOne();

    // Notify seller
    await Notification.create({
      recipient: product.seller,
      sender: req.user.id,
      type: "system",
      title: "Product Removed",
      message: `Your product "${product.title}" has been removed by admin`,
      priority: "high",
    });

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    logger.error("Delete product admin error:", error);
    next(error);
  }
};

export const getReports = async (req, res, next) => {
  try {
    const { type, limit = 20, page = 1 } = req.query;

    // This would typically fetch from a reports collection
    // For now, we'll aggregate from existing data

    let reports = [];

    if (type === "orders") {
      reports = await Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            total: { $sum: "$total" },
          },
        },
      ]);
    } else if (type === "users") {
      reports = await User.aggregate([
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);
    } else if (type === "products") {
      reports = await Product.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
            avgPrice: { $avg: "$price" },
          },
        },
      ]);
    }

    res.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    logger.error("Get reports error:", error);
    next(error);
  }
};

export const broadcastNotification = async (req, res, next) => {
  try {
    const { title, message, target = "all", priority = "medium" } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: "Title and message are required",
      });
    }

    let query = {};

    if (target === "sellers") {
      query = { isSeller: true, isActive: true };
    } else if (target === "buyers") {
      query = { isSeller: false, isActive: true };
    } else {
      query = { isActive: true };
    }

    const users = await User.find(query).select("_id");

    // Create notifications in batches
    const batchSize = 100;
    const notifications = [];

    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      const notificationDocs = batch.map((user) => ({
        recipient: user._id,
        sender: req.user.id,
        type: "promotion",
        title,
        message,
        priority,
        data: { broadcast: true },
      }));

      notifications.push(...notificationDocs);
    }

    await Notification.insertMany(notifications);

    // Send real-time notifications
    for (const notif of notifications) {
      io.to(`user:${notif.recipient}`).emit("new-notification", {
        notification: notif,
        unreadCount: 1, // Will be updated client-side
      });
    }

    res.json({
      success: true,
      message: `Broadcast notification sent to ${users.length} users`,
    });
  } catch (error) {
    logger.error("Broadcast notification error:", error);
    next(error);
  }
};
