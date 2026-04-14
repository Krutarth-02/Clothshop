// services/emailService.js

const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: `
        <h2>ClothShop Password Reset</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire in 5 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log("Email sent successfully");
  } catch (error) {
    console.log("Email error:", error);
  }
};

module.exports = { sendEmail };