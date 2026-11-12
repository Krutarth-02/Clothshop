const express = require("express");
const router = express.Router();
const authmiddleware = require("../middlewares/auth.middleware");
const { getPayments, getCheckoutDetails, quoteCheckout, createCodOrder } = require("../controllers/payment.controller");

router.get("/", authmiddleware, getPayments);
router.get("/checkout-details", authmiddleware, getCheckoutDetails);
router.post("/quote", authmiddleware, quoteCheckout);
router.post("/orders", authmiddleware, createCodOrder);

module.exports = router;
