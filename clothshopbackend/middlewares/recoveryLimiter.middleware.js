const rateLimit = require("express-rate-limit");
const recoveryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: { message: "Too many recovery attempts. Please try again later." },
});

module.exports = { recoveryLimiter };
