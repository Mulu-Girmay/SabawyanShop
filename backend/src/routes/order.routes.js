import express from "express";
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  getOrderStats,
} from "../controllers/order.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// All order routes require authentication
router.use(authenticate);

router.post("/", createOrder);
router.get("/", getOrders);
router.get("/stats", getOrderStats);
router.get("/:id", getOrder);
router.put("/:id/status", updateOrderStatus);
router.put("/:id/cancel", cancelOrder);

export default router;
