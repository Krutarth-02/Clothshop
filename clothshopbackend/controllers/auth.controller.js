const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { recordSuccessfulLogin } = require("../services/loginActivity");
const {
  BadRequestError,
  ServiceUnavailableError,
  UnauthorizedError,
  ForbiddenError,
} = require("../utils/errors");

let googleKeyCache = { keys: [], expiresAt: 0 };

async function providerRequest(url, headers = {}) {
  try {
    const response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(10000),
    });
    const data = await response.json();
    if (!response.ok || data.error)
      throw new UnauthorizedError(
        "Provider rejected this sign-in. Please try again.",
      );
    return { data, response };
  } catch (error) {
    if (error.status) throw error;
    throw new ServiceUnavailableError(
      "Sign-in provider is unavailable. Please try again.",
    );
  }
}

async function verifyGoogleLogin(credential) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId)
    throw new ServiceUnavailableError("Google sign-in is not configured.");
  const decoded = jwt.decode(credential, { complete: true });
  if (
    !decoded ||
    decoded.header.alg !== "RS256" ||
    typeof decoded.header.kid !== "string"
  )
    throw new UnauthorizedError("Invalid Google sign-in credential.");
  if (
    googleKeyCache.expiresAt <= Date.now() ||
    !googleKeyCache.keys.some((key) => key.kid === decoded.header.kid)
  ) {
    const { data, response } = await providerRequest(
      "https://www.googleapis.com/oauth2/v3/certs",
    );
    if (!Array.isArray(data.keys))
      throw new ServiceUnavailableError("Google verification is unavailable.");
    const age = Number(
      response.headers.get("cache-control")?.match(/max-age=(\d+)/)?.[1] || 300,
    );
    googleKeyCache = {
      keys: data.keys,
      expiresAt: Date.now() + Math.min(age, 3600) * 1000,
    };
  }
  const key = googleKeyCache.keys.find(
    (entry) => entry.kid === decoded.header.kid && entry.kty === "RSA",
  );
  if (!key) throw new UnauthorizedError("Invalid Google signing key.");
  let identity;
  try {
    identity = jwt.verify(
      credential,
      crypto.createPublicKey({ key, format: "jwk" }),
      {
        algorithms: ["RS256"],
        audience: clientId,
        issuer: ["accounts.google.com", "https://accounts.google.com"],
      },
    );
  } catch {
    throw new UnauthorizedError(
      "Google sign-in is invalid or expired. Please try again.",
    );
  }
  if (
    !identity.sub ||
    !Number.isFinite(identity.exp) ||
    identity.email_verified !== true
  )
    throw new UnauthorizedError(
      "Google must verify your email before sign-in.",
    );
  return {
    email: identity.email,
    name: identity.name,
    picture: identity.picture,
    authoritative:
      Boolean(identity.hd) || identity.email?.endsWith("@gmail.com"),
  };
}

async function verifyFacebookLogin(accessToken) {
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  if (!appId || !appSecret)
    throw new ServiceUnavailableError("Facebook sign-in is not configured.");
  const version = process.env.FACEBOOK_API_VERSION || "v24.0";
  if (!/^v\d+\.\d+$/.test(version))
    throw new ServiceUnavailableError("Invalid Facebook API configuration.");
  const debugUrl = new URL(
    "https://graph.facebook.com/" + version + "/debug_token",
  );
  debugUrl.searchParams.set("input_token", accessToken);
  const { data: debug } = await providerRequest(debugUrl, {
    Authorization: "Bearer " + appId + "|" + appSecret,
  });
  const info = debug.data;
  const now = Date.now() / 1000;
  if (
    !info?.is_valid ||
    String(info.app_id) !== appId ||
    info.type !== "USER" ||
    !info.user_id ||
    !Number.isFinite(info.expires_at) ||
    info.expires_at <= now ||
    (info.data_access_expires_at && info.data_access_expires_at <= now)
  )
    throw new UnauthorizedError("Invalid or expired Facebook sign-in.");
  const profileUrl = new URL("https://graph.facebook.com/" + version + "/me");
  profileUrl.searchParams.set("fields", "id,name,email,picture.type(large)");
  profileUrl.searchParams.set(
    "appsecret_proof",
    crypto.createHmac("sha256", appSecret).update(accessToken).digest("hex"),
  );
  const { data: profile } = await providerRequest(profileUrl, {
    Authorization: "Bearer " + accessToken,
  });
  if (String(profile.id) !== String(info.user_id))
    throw new UnauthorizedError("Facebook verification failed.");
  if (!profile.email)
    throw new BadRequestError(
      "Facebook did not share an email. Allow email access or use Google/email sign-in.",
    );
  return {
    email: profile.email,
    name: profile.name,
    picture: profile.picture?.data?.url,
    authoritative: false,
  };
}

