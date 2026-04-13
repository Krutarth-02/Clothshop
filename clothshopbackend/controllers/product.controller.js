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
module.exports = {
    getProducts,
    getProductById
}