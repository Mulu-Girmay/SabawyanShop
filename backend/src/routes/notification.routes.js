import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  dismissNotification,
  deleteNotification,
  getUnreadCount,
} from "../controllers/notification.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// All notification routes require authentication
router.use(authenticate);

router.get("/", getNotifications);
router.get("/unread", getUnreadCount);
router.put("/read-all", markAllAsRead);
router.put("/:id/read", markAsRead);
router.put("/:id/dismiss", dismissNotification);
router.delete("/:id", deleteNotification);

export default router;
