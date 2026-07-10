import Message from "../models/Message.js";
import User from "../models/User.js";
import { io } from "../app.js";
import logger from "../utils/logger.js";

export const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content, type = "text", productId, orderId } = req.body;
    const senderId = req.user.id;

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        error: "Receiver not found",
      });
    }

    // Create message
    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content,
      type,
      product: productId,
      order: orderId,
    });

    // Populate message details
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "username fullName avatar")
      .populate("receiver", "username fullName avatar")
      .populate("product", "title price images");

    // Emit real-time message via Socket.io
    io.to(`user:${receiverId}`).emit("new-message", populatedMessage);
    io.to(`user:${senderId}`).emit("message-sent", populatedMessage);

    res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    logger.error("Send message error:", error);
    next(error);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get all unique conversation partners
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
          isActive: true,
        },
      },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$sender", userId] }, "$receiver", "$sender"],
          },
          lastMessage: { $last: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiver", userId] },
                    { $eq: ["$read", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { "lastMessage.createdAt": -1 } },
    ]);

    // Populate user details for each conversation
    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const user = await User.findById(conv._id).select(
          "username fullName avatar isOnline lastActive",
        );

        return {
          user,
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount,
        };
      }),
    );

    res.json({
      success: true,
      data: populatedConversations,
    });
  } catch (error) {
    logger.error("Get conversations error:", error);
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    const { limit = 50, page = 1 } = req.query;

    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
      isActive: true,
    })
      .populate("sender", "username fullName avatar")
      .populate("receiver", "username fullName avatar")
      .populate("product", "title price images")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Mark messages as read
    await Message.updateMany(
      {
        sender: userId,
        receiver: currentUserId,
        read: false,
      },
      {
        read: true,
        readAt: new Date(),
      },
    );

    // Emit read receipts
    io.to(`user:${userId}`).emit("messages-read", {
      userId: currentUserId,
      conversationId: [currentUserId, userId].sort().join("_"),
    });

    res.json({
      success: true,
      data: messages.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error("Get messages error:", error);
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        error: "Message not found",
      });
    }

    if (message.receiver.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: "Not authorized",
      });
    }

    message.read = true;
    message.readAt = new Date();
    await message.save();

    // Emit read receipt
    io.to(`user:${message.sender}`).emit("message-read", {
      messageId,
      readAt: message.readAt,
    });

    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    logger.error("Mark as read error:", error);
    next(error);
  }
};

export const deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        error: "Message not found",
      });
    }

    // Soft delete - add user to deletedFor array
    if (!message.deletedFor.includes(userId)) {
      message.deletedFor.push(userId);
      await message.save();
    }

    res.json({
      success: true,
      message: "Message deleted",
    });
  } catch (error) {
    logger.error("Delete message error:", error);
    next(error);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const count = await Message.countDocuments({
      receiver: userId,
      read: false,
      isActive: true,
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
