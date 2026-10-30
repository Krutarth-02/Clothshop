const express = require("express");
const rateLimit = require("express-rate-limit");
const { sendContactMessage } = require("../controllers/contact.controller");

const router = express.Router();
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many messages. Please wait 15 minutes before trying again." },
});
router.post("/", contactLimiter, sendContactMessage);
module.exports = router;
