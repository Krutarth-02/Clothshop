const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!mongoose.isObjectIdOrHexString(decoded.userId)) throw new Error();
  } catch {
    return res.status(401).json({ message: "Invalid or expired session" });
  }
  try {
    // A deleted account must not keep access through an older valid JWT.
    const user = await User.findById(decoded.userId).select("_id role");
    if (!user)
      return res.status(401).json({ message: "Account no longer exists" });
    req.user = { ...decoded, userId: String(user._id), role: user.role };
    next();
  } catch (error) {
    next(error);
  }
};
module.exports = authMiddleware;
