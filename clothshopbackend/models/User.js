const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: {
        type: String, required: function () {
            return !this.isGoogleUser;
        },
    },
    city: { type: String },
    country: { type: String },
    phone: { type: String },
    image: { type: String },
    rememberMe: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },
    isOtpVerified: {
        type: Boolean,
        default: false
    },
    isGoogleUser: {
        type: Boolean,
        default: false,
    },
    isFacebookUser: {
        type: Boolean,
        default: false,
    },
},
)
module.exports = mongoose.model("User", UserSchema);