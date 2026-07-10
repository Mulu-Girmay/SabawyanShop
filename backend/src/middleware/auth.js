import jwt from "jsonwebtoken";
import User from "../models/User.js";
import logger from "../utils/logger.js";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: "Account is deactivated",
      });
    }

    req.user = {
      id: user._id,
      email: user.email,
      username: user.username,
      isSeller: user.isSeller,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified,
      fullName: user.fullName,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token expired",
      });
    }

    logger.error("Auth middleware error:", error);
    return res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }
};

export const requireSeller = (req, res, next) => {
  if (!req.user.isSeller) {
    return res.status(403).json({
      success: false,
      error: "Seller account required",
    });
  }
  next();
};

export const requireAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      error: "Admin access required",
    });
  }
  next();
};
