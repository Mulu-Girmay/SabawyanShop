import nodemailer from "nodemailer";
import logger from "./logger.js";

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: `CollabCart <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${options.to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error("Send email error:", error);
    throw error;
  }
};

export const sendWelcomeEmail = async (email, username) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6C63FF; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 10px 20px; background: #6C63FF; color: white; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to CollabCart! 🎉</h1>
        </div>
        <div class="content">
          <h2>Hello ${username}!</h2>
          <p>Welcome to CollabCart - where shopping meets community!</p>
          <p>Here's what you can do:</p>
          <ul>
            <li>🛍️ Discover amazing products</li>
            <li>👥 Start or join group buys for discounts</li>
            <li>💬 Chat with sellers directly</li>
            <li>❤️ Follow your favorite sellers and products</li>
            <li>📱 Share products with friends</li>
          </ul>
          <p>
            <a href="${process.env.CLIENT_URL}" class="button">Start Shopping</a>
          </p>
          <p>Happy shopping!<br>The CollabCart Team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: "Welcome to CollabCart!",
    html,
  });
};
