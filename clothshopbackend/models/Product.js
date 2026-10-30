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
module.exports = mongoose.model('Product', ProductSchema);
