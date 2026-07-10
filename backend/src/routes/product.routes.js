import express from "express";
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  getProductsBySeller,
} from "../controllers/product.controller.js";
import { authenticate, requireSeller } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// Public routes
router.get("/", getProducts);
router.get("/:id", getProduct);
router.get("/seller/:sellerId", getProductsBySeller);

// Protected routes (seller only)
router.post("/", authenticate, requireSeller, createProduct);
router.put("/:id", authenticate, requireSeller, updateProduct);
router.delete("/:id", authenticate, requireSeller, deleteProduct);
router.post(
  "/:id/images",
  authenticate,
  requireSeller,
  upload.array("images", 5),
  uploadProductImages,
);

export default router;
