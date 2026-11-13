const express = require("express");
const app = express();
const connectDB = require("./config/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middlewares/error.middleware");
app.use(cookieParser());
require("dotenv").config();
const proxyHops = Number(process.env.TRUST_PROXY_HOPS || 0);
if (Number.isSafeInteger(proxyHops) && proxyHops > 0 && proxyHops <= 3) app.set("trust proxy", proxyHops);
app.use((req, res, next) => {
  res.set("X-Content-Type-Options", "nosniff");
  res.set("Referrer-Policy", "strict-origin-when-cross-origin");
  if (req.path.startsWith("/api/")) res.set("Cache-Control", "no-store");
  next();
});
// Connect to the database

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/media", (req, res, next) => { res.set("X-Content-Type-Options", "nosniff"); res.set("Content-Security-Policy", "default-src 'none'; sandbox"); next(); }, express.static(require("node:path").join(__dirname, "uploads"), { dotfiles: "deny", index: false }));

// Routes
const authRoute = require("./routes/auth.routes");
const productRoute = require("./routes/product.routes");
const userRoute = require("./routes/user.routes");
const notificationRoute = require("./routes/notification.routes");
const paymentRoute = require("./routes/payment.routes");
const contactRoute = require("./routes/contact.routes");

app.use("/api/auth", authRoute);
app.use("/api/products", productRoute);
app.use("/api/user", userRoute);
app.use("/api/notifications", notificationRoute);
app.use("/api/payments", paymentRoute);
app.use("/api/contact", contactRoute);
app.use(errorHandler);

const port = process.env.PORT || 3000;
async function startServer() {
  await connectDB();
  app.listen(port, () => console.log("Server is running on port " + port));
}
if (require.main === module) startServer().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exit(1);
});
module.exports = app;
