// const db = require('../config/database');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const { sendVerificationEmail } = require('../services/email.service');
// const { v4: uuidv4 } = require('uuid');

// // --- HELPER FUNCTION: JWT GENERATION ---
// const generateTokens = (user) => {
//   const payload = {
//     id: user.id,
//     email: user.email,
//     role_name: user.role_name
//   };

//   const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
//     expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m'
//   });

//   const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
//     expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d'
//   });

//   return { accessToken, refreshToken };
// };

// // --- 1. REGISTER MENTOR ---
// const registerMentor = async (req, res) => {
//   const {
//     email, password, firstName, lastName, phone, gender, dob,
//     position_id, industry_id, job_title, about_mentor, experience_years, document_url
//   } = req.body;

//   if (!email || !password || !firstName || !lastName) {
//     return res.status(400).json({ message: 'Required fields missing.' });
//   }

//   const client = db.pool;
//   const userId = uuidv4();
//   const mentorProfileId = uuidv4();
//   const verificationToken = uuidv4();
//   const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day

//   try {
//     const existing = await db.query('SELECT id FROM Users WHERE email = $1', [email]);
//     if (existing.rows.length > 0) {
//       return res.status(409).json({ message: 'Email already registered.' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     await client.query('BEGIN');

//     await db.query(
//       'INSERT INTO Users (id, email, password, role_name, status) VALUES ($1, $2, $3, $4, $5)',
//       [userId, email, hashedPassword, 'mentor', 'unverified']
//     );

//     await db.query(
//       `INSERT INTO Mentor (id, user_id, first_name, last_name, gender, dob, phone, position_id, industry_id, job_title, about_mentor, experience_years) 
//        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
//       [mentorProfileId, userId, firstName, lastName, gender, dob, phone, position_id, industry_id, job_title, about_mentor, experience_years]
//     );

//     await db.query(
//       'INSERT INTO Mentor_Documents (mentor_id, document_url, is_primary_cv) VALUES ($1, $2, $3)',
//       [mentorProfileId, document_url, true]
//     );

//     // store verification token in Login_Session (as temporary refresh_token)
//     await db.query(
//       `INSERT INTO Login_Session (user_id, refresh_token, access_token, expired_at) 
//        VALUES ($1,$2,$3,$4)`,
//       [userId, verificationToken, 'temp_mentor', expiredAt]
//     );

//     await client.query('COMMIT');

//     // send email after commit (so token is persisted)
//     await sendVerificationEmail(email, verificationToken, 'mentor');

//     res.status(201).json({ message: 'Mentor application submitted. Verify email to continue.' });
//   } catch (error) {
//     try { await client.query('ROLLBACK'); } catch (e) { /* ignore */ }
//     console.error('Mentor registration error:', error);
//     res.status(500).json({ message: 'Server error during mentor registration.' });
//   }
// };




// // --- 2. LOGIN ---
// const login = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ message: 'email and password required.' });
//     }

//     console.log('LOGIN EMAIL:', email);

//     const userResult = await db.query(
//       'SELECT id, email, password, role_name, status FROM Users WHERE email = $1',
//       [email]
//     );

//     const user = userResult.rows[0];
//     console.log('DB USER FOUND:', !!user);

//     if (!user) {
//       return res.status(401).json({ message: 'Invalid credentials.' });
//     }

//     if (user.status !== 'active') {
//       return res.status(403).json({ message: 'Account not active.' });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     console.log('PASSWORD MATCH:', isMatch);

//     if (!isMatch) {
//       return res.status(401).json({ message: 'Invalid credentials.' });
//     }

//     const { accessToken, refreshToken } = generateTokens(user);

//     const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
//     await db.query(
//       `INSERT INTO Login_Session (user_id, refresh_token, access_token, expired_at)
//        VALUES ($1,$2,$3,$4)
//        ON CONFLICT (user_id)
//        DO UPDATE SET refresh_token = EXCLUDED.refresh_token,
//                      access_token = EXCLUDED.access_token,
//                      expired_at = EXCLUDED.expired_at`,
//       [user.id, refreshToken, accessToken, expiryDate]
//     );

//     res.cookie(process.env.REFRESH_TOKEN_COOKIE_NAME || 'jid', refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//       path: '/',
//     });

//     return res.json({
//       accessToken,
//       user: {
//         id: user.id,
//         email: user.email,
//         role_name: user.role_name,
//       },
//     });
//   } catch (err) {
//     next(err);
//   }
// };



