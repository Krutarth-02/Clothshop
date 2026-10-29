const mongoose = require("mongoose");
const Product = require("../models/Product");

function productData(body) {
  const {
    name,
    description,
    price,
    image = "",
    category,
    stock,
    color = [],
    size = [],
  } = body || {};
  if (typeof name !== "string" || !name.trim() || name.trim().length > 200)
    return { error: "Enter a product name (up to 200 characters)." };
  if (
    typeof description !== "string" ||
    !description.trim() ||
    description.length > 10000
  )
    return { error: "Enter a description (up to 10,000 characters)." };
  if (
    typeof price !== "number" ||
    !Number.isFinite(price) ||
    price < 0 ||
    !Number.isSafeInteger(Math.round(price * 100))
  )
    return { error: "Price must be a non-negative number." };
  if (!Number.isSafeInteger(stock) || stock < 0)
    return { error: "Stock must be a non-negative whole number." };
  if (typeof category !== "string" || !category.trim() || category.length > 100)
    return { error: "Enter a category (up to 100 characters)." };
  if (typeof image !== "string" || image.length > 2048)
    return { error: "Enter a valid image URL." };
  if (image.trim()) {
    try {
      if (!["http:", "https:"].includes(new URL(image.trim()).protocol))
        throw new Error();
    } catch {
      return { error: "Image URL must start with http:// or https://." };
    }
  }
  if (
    [color, size].some(
      (options) =>
        !Array.isArray(options) ||
        options.length > 50 ||
        options.some(
          (option) =>
            typeof option !== "string" || !option.trim() || option.length > 60,
        ),
    )
  )
    return {
      error:
        "Colours and sizes must be lists of non-empty values (up to 50 each).",
    };
  return {
    data: {
      name: name.trim(),
      description: description.trim(),
      price: Math.round(price * 100) / 100,
      image: image.trim(),
      category: category.trim(),
      stock,
      color: [...new Set(color.map((value) => value.trim()))],
      size: [...new Set(size.map((value) => value.trim()))],
    },
  };
}

const getAdminProducts = async (req, res, next) => {
  try {
    const data = await Product.find().sort({ createdAt: -1 });
    res.json({ message: "Store catalogue retrieved", data });
  } catch (error) {
    next(error);
  }
};

const saveProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id && !mongoose.isObjectIdOrHexString(id))
      return res.status(400).json({ message: "Invalid product ID" });
    const { data, error } = productData(req.body);
    if (error) return res.status(400).json({ message: error });
    const product = id
      ? await Product.findByIdAndUpdate(
          id,
          { $set: data },
          { new: true, runValidators: true },
        )
      : await Product.create(data);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(id ? 200 : 201).json({
      message: id ? "Product updated" : "Product created",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    if (!mongoose.isObjectIdOrHexString(req.params.id))
      return res.status(400).json({ message: "Invalid product ID" });
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted", data: { _id: product._id } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAdminProducts, saveProduct, deleteProduct };
