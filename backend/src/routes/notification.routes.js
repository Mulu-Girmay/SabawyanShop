import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/email.js";
import { io } from "../app.js";
import logger from "../utils/logger.js";

export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type, read, limit = 20, page = 1, sort = "-createdAt" } = req.query;

    const query = { recipient: userId };

    if (type) query.type = type;
    if (read !== undefined) query.read = read === "true";

    const skip = (page - 1) * limit;

    const notifications = await Notification.find(query)
      .populate("sender", "username fullName avatar")
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      read: false,
    });

    res.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Get notifications error:", error);
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: "Notification not found",
      });
    }

    if (notification.recipient.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: "Not authorized",
      });
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    // Update unread count for socket
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      read: false,
    });

    io.to(`user:${userId}`).emit("notification-read", {
      notificationId: id,
      unreadCount,
    });

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    logger.error("Mark as read error:", error);
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true, readAt: new Date() },
    );

    io.to(`user:${userId}`).emit("all-read", {
      unreadCount: 0,
    });

    res.json({
      success: true,
      message: "All notifications marked as read",
      data: { modifiedCount: result.modifiedCount },
    });
  } catch (error) {
    logger.error("Mark all as read error:", error);
    next(error);
  }
};

export const dismissNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: "Notification not found",
      });
    }

    if (notification.recipient.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: "Not authorized",
      });
    }

    notification.dismissed = true;
    await notification.save();

    res.json({
      success: true,
      message: "Notification dismissed",
    });
  } catch (error) {
    logger.error("Dismiss notification error:", error);
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: "Notification not found",
      });
    }

    if (notification.recipient.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: "Not authorized",
      });
    }

    await notification.deleteOne();

    res.json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    logger.error("Delete notification error:", error);
    next(error);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const count = await Notification.countDocuments({
      recipient: userId,
      read: false,
    });

    res.json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error) {
    logger.error("Get unread count error:", error);
    next(error);
  }
};

// WebSocket for real-time notifications
export const sendRealtimeNotification = async (notification) => {
  try {
    // Send via socket
    io.to(`user:${notification.recipient}`).emit("new-notification", {
      notification,
      unreadCount: await Notification.countDocuments({
        recipient: notification.recipient,
        read: false,
      }),
    });

    // Send email if not emailed
    if (!notification.emailed && notification.priority !== "low") {
      await sendNotificationEmail(notification);
      notification.emailed = true;
      await notification.save();
    }

    // Send push notification if enabled (for mobile)
    // TODO: Implement push notifications
  } catch (error) {
    logger.error("Send realtime notification error:", error);
  }
};

// Email notification
const sendNotificationEmail = async (notification) => {
  try {
    const recipient = await User.findById(notification.recipient);
    if (!recipient || !recipient.preferences?.notifications?.email) return;

    await sendEmail({
      to: recipient.email,
      subject: notification.title,
      html: `
        <h2>${notification.title}</h2>
        <p>${notification.message}</p>
        <p><a href="${process.env.CLIENT_URL}/notifications">View in app</a></p>
      `,
    });
  } catch (error) {
    logger.error("Send notification email error:", error);
  }
};

// Notification templates
export const createNotification = async (data) => {
  try {
    const notification = await Notification.create(data);
    await sendRealtimeNotification(notification);
    return notification;
  } catch (error) {
    logger.error("Create notification error:", error);
    throw error;
  }
};
