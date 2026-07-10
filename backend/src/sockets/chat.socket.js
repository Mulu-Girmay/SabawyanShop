import Message from "../models/Message.js";
import User from "../models/User.js";
import logger from "../utils/logger.js";

export default (io, socket) => {
  // Handle typing indicators
  socket.on("typing", (data) => {
    socket.to(`user:${data.receiverId}`).emit("typing", {
      senderId: socket.userId,
      username: socket.username,
    });
  });

  socket.on("stop-typing", (data) => {
    socket.to(`user:${data.receiverId}`).emit("stop-typing", {
      senderId: socket.userId,
    });
  });

  // Handle message delivery status
  socket.on("message-delivered", async (data) => {
    try {
      const { messageId } = data;
      await Message.findByIdAndUpdate(messageId, {
        delivered: true,
        deliveredAt: new Date(),
      });

      const message = await Message.findById(messageId);
      io.to(`user:${message.sender}`).emit("message-delivered", {
        messageId,
        deliveredAt: new Date(),
      });
    } catch (error) {
      logger.error("Message delivery error:", error);
    }
  });

  // Handle user going offline
  socket.on("disconnect", async () => {
    try {
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastActive: new Date(),
      });

      io.emit("user-offline", {
        userId: socket.userId,
      });
    } catch (error) {
      logger.error("User offline error:", error);
    }
  });

  // Handle user coming online
  socket.on("user-online", async () => {
    try {
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: true,
        lastActive: new Date(),
      });

      io.emit("user-online", {
        userId: socket.userId,
      });
    } catch (error) {
      logger.error("User online error:", error);
    }
  });
};
