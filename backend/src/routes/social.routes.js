import express from "express";
import {
  createPost,
  getFeed,
  getPost,
  likePost,
  commentOnPost,
  deleteComment,
  deletePost,
} from "../controllers/social.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// All social routes require authentication
router.use(authenticate);

router.post("/posts", createPost);
router.get("/feed", getFeed);
router.get("/posts/:id", getPost);
router.post("/posts/:id/like", likePost);
router.post("/posts/:id/comments", commentOnPost);
router.delete("/posts/:postId/comments/:commentId", deleteComment);
router.delete("/posts/:id", deletePost);

export default router;
