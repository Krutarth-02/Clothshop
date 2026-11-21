const mongoose = require("mongoose");

const AddtocartShema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, required: true, default: 1, min: 1, max: 100, validate: Number.isInteger },
  color: { type: String, default: "", maxlength: 50 },
  size: { type: String, default: "", maxlength: 50 },
});
AddtocartShema.index({ userId: 1, productId: 1, color: 1, size: 1 }, { unique: true });

const Addtocart = mongoose.model("Addtocart", AddtocartShema);
module.exports = Addtocart;