// // const login = async (req, res, next) => {
// //   try {
// //     const { email, password } = req.body;

// //     if (!email || !password) {
// //       return res.status(400).json({ message: 'email and password required.' });
// //     }

// //     const userResult = await db.query(
// //       `SELECT u.id, u.email, u.password, u.role_name, u.status,
// //               m.first_name, m.last_name
// //        FROM Users u
// //        LEFT JOIN Mentor m ON u.id = m.user_id
// //        WHERE u.email = $1`,
// //       [email]
// //     );

// //     const user = userResult.rows[0];
// //     if (!user) return res.status(401).json({ message: 'Invalid credentials.' });
// //     if (user.status !== 'active') return res.status(403).json({ message: 'Account not active.' });

// //     const isMatch = await bcrypt.compare(password, user.password);
// //     if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });

// //     const { accessToken, refreshToken } = generateTokens(user);

// //     const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
// //     await db.query(
// //       `INSERT INTO Login_Session (user_id, refresh_token, access_token, expired_at)
// //        VALUES ($1,$2,$3,$4)
// //        ON CONFLICT (user_id)
// //        DO UPDATE SET refresh_token = EXCLUDED.refresh_token,
// //                      access_token = EXCLUDED.access_token,
// //                      expired_at = EXCLUDED.expired_at`,
// //       [user.id, refreshToken, accessToken, expiryDate]
// //     );

// //     res.cookie(process.env.REFRESH_TOKEN_COOKIE_NAME || 'jid', refreshToken, {
// //       httpOnly: true,
// //       secure: process.env.NODE_ENV === 'production',
// //       sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
// //       maxAge: 7 * 24 * 60 * 60 * 1000,
// //       path: '/',
// //     });

// //     return res.json({
// //       accessToken,
// //       user: {
// //         id: user.id,
// //         email: user.email,
// //         role_name: user.role_name,
// //         first_name: user.first_name || '',
// //         last_name: user.last_name || ''
// //       },
// //     });
// //   } catch (err) {
// //     next(err);
// //   }
// // };




// // --- 3. TOKEN REFRESH ---
// const refreshToken = async (req, res) => {
//   const token = req.cookies ? req.cookies[process.env.REFRESH_TOKEN_COOKIE_NAME || 'jid'] : null;
//   if (!token) return res.status(401).json({ message: 'Refresh token missing.' });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

//     const sessionResult = await db.query('SELECT user_id FROM Login_Session WHERE refresh_token = $1', [token]);
//     if (sessionResult.rows.length === 0) {
//       return res.status(403).json({ message: 'Invalid refresh token.' });
//     }

//     // const userResult = await db.query('SELECT id, email, role_name FROM Users WHERE id = $1', [decoded.id]);
//         const userResult = await db.query(
//       `SELECT u.id, u.email, u.role_name, m.first_name, m.last_name
//       FROM Users u
//       LEFT JOIN Mentor m ON u.id = m.user_id
//       WHERE u.id = $1`,
//       [decoded.id]
//     );

//     const user = userResult.rows[0];
//     if (!user) return res.status(404).json({ message: 'User not found.' });

//     const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user);

//     const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
//     await db.query(
//       'UPDATE Login_Session SET refresh_token = $1, access_token = $2, expired_at = $3 WHERE user_id = $4',
//       [newRefreshToken, newAccessToken, expiryDate, user.id]
//     );

//     res.cookie(process.env.REFRESH_TOKEN_COOKIE_NAME || 'jid', newRefreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//       path: '/'
//     });

//     res.json({ accessToken: newAccessToken, role: user.role_name });
//   } catch (error) {
//     console.error('Token refresh error:', error);
//     res.status(403).json({ message: 'Invalid or expired refresh token.' });
//   }
// };

// // --- 4. FORGOT PASSWORD ---
// const forgotPassword = async (req, res) => {
//   const { email } = req.body;
//   if (!email) return res.json({ message: 'If the email exists, a password reset link has been sent.' });

//   try {
//     const userResult = await db.query('SELECT id FROM Users WHERE email = $1 AND status = $2', [email, 'active']);
//     if (userResult.rows.length === 0) {
//       return res.json({ message: 'If the email exists, a password reset link has been sent.' });
//     }

//     const userId = userResult.rows[0].id;
//     const resetToken = uuidv4();
//     const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

//     await db.query(
//       `INSERT INTO Password_Reset (user_id, reset_token, expires_at) 
//        VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET reset_token = EXCLUDED.reset_token, expires_at = EXCLUDED.expires_at`,
//       [userId, resetToken, expiresAt]
//     );

