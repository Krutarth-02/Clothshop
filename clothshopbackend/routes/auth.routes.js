const router = require("express").Router();
const { SignupUser, LoginUser } = require("../controllers/auth.controller");
const { apiLimiter } = require("../middlewares/rateLimiter.middleware");

// Register route
router.post('/login', apiLimiter, LoginUser);
router.post('/register', apiLimiter, SignupUser);

module.exports = router;