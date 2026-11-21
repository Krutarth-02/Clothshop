const Notification = require("../models/Notification");

const getNotifications = async (req, res, next) => {
  try {
    const data = await Notification.find({
      user: req.user.userId,
    })
      .sort({ createdAt: -1, _id: -1 })
      .lean();
    return res.json({ data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotifications };
