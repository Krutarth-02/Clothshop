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
    category: {
        type: String,
    },
    stock: {
        type: Number,
    }
}, { timestamps: true });
module.exports = mongoose.model('Product', ProductSchema
);