const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const {
  getProducts,
  getProductById,
  searchProducts,
} = require("../controllers/product.controller");
// Get all products
router
  .get("/", getProducts)
  .get("/search", searchProducts)
  // Get product by ID
  .get("/:_id", getProductById)
  .post("/search", authMiddleware, searchProducts);
module.exports = router;
