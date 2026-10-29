const router = require("express").Router();
const {
  getAdminProducts,
  saveProduct,
  deleteProduct,
} = require("../controllers/admin.controller");

router.get("/products", getAdminProducts);
router.post("/products", saveProduct);
router.put("/products/:id", saveProduct);
router.delete("/products/:id", deleteProduct);
module.exports = router;
