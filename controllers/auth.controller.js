// controllers/auth.controller.js
const { sendLoginNotification } = require('../services/telegram.service');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../models'); 
const { sendVerificationEmail, sendResetPasswordEmail } = require('../services/email.service');

// Models
const User = db.User;
const Admin = db.Admin;
const Mentor = db.Mentor;
const AccUser = db.AccUser;
const LoginSession = db.LoginSession;
const PasswordReset = db.PasswordReset;

// Helper: Generate Tokens
const generateTokens = (user) => {
  const payload = { id: user.id, email: user.email, role_name: user.role_name };
  return {
    accessToken: jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' }),
    refreshToken: jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })
  };
};

// ==========================================
// 1. AUTHENTICATION FUNCTIONS 
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


//   const { email, password } = req.body;
  
//   try {
//     // 1. Find User
//     const user = await User.findOne({ where: { email } });

//     // 2. Debugging Check (You can remove this later)
//     if (!user) {
//         console.log("Login failed: User not found");
//         return res.status(401).json({ message: 'Invalid credentials' });
//     }
    
//     // 3. Status Check
//     if (user.status !== 'active') {
//         return res.status(403).json({ message: 'Account not active. Please verify email.' });
//     }

//     // 4. Password Check (This will work now because user.password exists)
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//         console.log("Login failed: Password mismatch");
//         return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     // 5. Generate Tokens
//     const { accessToken, refreshToken } = generateTokens(user);

//     // 6. Save Refresh Token
//     await LoginSession.upsert({
//       user_id: user.id,
//       access_token: accessToken,
//       refresh_token: refreshToken,
//       expired_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
//     });

//     // 7. Send Response
//     res.cookie('jid', refreshToken, {
//       httpOnly: true,
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//       secure: process.env.NODE_ENV === 'production' // Add secure cookie in prod
//     });

//     return res.json({
//       accessToken,
//       user: {
//         id: user.id,
//         email: user.email,
//         role_name: user.role_name
//       }
//     });

//   } catch (err) {
//     console.error("LOGIN ERROR:", err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// const login = async (req, res) => {
//   const { email, password } = req.body;
  
//   try {
//     // 1. Find User
//     const user = await User.findOne({ where: { email } });

//     // 2. Debugging Check
//     if (!user) {
//         return res.status(401).json({ message: 'Invalid credentials' });
//     }
    
//     // 3. Status Check
//     if (user.status !== 'active') {
//         return res.status(403).json({ message: 'Account not active. Please verify email.' });
//     }

//     // 4. Password Check
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//         return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     // 5. Generate Tokens
//     const { accessToken, refreshToken } = generateTokens(user);

//     // 6. Save Refresh Token
//     await LoginSession.upsert({
//       user_id: user.id,
//       access_token: accessToken,
//       refresh_token: refreshToken,
//       expired_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
//     });

//     // 7. Send Response
//     res.cookie('jid', refreshToken, {
//       httpOnly: true,
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//       secure: process.env.NODE_ENV === 'production'
//     });

//     // ============================================
//     // 🔥 SEND TELEGRAM LOGIN ALERT (ដាក់នៅទីនេះ!)
//     // ============================================
//     try {
//         // ចាប់យក IP Address របស់អ្នក Login
//         const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        
//         // ផ្ញើសារទៅ Telegram
//         // sendLoginNotification(user.email, user.role_name, clientIp);
//         sendLoginNotification(user, req, accessToken);
//     } catch (tgError) {
//         console.error("Telegram Login Alert Error:", tgError);
//     }
//     // ============================================

//     return res.json({
//       accessToken,
//       user: {
//         id: user.id,
//         email: user.email,
//         role_name: user.role_name
//       }
//     });

//   } catch (err) {
//     console.error("LOGIN ERROR:", err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// ==========================================
// UPDATED LOGIN FUNCTION
// ==========================================
const login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // 1. Find User AND Include Profile Data (Admin/Mentor/Student)
    // 🔥 THIS IS THE CRITICAL FIX 🔥
    const user = await User.findOne({ 
      where: { email },
      include: [
        { model: Admin, as: 'admin', required: false },
        { model: Mentor, as: 'mentor', required: false },
        { model: AccUser, as: 'accUser', required: false }
      ]
    });

    // 2. Debugging Check
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // 3. Status Check
    if (user.status !== 'active') {
        return res.status(403).json({ message: 'Account not active. Please verify email.' });
    }

    // 4. Password Check
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 5. Generate Tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // 6. Save Refresh Token
    await LoginSession.upsert({
      user_id: user.id,
      access_token: accessToken,
      refresh_token: refreshToken,
      expired_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    // 7. Send Response
    res.cookie('jid', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production'
    });

    // ============================================
    // 🔥 SEND TELEGRAM LOGIN ALERT
    // ============================================
    try {
        // Now 'user' contains .admin, .mentor, or .accUser data
        // so the service can extract the Name and Phone correctly!
        await sendLoginNotification(user, req, accessToken);
    } catch (tgError) {
        console.error("Telegram Login Alert Error:", tgError);
    }
    // ============================================

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

const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  try {
    // 1. Get User with Password
    // IMPORTANT: Sequelize might exclude password by default depending on global scopes.
    // To be safe, we explicitly ask for it, though usually findByPk returns all columns defined in model.
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 2. Verify Current Password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

    // 3. Hash New Password
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
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const resetToken = uuidv4();
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); 

    await PasswordReset.destroy({ where: { user_id: user.id } });
    await PasswordReset.create({
      user_id: user.id,
      reset_token: resetToken,
      expires_at: expiresAt
    });

    await sendResetPasswordEmail(email, resetToken);

    res.json({ message: 'Reset link sent! Please check your email.' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  
  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password required' });
  }

  try {
    const resetRecord = await PasswordReset.findOne({ where: { reset_token: token } });
    
    if (!resetRecord) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    if (new Date() > new Date(resetRecord.expires_at)) {
      return res.status(400).json({ message: 'Token has expired' });
    }

    const user = await User.findByPk(resetRecord.user_id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.last_password_change = new Date();
    await user.save();

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
  forgotPassword,
  resetPassword
};