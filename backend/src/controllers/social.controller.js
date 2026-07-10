import Post from "../models/Post.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import logger from "../utils/logger.js";

export const createPost = async (req, res, next) => {
  try {
    const { content, productId, visibility = "public" } = req.body;
    const userId = req.user.id;

    const post = await Post.create({
      content,
      author: userId,
      product: productId,
      visibility,
      images: req.body.images || [],
    });

    const populatedPost = await Post.findById(post._id)
      .populate("author", "username fullName avatar isVerified")
      .populate("product", "title price images");

    // Notify followers
    const user = await User.findById(userId);
    const followers = user.followers;

    if (followers.length > 0) {
      const notifications = followers.map((followerId) => ({
        recipient: followerId,
        sender: userId,
        type: "post",
        message: `${user.fullName} created a new post`,
        data: { postId: post._id },
      }));

      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      success: true,
      data: populatedPost,
    });
  } catch (error) {
    logger.error("Create post error:", error);
    next(error);
  }
};

export const getFeed = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = 20, page = 1 } = req.query;

    const user = await User.findById(userId);
    const following = [...user.following, userId];

    const skip = (page - 1) * limit;

    const posts = await Post.find({
      author: { $in: following },
      isActive: true,
      visibility: { $in: ["public", "followers"] },
    })
      .populate("author", "username fullName avatar isVerified")
      .populate("product", "title price images seller")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    // Check if current user liked each post
    const postsWithUserData = await Promise.all(
      posts.map(async (post) => {
        const isLiked = await Post.exists({
          _id: post._id,
          likes: userId,
        });

        return {
          ...post,
          isLiked: !!isLiked,
          likesCount: post.likes?.length || 0,
          commentsCount: post.comments?.length || 0,
        };
      }),
    );

    const total = await Post.countDocuments({
      author: { $in: following },
      isActive: true,
    });

    res.json({
      success: true,
      data: postsWithUserData,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Get feed error:", error);
    next(error);
  }
};

export const getPost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id)
      .populate("author", "username fullName avatar isVerified")
      .populate("product", "title price images seller")
      .populate("comments.user", "username fullName avatar");

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post not found",
      });
    }

    // Check visibility
    if (
      post.visibility === "private" &&
      post.author._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to view this post",
      });
    }

    const isLiked = post.likes.includes(req.user.id);

    res.json({
      success: true,
      data: {
        ...post.toObject(),
        isLiked,
        likesCount: post.likes.length,
        commentsCount: post.comments.length,
      },
    });
  } catch (error) {
    logger.error("Get post error:", error);
    next(error);
  }
};

export const likePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post not found",
      });
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // Unlike
      await Post.findByIdAndUpdate(id, {
        $pull: { likes: userId },
      });

      res.json({
        success: true,
        data: { isLiked: false, likesCount: post.likes.length - 1 },
      });
    } else {
      // Like
      await Post.findByIdAndUpdate(id, {
        $push: { likes: userId },
      });

      // Create notification
      if (post.author.toString() !== userId) {
        await Notification.create({
          recipient: post.author,
          sender: userId,
          type: "like",
          message: `${req.user.fullName} liked your post`,
          data: { postId: id },
        });
      }

      res.json({
        success: true,
        data: { isLiked: true, likesCount: post.likes.length + 1 },
      });
    }
  } catch (error) {
    logger.error("Like post error:", error);
    next(error);
  }
};

export const commentOnPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.length < 1) {
      return res.status(400).json({
        success: false,
        error: "Comment content is required",
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post not found",
      });
    }

    const comment = {
      user: userId,
      content,
      createdAt: new Date(),
    };

    post.comments.push(comment);
    await post.save();

    // Populate comment user details
    const populatedPost = await Post.findById(id).populate(
      "comments.user",
      "username fullName avatar",
    );

    const newComment =
      populatedPost.comments[populatedPost.comments.length - 1];

    // Create notification
    if (post.author.toString() !== userId) {
      await Notification.create({
        recipient: post.author,
        sender: userId,
        type: "comment",
        message: `${req.user.fullName} commented on your post`,
        data: { postId: id, commentId: newComment._id },
      });
    }

    res.status(201).json({
      success: true,
      data: newComment,
    });
  } catch (error) {
    logger.error("Comment on post error:", error);
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post not found",
      });
    }

    const commentIndex = post.comments.findIndex(
      (c) => c._id.toString() === commentId,
    );

    if (commentIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Comment not found",
      });
    }

    const comment = post.comments[commentIndex];

    // Check if user owns the comment or post
    if (
      comment.user.toString() !== userId &&
      post.author.toString() !== userId &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this comment",
      });
    }

    post.comments.splice(commentIndex, 1);
    await post.save();

    res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    logger.error("Delete comment error:", error);
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post not found",
      });
    }

    if (post.author.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this post",
      });
    }

    // Soft delete
    post.isActive = false;
    await post.save();

    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    logger.error("Delete post error:", error);
    next(error);
  }
};
