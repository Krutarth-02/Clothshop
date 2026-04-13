const router = require("express").Router();
const { getUserProfile } = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");
// Get user profile
router.get('/:_id', getUserProfile);
module.exports = router;