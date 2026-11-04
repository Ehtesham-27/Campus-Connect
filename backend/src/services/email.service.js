import nodemailer from 'nodemailer';
import { ENV } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (ENV.EMAIL.HOST && ENV.EMAIL.USER) {
    transporter = nodemailer.createTransport({
      host: ENV.EMAIL.HOST,
      port: ENV.EMAIL.PORT,
      auth: {
        user: ENV.EMAIL.USER,
        pass: ENV.EMAIL.PASS,
      },
    });
  }

  return transporter;
};

/**
 * Send password reset email
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.resetToken - Raw unhashed reset token
 * @param {string} options.resetUrl - Full URL to password reset form
 */
export const sendPasswordResetEmail = async ({ to, resetToken, resetUrl }) => {
  const mailTransporter = getTransporter();

  // In production, SMTP configuration is strictly required and missing configuration is reported
  if (ENV.NODE_ENV === 'production') {
    if (!mailTransporter) {
      throw new ApiError(
        500,
        'Email service configuration error: SMTP credentials (EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD) are not configured in production environment.'
      );
    }

    try {
      const info = await mailTransporter.sendMail({
        from: ENV.EMAIL.FROM,
        to,
        subject: 'Reset your Campus Connect Password',
        text: `You requested a password reset. Use this link: ${resetUrl} (Valid for 15 minutes).`,
        html: `<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to reset your password. (Valid for 15 minutes).</p>`,
      });
      return { success: true, messageId: info.messageId, provider: 'smtp' };
    } catch (err) {
      throw new ApiError(
        500,
        `Email dispatch failure: Unable to deliver password reset email via SMTP provider (${err.message}).`
      );
    }
  }

  // Development / Test environment handling
  if (mailTransporter && ENV.NODE_ENV !== 'test') {
    try {
      const info = await mailTransporter.sendMail({
        from: ENV.EMAIL.FROM,
        to,
        subject: 'Reset your Campus Connect Password',
        text: `Reset link: ${resetUrl}`,
        html: `<a href="${resetUrl}">Reset Password</a>`,
      });
      return { success: true, messageId: info.messageId, provider: 'smtp' };
    } catch (err) {
      console.warn(`[EmailService] SMTP delivery failed (${err.message}). Using development console logger.`);
    }
  }

  // Development console fallback (NEVER used in production)
  if (ENV.NODE_ENV !== 'test') {
    console.log(`[EmailService DEV] Password Reset Link for ${to}: ${resetUrl}`);
  }

  return { success: true, preview: resetUrl, token: resetToken, provider: 'dev-logger' };
};

export const emailService = {
  sendPasswordResetEmail,
};

export default emailService;
