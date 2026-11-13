const { ForbiddenError } = require("../utils/errors");

// Cookie-authenticated management writes must originate from our own frontend.
const trustedOrigin = (req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const expected = new URL(process.env.FRONTEND_URL || "http://localhost:5173").origin;
  if (req.get("origin") !== expected)
    return next(new ForbiddenError("Open the store application to perform this action."));
  next();
};


module.exports = { trustedOrigin };
