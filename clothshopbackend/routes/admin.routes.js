const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const { adminMiddleware, adminRequestMiddleware } = require("../middlewares/admin.middleware");
const {
  loginAdmin, getAdminSession, logoutAdmin, getAdminDashboard, getAdminProducts, saveAdminProduct,
  deleteAdminProduct, getAdminUsers, saveAdminUser, deleteAdminUser, getAdminOrders, updateAdminOrder, getAdminActivity,
} = require("../controllers/admin.controller");

router.use(adminRequestMiddleware);
router.use(rateLimit({ windowMs: 60000, limit: 240, message: { message: "Too many admin requests. Please wait a moment." } }));
router.post("/login", rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, message: { message: "Too many login attempts. Retry in 15 minutes." } }), loginAdmin);
router.get("/session", getAdminSession);
router.use(adminMiddleware);
router.post("/logout", logoutAdmin);
router.get("/dashboard", getAdminDashboard);
router.get("/products", getAdminProducts);
router.post("/products", saveAdminProduct);
router.put("/products/:id", saveAdminProduct);
router.delete("/products/:id", deleteAdminProduct);
router.get("/users", getAdminUsers);
router.post("/users", saveAdminUser);
router.put("/users/:id", saveAdminUser);
router.delete("/users/:id", deleteAdminUser);
router.get("/orders", getAdminOrders);
router.put("/orders/:id", updateAdminOrder);
router.get("/activity", getAdminActivity);
module.exports = router;
