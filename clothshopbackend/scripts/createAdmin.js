require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const createAdmin = async () => {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Usage: node scripts/createAdmin.js existing-email@example.com");
  await mongoose.connect(process.env.MONGODB_URL);
  const existing = await User.findOne({ email }).collation({ locale: "en", strength: 2 }).select("role password");
  if (existing?.role === "superadmin") { console.log("This account already has owner access. Its password was preserved."); return; }
  if (!existing?.password) throw new Error("Register an account with a password first. Social-only accounts need a password before enabling admin access.");
  const user = await User.findOneAndUpdate({ _id: existing._id, role: { $in: ["user", "admin"] } }, {
    $set: { role: "superadmin" }, $inc: { adminSessionVersion: 1 },
  }, { new: true }).collation({ locale: "en", strength: 2 });
  if (!user) throw new Error("Account changed during setup. Refresh and retry.");
  console.log("Existing account promoted to owner. Use its existing password at /admin/login.");
};
createAdmin().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());
