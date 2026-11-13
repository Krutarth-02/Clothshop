const Payment = require("../models/Payment");
const User = require("../models/User");
const { UnauthorizedError } = require("../utils/errors");
const { normalizeCheckout, buildQuote, placeCodOrder } = require("../services/checkout");

// GET /payments/checkout-details: saved delivery fields for the signed-in user.
async function getCheckoutDetails(req, res, next) {
  try {
    const [user, order] = await Promise.all([
      User.findById(req.user.userId).select("fullName phone city country").lean(),
      Payment.findOne({
        userId: req.user.userId,
        orderStatus: "confirmed",
        "shippingAddress.country": "India",
      }).sort({ createdAt: -1, _id: -1 }).select("shippingAddress").lean(),
    ]);
    if (!user) return next(new UnauthorizedError("Session user no longer exists"));

    const saved = order?.shippingAddress || {};
    const text = (value) => typeof value === "string" ? value.trim() : "";
    const phone = text(saved.phone) || text(user.phone);
    const digits = phone.replace(/\D/g, "");
    res.json({ data: { shippingAddress: {
      fullName: text(saved.fullName) || text(user.fullName),
      phone: /^(?:91|0)[6-9]\d{9}$/.test(digits) ? digits.slice(-10) : digits,
      addressLine: text(saved.addressLine),
      city: text(saved.city) || (!user.country || /^(india|in)$/i.test(text(user.country)) ? text(user.city) : ""),
      state: text(saved.state),
      postalCode: text(saved.postalCode),
      country: "India",
    } } });
  } catch (error) {
    next(error);
  }
}

async function quoteCheckout(req, res, next) {
  try {
    const { data } = await buildQuote(req.user.userId, normalizeCheckout(req.body));
    res.json({ data });
  } catch (error) {
    next(error);
  }
}

async function createCodOrder(req, res, next) {
  try {
    const data = await placeCodOrder(req.user.userId, req.body);
    res.status(201).json({ message: "Your cash on delivery order is confirmed.", data });
  } catch (error) {
    next(error);
  }
}

const getPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ userId: req.user.userId })
      .populate("productId", "name image price category")
      .sort({ createdAt: -1, _id: -1 })
      .lean();

    return res.status(200).json({
      message: "Payment history retrieved successfully",
      count: payments.length,
      data: payments,
    });
  } catch (err) {
    next(err);
  }
};



module.exports = { getPayments, getCheckoutDetails, quoteCheckout, createCodOrder };
