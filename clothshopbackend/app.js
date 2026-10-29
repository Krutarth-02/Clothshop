const express = require("express");
const app = express();
const connectDB = require("./config/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middlewares/error.middleware");
app.use(cookieParser());
require("dotenv").config();
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

// Routes
const authRoute = require("./routes/auth.routes");
const productRoute = require("./routes/product.routes");
const userRoute = require("./routes/user.routes");
const adminRoute = require("/routes/admin.routes");

app.use("/api/auth", authRoute);
app.use("/api/products", productRoute);
app.use("/api/user", userRoute);
app.use("/api/admin", adminRoute);
app.use(errorHandler);

// Both customer and admin accounts run in this same server process.
const initializeAdmin = require("./config/admin");
const port = process.env.PORT || 3000;
async function startServer() {
  await connectDB();
  await initializeAdmin();
  app.listen(port, () => console.log("Server is running on port " + port));
}
startServer().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exit(1);
});
