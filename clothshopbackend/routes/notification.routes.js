const router = require("express").Router();
const authMiddleware = require("../middlewares/auth.middleware");
const { getNotifications } = require("../controllers/notification.controller");

router.use(authMiddleware);
router.get("/", authMiddleware, getNotifications);
module.exports = router;