//     // send password reset email (service must implement)
//     try { await require('../services/email.service').sendPasswordResetEmail(email, resetToken); } catch (e) { /* log but don't fail */ }

//     res.json({ message: 'If the email exists, a password reset link has been sent.' });
//   } catch (error) {
//     console.error('Forgot password error:', error);
//     res.status(500).json({ message: 'Server error.' });
//   }
// };

// // --- 5. RESET PASSWORD ---
// const resetPassword = async (req, res) => {
//   const { token, newPassword } = req.body;
//   if (!token || !newPassword) return res.status(400).json({ message: 'token and newPassword are required.' });

//   try {
//     const resetResult = await db.query('SELECT user_id, expires_at FROM Password_Reset WHERE reset_token = $1', [token]);
//     if (resetResult.rows.length === 0 || new Date(resetResult.rows[0].expires_at) < new Date()) {
//       return res.status(400).json({ message: 'Invalid or expired password reset token.' });
//     }

//     const userId = resetResult.rows[0].user_id;
//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     await db.query('UPDATE Users SET password = $1, last_password_change = NOW() WHERE id = $2', [hashedPassword, userId]);
//     await db.query('DELETE FROM Password_Reset WHERE reset_token = $1', [token]);

//     res.json({ message: 'Password has been reset successfully.' });
//   } catch (error) {
//     console.error('Reset password error:', error);
//     res.status(500).json({ message: 'Server error.' });
//   }
// };

// // --- 6. UPDATE PASSWORD (Protected Route) ---
// const updatePassword = async (req, res) => {
//   const userId = req.user && req.user.id;
//   const { currentPassword, newPassword } = req.body;
//   if (!userId) return res.status(401).json({ message: 'Unauthorized.' });
//   if (!currentPassword || !newPassword) return res.status(400).json({ message: 'currentPassword and newPassword are required.' });

//   try {
//     const userResult = await db.query('SELECT password FROM Users WHERE id = $1', [userId]);
//     const user = userResult.rows[0];
//     if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
//       return res.status(401).json({ message: 'Invalid current password.' });
//     }

//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     await db.query('UPDATE Users SET password = $1, last_password_change = NOW() WHERE id = $2', [hashedPassword, userId]);

//     // optionally invalidate existing sessions
//     res.json({ message: 'Password updated successfully.' });
//   } catch (error) {
//     console.error('Update password error:', error);
//     res.status(500).json({ message: 'Server error.' });
//   }
// };

// // --- VERIFY EMAIL ---
// const verifyEmail = async (req, res) => {
//   const { token } = req.query;
//   if (!token) return res.status(400).json({ message: 'token is required.' });

//   try {
//     const sessionRes = await db.query('SELECT user_id FROM Login_Session WHERE refresh_token = $1', [token]);
//     if (sessionRes.rows.length === 0) return res.status(400).json({ message: 'Invalid token.' });

//     const userId = sessionRes.rows[0].user_id;
//     await db.query('UPDATE Users SET status = $1, email_verified_at = NOW() WHERE id = $2', ['active', userId]);
//     // remove the temporary token
//     await db.query('DELETE FROM Login_Session WHERE refresh_token = $1 AND access_token = $2', [token, 'temp_mentor']);

//     res.json({ message: 'Email verified. You may now login.' });
//   } catch (error) {
//     console.error('verifyEmail error:', error);
//     res.status(500).json({ message: 'Server error.' });
//   }
// };

// // --- LOGOUT ---
// const logout = async (req, res) => {
//   const token = req.cookies ? req.cookies[process.env.REFRESH_TOKEN_COOKIE_NAME || 'jid'] : null;
//   if (token) {
//     try { await db.query('DELETE FROM Login_Session WHERE refresh_token = $1', [token]); } catch (e) { /* ignore */ }
//   }
//   res.clearCookie(process.env.REFRESH_TOKEN_COOKIE_NAME || 'jid', { path: '/' });
//   res.json({ message: 'Logged out.' });
// };


// const getMe = async (req, res) => {
//   try {
//     const result = await db.query(`
//       SELECT
//         u.id,
//         u.email,
//         u.role_name,

//         a.first_name,
//         a.last_name

//       FROM Users u
//       LEFT JOIN Admin a ON a.user_id = u.id
//       WHERE u.id = $1
//     `, [req.user.id]);

//     res.json(result.rows[0]);
//   } catch (error) {
//     console.error('getMe error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };




