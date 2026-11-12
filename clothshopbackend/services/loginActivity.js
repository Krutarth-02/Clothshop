const User = require("../models/User");
const { withUniqueWelcomeCode } = require("./welcomeCoupon");

async function recordSuccessfulLogin(user, rememberMe) {
  const now = new Date();
  const updates = { rememberMe: rememberMe === true, lastLoginAt: now };
  const first = await withUniqueWelcomeCode((welcomeCouponCode) => User.findOneAndUpdate(
    { _id: user._id, firstLoginAt: null },
    { $set: { ...updates, firstLoginAt: now, welcomeCouponIssuedAt: now, welcomeCouponCode } },
    { new: true, runValidators: true },
  ));
  if (first) return first;
  return User.findByIdAndUpdate(user._id, { $set: updates },
    { new: true, runValidators: true });
}

module.exports = { recordSuccessfulLogin };
