const User = require("../models/User");
const Payment = require("../models/Payment");
const { ensureWelcomeCouponCode } = require("../services/welcomeCoupon");

async function getWelcomeCoupon(req, res, next) {
  try {
    let user = await User.findById(req.user.userId)
      .select("welcomeCouponIssuedAt welcomeCouponSeenAt welcomeCouponCode welcomeCouponUsedAt").lean();
    if (!user) return res.status(401).json({ message: "Please sign in again." });
    if (!user.welcomeCouponIssuedAt) return res.json({ data: null });
    user = await ensureWelcomeCouponCode(user);
    if (!user) return res.status(401).json({ message: "Please sign in again." });
    const payment = await Payment.findOne({
      userId: req.user.userId,
      // Retain usage history for coupons issued before unique codes were added.
      couponCode: { $in: [user.welcomeCouponCode, "FIRST11"] },
      status: { $in: ["pending", "paid", "refunded"] },
    }).select("status orderStatus paidAt createdAt updatedAt").lean();
    let status = user.welcomeCouponUsedAt ? "used" : "available";
    if (payment) status = payment.status === "pending" && payment.orderStatus !== "confirmed" ? "reserved" : "used";

    return res.json({
      data: {
        code: user.welcomeCouponCode,
        percent: 10,
        status,
        issuedAt: user.welcomeCouponIssuedAt,
        seenAt: user.welcomeCouponSeenAt || null,
        usedAt: status === "used" ? user.welcomeCouponUsedAt || payment?.paidAt || payment?.createdAt || payment?.updatedAt : null,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function dismissWelcomeCoupon(req, res, next) {
  try {
    await User.updateOne({
      _id: req.user.userId,
      welcomeCouponIssuedAt: { $ne: null },
      welcomeCouponSeenAt: null,
    }, { $set: { welcomeCouponSeenAt: new Date() } });
    return res.json({ message: "Welcome offer acknowledged." });
  } catch (error) {
    next(error);
  }
}

module.exports = { getWelcomeCoupon, dismissWelcomeCoupon };
