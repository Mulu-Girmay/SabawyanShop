import express from "express";
import {
  getDashboardStats,
  getUsers,
  getUser,
  updateUser,
  suspendUser,
  getProducts,
  deleteProductAdmin,
  getReports,
  broadcastNotification,
} from "../controllers/admin.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Dashboard
router.get("/stats", getDashboardStats);

// User management
router.get("/users", getUsers);
router.get("/users/:id", getUser);
router.put("/users/:id", updateUser);
router.put("/users/:id/suspend", suspendUser);

// Product management
router.get("/products", getProducts);
router.delete("/products/:id", deleteProductAdmin);

// Reports
router.get("/reports", getReports);

// Communications
router.post("/broadcast", broadcastNotification);

export default router;
