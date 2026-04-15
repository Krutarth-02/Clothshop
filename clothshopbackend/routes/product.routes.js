const router = require("express").Router();
const { getProducts, getProductById, searchProducts } = require("../controllers/product.controller");
const authMiddleware = require("../middlewares/auth.middleware");
// Get all products
router.get('/', authMiddleware, getProducts);
// Get product by ID
router.get('/:_id', authMiddleware, getProductById);
router.post('/search',authMiddleware,searchProducts);
module.exports = router;