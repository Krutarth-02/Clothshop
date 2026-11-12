const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const { getWelcomeCoupon, dismissWelcomeCoupon } = require("../controllers/coupon.controller");
router.get("/welcome", auth, getWelcomeCoupon);
router.post("/welcome/dismiss", auth, dismissWelcomeCoupon);
module.exports = router;
