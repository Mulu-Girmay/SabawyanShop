import express from "express";
import {
  getProfile,
  updateProfile,
  updateAvatar,
  followUser,
  unfollowUser,
  searchUsers,
  getSuggestions,
} from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// Public routes
router.get("/search", searchUsers);
router.get("/suggestions", authenticate, getSuggestions);
router.get("/:username", getProfile);

// Protected routes (auth required — move suggestions out of public block since it needs auth)
router.put("/profile", authenticate, updateProfile);
router.put("/avatar", authenticate, upload.single("avatar"), updateAvatar);
router.post("/:userId/follow", authenticate, followUser);
router.delete("/:userId/follow", authenticate, unfollowUser);

export default router;
