const { BadRequestError } = require("./errors");

const text = (value, label, max = 200) => {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max)
    throw new BadRequestError(`Enter a valid ${label} (maximum ${max} characters).`);
  return value.trim();
};

module.exports = { text };
