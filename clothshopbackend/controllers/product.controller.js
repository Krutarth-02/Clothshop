const Product = require("../models/Product");

const getProducts = async (req, res,next) => {
    try {
        const products = await Product.find();
        res.status(200).json({ message: "Products retrieved successfully", data: products });
    } catch (error) {
        next(error);
    }
}

const getProductById = async (req, res,next) => {
    try {
        const { _id } = req.params;
        const product = await Product.findById(_id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product retrieved successfully", data: product });
    } catch (error) {
        next(error);
    }
}

const searchProducts = async (req, res, next) => {
  try {
    const keyword = typeof req.query.keyword === "string" ? req.query.keyword.trim() : "";
    if (!keyword || keyword.length > 120) {
      return res.status(400).json({ message: "Enter a product name between 1 and 120 characters." });
    }
    const page = Number(req.query.page || 1);
    const limit = 5;
    if (!Number.isSafeInteger(page) || page < 1 || page > 100000) {
      return res.status(400).json({ message: "Invalid search page." });
    }
    const words = keyword.split(/\s+/).map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const filter = { $and: words.map((word) => ({ name: { $regex: word, $options: "i" } })) };
    const [products, total] = await Promise.all([
      Product.find(filter).sort({ name: 1, _id: 1 }).skip((page - 1) * limit).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);
    return res.status(200).json({ success: true, count: products.length, total, page, limit, hasMore: page * limit < total, data: products });
  } catch (error) { next(error); }
};

module.exports = {
    getProducts,
    getProductById,
    searchProducts,
}
