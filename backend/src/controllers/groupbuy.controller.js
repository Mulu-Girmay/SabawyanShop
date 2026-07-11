import GroupBuy from "../models/GroupBuy.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import Order from "../models/Order.js";
import { io } from "../app.js";
import logger from "../utils/logger.js";

export const createGroupBuy = async (req, res, next) => {
  try {
    const { productId, targetQuantity, expiresAt } = req.body;
    const userId = req.user.id;

    // Validate product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    if (!product.isGroupBuyable) {
      return res.status(400).json({
        success: false,
        error: "This product is not available for group buy",
      });
    }

    if (product.seller.toString() === userId) {
      return res.status(400).json({
        success: false,
        error: "You cannot create a group buy for your own product",
      });
    }

    if (product.quantity < targetQuantity) {
      return res.status(400).json({
        success: false,
        error: "Not enough stock available",
      });
    }

    // Check if user already has active group buy for this product
    const existingGroupBuy = await GroupBuy.findOne({
      product: productId,
      creator: userId,
      status: "active",
    });

    if (existingGroupBuy) {
      return res.status(400).json({
        success: false,
        error: "You already have an active group buy for this product",
      });
    }

    // Calculate price per unit with discount
    const discount = product.groupBuySettings?.discountPercentage || 10;
    const pricePerUnit = product.discountPrice || product.price;
    const discountedPrice = pricePerUnit * (1 - discount / 100);

    const groupBuy = await GroupBuy.create({
      product: productId,
      creator: userId,
      targetQuantity,
      currentQuantity: 1,
      pricePerUnit: discountedPrice,
      originalPrice: pricePerUnit,
      discount,
      expiresAt: new Date(expiresAt),
      members: [
        {
          user: userId,
          quantity: 1,
          joinedAt: new Date(),
        },
      ],
    });

    const populatedGroupBuy = await GroupBuy.findById(groupBuy._id)
      .populate("product", "title price images seller")
      .populate("creator", "username fullName avatar")
      .populate("members.user", "username fullName avatar");

    // Notify followers of creator
    const creator = await User.findById(userId);
    const followers = creator.followers;

    if (followers.length > 0) {
      const notifications = followers.map((followerId) => ({
        recipient: followerId,
        sender: userId,
        type: "group_buy",
        title: "New Group Buy",
        message: `${creator.fullName} started a group buy for ${product.title}`,
        data: { groupBuyId: groupBuy._id, productId },
      }));

      await Notification.insertMany(notifications);
    }

    // Emit socket event
    io.emit("new-group-buy", populatedGroupBuy);

    res.status(201).json({
      success: true,
      message: "Group buy created successfully",
      data: populatedGroupBuy,
    });
  } catch (error) {
    logger.error("Create group buy error:", error);
    next(error);
  }
};

