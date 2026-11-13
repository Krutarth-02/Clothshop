const User = require("../models/User");

const recordSuccessfulLogin = async (user, rememberMe) => {
  const now = new Date();
  const updates = { rememberMe: rememberMe === true, lastLoginAt: now };
  const first = await User.findOneAndUpdate(
    { _id: user._id, firstLoginAt: null },
    { $set: { ...updates, firstLoginAt: now } },
    { returnDocument: "after", runValidators: true },
  );
  return first || User.findByIdAndUpdate(user._id, { $set: updates }, { returnDocument: "after", runValidators: true });
};

module.exports = { recordSuccessfulLogin };
