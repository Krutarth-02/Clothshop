const User = require("../models/User");

// Read the current role from MongoDB on every admin request.
const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select("role");
    if (!user)
      return res.status(401).json({ message: "Session user no longer exists" });
    if (user.role !== "admin")
      return res
        .status(403)
        .json({ message: "Store administrator access required" });
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = adminMiddleware;
