// controllers/auth.controller.js

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { NotFoundError, UnauthorizedError, ForbiddenError } = require("../utils/errors");

const LoginUser = async (req, res, next) => {
  const { email, password, rememberMe, googleAuth, name, picture } = req.body;
  try {
    // if (googleAuth) {
    //   if (googleAuth) {
    //     let user = await User.findOne({ email });

    //     if (!user) {
    //       user = await User.create({
    //         fullName: name,
    //         email,
    //         isGoogleUser: true,
    //         image: picture,
    //       });
    //     }

    //     const token = jwt.sign(
    //       { userId: user._id },
    //       process.env.JWT_SECRET,
    //       { expiresIn: "15d" }
    //     );

    //     res.cookie("token", token, {
    //       httpOnly: true,
    //       secure: process.env.NODE_ENV === "production",
    //       sameSite:
    //         process.env.NODE_ENV === "production"
    //           ? "None"
    //           : "Lax",
    //     });

    //     return res.status(200).json({
    //       message: "Google login successful",
    //       data: user,
    //       token,
    //     });
    // }
    const user = await User.findOne({ email });
    if (!user) {
      return next(new ForbiddenError("email already exists"));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(new UnauthorizedError("Invalid credentials"));
    }
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: rememberMe ? "15d" : "7d" }
    );

    user.rememberMe = rememberMe;
    await user.save();

    // Store token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: rememberMe ? 15 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000, // 15 days or 7 days
    });

    return res.status(200).json({ message: "Login successful", data: user, token });
  }
  catch (error) {
    next(error);
  }
};

const SignupUser = async (req, res, next) => {
  const { fullName, email, password } = req.body;
  try {

    const user = await User.findOne({ email });
    if (user) {
      return next(new ForbiddenError("User already exists"));
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    next(err);
  }
}
const LogoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.status(200).json({ message: "Logout successful" });
}

module.exports = {
  LoginUser,
  SignupUser,
  LogoutUser,
}