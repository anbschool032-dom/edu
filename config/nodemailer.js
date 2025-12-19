const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587,
  secure: process.env.EMAIL_PORT == '465', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMail = async (to, subject, html, text) => {
  await transporter.sendMail({
    from: `"CareerSync" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text: text || '',
    html: html || '',
  });
};

const sendVerificationEmail = async (email, token, role = 'user') => {
  const base = role === 'admin' ? process.env.CLIENT_BASE_URL_ADMIN : process.env.CLIENT_BASE_URL_PUBLIC;
  const verifyUrl = `${base}/verify-email?token=${token}&role=${role}`;
  const html = `<p>Please verify your email by clicking <a href="${verifyUrl}">here</a>.</p>`;
  await sendMail(email, 'Verify your CareerSync account', html, `Verify: ${verifyUrl}`);
};

const sendPasswordResetEmail = async (email, token) => {
  const base = process.env.CLIENT_BASE_URL_PUBLIC || 'http://localhost:5173';
  const resetUrl = `${base}/reset-password?token=${token}`;
  const html = `<p>Reset your password by clicking <a href="${resetUrl}">here</a>. This link expires in 1 hour.</p>`;
  await sendMail(email, 'CareerSync password reset', html, `Reset: ${resetUrl}`);
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  transporter, // exported for testing if needed
};

