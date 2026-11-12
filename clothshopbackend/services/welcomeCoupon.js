const { randomBytes } = require("node:crypto");
const User = require("../models/User");

function generateWelcomeCode() {
  return `WELCOME-${randomBytes(6).toString("hex").toUpperCase()}`;
}

// The unique database index is the final guard against a random collision.
async function withUniqueWelcomeCode(saveCode) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await saveCode(generateWelcomeCode());
    } catch (error) {
      const codeCollision = error.code === 11000 && error.keyPattern?.welcomeCouponCode;
      if (!codeCollision || attempt === 4) throw error;
    }
  }
}

async function ensureWelcomeCouponCode(user) {
  if (!user.welcomeCouponIssuedAt || user.welcomeCouponCode) return user;

  // Upgrade previously issued shared-code coupons without resetting seen/used state.
  const updatedUser = await withUniqueWelcomeCode((code) => User.findOneAndUpdate(
    { _id: user._id, welcomeCouponCode: null },
    { $set: { welcomeCouponCode: code } },
    { new: true, runValidators: true },
  ).select("welcomeCouponIssuedAt welcomeCouponSeenAt welcomeCouponCode welcomeCouponUsedAt").lean());

  if (updatedUser) return updatedUser;

  // A concurrent request may have assigned the code first.
  return User.findById(user._id)
    .select("welcomeCouponIssuedAt welcomeCouponSeenAt welcomeCouponCode welcomeCouponUsedAt").lean();
}

module.exports = { generateWelcomeCode, withUniqueWelcomeCode, ensureWelcomeCouponCode };
