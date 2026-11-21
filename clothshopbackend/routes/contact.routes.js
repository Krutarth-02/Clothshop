const express = require("express");
const router = express.Router();
const { apiLimiter } = require("../middlewares/rateLimiter.middleware");
const { sendContactMessage } = require("../controllers/contact.controller");

router.post("/", apiLimiter, sendContactMessage);
module.exports = router;
