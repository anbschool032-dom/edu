// const db = require('../config/database');
// const bcrypt = require('bcryptjs');
// const { v4: uuidv4 } = require('uuid');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const { log } = require('console');

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const dir = 'uploads/positions';
//     // Create folder if it doesn't exist
//     if (!fs.existsSync(dir)) {
//       fs.mkdirSync(dir, { recursive: true });
//     }
//     cb(null, dir);
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   }
// });

// const upload = multer({ storage });


// // // --- 1. SEED/INITIAL ADMIN CREATION (HIGHLY RESTRICTED) ---
// // const createInitialAdmin = async (req, res) => {
// //     const { email, password, fullName, phone } = req.body;

// //     try {
// //         const existingAdmin = await db.query("SELECT id FROM Users WHERE role_name = 'admin'");
// //         if (existingAdmin.rows.length > 0) {
// //             return res.status(403).json({ message: 'Admin already seeded.' });
// //         }

// //         const hashedPassword = await bcrypt.hash(password, 10);
// //         const userId = uuidv4();
// //         const adminId = uuidv4();

// //         await db.pool.query('BEGIN');

// //         // await db.query(
// //         //     `INSERT INTO Users (id, email, password, role_name, status, email_verified_at) 
// //         //      VALUES ($1, $2, $3, $4, $5, NOW())`,
// //         //     [userId, email, hashedPassword, 'admin', 'active']
// //         // );

// //             await db.query(
// //           `INSERT INTO Users (
// //             id, email, password, role_name, status, email_verified_at, created_by
// //           )
// //           VALUES ($1,$2,$3,$4,'inactive',NOW(), $5)`,
// //           [userId, email, hashedPassword, role_name, req.user.id]
// //         );


// //         await db.query(
// //             `INSERT INTO Admin (id, user_id, full_name, phone) 
// //              VALUES ($1, $2, $3, $4)`,
// //             [adminId, userId, fullName, phone]
// //         );

// //         await db.pool.query('COMMIT');

// //         res.status(201).json({ message: 'Initial Admin account created successfully.' });

// //     } catch (error) {
// //         try { await db.pool.query('ROLLBACK'); } catch (e) { /* ignore */ }
// //         console.error('Admin creation error:', error);
// //         res.status(500).json({ message: 'Server error during initial Admin creation.' });
// //     }
// // };

// const createInitialAdmin = async (req, res) => {
//   const { email, password, first_name, last_name, phone } = req.body;

//   try {
//     // ❗ Only allow ONE initial admin
//     const existingAdmin = await db.query(
//       "SELECT id FROM Users WHERE role_name = 'admin'"
//     );

//     if (existingAdmin.rows.length > 0) {
//       return res.status(403).json({ message: 'Admin already exists' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const userId = uuidv4();
//     const adminId = uuidv4();

//     await db.pool.query('BEGIN');

//     // ✅ USERS (created_by = NULL)
//     await db.query(
//       `INSERT INTO Users (
//         id, email, password, role_name, status, email_verified_at, created_by
//       )
//       VALUES ($1,$2,$3,'admin','active',NOW(), NULL)`,
//       [userId, email, hashedPassword]
//     );

//     // ✅ ADMIN PROFILE
//     await db.query(
//       `INSERT INTO Admin (id, user_id, first_name, last_name, phone)
//        VALUES ($1,$2,$3,$4,$5)`,
//       [adminId, userId, first_name, last_name, phone]
//     );

//     await db.pool.query('COMMIT');

//     res.status(201).json({ message: 'Initial admin created successfully' });

//   } catch (error) {
//     await db.pool.query('ROLLBACK');
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


// const getMentorStats = async (req, res) => {
//   try {
//     const result = await db.query(`
//       SELECT
//         COUNT(*)::int AS total,
//         COUNT(*) FILTER (WHERE approval_status = 'approved')::int AS accepted,
//         COUNT(*) FILTER (WHERE approval_status = 'rejected')::int AS rejected,
//         COUNT(*) FILTER (WHERE approval_status = 'pending')::int AS pending
//       FROM Mentor
//     `);

