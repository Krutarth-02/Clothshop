const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Provision the trusted account during the normal backend startup, never from request data.
async function initializeAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email && !password) return;
  if (
    !email ||
    !password ||
    password.length < 12 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    throw new Error(
      "Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters in the backend .env.",
    );
  }
  let user = await User.findOne({ email }).collation({
    locale: "en",
    strength: 2,
  });
  if (!user) {
    user = new User({
      fullName: process.env.ADMIN_NAME?.trim() || "Store administrator",
      email,
      password: await bcrypt.hash(password, 12),
      role: "admin",
    });
    await user.save();
  } else if (user.role === "admin") {
    // The trusted backend configuration is the source of this admin's credentials.
    if (!user.password || !(await bcrypt.compare(password, user.password))) {
      user.password = await bcrypt.hash(password, 12);
      await user.save();
    }
  } else {
    if (!user.password || !(await bcrypt.compare(password, user.password))) {
      throw new Error(
        "ADMIN_EMAIL already belongs to an account. ADMIN_PASSWORD must match its existing password to grant admin access.",
      );
    }
    user.role = "admin";
    await user.save();
  }
}
module.exports = initializeAdmin;