const LoginUser = async (req, res, next) => {
  const {
    email,
    password,
    rememberMe,
    googleAuth,
    facebookAuth,
    credential,
    accessToken,
    accountPassword,
  } = req.body || {};
  try {
    let user;
    if (googleAuth === true || facebookAuth === true) {
      if (googleAuth === true && facebookAuth === true)
        return next(new BadRequestError("Choose one sign-in provider."));
      const origin = new URL(
        process.env.FRONTEND_URL || "http://localhost:5173",
      ).origin;
      if (req.get("origin") !== origin)
        return next(
          new ForbiddenError("Sign in from the storefront to continue."),
        );
      const proof = googleAuth === true ? credential : accessToken;
      if (typeof proof !== "string" || !proof || proof.length > 16384)
        return next(
          new BadRequestError("A valid provider credential is required."),
        );
      const identity = await (googleAuth === true
        ? verifyGoogleLogin(proof)
        : verifyFacebookLogin(proof));
      if (
        typeof identity.email !== "string" ||
        identity.email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity.email)
      )
        return next(
          new BadRequestError("The provider did not return a valid email."),
        );
      const flag = googleAuth === true ? "isGoogleUser" : "isFacebookUser";
      user = await User.findOne({ email: identity.email.trim() }).collation({
        locale: "en",
        strength: 2,
      });
      if (!user) {
        try {
          user = await User.create({
            fullName:
              typeof identity.name === "string" && identity.name.trim()
                ? identity.name.trim().slice(0, 200)
                : identity.email.split("@")[0],
            email: identity.email.trim().toLowerCase(),
            [flag]: true,
            role: "user",
            image:
              typeof identity.picture === "string" &&
              identity.picture.startsWith("https://")
                ? identity.picture
                : undefined,
          });
        } catch (error) {
          if (error.code === 11000)
            return res.status(409).json({
              message:
                "Your account was just updated. Please try signing in again.",
            });
          throw error;
        }
      } else if (!user[flag]) {
        if (!identity.authoritative) {
          if (!user.password)
            return res.status(409).json({
              message:
                "This email already uses another provider. Use that sign-in option or reset your password first.",
            });
          if (typeof accountPassword !== "string" || !accountPassword)
            return res.status(409).json({
              code: "ACCOUNT_LINK_REQUIRED",
              message:
                "Confirm your existing account password to connect this sign-in method.",
            });
          if (
            Buffer.byteLength(accountPassword, "utf8") > 72 ||
            !(await bcrypt.compare(accountPassword, user.password))
          )
            return next(
              new UnauthorizedError(
                "Account password is incorrect. Retry or reset your password.",
              ),
            );
        }
        user = await User.findOneAndUpdate(
          { _id: user._id, email: user.email, password: user.password },
          { $set: { [flag]: true } },
          { new: true, runValidators: true },
        );
        if (!user)
          return next(
            new UnauthorizedError("Account changed. Please sign in again."),
          );
      }
      if (typeof identity.picture === "string" && identity.picture.startsWith("https://") && identity.picture !== user.image) {
        user = await User.findByIdAndUpdate(user._id,
          { $set: { image: identity.picture } }, { new: true, runValidators: true });
        if (!user) return next(new UnauthorizedError("Account no longer exists"));
      }
    } else {
      if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        !password
      )
        return next(new BadRequestError("Email and password are required."));
      user = await User.findOne({ email });
      if (
        !user ||
        !user.password ||
        !(await bcrypt.compare(password, user.password))
      )
        return next(
          new UnauthorizedError(
            "Invalid credentials. Use your connected provider if needed.",
          ),
        );
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: rememberMe ? "15d" : "7d",
    });

    user = await recordSuccessfulLogin(user, rememberMe);
    if (!user) return next(new UnauthorizedError("Account no longer exists"));

    // Store token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: rememberMe ? 15 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000, // 15 days or 7 days
    });

    const safeUser = user.toObject();
    for (const field of [
      "password",
      "otp",
      "otpExpiry",
      "otpAttempts",
      "isOtpVerified",
      "resetTokenHash",
      "resetTokenExpiry",
    ])
      delete safeUser[field];
    return res
      .status(200)
      .json({ message: "Login successful", data: safeUser, token });
  } catch (error) {
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
      role: "user",
    });

    await newUser.save();
    res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    next(err);
  }
};

const LogoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
  res.status(200).json({ message: "Logout successful" });
};
module.exports = {
  LoginUser,
  SignupUser,
  LogoutUser,
};
