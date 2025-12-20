const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../models'); // Check if this path is correct for your folder structure
// Add sendResetPasswordEmail to the list inside { }
const { sendVerificationEmail, sendResetPasswordEmail } = require('../services/email.service');
const PasswordReset = db.PasswordReset;

// Make sure these match your exports in models/index.js
const User = db.User;
const Admin = db.Admin;
const Mentor = db.Mentor;
const AccUser = db.AccUser;
const LoginSession = db.LoginSession;



// Helper: Generate Tokens
const generateTokens = (user) => {
  const payload = { id: user.id, email: user.email, role_name: user.role_name };
  return {
    accessToken: jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' }),
    refreshToken: jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })
  };
};

// ==========================================
// 1. AUTHENTICATION FUNCTIONS (Restored)
// ==========================================

const registerMentor = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ message: 'Required fields missing' });
  }

  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create User
    const user = await User.create({ 
      id: uuidv4(), 
      email, 
      password: hashedPassword, 
      role_name: 'mentor', 
      status: 'unverified' 
    });
    
    // Create Mentor Profile
    await Mentor.create({ 
      id: uuidv4(), 
      user_id: user.id, 
      first_name: firstName, 
      last_name: lastName, 
      approval_status: 'pending' 
    });

    // Create Verification Token
    const verificationToken = uuidv4();
    await LoginSession.create({ 
      user_id: user.id, 
      refresh_token: verificationToken, 
      access_token: 'temp', 
      expired_at: new Date(Date.now() + 24 * 60 * 60 * 1000) 
    });

    await sendVerificationEmail(email, verificationToken, 'mentor');
    res.status(201).json({ message: 'Mentor registered. Check email to verify.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password required' });

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.status !== 'active') return res.status(403).json({ message: 'Account not active' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh token to DB
    await LoginSession.upsert({
      user_id: user.id,
      access_token: accessToken,
      refresh_token: refreshToken,
      expired_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    // Set Cookie
    res.cookie('jid', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role_name: user.role_name
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

const refreshToken = async (req, res) => {
  const token = req.cookies?.jid;
  if (!token) return res.status(401).json({ message: 'Refresh token missing' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    
    await LoginSession.upsert({ 
      user_id: user.id, 
      access_token: accessToken, 
      refresh_token: newRefreshToken, 
      expired_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
    });

    res.cookie('jid', newRefreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ accessToken });
  } catch (err) {
    console.error(err);
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

const logout = async (req, res) => {
  const token = req.cookies?.jid;
  if (token) await LoginSession.destroy({ where: { refresh_token: token } });
  res.clearCookie('jid'); 
  res.json({ message: 'Logged out' });
};

const verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    const session = await LoginSession.findOne({ where: { refresh_token: token } });
    
    if (!session) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const user = await User.findByPk(session.user_id);
    if (user) {
        user.status = 'active'; 
        user.email_verified_at = new Date();
        await user.save();
    }

    await session.destroy(); 
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ==========================================
// 2. SETTINGS & PROFILE FUNCTIONS (Updated)
// ==========================================

// ✅ UPDATED: Returns full profile details
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'role_name', 'status'],
      include: [
        { model: Admin, as: 'admin', required: false },
        { model: Mentor, as: 'mentor', required: false },
        { model: AccUser, as: 'accUser', required: false }
      ]
    });
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Extract profile data based on role
    let profileData = {};
    if (user.role_name === 'admin' && user.admin) {
      profileData = user.admin.toJSON();
    } else if (user.role_name === 'mentor' && user.mentor) {
      profileData = user.mentor.toJSON();
    } else if (user.role_name === 'user' && user.accUser) {
      profileData = user.accUser.toJSON();
    }

    res.json({ 
      id: user.id, 
      email: user.email, 
      role_name: user.role_name,
      status: user.status,
      ...profileData 
    });
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ NEW: Update Password
const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.last_password_change = new Date();
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Security: Don't reveal if user exists. Just say email sent.
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    // Generate Token
    const resetToken = uuidv4();
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    // Save to DB (Handle duplicates by deleting old requests first)
    await PasswordReset.destroy({ where: { user_id: user.id } });
    await PasswordReset.create({
      user_id: user.id,
      reset_token: resetToken,
      expires_at: expiresAt
    });

    // Send Email
    await sendResetPasswordEmail(email, resetToken);

    res.json({ message: 'Reset link sent! Please check your email.' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ 2. Reset Password (User clicks link -> Enters new password)
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  
  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password required' });
  }

  try {
    // Find valid token
    const resetRecord = await PasswordReset.findOne({ where: { reset_token: token } });
    
    if (!resetRecord) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Check expiration
    if (new Date() > new Date(resetRecord.expires_at)) {
      return res.status(400).json({ message: 'Token has expired' });
    }

    // Update User Password
    const user = await User.findByPk(resetRecord.user_id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.last_password_change = new Date();
    await user.save();

    // Delete the used token
    await resetRecord.destroy();

    res.json({ message: 'Password has been reset successfully. Please login.' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { 
  registerMentor, 
  login, 
  refreshToken, 
  logout, 
  getMe, 
  verifyEmail,
  updatePassword,
  forgotPassword ,
  resetPassword
};