export const joinGroupBuy = async (req, res, next) => {
  try {
    const { groupBuyId } = req.params;
    const { quantity = 1 } = req.body;
    const userId = req.user.id;

    const groupBuy = await GroupBuy.findById(groupBuyId);

    if (!groupBuy) {
      return res.status(404).json({
        success: false,
        error: "Group buy not found",
      });
    }

    if (groupBuy.status !== "active") {
      return res.status(400).json({
        success: false,
        error: `Group buy is ${groupBuy.status}`,
      });
    }

    if (new Date() > groupBuy.expiresAt) {
      groupBuy.status = "expired";
      await groupBuy.save();
      return res.status(400).json({
        success: false,
        error: "Group buy has expired",
      });
    }

    if (groupBuy.currentQuantity + quantity > groupBuy.targetQuantity) {
      return res.status(400).json({
        success: false,
        error: `Only ${groupBuy.targetQuantity - groupBuy.currentQuantity} spots remaining`,
      });
    }

    // Check if user already joined
    const existingMember = groupBuy.members.find(
      (m) => m.user.toString() === userId,
    );

    if (existingMember) {
      return res.status(400).json({
        success: false,
        error: "You have already joined this group buy",
      });
    }

    // Check product stock
    const product = await Product.findById(groupBuy.product);
    if (product.quantity < quantity) {
      return res.status(400).json({
        success: false,
        error: "Not enough stock available",
      });
    }

    // Add member
    groupBuy.members.push({
      user: userId,
      quantity,
      joinedAt: new Date(),
    });
    groupBuy.currentQuantity += quantity;

    await groupBuy.save();

    const populatedGroupBuy = await GroupBuy.findById(groupBuy._id)
      .populate("product", "title price images seller")
      .populate("creator", "username fullName avatar")
      .populate("members.user", "username fullName avatar");

    // Notify creator
    if (groupBuy.creator.toString() !== userId) {
      await Notification.create({
        recipient: groupBuy.creator,
        sender: userId,
        type: "group_buy",
        title: "New Member Joined",
        message: `${req.user.fullName} joined your group buy`,
        data: { groupBuyId, memberCount: groupBuy.members.length },
      });
    }

    // Emit socket event
    io.to(`user:${groupBuy.creator}`).emit(
      "group-buy-update",
      populatedGroupBuy,
    );
    io.emit("group-buy-joined", {
      groupBuyId,
      memberCount: groupBuy.members.length,
      currentQuantity: groupBuy.currentQuantity,
    });

    // Check if group buy is complete
    if (groupBuy.currentQuantity >= groupBuy.targetQuantity) {
      await fulfillGroupBuy(groupBuy._id);
    }

    res.json({
      success: true,
      message: "Successfully joined group buy",
      data: populatedGroupBuy,
    });
  } catch (error) {
    logger.error("Join group buy error:", error);
    next(error);
  }
};

export const getGroupBuys = async (req, res, next) => {
  try {
    const {
      status = "active",
      category,
      limit = 20,
      page = 1,
      sort = "-createdAt",
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (category) {
      const products = await Product.find({ category });
      query.product = { $in: products.map((p) => p._id) };
    }

    const skip = (page - 1) * limit;

    const groupBuys = await GroupBuy.find(query)
      .populate("product", "title price images seller category")
      .populate("creator", "username fullName avatar")
      .populate("members.user", "username fullName avatar")
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    // Calculate progress for each
    const groupBuysWithProgress = groupBuys.map((gb) => ({
      ...gb.toObject(),
      progress: ((gb.currentQuantity / gb.targetQuantity) * 100).toFixed(1),
      timeRemaining: getTimeRemaining(gb.expiresAt),
      spotsLeft: gb.targetQuantity - gb.currentQuantity,
    }));

    const total = await GroupBuy.countDocuments(query);

    res.json({
      success: true,
      data: groupBuysWithProgress,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Get group buys error:", error);
    next(error);
  }
};

export const getGroupBuy = async (req, res, next) => {
  try {
    const { id } = req.params;

    const groupBuy = await GroupBuy.findById(id)
      .populate("product", "title description price images seller quantity")
      .populate("creator", "username fullName avatar isVerified")
      .populate("members.user", "username fullName avatar");

    if (!groupBuy) {
      return res.status(404).json({
        success: false,
        error: "Group buy not found",
      });
    }

    const groupBuyData = {
      ...groupBuy.toObject(),
      progress: (
        (groupBuy.currentQuantity / groupBuy.targetQuantity) *
        100
      ).toFixed(1),
      timeRemaining: getTimeRemaining(groupBuy.expiresAt),
      spotsLeft: groupBuy.targetQuantity - groupBuy.currentQuantity,
      hasJoined: groupBuy.members.some(
        (m) => m.user._id.toString() === req.user.id,
      ),
    };

    res.json({
      success: true,
      data: groupBuyData,
    });
  } catch (error) {
    logger.error("Get group buy error:", error);
    next(error);
  }
};

export const cancelGroupBuy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const groupBuy = await GroupBuy.findById(id);

    if (!groupBuy) {
      return res.status(404).json({
        success: false,
        error: "Group buy not found",
      });
    }

    if (groupBuy.creator.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to cancel this group buy",
      });
    }

    if (groupBuy.status !== "active") {
      return res.status(400).json({
        success: false,
        error: "Group buy is already completed or cancelled",
      });
    }

    groupBuy.status = "cancelled";
    await groupBuy.save();

    // Notify all members
    const memberIds = groupBuy.members.map((m) => m.user);
    const notifications = memberIds.map((memberId) => ({
      recipient: memberId,
      sender: userId,
      type: "group_buy",
      title: "Group Buy Cancelled",
      message: `The group buy for ${groupBuy.product.title} has been cancelled`,
      data: { groupBuyId: id },
    }));

    await Notification.insertMany(notifications);

    res.json({
      success: true,
      message: "Group buy cancelled successfully",
    });
  } catch (error) {
    logger.error("Cancel group buy error:", error);
    next(error);
  }
};

