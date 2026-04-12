const router = require("express").Router();
const { SignupUser, LoginUser } = require("../controllers/auth.controller");
const authMiddlewarre = require("../middlewares/auth.middleware");

// Register route
router.post('/login', LoginUser);
router.post('/register', SignupUser);

module.exports = router;