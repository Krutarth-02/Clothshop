const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
      ],
      required: true,
      validate: {
        validator: (products) => Array.isArray(products) && products.length > 0,
        message: "At least one product is required.",
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isFinite,
        message: "Enter a valid total amount.",
      },
    },
    paymentMethod: { type: String, enum: ["cod", "online"], default: "cod" },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paidAt: { type: Date },
    couponCode: { type: String, trim: true, uppercase: true },
    discountAmount: { type: Number, min: 0, default: 0 },
    subtotal: { type: Number, min: 0 },
    orderStatus: { type: String, enum: ["confirmed" ] },
    requestId: { type: String },
    requestFingerprint: { type: String },
    shippingAddress: {
      fullName: String,
      phone: String,
      addressLine: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    items: [{
      _id: false,
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: String,
      image: String,
      color: String,
      size: String,
      quantity: Number,
      unitPrice: Number,
      lineTotal: Number,
    }],
  },
  { timestamps: true },
);

PaymentSchema.index({ userId: 1, createdAt: -1, _id: -1 });
PaymentSchema.index({ userId: 1, requestId: 1 }, {
  name: "unique_checkout_request",
  unique: true,
  partialFilterExpression: { requestId: { $type: "string" } },
});
// A welcome coupon can belong to only one order, including pending orders.
PaymentSchema.index({ userId: 1, couponCode: 1 }, {
  name: "one_active_payment_per_coupon",
  unique: true,
  partialFilterExpression: { couponCode: { $type: "string" }, status: { $in: ["pending", "paid", "refunded"] } },
});

const Payment = mongoose.model("Payment", PaymentSchema);
module.exports = Payment;
