const express = require("express");
const router = express.Router();
const {
  SignupUser,
  LoginUser,
  LogoutUser,
} = require("../controllers/auth.controller");
const { apiLimiter } = require("../middlewares/rateLimiter.middleware");
const authMiddleware = require("../middlewares/auth.middleware");
// Register route
router
  .post("/login", apiLimiter, LoginUser)
  .post("/register", apiLimiter, SignupUser)
  .post("/logout", authMiddleware, LogoutUser);

module.exports = router;
