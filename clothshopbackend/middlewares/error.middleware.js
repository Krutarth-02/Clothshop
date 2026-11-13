function errorHandler(err, req, res, next) {
  const status = err.status || (err.type === "entity.too.large" ? 413 : err.name === "ValidationError" || err.name === "CastError" || err.type === "entity.parse.failed" ? 400 : err.code === 11000 ? 409 : 500);
  if (status >= 500) console.error("Request failed:", err.name, err.message);
  res.status(status).json({
    success: false,
    message: err.code === 11000 ? "This value already exists." : status >= 500 ? "The request could not be completed. Please try again." : err.message || "Invalid request.",
  });
}

module.exports = errorHandler;