//     res.json(result.rows[0]);
//   } catch (error) {
//     console.error('getMentorStats error:', error);
//     res.status(500).json({ message: 'Failed to fetch mentor stats' });
//   }
// };
// const reviewMentor = async (req, res) => {
//   const { mentorId } = req.params;
//   const { action } = req.body;

//   if (!['accept', 'reject'].includes(action)) {
//     return res.status(400).json({ message: 'Invalid action' });
//   }

//   const mentorStatus = action === 'accept' ? 'approved' : 'rejected';
//   const userStatus = action === 'accept' ? 'active' : 'rejected';

//   try {
//     await db.pool.query('BEGIN');

//     // Update mentor approval status
//     const mentorResult = await db.query(
//       `UPDATE Mentor 
//        SET approval_status = $1, updated_at = NOW()
//        WHERE id = $2
//        RETURNING user_id`,
//       [mentorStatus, mentorId]
//     );

//     if (mentorResult.rows.length === 0) {
//       await db.pool.query('ROLLBACK');
//       return res.status(404).json({ message: 'Mentor not found' });
//     }

//     const userId = mentorResult.rows[0].user_id;

//     // Update user status
//     await db.query(
//       `UPDATE Users SET status = $1 WHERE id = $2`,
//       [userStatus, userId]
//     );

//     await db.pool.query('COMMIT');

//     console.log('🔥 REVIEW HIT:', mentorId, action);

//     res.json({ message: `Mentor ${mentorStatus} successfully` });

//   } catch (error) {
//     await db.pool.query('ROLLBACK');
//     console.error('reviewMentor error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }

// };


// const listPendingMentors = async (req, res) => {
//   try {
//     const result = await db.query(`
//       SELECT
//         m.id,
//         m.first_name,
//         m.last_name,
//         m.gender,
//         m.job_title,
//         m.created_at,
//         p.position_name,
//         d.document_url
//       FROM Mentor m
//       JOIN Users u ON u.id = m.user_id
//       LEFT JOIN Position p ON p.id = m.position_id
//       LEFT JOIN Mentor_Documents d ON d.mentor_id = m.id AND d.is_primary_cv = true
//       WHERE m.approval_status = 'pending'
//       ORDER BY m.created_at DESC
//     `);

//     res.json(result.rows);
//   } catch (error) {
//     console.error('listPendingMentors error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


// const createIndustry = async (req, res) => {
//   const { industry_name } = req.body;

//   if (!industry_name) {
//     return res.status(400).json({ message: 'Industry name required' });
//   }

//   try {
//     const result = await db.query(
//       'INSERT INTO Industry (industry_name) VALUES ($1) RETURNING *',
//       [industry_name]
//     );

//     res.status(201).json({
//       message: 'Industry created',
//       industry: result.rows[0],
//     });
//   } catch (err) {
//     if (err.code === '23505') {
//       return res.status(409).json({ message: 'Industry already exists' });
//     }

//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };




// const getIndustries = async (req, res) => {
//   try {
//     const result = await db.query('SELECT * FROM Industry ORDER BY created_at DESC');
//     res.json(result.rows);
//   } catch (err) {
//     console.error('getIndustries error:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// const updateIndustry = async (req, res) => {
//   const { id } = req.params;
//   const { industry_name } = req.body;

//   try {
//     const result = await db.query(
//       'UPDATE Industry SET industry_name=$1 WHERE id=$2 RETURNING *',
//       [industry_name, id]
//     );
//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error('updateIndustry error:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// const deleteIndustry = async (req, res) => {
//   const { id } = req.params;
//   try {
//     await db.query('DELETE FROM Industry WHERE id=$1', [id]);
//     res.json({ message: 'Industry deleted' });
//   } catch (err) {
//     console.error('deleteIndustry error:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };






// const createPosition = async (req, res) => {
//   const { industry_id, position_name, description } = req.body;

//   if (!industry_id || !position_name) {
//     return res.status(400).json({
//       message: 'industry_id and position_name are required'
//     });
//   }

//   const image_position = req.file ? req.file.filename : null;

