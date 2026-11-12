const User = require("../models/User");
const AdminActivity = require("../models/AdminActivity");
const { withUniqueWelcomeCode } = require("./welcomeCoupon");

async function recordSuccessfulLogin(user, rememberMe) {
  const now = new Date();
  const updates = { rememberMe: rememberMe === true, lastLoginAt: now };
  const first = await withUniqueWelcomeCode((welcomeCouponCode) => User.findOneAndUpdate(
    { _id: user._id, firstLoginAt: null },
    { $set: { ...updates, firstLoginAt: now, welcomeCouponIssuedAt: now, welcomeCouponCode } },
    { new: true, runValidators: true },
  ));
  const updatedUser = first || await User.findByIdAndUpdate(user._id, { $set: updates },
    { new: true, runValidators: true });
  if (updatedUser) await AdminActivity.create({ userId: updatedUser._id, action: "USER_SIGNED_IN", resource: "customers", status: 200 })
    .catch(() => console.error("Login activity could not be recorded."));
  return updatedUser;
}

module.exports = { recordSuccessfulLogin };
