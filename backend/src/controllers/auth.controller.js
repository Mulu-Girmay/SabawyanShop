import * as authService from "../services/auth.service.js";
import { validateRegistration, validateLogin } from "../utils/validators.js";
import logger from "../utils/logger.js";

export const register = async (req, res, next) => {
  try {
    // Validate input
    const { error } = validateRegistration(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const result = await authService.register(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    logger.error("Register controller error:", error);
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    // Validate input
    const { error } = validateLogin(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const { email, password } = req.body;
    const result = await authService.login(email, password);

    res.json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    logger.error("Login controller error:", error);
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: "Refresh token required",
      });
    }

    const tokens = await authService.refreshToken(refreshToken);

    res.json({
      success: true,
      data: tokens,
    });
  } catch (error) {
    logger.error("Refresh token controller error:", error);
    next(error);
  }
};

export const logout = async (req, res) => {
  // Client-side will remove tokens
  res.json({
    success: true,
    message: "Logged out successfully",
  });
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email required",
      });
    }

    await authService.forgotPassword(email);

    res.json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (error) {
    logger.error("Forgot password controller error:", error);
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        error: "Token and password required",
      });
    }

    await authService.resetPassword(token, password);

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    logger.error("Reset password controller error:", error);
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("followers", "username fullName avatar")
      .populate("following", "username fullName avatar");

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error("Get current user error:", error);
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerified: false,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid verification token",
      });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    logger.error("Verify email error:", error);
    next(error);
  }
};