//   try {
//     const result = await db.query(
//       `
//       INSERT INTO Position (
//         industry_id,
//         position_name,
//         description,
//         image_position
//       )
//       VALUES ($1, $2, $3, $4)
//       RETURNING *
//       `,
//       [industry_id, position_name, description || null, image_position]
//     );

//     res.status(201).json(result.rows[0]);
//   } catch (error) {
//     console.error('createPosition error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// const getPositions = async (req, res) => {
//   try {
//     const result = await db.query(`
//       SELECT 
//         p.*, 
//         i.industry_name AS industry
//       FROM Position p
//       JOIN Industry i ON p.industry_id = i.id
//       ORDER BY p.created_at DESC
//     `);
//     res.json(result.rows);
//   } catch (err) {
//     console.error('getPositions error:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// const updatePosition = async (req, res) => {
//   const { id } = req.params;
//   const { industry_id, position_name, description } = req.body;
//   const image_position = req.file ? req.file.filename : null;

//   try {
//     const result = await db.query(
//       `
//       UPDATE Position SET
//         industry_id=$1,
//         position_name=$2,
//         description=$3,
//         image_position=COALESCE($4, image_position)
//       WHERE id=$5
//       RETURNING *
//       `,
//       [industry_id, position_name, description, image_position, id]
//     );

//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error('updatePosition error:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// const deletePosition = async (req, res) => {
//   const { id } = req.params;
//   try {
//     await db.query('DELETE FROM Position WHERE id=$1', [id]);
//     res.json({ message: 'Position deleted' });
//   } catch (err) {
//     console.error('deletePosition error:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };



// const createRole = async (req, res) => {
//   const {
//     email, password, role_name,
//     first_name, last_name, phone, gender, dob,
//     types_user, institution_name,
//     position_id, industry_id, job_title, expertise_areas,
//     experience_years, company_name, social_media, about_mentor,
//     education
//   } = req.body;

//   const profile_image = req.file ? req.file.filename : null;

//   try {
//     await db.pool.query('BEGIN');

//     // 1. Check email
//     const emailCheck = await db.query(
//       'SELECT id FROM Users WHERE email = $1',
//       [email]
//     );

//     if (emailCheck.rows.length > 0) {
//       await db.pool.query('ROLLBACK');
//       return res.status(400).json({ message: 'Email already exists.' });
//     }

//     // 2. Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const userId = uuidv4();

//     // // 3. Insert user
//     // await db.query(
//     //   `INSERT INTO Users (id, email, password, role_name, status, email_verified_at)
//     //    VALUES ($1,$2,$3,$4,'inactive',NOW())`,
//     //   [userId, email, hashedPassword, role_name]
//     // );

//     await db.query(
//   `INSERT INTO Users (
//     id,
//     email,
//     password,
//     role_name,
//     status,
//     email_verified_at,
//     created_by
//   )
//    VALUES ($1,$2,$3,$4,'inactive',NOW(),$5)`, 
//   [
//     userId,
//     email,
//     hashedPassword,
//     role_name,
//     req.user.id   // 👈 ADMIN WHO CREATED THIS USER
//   ]
// );


//     // 4. Role logic
//     if (role_name === 'user') {
//       await db.query(
//         `INSERT INTO Acc_User
//          (id, user_id, first_name, last_name, phone, gender, dob, types_user, institution_name, profile_image)
//          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
//         [uuidv4(), userId, first_name, last_name, phone, gender, dob, types_user, institution_name, profile_image]
//       );
//     }

//     else if (role_name === 'mentor') {
//       const mentorId = uuidv4();

//       await db.query(
//         `INSERT INTO Mentor
//          (id, user_id, first_name, last_name, gender, dob, phone,
//           position_id, industry_id, job_title, expertise_areas,
//           experience_years, company_name, social_media, about_mentor,
//           profile_image, approval_status)
//          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'pending')`,
//         [
//           mentorId, userId, first_name, last_name, gender, dob, phone,
//           position_id, industry_id, job_title, expertise_areas,
//           experience_years, company_name, social_media, about_mentor,
//           profile_image
//         ]
//       );

//       // ✅ EDUCATION SAFE HANDLING
//       if (education) {
//         const eduList = typeof education === 'string'
//           ? JSON.parse(education)
//           : education;

