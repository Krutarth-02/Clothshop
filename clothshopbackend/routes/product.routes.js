const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  searchProducts,
} = require("../controllers/product.controller");
const authMiddleware = require("../middlewares/auth.middleware");
// Get all products
router
  .get("/", authMiddleware, getProducts)
  // Get product by ID
  .get("/:_id", authMiddleware, getProductById)
  .post("/search", authMiddleware, searchProducts);
module.exports = router;
