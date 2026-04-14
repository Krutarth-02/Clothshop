const rateLimit = require('express-rate-limit');

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 requests per IP
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

module.exports = { apiLimiter }