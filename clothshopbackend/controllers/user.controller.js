const User = require("../models/User");
const { sendEmail } = require("../services/emailService");
const bcrypt = require('bcryptjs')
const { normalizePublicFilePath } = require("../utils/filePath");
const {
    ForbiddenError,
    BadRequestError,
    NotFoundError,
} = require("../utils/errors");

const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json({ message: "User profile retrieved successfully", data: user });
    } catch (error) {
        next(error);
    }
}
const forgotPassword = async (req, res, next) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return next(new NotFoundError("User not found"))
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
        `Your OTP is ${otp}.`
    );

    res.json({ message: "OTP sent to email" });
};
const verifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        // 1. Check user
        const user = await User.findOne({ email });
        if (!user) {
            return next(new NotFoundError("User not found"))
        }

        // 2. Check OTP
        if (!user.otp || user.otp != otp) {
            return next(new BadRequestError("Invalid OTP"))
        }

        // 3. Check expiry
        if (user.otpExpiry < Date.now()) {
            return next(new BadRequestError("OTP expired"))
        }
        
        user.isOtpVerified = true;
        await user.save();

        res.status(200).json({ message: "OTP verified successfully" });

    } catch (error) {
        return next(new InternalServerError(error.message))
    }
};
const resetPassword = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!password) {
            return next(new BadRequestError("All fields required"))
        }

        const user = await User.findOne({ email });
        if (!user) {
            return next(new NotFoundError("User not found"))
        }

        // 3. Check OTP verified (IMPORTANT SECURITY)
        if (!user.isOtpVerified) {
            return next(new ForbiddenError("Please verify OTP first"))
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
        return next(new InternalServerError(error.message))
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        const updateData = { ...req.body };

        if (req.body.password) {
            const isMatch = await bcrypt.compare(req.body.password, user.password);
            if (!isMatch) {
                return next(new ForbiddenError("Invalid password"));
            }
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(req.body.password, salt);
        }

        if (req.file?.path) {
            updateData.image = normalizePublicFilePath(req.file.path);
        }

        const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
            new: true,
        }).select("-password");
        return res
            .status(200)
            .json({ message: "Profile updated", data: updatedUser });
    } catch (error) {
        next(error);
    }
}
module.exports = {
    getUserProfile,
    updateProfile,
    forgotPassword,
    resetPassword,
    verifyOtp,
}