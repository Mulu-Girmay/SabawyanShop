import express from "express";
import {
  sendMessage,
  getConversations,
  getMessages,
  markAsRead,
  deleteMessage,
  getUnreadCount,
} from "../controllers/chat.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// All chat routes require authentication
router.use(authenticate);

router.post("/messages", sendMessage);
router.get("/conversations", getConversations);
router.get("/messages/:userId", getMessages);
router.put("/messages/:messageId/read", markAsRead);
router.delete("/messages/:messageId", deleteMessage);
router.get("/unread", getUnreadCount);

export default router;
