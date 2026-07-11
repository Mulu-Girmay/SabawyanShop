import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cart.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// All cart routes require authentication
router.use(authenticate);

router.get("/", getCart);
router.post("/", addToCart);
router.put("/:productId", updateCartItem);
router.delete("/clear", clearCart);          // must be before /:productId
router.delete("/:productId", removeFromCart);

export default router;
