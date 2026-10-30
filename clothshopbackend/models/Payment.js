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
  },
  { timestamps: true },
);

PaymentSchema.index({ userId: 1, createdAt: -1, _id: -1 });

const Payment = mongoose.model("Payment", PaymentSchema);
module.exports = Payment;
