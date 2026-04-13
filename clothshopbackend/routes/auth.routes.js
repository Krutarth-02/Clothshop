const router = require("express").Router();
const { SignupUser, LoginUser } = require("../controllers/auth.controller");

// Register route
router.post('/login', LoginUser);
router.post('/register', SignupUser);

module.exports = router;