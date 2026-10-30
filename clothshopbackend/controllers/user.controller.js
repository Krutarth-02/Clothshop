const User = require("../models/User");
const { sendEmail } = require("../services/emailService");
const bcrypt = require("bcryptjs");
const {
  ForbiddenError,
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} = require("../utils/errors");

const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "-password -otp -otpExpiry -isOtpVerified",
    );
    if (!user)
      return next(new UnauthorizedError("Session user no longer exists"));
    res.status(200).json({
      message: "User profile retrieved successfully",
      data: user.toObject(),
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new NotFoundError("User not found"));
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000);

  user.otp = otp;
  user.otpExpiry = Date.now() + 5 * 60 * 1000;

  await user.save();

  // Send Email
  await sendEmail(email, "Password Reset OTP", `Your OTP is ${otp}.`);

  return res.status(200).json({ message: "OTP sent to email" });
};
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // 1. Check user
    const user = await User.findOne({ email });
    if (!user) {
      return next(new NotFoundError("User not found"));
    }

    // 2. Check OTP
    if (!user.otp || user.otp != otp) {
      return next(new BadRequestError("Invalid OTP"));
    }

    // 3. Check expiry
    if (user.otpExpiry < Date.now()) {
      return next(new BadRequestError("OTP expired"));
    }

    user.isOtpVerified = true;
    await user.save();

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    return next(new InternalServerError(error.message));
  }
};
const resetPassword = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!password) {
      return next(new BadRequestError("All fields required"));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return next(new NotFoundError("User not found"));
    }

    // 3. Check OTP verified (IMPORTANT SECURITY)
    if (!user.isOtpVerified) {
      return next(new ForbiddenError("Please verify OTP first"));
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
    return next(new InternalServerError(error.message));
  }
};
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user)
      return next(new UnauthorizedError("Session user no longer exists"));
    const updateData = {};
    // Account roles and login history are server-managed.
    for (const field of [
      "fullName",
      "email",
      "city",
      "country",
      "phone",
      "rememberMe",
    ]) {
      if (Object.prototype.hasOwnProperty.call(req.body, field))
        updateData[field] = req.body[field];
    }

    for (const field of ["fullName", "phone", "city", "country"]) {
      if (updateData[field] !== undefined) {
        if (
          typeof updateData[field] !== "string" ||
          updateData[field].length > (field === "fullName" ? 200 : 100)
        )
          return next(new BadRequestError("Enter valid profile details."));
        updateData[field] = updateData[field].trim();
      }
    }
    if (updateData.fullName !== undefined && !updateData.fullName)
      return next(new BadRequestError("Full name is required."));

    if (req.body.password) {
      const isMatch = await bcrypt.compare(req.body.password, user.password);
      if (!isMatch) {
        return next(new ForbiddenError("Invalid password"));
      }
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    ).select("-password -otp -otpExpiry -isOtpVerified");
    if (!updatedUser) throw new UnauthorizedError("Account no longer exists");
    return res
      .status(200)
      .json({ message: "Profile updated", data: updatedUser });
  } catch (error) {
    next(error);
  }
};
const deleteAccount = async (req, res, next) => {
  try {
    const { password, confirmation } = req.body || {};
    if (
      confirmation !== "DELETE" ||
      typeof password !== "string" ||
      !password ||
      password.length > 1024
    )
      return next(
        new BadRequestError(
          "Enter your current password and type DELETE to confirm.",
        ),
      );
    const user = await User.findById(req.user.userId);
    if (!user) return next(new UnauthorizedError("Account no longer exists"));
    if (!user.password || !(await bcrypt.compare(password, user.password)))
      return next(new BadRequestError("Current password is incorrect."));
    // Re-check the password at deletion time to avoid concurrent changes.
    const deleted = await User.findOneAndDelete({
      _id: user._id,
      password: user.password,
    });
    if (!deleted)
      return res
        .status(409)
        .json({ message: "Your account changed. Sign in again and retry." });
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });
    return res.json({ message: "Account deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  deleteAccount,
  updateProfile,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
