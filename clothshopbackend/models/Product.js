const mongoose = require('mongoose');
const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String,
    },
    // Actual photos of this product in each available colour.
    colorImages: {
        type: [new mongoose.Schema({
            color: { type: String, required: true, trim: true },
            images: { type: [{ type: String, trim: true }], default: [] }
        }, { _id: false })],
        default: undefined
    },
    color: {
        type: [String],
    },
    size: {
        type: [String],
    },
    sizeChart: {
        type: [new mongoose.Schema({
            size: { type: String, required: true, trim: true },
            chestCm: { type: Number, required: true, min: 1 }
        }, { _id: false })],
        default: undefined
    },
    category: {
        type: String,
    },
    stock: {
        type: Number,
    }
}, { timestamps: true });
ProductSchema.statics.imageForColor = (product, color) => {
    const selected = String(color || '').trim().toLowerCase();
    const photos = Array.isArray(product.colorImages)
        ? product.colorImages.find((item) => String(item?.color || '').trim().toLowerCase() === selected)
        : null;
    return (photos?.images?.find((image) => typeof image === 'string' && image.trim()) || product.image || '').trim();
};
module.exports = mongoose.model('Product', ProductSchema);
