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

// Get user profile
router
  .get("/profile", authMiddleware, getUserProfile)
  .post("/forgot-password", forgotPassword)
  .post("/verify-otp", verifyOtp)
  .post("/reset-password", resetPassword)
  .put("/update-profile", authMiddleware, updateProfile)
  .delete("/account", authMiddleware, apiLimiter, deleteAccount);
module.exports = router;
