const router = require("express").Router();
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
const rateLimit = require("express-rate-limit");
const recoveryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: { message: "Too many recovery attempts. Please try again later." },
});
// Get user profile
router
  .get("/profile", authMiddleware, getUserProfile)
  .post("/forgot-password", recoveryLimiter, forgotPassword)
  .post("/verify-otp", recoveryLimiter, verifyOtp)
  .post("/reset-password", recoveryLimiter, resetPassword)
  .put("/update-profile", authMiddleware, updateProfile)
  .delete("/account", authMiddleware, apiLimiter, deleteAccount);
module.exports = router;
