const mongoose = require("mongoose");
const ProductSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
    },
    // Actual photos of this product in each available colour.
    colorImages: {
      type: [
        new mongoose.Schema(
          {
            color: { type: String, required: true, trim: true },
            images: { type: [{ type: String, trim: true }], default: [] },
          },
          { _id: false },
        ),
      ],
      default: undefined,
    },
    color: {
      type: [String],
    },
    size: {
      type: [String],
    },
    sizeChart: {
      type: [
        new mongoose.Schema(
          {
            size: { type: String, required: true, trim: true },
            chestCm: { type: Number, required: true, min: 1 },
          },
          { _id: false },
        ),
      ],
      default: undefined,
    },
    category: {
      type: String,
    },
    stock: {
      type: Number,
    },
  },
  { timestamps: true },
);

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;
