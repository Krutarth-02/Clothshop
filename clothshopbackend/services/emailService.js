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

const sendContactEmail = async ({ name, email, subject, message }) => {
  const recipient = (process.env.CONTACT_EMAIL || process.env.EMAIL_USER || "").trim();
  const sender = (process.env.EMAIL_USER || "").trim();
  const validEmail = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
  if (!validEmail.test(recipient) || !validEmail.test(sender) || !process.env.EMAIL_PASS) {
    throw new Error("Contact email is not configured.");
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: sender, pass: process.env.EMAIL_PASS },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
  const result = await transporter.sendMail({
    from: { name: "HIFASHOPNHUB Contact", address: sender },
    to: recipient,
    replyTo: { name, address: email },
    subject: `[HIFASHOPNHUB] ${subject}`,
    text: `New customer message\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}\n\nSent through the HIFASHOPNHUB Contact Us form.`,
    disableFileAccess: true,
    disableUrlAccess: true,
  });
  if (!result.accepted?.length) throw new Error("Contact email was not accepted.");
};

module.exports = { sendEmail, sendContactEmail };
