import nodemailer from 'nodemailer';
import config from '../config/env.js';

/**
 * Create a reusable email transporter.
 *
 * Nodemailer "transporters" handle the connection to the SMTP server.
 * We create it once and reuse it to avoid reconnecting on every email.
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_SECURE === 'true', // true for port 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Verify transporter connection on startup.
 *
 * If credentials are wrong, we want to know immediately
 * instead of failing silently when the first email is sent.
 */
transporter.verify((error) => {
  if (error) {
    console.warn('⚠️  Email transporter verification failed:', error.message);
    console.warn('   Emails will not be sent until SMTP credentials are fixed.');
  } else {
    console.log('✅ Email transporter verified and ready.');
  }
});

/**
 * Send a single email.
 *
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @param {string} text - Plain text fallback
 * @returns {Promise<object>} Nodemailer info object
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"IntelliHostel" <noreply@intellihostel.com>',
      to,
      subject,
      html,
      text,
    });

    console.log(`✅ Email sent to ${to} | Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};