// module.exports = {
//   registerMentor,
//   login,
//   refreshToken,
//   verifyEmail,
//   logout,
//   getMe,
//   forgotPassword,
//   resetPassword,
//   updatePassword,
// };





const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('../services/email.service');
const { v4: uuidv4 } = require('uuid');

const generateTokens = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role_name: user.role_name
  };
  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m'
  });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d'
  });
  return { accessToken, refreshToken };
};

const registerMentor = async (req, res) => {
  const {
    email, password, firstName, lastName, phone, gender, dob,
    position_id, industry_id, job_title, about_mentor, experience_years, document_url
  } = req.body;
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ message: 'Required fields missing.' });
  }
  const userId = uuidv4();
  const mentorProfileId = uuidv4();
  const verificationToken = uuidv4();
  const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
  try {
    const existing = await db.query('SELECT id FROM Users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Email already registered.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.pool.query('BEGIN');
    await db.query(
      'INSERT INTO Users (id, email, password, role_name, status) VALUES ($1, $2, $3, $4, $5)',
      [userId, email, hashedPassword, 'mentor', 'unverified']
    );
    await db.query(
      `INSERT INTO Mentor (id, user_id, first_name, last_name, gender, dob, phone, position_id, industry_id, job_title, about_mentor, experience_years)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [mentorProfileId, userId, firstName, lastName, gender, dob, phone, position_id, industry_id, job_title, about_mentor, experience_years]
    );
    await db.query(
      'INSERT INTO Mentor_Documents (mentor_id, document_url, is_primary_cv) VALUES ($1, $2, $3)',
      [mentorProfileId, document_url, true]
    );
    await db.query(
      `INSERT INTO Login_Session (user_id, refresh_token, access_token, expired_at)
       VALUES ($1,$2,$3,$4)`,
      [userId, verificationToken, 'temp_mentor', expiredAt]
    );
    await db.pool.query('COMMIT');
    await sendVerificationEmail(email, verificationToken, 'mentor');
    res.status(201).json({ message: 'Mentor application submitted. Verify email to continue.' });
  } catch (error) {
    await db.pool.query('ROLLBACK');
    console.error('Mentor registration error:', error);
    res.status(500).json({ message: 'Server error during mentor registration.' });
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password required.' });
    }
    const userResult = await db.query(
      `SELECT u.id, u.email, u.password, u.role_name, u.status,
       m.first_name, m.last_name, a.first_name AS admin_first_name, a.last_name AS admin_last_name
       FROM Users u
       LEFT JOIN Mentor m ON u.id = m.user_id
       LEFT JOIN Admin a ON u.id = a.user_id
       WHERE u.email = $1`,
      [email]
    );
    const user = userResult.rows[0];
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });
    if (user.status !== 'active') return res.status(403).json({ message: 'Account not active.' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });
    const { accessToken, refreshToken } = generateTokens(user);
    const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.query(
      `INSERT INTO Login_Session (user_id, refresh_token, access_token, expired_at)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (user_id)
       DO UPDATE SET refresh_token = EXCLUDED.refresh_token,
                     access_token = EXCLUDED.access_token,
                     expired_at = EXCLUDED.expired_at`,
      [user.id, refreshToken, accessToken, expiryDate]
    );
    res.cookie(process.env.REFRESH_TOKEN_COOKIE_NAME || 'jid', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    return res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role_name: user.role_name,
        first_name: user.first_name || user.admin_first_name || '',
        last_name: user.last_name || user.admin_last_name || ''
      },
    });
  } catch (err) {
    next(err);
  }
};

const refreshToken = async (req, res) => {
  const token = req.cookies ? req.cookies[process.env.REFRESH_TOKEN_COOKIE_NAME || 'jid'] : null;
  if (!token) return res.status(401).json({ message: 'Refresh token missing.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const sessionResult = await db.query('SELECT user_id FROM Login_Session WHERE refresh_token = $1', [token]);
    if (sessionResult.rows.length === 0) {
      return res.status(403).json({ message: 'Invalid refresh token.' });
    }
    const userResult = await db.query(
      `SELECT u.id, u.email, u.role_name, m.first_name, m.last_name, a.first_name AS admin_first_name, a.last_name AS admin_last_name
      FROM Users u
      LEFT JOIN Mentor m ON u.id = m.user_id
      LEFT JOIN Admin a ON u.id = a.user_id
      WHERE u.id = $1`,
      [decoded.id]
    );
    const user = userResult.rows[0];
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user);
    const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.query(
      'UPDATE Login_Session SET refresh_token = $1, access_token = $2, expired_at = $3 WHERE user_id = $4',
      [newRefreshToken, newAccessToken, expiryDate, user.id]
    );
    res.cookie(process.env.REFRESH_TOKEN_COOKIE_NAME || 'jid', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });
    res.json({ accessToken: newAccessToken, role: user.role_name });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(403).json({ message: 'Invalid or expired refresh token.' });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ message: 'If the email exists, a password reset link has been sent.' });
  try {
    const userResult = await db.query('SELECT id FROM Users WHERE email = $1 AND status = $2', [email, 'active']);
    if (userResult.rows.length === 0) {
      return res.json({ message: 'If the email exists, a password reset link has been sent.' });
    }
    const userId = userResult.rows[0].id;
    const resetToken = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await db.query(
      `INSERT INTO Password_Reset (user_id, reset_token, expires_at)
       VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET reset_token = EXCLUDED.reset_token, expires_at = EXCLUDED.expires_at`,
      [userId, resetToken, expiresAt]
    );
    try { await require('../services/email.service').sendPasswordResetEmail(email, resetToken); } catch (e) { console.error(e); }
    res.json({ message: 'If the email exists, a password reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ message: 'token and newPassword are required.' });
  try {
    const resetResult = await db.query('SELECT user_id, expires_at FROM Password_Reset WHERE reset_token = $1', [token]);
    if (resetResult.rows.length === 0 || new Date(resetResult.rows[0].expires_at) < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired password reset token.' });
    }
    const userId = resetResult.rows[0].user_id;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE Users SET password = $1, last_password_change = NOW() WHERE id = $2', [hashedPassword, userId]);
    await db.query('DELETE FROM Password_Reset WHERE reset_token = $1', [token]);
    res.json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const updatePassword = async (req, res) => {
  const userId = req.user?.id;
  const { currentPassword, newPassword } = req.body;
  if (!userId) return res.status(401).json({ message: 'Unauthorized.' });
  if (!currentPassword || !newPassword) return res.status(400).json({ message: 'currentPassword and newPassword are required.' });
  try {
    const userResult = await db.query('SELECT password FROM Users WHERE id = $1', [userId]);
    const user = userResult.rows[0];
    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(401).json({ message: 'Invalid current password.' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE Users SET password = $1, last_password_change = NOW() WHERE id = $2', [hashedPassword, userId]);
    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ message: 'token is required.' });
  try {
    const sessionRes = await db.query('SELECT user_id FROM Login_Session WHERE refresh_token = $1', [token]);
    if (sessionRes.rows.length === 0) return res.status(400).json({ message: 'Invalid token.' });
    const userId = sessionRes.rows[0].user_id;
    await db.query('UPDATE Users SET status = $1, email_verified_at = NOW() WHERE id = $2', ['active', userId]);
    await db.query('DELETE FROM Login_Session WHERE refresh_token = $1 AND access_token = $2', [token, 'temp_mentor']);
    res.json({ message: 'Email verified. You may now login.' });
  } catch (error) {
    console.error('verifyEmail error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const logout = async (req, res) => {
  const token = req.cookies ? req.cookies[process.env.REFRESH_TOKEN_COOKIE_NAME || 'jid'] : null;
  if (token) {
    try { await db.query('DELETE FROM Login_Session WHERE refresh_token = $1', [token]); } catch (e) { console.error(e); }
  }
  res.clearCookie(process.env.REFRESH_TOKEN_COOKIE_NAME || 'jid', { path: '/' });
  res.json({ message: 'Logged out.' });
};

// const getMe = async (req, res) => {
//   try {
//     const result = await db.query(`
//       SELECT
//         u.id,
//         u.email,
//         u.role_name,
//         a.first_name,
//         a.last_name
//       FROM Users u
//       LEFT JOIN Admin a ON a.user_id = u.id
//       WHERE u.id = $1
//     `, [req.user.id]);
//     res.json(result.rows[0]);
//   } catch (error) {
//     console.error('getMe error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

const getMe = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        u.id,
        u.email,
        u.role_name,
        a.first_name,
        a.last_name,
        a.profile_image  -- ← ADD THIS
      FROM Users u
      LEFT JOIN Admin a ON a.user_id = u.id
      WHERE u.id = $1
    `, [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
module.exports = {
  registerMentor,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  updatePassword,
  verifyEmail,
  logout,
  getMe
};