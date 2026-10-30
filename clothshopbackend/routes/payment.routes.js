const express = require("express");
const router = express.Router();
const authmiddleware = require("../middlewares/auth.middleware");
const { getPayments } = require("../controllers/payment.controller");

router.get("/", authmiddleware, getPayments);

module.exports = router;
