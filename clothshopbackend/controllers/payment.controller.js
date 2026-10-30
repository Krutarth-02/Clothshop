const Payment = require("../models/Payment");

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



module.exports = { getPayments };
