const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  deleteAccount,
  updateProfile,
  forgotPassword,
  verifyOtp,
  resetPassword,
} = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { apiLimiter } = require("../middlewares/rateLimiter.middleware");
const {
  recoveryLimiter,
} = require("../middlewares/recoveryLimiter.middleware");

// Get user profile
router
  .get("/profile", authMiddleware, getUserProfile)
  .post("/forgot-password", recoveryLimiter, forgotPassword)
  .post("/verify-otp", recoveryLimiter, verifyOtp)
  .post("/reset-password", recoveryLimiter, resetPassword)
  .put("/update-profile", authMiddleware, updateProfile)
  .delete("/account", authMiddleware, apiLimiter, deleteAccount);
module.exports = router;
