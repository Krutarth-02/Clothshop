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
const { trustedOrigin } = require("../middlewares/origin.middleware");
const { apiLimiter } = require("../middlewares/rateLimiter.middleware");
const {
  recoveryLimiter,
} = require("../middlewares/recoveryLimiter.middleware");

// Get user profile
router
  .get("/profile", authMiddleware, getUserProfile)
  .post("/forgot-password", recoveryLimiter, forgotPassword)
  .post("/verify-otp", trustedOrigin, recoveryLimiter, verifyOtp)
  .post("/reset-password", trustedOrigin, recoveryLimiter, resetPassword)
  .put("/update-profile", authMiddleware, trustedOrigin, updateProfile)
  .delete("/account", authMiddleware, trustedOrigin, apiLimiter, deleteAccount);
module.exports = router;
