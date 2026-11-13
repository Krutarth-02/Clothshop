const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: {
    type: String,
    required: function () {
      return !this.isGoogleUser && !this.isFacebookUser;
    },
  },
  role: { type: String, default: "user" },
  status: { type: String, enum: ["active", "suspended"], default: "active", index: true },
  sessionVersion: { type: Number, default: 0, select: false },
  otpAttempts: { type: Number, default: 0, select: false },
  resetTokenHash: { type: String, select: false },
  resetTokenExpiry: { type: Date, select: false },
  firstLoginAt: { type: Date },
  lastLoginAt: { type: Date },
  city: { type: String },
  country: { type: String },
  phone: { type: String },
  image: { type: String },
  rememberMe: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },
  isOtpVerified: {
    type: Boolean,
    default: false,
  },
  isGoogleUser: {
    type: Boolean,
    default: false,
  },
  isFacebookUser: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });
module.exports = mongoose.model("User", UserSchema);
