const { sendContactEmail } = require("../services/emailService");

const sendContactMessage = async (req, res) => {
  const body = req.body || {};
  const values = {};
  const errors = {};
  for (const [field, min, max] of [["name", 2, 80], ["email", 3, 254], ["subject", 3, 120], ["message", 10, 5000]]) {
    const value = typeof body[field] === "string" ? body[field].trim() : "";
    values[field] = value;
    if (value.length < min || value.length > max) errors[field] = `Use ${min} to ${max} characters.`;
    if (field !== "message" && /[\r\n\x00]/.test(value)) errors[field] = "Enter a single line of text.";
  }
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(values.email)) errors.email = "Enter a valid email address.";
  if (Object.keys(errors).length) return res.status(400).json({ message: "Please check the highlighted fields.", errors });
  try {
    await sendContactEmail(values);
    return res.status(200).json({ message: "Your message has been sent. Thank you for contacting HIFASHOPNHUB." });
  } catch {
    return res.status(503).json({ message: "Your message couldn't be sent right now. Please try again shortly." });
  }
};

module.exports = { sendContactMessage };
