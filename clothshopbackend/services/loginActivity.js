const User = require("../models/User");

async function recordSuccessfulLogin(user, rememberMe) {
  const now = new Date();
  const updates = { rememberMe: rememberMe === true, lastLoginAt: now };
  const first = await User.findOneAndUpdate(
    { _id: user._id, firstLoginAt: null },
    { $set: { ...updates, firstLoginAt: now } },
    { new: true, runValidators: true },
  );
  if (first) return first;
  return User.findByIdAndUpdate(user._id, { $set: updates },
    { new: true, runValidators: true });
}

module.exports = { recordSuccessfulLogin };
