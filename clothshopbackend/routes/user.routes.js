const router = require("express").Router();
const { getUserProfile, forgotPassword, verifyOtp, resetPassword } = require("../controllers/user.controller");
// Get user profile
router.get('/:_id', getUserProfile);
router.post("/forgot-password", forgotPassword)
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
module.exports = router;