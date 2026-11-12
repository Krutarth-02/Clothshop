const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Product = require("../models/Product");
const Payment = require("../models/Payment");
const AdminActivity = require("../models/AdminActivity");
const { adminMiddleware, adminCookieOptions, adminSecret } = require("../middlewares/admin.middleware");
const { BadRequestError, ForbiddenError, UnauthorizedError, NotFoundError, ConflictError, ServiceUnavailableError } = require("../utils/errors");

const userFields = "fullName email phone city country role image lastLoginAt";
const adminDetails = user => ({ _id: user._id, fullName: user.fullName, email: user.email, role: user.role, image: user.image });
const text = (value, name, max = 200, required = true) => {
  if (typeof value !== "string" || value.trim().length > max || (required && !value.trim())) throw new BadRequestError(`Enter a valid ${name}.`);
  return value.trim();
};
const validId = id => { if (!mongoose.isObjectIdOrHexString(id)) throw new BadRequestError("Invalid record ID."); };
const pagination = query => {
  const page = Number(query.page || 1), limit = 15;
  if (!Number.isSafeInteger(page) || page < 1 || page > 100000) throw new BadRequestError("Invalid page.");
  const search = query.search ? text(query.search, "search", 100).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : "";
  return { page, limit, search };
};
const handleError = (error, next) => {
  if (error.code === 11000) return next(new ConflictError("This email is already registered."));
  if (error.name === "ValidationError") return next(new BadRequestError("Please check the record details."));
  next(error);
};

const loginAdmin = async (req, res, next) => {
  try {
    if (!adminSecret() || adminSecret().length < 32) throw new ServiceUnavailableError("Configure ADMIN_JWT_SECRET with at least 32 random characters in the backend .env and restart the server.");
    const { email, password } = req.body || {};
    if (typeof email !== "string" || email.length > 200 || typeof password !== "string" || Buffer.byteLength(password) > 72)
      throw new BadRequestError("Enter your admin email and password.");
    const user = await User.findOne({ email: email.trim().toLowerCase(), role: { $in: ["admin", "superadmin"] } })
      .collation({ locale: "en", strength: 2 }).select("fullName email role image password +adminSessionVersion");
    const hash = user?.password || "$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW";
    const matches = await bcrypt.compare(password, hash);
    if (!user?.password || !matches) throw new UnauthorizedError("Invalid administrator credentials.");
    const token = jwt.sign({ adminId: String(user._id), version: user.adminSessionVersion }, adminSecret(), {
      audience: "clothshop-admin", expiresIn: "8h", algorithm: "HS256",
    });
    req.admin = user;
    res.cookie("adminToken", token, { ...adminCookieOptions, maxAge: 8 * 60 * 60 * 1000 });
    res.json({ message: "Admin sign-in successful", data: adminDetails(user) });
  } catch (error) { next(error); }
};

const getAdminSession = (req, res, next) => {
  if (!req.cookies?.adminToken) return res.json({ data: null });
  adminMiddleware(req, res, error => {
    if (error?.status === 401) return res.clearCookie("adminToken", adminCookieOptions).json({ data: null });
    if (error) return next(error);
    res.json({ data: adminDetails(req.admin) });
  });
};
const logoutAdmin = async (req, res, next) => {
  try {
    await User.updateOne({ _id: req.admin._id }, { $inc: { adminSessionVersion: 1 } });
    res.clearCookie("adminToken", adminCookieOptions).json({ message: "Admin sessions signed out." });
  } catch (error) { next(error); }
};

