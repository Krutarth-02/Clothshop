const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    city: { type: String },
    country: { type: String },
    phone: { type: String },
    image: { type: String },
},
)
module.exports = mongoose.model("User", UserSchema);