const mongoose = require("mongoose");

const AdminActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: { type: String, required: true },
  resource: String,
  recordId: String,
  status: Number,
}, { timestamps: true });

AdminActivitySchema.index({ createdAt: -1, _id: -1 });
AdminActivitySchema.index({ action: 1, recordId: 1 }, { unique: true, partialFilterExpression: { action: "ORDER_PLACED" } });
module.exports = mongoose.model("AdminActivity", AdminActivitySchema);
