const User = require("../models/User");
const { sendEmail } = require("../services/emailService");
const bcrypt = require("bcryptjs");
const { randomInt, randomBytes, createHash, createHmac } = require("node:crypto");
const {
  ForbiddenError,
  BadRequestError,
  UnauthorizedError,
  ConflictError,
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
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return next(new BadRequestError("Enter a valid email address."));
    const user = await User.findOne({ email }).collation({ locale: "en", strength: 2 });
    if (user) {
      const otp = String(randomInt(100000, 1000000));
      user.otp = createHmac("sha256", process.env.JWT_SECRET).update(`${email}:${otp}`).digest("hex");
      user.otpExpiry = Date.now() + 5 * 60 * 1000;
      user.isOtpVerified = false; user.otpAttempts = 0;
      user.resetTokenHash = undefined; user.resetTokenExpiry = undefined;
      await user.save();
      await sendEmail(email, "Password Reset OTP", `Your OTP is ${otp}.`);
    }
    return res.json({ message: "If the account exists, a reset code has been sent." });
  } catch (err) {
    next(err);
  }
};
const resetCookieOptions = () => ({ httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", path: "/api/user" });
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body || {};
    const normalized = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (normalized.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized))
      return next(new BadRequestError("Enter a valid email address."));
    if (!["string", "number"].includes(typeof otp) || !/^\d{6}$/.test(String(otp))) return next(new BadRequestError("Enter the six-digit code."));
    const proof = randomBytes(32).toString("hex");
    const user = await User.findOneAndUpdate({ email: normalized,
      otp: createHmac("sha256", process.env.JWT_SECRET).update(`${normalized}:${otp}`).digest("hex"),
      otpExpiry: { $gt: new Date() }, otpAttempts: { $lt: 5 },
    }, { $set: { isOtpVerified: true, otp: null, resetTokenHash: createHash("sha256").update(proof).digest("hex"), resetTokenExpiry: new Date(Date.now() + 5 * 60000) } });
    if (!user) {
      await User.updateOne({ email: normalized, otpAttempts: { $lt: 5 } }, { $inc: { otpAttempts: 1 } });
      return next(new BadRequestError("Invalid or expired code. Request a new code if needed."));
    }
    res.cookie("passwordReset", proof, { ...resetCookieOptions(), maxAge: 5 * 60000 });
    res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    next(err);
  }
};
const resetPassword = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (typeof password !== "string" || password.length < 8 || Buffer.byteLength(password, "utf8") > 72)
      return next(new BadRequestError("Use at least 8 characters and at most 72 bytes for your password."));

    const proof = req.cookies?.passwordReset;
    if (typeof proof !== "string" || !/^[a-f0-9]{64}$/.test(proof)) return next(new ForbiddenError("Verify the reset code in this browser first."));
    const normalized = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (normalized.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized))
      return next(new BadRequestError("Enter a valid email address."));
    const user = await User.findOneAndUpdate({ email: normalized, isOtpVerified: true, resetTokenHash: createHash("sha256").update(proof).digest("hex"), resetTokenExpiry: { $gt: new Date() } }, {
      $set: { password: await bcrypt.hash(password, 12), isOtpVerified: false }, $unset: { otp: "", otpExpiry: "", resetTokenHash: "", resetTokenExpiry: "" }, $inc: { sessionVersion: 1 },
    });
    if (!user) return next(new ForbiddenError("Reset authorization expired or was already used."));
    res.clearCookie("passwordReset", resetCookieOptions());

    res.status(200).json({
      message: "Password reset successful",
    });
  } catch (err) {
    next(err);
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
      if (Object.prototype.hasOwnProperty.call(req.body || {}, field))
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
    if (updateData.email !== undefined) {
      updateData.email = typeof updateData.email === "string" ? updateData.email.trim().toLowerCase() : "";
      if (updateData.email.length > 254) return next(new BadRequestError("Enter a valid email."));
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateData.email)) return next(new BadRequestError("Enter a valid email."));
      const duplicate = await User.findOne({ email: updateData.email, _id: { $ne: user._id } })
        .collation({ locale: "en", strength: 2 }).select("_id").lean();
      if (duplicate) return next(new ConflictError("This email already has an account."));
    }

    if (updateData.rememberMe !== undefined && typeof updateData.rememberMe !== "boolean")
      return next(new BadRequestError("Remember me must be true or false."));
    if (req.body?.password) {
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
    if (!updatedUser) return next(new UnauthorizedError("Account no longer exists"));
    return res
      .status(200)
      .json({ message: "Profile updated", data: updatedUser });
  } catch (err) {
    next(err);
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
      return next(new ConflictError("Your account changed. Sign in again and retry."));
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });
    return res.json({ message: "Account deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUserProfile, deleteAccount, updateProfile, forgotPassword, verifyOtp, resetPassword };