//         for (const edu of eduList) {
//           await db.query(
//             `INSERT INTO mentor_education
//              (mentor_id, university_name, degree_name, field_of_study,
//               year_graduated, grade_gpa, activities)
//              VALUES ($1,$2,$3,$4,$5,$6,$7)`,
//             [
//               mentorId,
//               edu.university_name,
//               edu.degree_name,
//               edu.field_of_study || null,
//               parseInt(edu.year_graduated),
//               edu.grade_gpa || null,
//               edu.activities || null
//             ]
//           );
//         }
//       }
//     }

//     else if (role_name === 'admin') {
//       await db.query(
//         `INSERT INTO Admin
//          (id, user_id, first_name, last_name, phone, profile_image)
//          VALUES ($1,$2,$3,$4,$5,$6)`,
//         [uuidv4(), userId, first_name, last_name, phone, profile_image]
//       );
//     }

//     await db.pool.query('COMMIT');
//     res.status(201).json({ message: `${role_name} created successfully.` });

//   } catch (error) {
//     await db.pool.query('ROLLBACK');
//     console.error('Create User Error:', error);
//     res.status(500).json({ message: 'Failed to create user account.' });
//   }
// };


// // const getAllUsers = async (req, res) => {
// //   try {
// //     const result = await db.query(`
// //       SELECT
// //         u.id,
// //         u.email,
// //         u.role_name,
// //         u.status,
// //         u.created_at,

// //         -- Admin
// //         a.first_name AS admin_first_name,
// //         a.last_name AS admin_last_name,

// //         -- Mentor
// //         m.first_name AS mentor_first_name,
// //         m.last_name AS mentor_last_name,

// //         -- User
// //         au.first_name AS user_first_name,
// //         au.last_name AS user_last_name,


// //       FROM Users u
// //       LEFT JOIN Admin a ON a.user_id = u.id
// //       LEFT JOIN Mentor m ON m.user_id = u.id
// //       LEFT JOIN Acc_User au ON au.user_id = u.id
// //       ORDER BY u.created_at DESC
// //     `);

// //     res.json(result.rows);
// //   } catch (error) {
// //     console.error('Get users error:', error);
// //     res.status(500).json({ message: 'Failed to fetch users' });
// //   }
// // };



// // const getAllUsers = async (req, res) => {
// //   try {
// //     const result = await db.query(`
// //       SELECT
// //         u.id,
// //         u.email,
// //         u.role_name,
// //         u.status,
// //         u.created_at,

// //         -- user name
// //         au.first_name AS user_first_name,
// //         au.last_name AS user_last_name,

// //         -- mentor name
// //         m.first_name AS mentor_first_name,
// //         m.last_name AS mentor_last_name,

// //         -- admin name
// //         a.first_name AS admin_first_name,
// //         a.last_name AS admin_last_name,

// //         -- CREATED BY
// //         creator_admin.first_name || ' ' || creator_admin.last_name AS created_by_name

// //       FROM Users u

// //       LEFT JOIN Admin a ON a.user_id = u.id
// //       LEFT JOIN Mentor m ON m.user_id = u.id
// //       LEFT JOIN Acc_User au ON au.user_id = u.id

// //       LEFT JOIN Users cu ON cu.id = u.created_by
// //       LEFT JOIN Admin creator_admin ON creator_admin.user_id = cu.id

// //       ORDER BY u.created_at DESC
// //     `);

// //     res.json(result.rows);
// //   } catch (error) {
// //     console.error('Get users error:', error);
// //     res.status(500).json({ message: 'Failed to fetch users' });
// //   }

  
// // };

// const getAllUsers = async (req, res) => {
//   try {
//     const result = await db.query(`
//       SELECT
//         u.id,
//         u.email,
//         u.role_name,
//         u.status,
//         u.created_at,

//         -- target user name
//         au.first_name AS user_first_name,
//         au.last_name AS user_last_name,
//         m.first_name AS mentor_first_name,
//         m.last_name AS mentor_last_name,
//         a.first_name AS admin_first_name,
//         a.last_name AS admin_last_name,

