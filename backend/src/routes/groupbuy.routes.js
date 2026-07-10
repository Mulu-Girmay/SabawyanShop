import express from "express";
import {
  createGroupBuy,
  joinGroupBuy,
  getGroupBuys,
  getGroupBuy,
  cancelGroupBuy,
  getMyGroupBuys,
} from "../controllers/groupbuy.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getGroupBuys);
router.get("/:id", authenticate, getGroupBuy);

// Protected routes
router.post("/", authenticate, createGroupBuy);
router.post("/:groupBuyId/join", authenticate, joinGroupBuy);
router.delete("/:id/cancel", authenticate, cancelGroupBuy);
router.get("/my/group-buys", authenticate, getMyGroupBuys);

export default router;
