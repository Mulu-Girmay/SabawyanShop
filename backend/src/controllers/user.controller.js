import User from "../models/User.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import logger from "../utils/logger.js";

export const getProfile = async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username })
      .select(
        "-password -emailVerificationToken -resetPasswordToken -resetPasswordExpire",
      )
      .populate("followers", "username fullName avatar")
      .populate("following", "username fullName avatar");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Check if current user is following this user
    let isFollowing = false;
    if (req.user) {
      const currentUser = await User.findById(req.user.id);
      isFollowing = currentUser.following.includes(user._id);
    }

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        isFollowing,
      },
    });
  } catch (error) {
    logger.error("Get profile error:", error);
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const updates = {
      fullName: req.body.fullName,
      bio: req.body.bio,
      preferences: req.body.preferences,
    };

    // Remove undefined values
    Object.keys(updates).forEach(
      (key) => updates[key] === undefined && delete updates[key],
    );

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    logger.error("Update profile error:", error);
    next(error);
  }
};

export const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Please upload an image",
      });
    }

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: "avatars",
      width: 500,
      height: 500,
      crop: "fill",
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: result.secure_url },
      { new: true },
    ).select("-password");

    res.json({
      success: true,
      message: "Avatar updated successfully",
      data: { avatar: user.avatar },
    });
  } catch (error) {
    logger.error("Update avatar error:", error);
    next(error);
  }
};

export const followUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (userId === currentUserId) {
      return res.status(400).json({
        success: false,
        error: "You cannot follow yourself",
      });
    }

    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const currentUser = await User.findById(currentUserId);

    if (currentUser.following.includes(userId)) {
      return res.status(400).json({
        success: false,
        error: "Already following this user",
      });
    }

    // Add to following/followers
    await User.findByIdAndUpdate(currentUserId, {
      $push: { following: userId },
    });

    await User.findByIdAndUpdate(userId, {
      $push: { followers: currentUserId },
    });

    // Create notification
    await Notification.create({
      recipient: userId,
      sender: currentUserId,
      type: "follow",
      message: `${currentUser.fullName} started following you`,
    });

    res.json({
      success: true,
      message: "User followed successfully",
    });
  } catch (error) {
    logger.error("Follow user error:", error);
    next(error);
  }
};

export const unfollowUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (userId === currentUserId) {
      return res.status(400).json({
        success: false,
        error: "You cannot unfollow yourself",
      });
    }

    const currentUser = await User.findById(currentUserId);

    if (!currentUser.following.includes(userId)) {
      return res.status(400).json({
        success: false,
        error: "Not following this user",
      });
    }

    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: userId },
    });

    await User.findByIdAndUpdate(userId, {
      $pull: { followers: currentUserId },
    });

    res.json({
      success: true,
      message: "User unfollowed successfully",
    });
  } catch (error) {
    logger.error("Unfollow user error:", error);
    next(error);
  }
};

export const searchUsers = async (req, res, next) => {
  try {
    const { query, limit = 20, page = 1 } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        error: "Search query must be at least 2 characters",
      });
    }

    const skip = (page - 1) * limit;

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { fullName: { $regex: query, $options: "i" } },
        { "sellerProfile.storeName": { $regex: query, $options: "i" } },
      ],
      isActive: true,
    })
      .select(
        "username fullName avatar isSeller sellerProfile isVerified followers",
      )
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ followers: -1 });

    const total = await User.countDocuments({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { fullName: { $regex: query, $options: "i" } },
        { "sellerProfile.storeName": { $regex: query, $options: "i" } },
      ],
      isActive: true,
    });

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Search users error:", error);
    next(error);
  }
};

export const getSuggestions = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user.id).select(
      "following interests",
    );

    // Get users not followed and not self
    const suggestions = await User.aggregate([
      {
        $match: {
          _id: { $ne: req.user.id },
          _id: { $nin: currentUser.following },
          isActive: true,
        },
      },
      {
        $addFields: {
          score: {
            $add: [
              { $multiply: [{ $size: "$followers" }, 0.5] },
              { $cond: [{ $eq: ["$isVerified", true] }, 10, 0] },
            ],
          },
        },
      },
      { $sort: { score: -1 } },
      { $limit: 10 },
      {
        $project: {
          username: 1,
          fullName: 1,
          avatar: 1,
          isVerified: 1,
          isSeller: 1,
          followers: { $size: "$followers" },
        },
      },
    ]);

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    logger.error("Get suggestions error:", error);
    next(error);
  }
};
