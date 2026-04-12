const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    city: { type: String },
    country: { type: String },
    phone: { type: String },
    image: { type: String },
},
)
module.exports = mongoose.model("User", UserSchema);