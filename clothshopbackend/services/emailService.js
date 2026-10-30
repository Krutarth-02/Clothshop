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
        <h5>HIFASHOPNHUB Password Reset</h5>
        <h4>${otp}</h4>
        <p>This OTP will expire in 5 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log("Email sent successfully");
  } catch (error) {
    throw new Error("Unable to send verification email. Please try again later.", { cause: error });
  }
};

module.exports = { sendEmail };
