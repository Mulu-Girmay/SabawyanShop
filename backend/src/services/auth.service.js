import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../utils/email.js";
import logger from "../utils/logger.js";

const generateTokens = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    username: user.username,
    isSeller: user.isSeller,
    isAdmin: user.isAdmin,
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d" },
  );

  return { accessToken, refreshToken };
};

export const register = async (userData) => {
  try {
    const { email, username, password, fullName, isSeller } = userData;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() },
      ],
    });

    if (existingUser) {
      throw new Error("User already exists with this email or username");
    }

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password,
      fullName,
      isSeller: isSeller || false,
    });

    // If seller, initialize seller profile
    if (user.isSeller) {
      user.sellerProfile = {
        storeName: `${fullName}'s Store`,
        verificationStatus: "pending",
      };
      await user.save();
    }

    // Generate tokens
    const tokens = generateTokens(user);

    // Remove password from response
    const userObj = user.toObject();
    delete userObj.password;

    // Send welcome email (async)
    sendWelcomeEmail(user.email, user.fullName).catch((err) => {
      logger.error("Welcome email failed:", err);
    });

    return { user: userObj, ...tokens };
  } catch (error) {
    logger.error("Registration error:", error);
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    // Find user with password included
    const user = await User.findOne({ email: email.toLowerCase() })
      .select("+password")
      .lean();

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    // Update last active
    await User.findByIdAndUpdate(user._id, { lastActive: new Date() });

    // Generate tokens
    const tokens = generateTokens(user);

    // Remove password
    delete user.password;

    return { user, ...tokens };
  } catch (error) {
    logger.error("Login error:", error);
    throw error;
  }
};

export const refreshToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new Error("User not found");
    }

    return generateTokens(user);
  } catch (error) {
    logger.error("Refresh token error:", error);
    throw new Error("Invalid refresh token");
  }
};

export const forgotPassword = async (email) => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new Error("User not found");
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour

    await user.save();

    // Send reset email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request - CollabCart",
      html: `
        <h1>Reset Your Password</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    return { message: "Password reset email sent" };
  } catch (error) {
    logger.error("Forgot password error:", error);
    throw error;
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw new Error("Invalid or expired reset token");
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return { message: "Password reset successfully" };
  } catch (error) {
    logger.error("Reset password error:", error);
    throw error;
  }
};

const sendWelcomeEmail = async (email, name) => {
  // Implementation for welcome email
  // Could use nodemailer or SendGrid
};
