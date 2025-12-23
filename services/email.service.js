// // services/email.service.js
// const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST || 'smtp.gmail.com',
//   port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587,
//   secure: process.env.EMAIL_PORT == '465', // true for 465, false for other ports
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS, // This will be your App Password
//   },
// });

// const sendMail = async (to, subject, html, text) => {
//   try {
//     await transporter.sendMail({
//       from: `"CareerSync" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       text: text || '',
//       html: html || '',
//     });
//     console.log(`✅ Email sent to ${to}`);
//   } catch (error) {
//     console.error(`❌ Email failed to ${to}:`, error.message);
//     throw error;
//   }
// };

// const sendVerificationEmail = async (email, token, role = 'user') => {
//   const base = role === 'admin' ? process.env.CLIENT_BASE_URL_ADMIN : process.env.CLIENT_BASE_URL_PUBLIC;
//   const verifyUrl = `${base}/verify-email?token=${token}&role=${role}`;
  
//   const html = `
//     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//       <h2 style="color: #667eea;">Welcome to CareerSync!</h2>
//       <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
//       <div style="text-align: center; margin: 30px 0;">
//         <a href="${verifyUrl}" 
//            style="background: linear-gradient(90deg,#4F46E5,#7C3AED); 
//                   color: white; 
//                   padding: 12px 30px; 
//                   text-decoration: none; 
//                   border-radius: 5px;
//                   display: inline-block;">
//           Verify Email
//         </a>
//       </div>
//       <p style="color: #666;">Or copy this link: <br/> <a href="${verifyUrl}">${verifyUrl}</a></p>
//       <p style="color: #999; font-size: 12px;">This link expires in 24 hours.</p>
//     </div>
//   `;
  
//   await sendMail(email, 'Verify your CareerSync account', html, `Verify your email: ${verifyUrl}`);
// };

// const sendPasswordResetEmail = async (email, token) => {
//   const base = process.env.CLIENT_BASE_URL_PUBLIC || 'http://localhost:5173';
//   const resetUrl = `${base}/reset-password?token=${token}`;
  
//   const html = `
//     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//       <h2 style="color: #667eea;">Password Reset Request</h2>
//       <p>Click the button below to reset your password:</p>
//       <div style="text-align: center; margin: 30px 0;">
//         <a href="${resetUrl}" 
//            style="background: linear-gradient(90deg,#4F46E5,#7C3AED); 
//                   color: white; 
//                   padding: 12px 30px; 
//                   text-decoration: none; 
//                   border-radius: 5px;
//                   display: inline-block;">
//           Reset Password
//         </a>
//       </div>
//       <p style="color: #666;">Or copy this link: <br/> <a href="${resetUrl}">${resetUrl}</a></p>
//       <p style="color: #999; font-size: 12px;">This link expires in 1 hour.</p>
//       <p style="color: #999; font-size: 12px;">If you didn't request this, ignore this email.</p>
//     </div>
//   `;
  
//   await sendMail(email, 'CareerSync Password Reset', html, `Reset password: ${resetUrl}`);
// };

// module.exports = {
//   sendVerificationEmail,
//   sendPasswordResetEmail,
//   transporter,
// };



// services/email.service.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587,
  secure: process.env.EMAIL_PORT == '465', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // This will be your App Password
  },
});

// Helper function to send mail
const sendMail = async (to, subject, html, text) => {
  try {
    await transporter.sendMail({
      from: `"CareerSync" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: text || '',
      html: html || '',
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Email failed to ${to}:`, error.message);
    throw error;
  }
};

const sendVerificationEmail = async (email, token, role = 'user') => {
  const base = role === 'admin' ? process.env.CLIENT_BASE_URL_ADMIN : process.env.CLIENT_BASE_URL_PUBLIC;
  const verifyUrl = `${base}/verify-email?token=${token}&role=${role}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #667eea;">Welcome to CareerSync!</h2>
      <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}" 
           style="background: linear-gradient(90deg,#4F46E5,#7C3AED); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email
        </a>
      </div>
      <p style="color: #666;">Or copy this link: <br/> <a href="${verifyUrl}">${verifyUrl}</a></p>
      <p style="color: #999; font-size: 12px;">This link expires in 24 hours.</p>
    </div>
  `;
  
  await sendMail(email, 'Verify your CareerSync account', html, `Verify your email: ${verifyUrl}`);
};

// ✅ Renamed to match your controller: sendResetPasswordEmail
const sendResetPasswordEmail = async (email, token) => {
  // Point to your FRONTEND URL (Admin or Public depending on need, defaulting to 5173 here)
  const base = 'http://localhost:5173'; 
  const resetLink = `${base}/reset-password?token=${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #667eea;">Password Reset Request</h2>
      <p>Click the button below to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" 
           style="background: linear-gradient(90deg,#4F46E5,#7C3AED); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color: #666;">Or copy this link: <br/> <a href="${resetLink}">${resetLink}</a></p>
      <p style="color: #999; font-size: 12px;">This link expires in 1 hour.</p>
    </div>
  `;
  
  await sendMail(email, 'Reset your CareerSync Password', html, `Reset password: ${resetLink}`);
};


const sendMentorApprovalEmail = async (toEmail, firstName) => {
  const loginUrl = `${process.env.FRONTEND_URL}/login`; // Link ទៅកាន់ Login Page

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: '🎉 Congratulations! Your Mentor Application is Approved - CareerSync',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #4F46E5; text-align: center;">Welcome to CareerSync!</h2>
        <p>Dear ${firstName},</p>
        <p>We are pleased to inform you that your application to become a Mentor has been <strong>APPROVED</strong>!</p>
        <p>You can now log in to your dashboard and start guiding students.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Login to Your Account
          </a>
        </div>

        <p>If the button doesn't work, copy this link: <br> <a href="${loginUrl}">${loginUrl}</a></p>
        <p>Best Regards,<br>The CareerSync Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// 2. Email សម្រាប់ពេល Admin REJECT Mentor
const sendMentorRejectionEmail = async (toEmail, firstName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Update on Your Mentor Application - CareerSync',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #EF4444; text-align: center;">Application Status</h2>
        <p>Dear ${firstName},</p>
        <p>Thank you for your interest in becoming a mentor at CareerSync.</p>
        <p>After carefully reviewing your application, we regret to inform you that we are unable to approve your mentor profile at this time.</p>
        <p>If you have any questions or believe this is a mistake, please reply to this email.</p>
        
        <p>Best Regards,<br>The CareerSync Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendVerificationEmail,
  sendResetPasswordEmail, // ✅ Exporting with the correct name
  sendMentorApprovalEmail, // 👈 ថ្មី
  sendMentorRejectionEmail,
  transporter,
};