const getAdminDashboard = async (req, res, next) => {
  try {
    const since = new Date(); since.setUTCDate(1); since.setUTCHours(0, 0, 0, 0); since.setUTCMonth(since.getUTCMonth() - 11);
    const [products, customers, orders, payments, monthlySales, recentOrders, lowStock, activity, activeCustomers,
      stockReport, popularProducts, monthlyOrders, customerCountries, monthlyCustomers] = await Promise.all([
      Product.countDocuments(), User.countDocuments({ role: "user" }), Payment.countDocuments({ orderStatus: "confirmed" }),
      Payment.aggregate([{ $group: { _id: "$status", amount: { $sum: "$totalAmount" }, count: { $sum: 1 } } }]),
      Payment.aggregate([{ $match: { status: "paid", paidAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$paidAt", timezone: "UTC" } }, amount: { $sum: "$totalAmount" } } }, { $sort: { _id: 1 } }]),
      Payment.find({ orderStatus: "confirmed" }).select("shippingAddress.fullName items totalAmount status fulfillmentStatus createdAt").sort({ createdAt: -1, _id: -1 }).limit(5).lean(),
      Product.find({ stock: { $lte: 5 } }).select("name image stock price").sort({ stock: 1, _id: 1 }).limit(5).lean(),
      AdminActivity.find().sort({ _id: -1 }).limit(5).populate("userId", "fullName").lean(),
      User.countDocuments({ role: "user", lastLoginAt: { $gte: new Date(Date.now() - 30 * 86400000) } }),
      Product.find().select("name image price stock category color size").sort({ stock: 1, _id: -1 }).limit(5).lean(),
      Payment.aggregate([
        { $match: { orderStatus: "confirmed" } }, { $unwind: "$items" },
        { $group: { _id: "$items.productId", name: { $first: "$items.name" }, quantity: { $sum: "$items.quantity" }, amount: { $sum: "$items.lineTotal" } } },
        { $sort: { quantity: -1, _id: 1 } }, { $limit: 4 },
      ]),
      Payment.aggregate([
        { $match: { orderStatus: "confirmed", createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt", timezone: "UTC" } }, count: { $sum: 1 } } },
      ]),
      User.aggregate([
        { $match: { role: "user", lastLoginAt: { $gte: new Date(Date.now() - 30 * 86400000) } } },
        { $group: { _id: { $ifNull: ["$country", "Not specified"] }, count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } }, { $limit: 4 },
      ]),
      User.aggregate([
        { $match: { role: "user", firstLoginAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$firstLoginAt", timezone: "UTC" } }, count: { $sum: 1 } } },
      ]),
    ]);
    const months = Array.from({ length: 12 }, (_, index) => {
      const date = new Date(since); date.setUTCMonth(since.getUTCMonth() + index);
      const key = date.toISOString().slice(0, 7);
      return { month: key, amount: monthlySales.find(row => row._id === key)?.amount || 0,
        orders: monthlyOrders.find(row => row._id === key)?.count || 0,
        customers: monthlyCustomers.find(row => row._id === key)?.count || 0 };
    });
    res.json({ data: { products, customers, orders, activeCustomers, payments, months, recentOrders, lowStock, activity,
      stockReport, popularProducts, customerCountries,
      revenue: payments.find(row => row._id === "paid")?.amount || 0,
      pendingAmount: payments.find(row => row._id === "pending")?.amount || 0,
    } });
  } catch (error) { next(error); }
};

const getAdminProducts = async (req, res, next) => {
  try {
    const { page, limit, search } = pagination(req.query), filter = search ? { $or: [{ name: { $regex: search, $options: "i" } }, { category: { $regex: search, $options: "i" } }] } : {};
    const [data, total] = await Promise.all([Product.find(filter).sort({ _id: -1 }).skip((page - 1) * limit).limit(limit).lean(), Product.countDocuments(filter)]);
    res.json({ data, total, page, limit });
  } catch (error) { next(error); }
};

const saveAdminProduct = async (req, res, next) => {
  try {
    const body = req.body || {}, creating = !req.params.id, data = {};
    if (!creating) validId(req.params.id);
    for (const field of ["name", "description", "category", "image"])
      if (creating || body[field] !== undefined) data[field] = text(body[field] ?? "", field, field === "description" ? 5000 : 2000, ["name", "description"].includes(field));
    const validUrl = value => { try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; } };
    if (data.image && !validUrl(data.image)) throw new BadRequestError("Use an http or https image URL.");
    for (const field of ["price", "stock"]) if (creating || body[field] !== undefined) {
      if (typeof body[field] !== "number" || !Number.isFinite(body[field]) || body[field] < 0 || body[field] > 100000000 || (field === "stock" && !Number.isSafeInteger(body[field]))) throw new BadRequestError(`Enter a valid ${field}.`);
      data[field] = body[field];
    }
    for (const field of ["color", "size"]) if (body[field] !== undefined) {
      if (!Array.isArray(body[field]) || body[field].length > 50) throw new BadRequestError(`Invalid ${field} list.`);
      data[field] = [...new Set(body[field].map(value => text(value, field, 100)))];
    }
    if (body.colorImages !== undefined) {
      if (!Array.isArray(body.colorImages) || body.colorImages.length > 50) throw new BadRequestError("Invalid colour photos.");
      data.colorImages = body.colorImages.map(item => {
        if (!item || !Array.isArray(item.images) || item.images.length > 20 || item.images.some(url => typeof url !== "string" || url.length > 2000 || !validUrl(url))) throw new BadRequestError("Enter valid colour photo URLs.");
        return { color: text(item.color, "colour", 100), images: item.images };
      });
    }
    if (body.sizeChart !== undefined) {
      if (!Array.isArray(body.sizeChart) || body.sizeChart.length > 50) throw new BadRequestError("Invalid size chart.");
      data.sizeChart = body.sizeChart.map(item => {
        if (!item || typeof item.chestCm !== "number" || !Number.isFinite(item.chestCm) || item.chestCm < 1 || item.chestCm > 1000) throw new BadRequestError("Enter a valid size measurement.");
        return { size: text(item.size, "size", 100), chestCm: item.chestCm };
      });
    }
    const product = creating ? await Product.create(data) : await Product.findByIdAndUpdate(req.params.id, { $set: data }, { new: true, runValidators: true });
    if (!product) throw new NotFoundError("Product not found.");
    res.status(creating ? 201 : 200).json({ message: "Product saved", data: product });
  } catch (error) { handleError(error, next); }
};
const deleteAdminProduct = async (req, res, next) => {
  try {
    validId(req.params.id);
    if (!await Product.findByIdAndDelete(req.params.id)) throw new NotFoundError("Product not found.");
    res.json({ message: "Product deleted" });
  } catch (error) { next(error); }
};

const getAdminUsers = async (req, res, next) => {
  try {
    const { page, limit, search } = pagination(req.query);
    const filter = req.admin.role === "superadmin" && req.query.staff === "true" ? { role: { $in: ["admin", "superadmin"] } } : { role: "user" };
    if (req.query.staff === "true" && req.admin.role !== "superadmin") throw new ForbiddenError("Only the owner can manage administrators.");
    if (search) filter.$or = ["fullName", "email"].map(field => ({ [field]: { $regex: search, $options: "i" } }));
    const [data, total] = await Promise.all([User.find(filter).select(userFields).sort({ _id: -1 }).skip((page - 1) * limit).limit(limit).lean(), User.countDocuments(filter)]);
    res.json({ data, total, page, limit });
  } catch (error) { next(error); }
};
const saveAdminUser = async (req, res, next) => {
  try {
    const creating = !req.params.id, body = req.body || {}, data = {};
    if (!creating) validId(req.params.id);
    const current = creating ? null : await User.findById(req.params.id).select("role");
    if (!creating && !current) throw new NotFoundError("User not found.");
    if ((current && current.role !== "user" || body.role && body.role !== "user") && req.admin.role !== "superadmin") throw new ForbiddenError("Only the owner can manage administrators.");
    for (const field of ["fullName", "email", "phone", "city", "country"])
      if (body[field] !== undefined || creating && ["fullName", "email"].includes(field)) data[field] = text(body[field], field, 200, ["fullName", "email"].includes(field));
    if (data.email) { data.email = data.email.toLowerCase(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) throw new BadRequestError("Enter a valid email."); }
    if (body.role !== undefined) {
      if (!["user", "admin"].includes(body.role) && body.role !== current?.role) throw new BadRequestError("Owner accounts cannot be created through this form.");
      if (current?.role === "superadmin" && body.role !== "superadmin") throw new ForbiddenError("Owner accounts cannot be demoted.");
      data.role = body.role;
    } else if (creating) data.role = "user";
    if (creating || body.password) {
      if (typeof body.password !== "string" || body.password.length < 12 || Buffer.byteLength(body.password) > 72) throw new BadRequestError("Use a password of at least 12 characters (maximum 72 UTF-8 bytes).");
      data.password = await bcrypt.hash(body.password, 12);
    }
    const update = { $set: data };
    if (!creating && (data.password || data.role && data.role !== current.role)) update.$inc = { adminSessionVersion: 1 };
    const filter = creating ? null : { _id: req.params.id, role: current.role };
    if (req.admin.role !== "superadmin" && filter) filter.role = "user";
    const user = creating ? await User.create(data) : await User.findOneAndUpdate(filter, update, { new: true, runValidators: true });
    if (!user) throw new ConflictError("Account changed. Refresh and retry.");
    const result = await User.findById(user._id).select(userFields).lean();
    res.status(creating ? 201 : 200).json({ message: "Account saved", data: result });
  } catch (error) { handleError(error, next); }
};
const deleteAdminUser = async (req, res, next) => {
  try {
    validId(req.params.id);
    const filter = { _id: req.params.id, role: req.admin.role === "superadmin" ? { $in: ["user", "admin"] } : "user" };
    if (String(req.admin._id) === req.params.id) throw new ForbiddenError("You cannot delete your own account.");
    if (!await User.findOneAndDelete(filter)) throw new NotFoundError("Account not found or protected.");
    res.json({ message: "Account deleted; purchase history retained." });
  } catch (error) { next(error); }
};

const getAdminOrders = async (req, res, next) => {
  try {
    const { page, limit, search } = pagination(req.query), filter = { orderStatus: "confirmed" };
    if (search) filter["shippingAddress.fullName"] = { $regex: search, $options: "i" };
    const [data, total] = await Promise.all([Payment.find(filter).select("items shippingAddress totalAmount paymentMethod status fulfillmentStatus createdAt").sort({ _id: -1 }).skip((page - 1) * limit).limit(limit).lean(), Payment.countDocuments(filter)]);
    res.json({ data, total, page, limit });
  } catch (error) { next(error); }
};
const updateAdminOrder = async (req, res, next) => {
  try {
    validId(req.params.id);
    const statuses = ["confirmed", "processing", "shipped", "delivered"], status = req.body?.fulfillmentStatus;
    if (!statuses.includes(status)) throw new BadRequestError("Invalid fulfillment status.");
    const order = await Payment.findOne({ _id: req.params.id, orderStatus: "confirmed" }).lean();
    if (!order) throw new NotFoundError("Order not found.");
    if (statuses.indexOf(status) < statuses.indexOf(order.fulfillmentStatus || "confirmed")) throw new BadRequestError("Fulfillment cannot move backwards.");
    const result = await Payment.findOneAndUpdate({ _id: order._id, fulfillmentStatus: order.fulfillmentStatus ?? { $exists: false } }, { $set: { fulfillmentStatus: status } }, { new: true });
    if (!result) throw new ConflictError("Order changed. Refresh and retry.");
    res.json({ message: "Fulfillment updated" });
  } catch (error) { next(error); }
};

const getAdminActivity = async (req, res, next) => {
  try {
    const { page, limit } = pagination(req.query);
    const [data, total] = await Promise.all([AdminActivity.find().sort({ _id: -1 }).skip((page - 1) * limit).limit(limit).populate("userId", "fullName email").lean(), AdminActivity.countDocuments()]);
    res.json({ data, total, page, limit });
  } catch (error) { next(error); }
};

module.exports = { loginAdmin, getAdminSession, logoutAdmin, getAdminDashboard, getAdminProducts, saveAdminProduct, deleteAdminProduct, getAdminUsers, saveAdminUser, deleteAdminUser, getAdminOrders, updateAdminOrder, getAdminActivity };
