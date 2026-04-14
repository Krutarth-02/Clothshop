const User = require("../models/User");
const { sendEmail } = require("../services/emailService");
const bcrypt = require('bcryptjs')
const getUserProfile = async (req, res) => {
    const { _id } = req.params; // Assuming auth middleware adds user info to req
    const user = await User.findById(_id); // Fetch user profile from database
    res.status(200).json({ message: "User profile retrieved successfully", data: user });
}
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;

    await user.save();

    // Send Email
    await sendEmail(
        email,
        "Password Reset OTP",
        `Your OTP is ${otp}. It will expire in 5 minutes.`
    );

    res.json({ message: "OTP sent to email", data: otp });
};
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // 1. Check user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 2. Check OTP
        if (!user.otp || user.otp != otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // 3. Check expiry
        if (user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: "OTP expired" });
        }

        // ✅ OPTIONAL (Best Practice)
        user.isOtpVerified = true;
        await user.save();

        res.status(200).json({ message: "OTP verified successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const resetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!password) {
            return res.status(400).json({ message: "All fields required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 3. Check OTP verified (IMPORTANT SECURITY)
        if (!user.isOtpVerified) {
            return res.status(403).json({
                message: "Please verify OTP first",
            });
        }

        // 4. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. Update password
        user.password = hashedPassword;

        // 6. Clear OTP data
        user.otp = null;
        user.otpExpiry = null;
        user.isOtpVerified = false;

        await user.save();

        res.status(200).json({
            message: "Password reset successful",
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = {
    getUserProfile,
    forgotPassword,
    resetPassword,
    verifyOtp,
}