//         -- 🔥 CREATED BY NAME (FIXED)
//         COALESCE(
//           ca.first_name || ' ' || ca.last_name,
//           cm.first_name || ' ' || cm.last_name,
//           cuu.first_name || ' ' || cuu.last_name,
//           'System'
//         ) AS created_by_name

//       FROM Users u

//       LEFT JOIN Admin a ON a.user_id = u.id
//       LEFT JOIN Mentor m ON m.user_id = u.id
//       LEFT JOIN Acc_User au ON au.user_id = u.id

//       -- creator user
//       LEFT JOIN Users cu ON cu.id = u.created_by

//       -- creator profiles
//       LEFT JOIN Admin ca ON ca.user_id = cu.id
//       LEFT JOIN Mentor cm ON cm.user_id = cu.id
//       LEFT JOIN Acc_User cuu ON cuu.user_id = cu.id

//       ORDER BY u.created_at DESC
//     `);

//     res.json(result.rows);
//   } catch (error) {
//     console.error('Get users error:', error);
//     res.status(500).json({ message: 'Failed to fetch users' });
//   }
// };


// module.exports = {
//     upload,
//     createInitialAdmin,
//     reviewMentor,
//     listPendingMentors,
//     createIndustry,
//     getIndustries,
//     updateIndustry,
//     deleteIndustry,
//     createPosition,
//     getPositions,
//     updatePosition,
//     deletePosition,
//     createRole,
//     getAllUsers,
//     getMentorStats
// };



const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/positions';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

