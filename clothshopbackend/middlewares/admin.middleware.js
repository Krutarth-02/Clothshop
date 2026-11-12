const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const AdminActivity = require("../models/AdminActivity");
const { ForbiddenError, UnauthorizedError } = require("../utils/errors");

const adminCookieOptions = {
  httpOnly: true, secure: process.env.NODE_ENV === "production",
  sameSite: "strict", path: "/api/admin",
};
const adminSecret = () => process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET;

const adminMiddleware = async (req, res, next) => {
  let decoded;
  try {
    decoded = jwt.verify(req.cookies?.adminToken || "", adminSecret(), {
      audience: "clothshop-admin", algorithms: ["HS256"],
    });
    if (!mongoose.isObjectIdOrHexString(decoded.adminId)) throw new Error();
  } catch { return next(new UnauthorizedError("Please sign in to the admin workspace.")); }
  try {
    const user = await User.findById(decoded.adminId).select("fullName email role image +adminSessionVersion");
    if (!user || !["admin", "superadmin"].includes(user.role) || user.adminSessionVersion !== decoded.version)
      return next(new UnauthorizedError("Your admin access changed. Please sign in again."));
    req.admin = user;
    next();
  } catch (error) { next(error); }
};

const adminRequestMiddleware = (req, res, next) => {
  res.set({ "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    const origin = new URL(process.env.FRONTEND_URL || "http://localhost:5173").origin;
    if (req.get("origin") !== origin) return next(new ForbiddenError("Use the configured admin website to submit this request."));
    res.once("finish", () => {
      // Keep operation metadata, never request bodies, passwords or tokens.
      AdminActivity.create({ userId: req.admin?._id, action: req.method,
        resource: req.route?.path || req.path, recordId: req.params.id, status: res.statusCode,
      }).catch(() => console.error("Admin activity could not be recorded."));
    });
  }
  next();
};

module.exports = { adminMiddleware, adminRequestMiddleware, adminCookieOptions, adminSecret };