export const getMyGroupBuys = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const groupBuys = await GroupBuy.find({
      $or: [{ creator: userId }, { "members.user": userId }],
    })
      .populate("product", "title price images seller")
      .populate("creator", "username fullName avatar")
      .populate("members.user", "username fullName avatar")
      .sort({ createdAt: -1 });

    const groupBuysData = groupBuys.map((gb) => ({
      ...gb.toObject(),
      progress: ((gb.currentQuantity / gb.targetQuantity) * 100).toFixed(1),
      timeRemaining: getTimeRemaining(gb.expiresAt),
      userRole: gb.creator._id.toString() === userId ? "creator" : "member",
    }));

    res.json({
      success: true,
      data: groupBuysData,
    });
  } catch (error) {
    logger.error("Get my group buys error:", error);
    next(error);
  }
};

// Helper function to fulfill group buy
const fulfillGroupBuy = async (groupBuyId) => {
  try {
    const groupBuy = await GroupBuy.findById(groupBuyId)
      .populate("product")
      .populate("members.user");

    if (!groupBuy) return;

    groupBuy.status = "fulfilled";
    await groupBuy.save();

    // Create orders for each member
    const orderPromises = groupBuy.members.map(async (member) => {
      const order = await Order.create({
        orderNumber: generateOrderNumber(),
        buyer: member.user._id,
        seller: groupBuy.product.seller,
        items: [
          {
            product: groupBuy.product._id,
            name: groupBuy.product.title,
            price: groupBuy.pricePerUnit,
            quantity: member.quantity,
            total: groupBuy.pricePerUnit * member.quantity,
            image: groupBuy.product.images[0],
          },
        ],
        subtotal: groupBuy.pricePerUnit * member.quantity,
        total: groupBuy.pricePerUnit * member.quantity,
        groupBuy: groupBuy._id,
        status: "processing",
        paymentStatus: "pending",
      });

      // Update member with order
      member.orderId = order._id;
      return order;
    });

    await Promise.all(orderPromises);
    await groupBuy.save();

    // Notify all members
    const notifications = groupBuy.members.map((member) => ({
      recipient: member.user._id,
      sender: groupBuy.creator,
      type: "group_buy",
      title: "Group Buy Fulfilled!",
      message: `🎉 Group buy complete! Your order for ${groupBuy.product.title} is being processed.`,
      data: { groupBuyId, orderId: member.orderId },
    }));

    await Notification.insertMany(notifications);

    // Emit socket event
    io.emit("group-buy-fulfilled", {
      groupBuyId,
      productTitle: groupBuy.product.title,
    });

    logger.info(`Group buy ${groupBuyId} fulfilled`);
  } catch (error) {
    logger.error("Fulfill group buy error:", error);
  }
};

// Helper functions
const getTimeRemaining = (expiresAt) => {
  const now = new Date();
  const diff = expiresAt - now;

  if (diff <= 0) return "Expired";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `COLLAB-${year}${month}${day}-${random}`;
};