const createInitialAdmin = async (req, res) => {
  const { email, password, first_name, last_name, phone } = req.body;
  try {
    const existingAdmin = await db.query(
      "SELECT id FROM Users WHERE role_name = 'admin'"
    );
    if (existingAdmin.rows.length > 0) {
      return res.status(403).json({ message: 'Admin already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const adminId = uuidv4();
    await db.pool.query('BEGIN');
    await db.query(
      `INSERT INTO Users (
        id, email, password, role_name, status, email_verified_at, created_by
      )
      VALUES ($1,$2,$3,'admin','active',NOW(), NULL)`,
      [userId, email, hashedPassword]
    );
    await db.query(
      `INSERT INTO Admin (id, user_id, first_name, last_name, phone)
       VALUES ($1,$2,$3,$4,$5)`,
      [adminId, userId, first_name, last_name, phone]
    );
    await db.pool.query('COMMIT');
    res.status(201).json({ message: 'Initial admin created successfully' });
  } catch (error) {
    await db.pool.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMentorStats = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE approval_status = 'approved')::int AS accepted,
        COUNT(*) FILTER (WHERE approval_status = 'rejected')::int AS rejected,
        COUNT(*) FILTER (WHERE approval_status = 'pending')::int AS pending
      FROM Mentor
    `);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('getMentorStats error:', error);
    res.status(500).json({ message: 'Failed to fetch mentor stats' });
  }
};

const reviewMentor = async (req, res) => {
  const { mentorId } = req.params;
  const { action } = req.body;
  if (!['accept', 'reject'].includes(action)) {
    return res.status(400).json({ message: 'Invalid action' });
  }
  const mentorStatus = action === 'accept' ? 'approved' : 'rejected';
  const userStatus = action === 'accept' ? 'active' : 'rejected';
  try {
    await db.pool.query('BEGIN');
    const mentorResult = await db.query(
      `UPDATE Mentor
       SET approval_status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING user_id`,
      [mentorStatus, mentorId]
    );
    if (mentorResult.rows.length === 0) {
      await db.pool.query('ROLLBACK');
      return res.status(404).json({ message: 'Mentor not found' });
    }
    const userId = mentorResult.rows[0].user_id;
    await db.query(
      `UPDATE Users SET status = $1 WHERE id = $2`,
      [userStatus, userId]
    );
    await db.pool.query('COMMIT');
    res.json({ message: `Mentor ${mentorStatus} successfully` });
  } catch (error) {
    await db.pool.query('ROLLBACK');
    console.error('reviewMentor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const listPendingMentors = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        m.id,
        m.first_name,
        m.last_name,
        m.gender,
        m.job_title,
        m.created_at,
        p.position_name,
        d.document_url
      FROM Mentor m
      JOIN Users u ON u.id = m.user_id
      LEFT JOIN Position p ON p.id = m.position_id
      LEFT JOIN Mentor_Documents d ON d.mentor_id = m.id AND d.is_primary_cv = true
      WHERE m.approval_status = 'pending'
      ORDER BY m.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('listPendingMentors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createIndustry = async (req, res) => {
  const { industry_name } = req.body;
  if (!industry_name) {
    return res.status(400).json({ message: 'Industry name required' });
  }
  try {
    const result = await db.query(
      'INSERT INTO Industry (industry_name) VALUES ($1) RETURNING *',
      [industry_name]
    );
    res.status(201).json({
      message: 'Industry created',
      industry: result.rows[0],
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Industry already exists' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getIndustries = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM Industry ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('getIndustries error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateIndustry = async (req, res) => {
  const { id } = req.params;
  const { industry_name } = req.body;
  try {
    const result = await db.query(
      'UPDATE Industry SET industry_name=$1 WHERE id=$2 RETURNING *',
      [industry_name, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('updateIndustry error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteIndustry = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM Industry WHERE id=$1', [id]);
    res.json({ message: 'Industry deleted' });
  } catch (err) {
    console.error('deleteIndustry error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const createPosition = async (req, res) => {
  const { industry_id, position_name, description } = req.body;
  if (!industry_id || !position_name) {
    return res.status(400).json({
      message: 'industry_id and position_name are required'
    });
  }
  const image_position = req.file ? req.file.filename : null;
  try {
    const result = await db.query(
      `
      INSERT INTO Position (
        industry_id,
        position_name,
        description,
        image_position
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [industry_id, position_name, description || null, image_position]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('createPosition error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPositions = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        p.*,
        i.industry_name AS industry
      FROM Position p
      JOIN Industry i ON p.industry_id = i.id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('getPositions error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updatePosition = async (req, res) => {
  const { id } = req.params;
  const { industry_id, position_name, description } = req.body;
  const image_position = req.file ? req.file.filename : null;
  try {
    const result = await db.query(
      `
      UPDATE Position SET
        industry_id=$1,
        position_name=$2,
        description=$3,
        image_position=COALESCE($4, image_position)
      WHERE id=$5
      RETURNING *
      `,
      [industry_id, position_name, description, image_position, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('updatePosition error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const deletePosition = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM Position WHERE id=$1', [id]);
    res.json({ message: 'Position deleted' });
  } catch (err) {
    console.error('deletePosition error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const createRole = async (req, res) => {
  const {
    email, password, role_name,
    first_name, last_name, phone, gender, dob,
    types_user, institution_name,
    position_id, industry_id, job_title, expertise_areas,
    experience_years, company_name, social_media, about_mentor,
    education
  } = req.body;
  const profile_image = req.file ? req.file.filename : null;
  try {
    await db.pool.query('BEGIN');
    const emailCheck = await db.query(
      'SELECT id FROM Users WHERE email = $1',
      [email]
    );
    if (emailCheck.rows.length > 0) {
      await db.pool.query('ROLLBACK');
      return res.status(400).json({ message: 'Email already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    await db.query(
      `INSERT INTO Users (
        id,
        email,
        password,
        role_name,
        status,
        email_verified_at,
        created_by
      )
      //  VALUES ($1,$2,$3,$4,'inactive',NOW(),$5)`,
      
      [
        userId,
        email,
        hashedPassword,
        role_name,
        req.user.id // Admin who created
      ]
    );
    if (role_name === 'user') {
      await db.query(
        `INSERT INTO Acc_User
         (id, user_id, first_name, last_name, phone, gender, dob, types_user, institution_name, profile_image)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [uuidv4(), userId, first_name, last_name, phone, gender, dob, types_user, institution_name, profile_image]
      );
    } else if (role_name === 'mentor') {
      const mentorId = uuidv4();
      await db.query(
        `INSERT INTO Mentor
         (id, user_id, first_name, last_name, gender, dob, phone,
          position_id, industry_id, job_title, expertise_areas,
          experience_years, company_name, social_media, about_mentor,
          profile_image, approval_status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'pending')`,
        [
          mentorId, userId, first_name, last_name, gender, dob, phone,
          position_id, industry_id, job_title, expertise_areas,
          experience_years, company_name, social_media, about_mentor,
          profile_image
        ]
      );
      if (education) {
        const eduList = typeof education === 'string' ? JSON.parse(education) : education;
        for (const edu of eduList) {
          await db.query(
            `INSERT INTO mentor_education
             (mentor_id, university_name, degree_name, field_of_study,
              year_graduated, grade_gpa, activities)
             VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [
              mentorId,
              edu.university_name,
              edu.degree_name,
              edu.field_of_study || null,
              parseInt(edu.year_graduated),
              edu.grade_gpa || null,
              edu.activities || null
            ]
          );
        }
      }
    } else if (role_name === 'admin') {
      await db.query(
        `INSERT INTO Admin
         (id, user_id, first_name, last_name, phone, profile_image)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [uuidv4(), userId, first_name, last_name, phone, profile_image]
      );
    }
    await db.pool.query('COMMIT');
    res.status(201).json({ message: `${role_name} created successfully.` });
  } catch (error) {
    await db.pool.query('ROLLBACK');
    console.error('Create User Error:', error);
    res.status(500).json({ message: 'Failed to create user account.' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        u.id,
        u.email,
        u.role_name,
        u.status,
        u.created_at,
        au.first_name AS user_first_name,
        au.last_name AS user_last_name,
        m.first_name AS mentor_first_name,
        m.last_name AS mentor_last_name,
        a.first_name AS admin_first_name,
        a.last_name AS admin_last_name,
        COALESCE(
          ca.first_name || ' ' || ca.last_name,
          cm.first_name || ' ' || cm.last_name,
          cuu.first_name || ' ' || cuu.last_name,
          'System'
        ) AS created_by_name
      FROM Users u
      LEFT JOIN Admin a ON a.user_id = u.id
      LEFT JOIN Mentor m ON m.user_id = u.id
      LEFT JOIN Acc_User au ON au.user_id = u.id
      LEFT JOIN Users cu ON cu.id = u.created_by
      LEFT JOIN Admin ca ON ca.user_id = cu.id
      LEFT JOIN Mentor cm ON cm.user_id = cu.id
      LEFT JOIN Acc_User cuu ON cuu.user_id = cu.id
      ORDER BY u.created_at DESC
    `);
    console.log('Fetched users with created_by_name:', result.rows); // Debug log
    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

const getFullDashboard = async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM Users) "totalUsers",
        (SELECT COUNT(*) FROM Mentor WHERE approval_status = 'pending') "pendingMentors",
        (SELECT COUNT(*) FROM Booking) "totalBookings",
        (SELECT COALESCE(SUM(amount), 0) FROM Invoice) "totalRevenue"
    `);

    // Add your own real queries later – for now this works
    res.json({
      stats: stats.rows[0],
      monthlyBookings: [1200,1500,1800,2200,2800,3200,3500,3800,4100,4500,4800,5200],
      topMentors: [
        { name: "James Wilson", bookings: 245, revenue: 12250, status: "Active" },
        { name: "Sarah Johnson", bookings: 189, revenue: 9450, status: "Active" },
        { name: "David Brown", bookings: 156, revenue: 4680, status: "Active" },
      ],
      recentActivity: [
        { type: "user", message: "New student joined", time: "2 min ago" },
        { type: "mentor", message: "Mentor approved – James Wilson", time: "15 min ago" },
        { type: "booking", message: "New booking created", time: "1 hour ago" },
      ]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { ... getFullDashboard };

module.exports = {
  upload,
  createInitialAdmin,
  getMentorStats,
  reviewMentor,
  listPendingMentors,
  createIndustry,
  getIndustries,
  updateIndustry,
  deleteIndustry,
  createPosition,
  getPositions,
  updatePosition,
  deletePosition,
  createRole,
  getAllUsers,
  getFullDashboard
};