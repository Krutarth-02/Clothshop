const mongoose = require("mongoose");
const WishlistSchema = mongoose.Schema({
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
});
WishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });
const Wishlist = mongoose.model("Wishlist", WishlistSchema);
module.exports = Wishlist;
