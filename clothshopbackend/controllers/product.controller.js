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

const searchProducts = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({ message: "Search keyword required" });
    }

    // 🔍 Search logic
    const products = await Product.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { category: { $regex: keyword, $options: "i" } },
        { brand: { $regex: keyword, $options: "i" } },
      ],
    });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
    getProducts,
    getProductById,
    searchProducts,
}