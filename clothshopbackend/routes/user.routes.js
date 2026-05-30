const router = require("express").Router();
const { getUserProfile, forgotPassword, verifyOtp, resetPassword, updateProfile } = require("../controllers/user.controller");
const authMiddleware = require('../middlewares/auth.middleware')
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "." + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Get user profile
router.get('/profile',authMiddleware, getUserProfile)
.post("/forgot-password", forgotPassword)
.post("/verify-otp", verifyOtp)
.post("/reset-password", resetPassword)
.put("/update-profile", upload.single("image"), authMiddleware, updateProfile);
module.exports = router;