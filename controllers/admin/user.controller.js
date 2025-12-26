const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const sequelize = require('../../config/database');
const db = require('../../models');

// Import Services
const { sendTelegramNotification } = require('../../services/telegram.service');
const { sendVerificationEmail } = require('../../services/email.service');

// Import Models
const User = db.User;
const Admin = db.Admin;
const Mentor = db.Mentor;
const AccUser = db.AccUser;
const MentorEducation = db.MentorEducation;
const LoginSession = db.LoginSession;



exports.createRole = async (req, res) => {
  console.log("🚀 START: createRole called"); // Log 1

  const {
    email, password, role_name,
    first_name, last_name, phone, gender, dob,
    types_user, institution_name,
    position_id, industry_id, job_title, expertise_areas,
    experience_years, company_name, social_media, about_mentor,
    education
  } = req.body;

  const profile_image = req.file ? req.file.filename : null;

  // Validation
  if (!email || !password || !first_name || !last_name || !role_name) {
    console.log("❌ Missing fields");
    return res.status(400).json({ message: 'Required fields missing' });
  }

  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      console.log("❌ Email exists:", email);
      return res.status(409).json({ message: 'Email already exists' });
    }

    console.log("✅ Validation Passed. Starting Transaction..."); // Log 2
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const t = await sequelize.transaction();

    try {
      // 1. Create Base User
      console.log("⏳ Creating User table...");
      await User.create({
        id: userId,
        email,
        password: hashedPassword,
        role_name,
        status: 'unverified',
        created_by: req.user ? req.user.id : null,
      }, { transaction: t });

      // 2. Create Role-Specific Profile
      console.log(`⏳ Creating Profile for role: ${role_name}...`);
      if (role_name === 'admin') {
        await Admin.create({ 
            id: uuidv4(), user_id: userId, first_name, last_name, phone, profile_image 
        }, { transaction: t });
      } else if (role_name === 'user') {
        await AccUser.create({ 
            id: uuidv4(), user_id: userId, first_name, last_name, phone, gender, dob, types_user, institution_name, profile_image 
        }, { transaction: t });
      } else if (role_name === 'mentor') {
        const mentorId = uuidv4();
        await Mentor.create({ 
            id: mentorId, user_id: userId, first_name, last_name, gender, dob, phone, position_id, industry_id, 
            job_title, expertise_areas, experience_years, company_name, social_media, about_mentor, 
            profile_image, approval_status: 'pending' 
        }, { transaction: t });

        if (education) {
          const eduList = typeof education === 'string' ? JSON.parse(education) : education;
          for (const edu of eduList) {
            await MentorEducation.create({ id: uuidv4(), mentor_id: mentorId, ...edu }, { transaction: t });
          }
        }
      }

      // 3. Create Verification Token
      console.log("⏳ Creating LoginSession...");
      const verificationToken = uuidv4();
      await LoginSession.create({
        user_id: userId, refresh_token: verificationToken, access_token: 'temp_verification',
        expired_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }, { transaction: t });

      // ✅ 4. COMMIT TRANSACTION
      console.log("⏳ Committing Transaction...");
      await t.commit();
      console.log("✅ Transaction Committed!");

      // ============================================================
      // 🔥 SEND RESPONSE IMMEDIATELY
      // ============================================================
      res.status(201).json({ 
        message: `${role_name} created successfully! Verification email is being sent.` 
      });
      console.log("✅ Response sent to Frontend");

      // ============================================================
      // 🚀 BACKGROUND TASKS (Isolated Try/Catch)
      // ============================================================
      // យើងដាក់ក្នុង try/catch ដាច់ដោយឡែក ដើម្បីកុំឱ្យប៉ះពាល់ដល់ Response
      try {
        console.log("⏳ Starting Background Tasks...");
        
        // Prepare Creator Name
        let creatorName = 'System/Admin';
        if (req.user) {
            if (req.user.first_name) {
                creatorName = `${req.user.first_name} ${req.user.last_name || ''}`.trim();
            } else {
                creatorName = req.user.email;
            }
        }

        const telegramData = {
            first_name, last_name, email, phone, 
            gender: gender || 'N/A', role_name,
            types_user, institution_name, company_name, job_title, expertise_areas,
            status: 'Unverified'
        };
        
        // A. Telegram
        sendTelegramNotification(telegramData, creatorName)
          .then(() => console.log("✅ Telegram sent"))
          .catch(err => console.error("⚠️ Telegram failed:", err.message));

        // B. Email
        sendVerificationEmail(email, verificationToken, role_name)
          .then(() => console.log(`✅ Email sent to ${email}`))
          .catch(err => console.error(`⚠️ Email failed:`, err.message));

      } catch (bgError) {
        console.error("❌ Background Task Logic Error:", bgError);
      }

    } catch (err) {
      console.error("❌ DB Transaction Error:", err);
      // Rollback តែបើ Transaction មិនទាន់ Commit
      if (!t.finished) {
        await t.rollback();
        console.log("↺ Transaction Rolled Back");
      }
      throw err;
    }
  } catch (error) {
    console.error('❌ CRITICAL ERROR in createRole:', error);
    if (!res.headersSent) {
        res.status(500).json({ message: 'Failed to create user', error: error.message });
    }
  }
};


exports.getAllUsers = async (req, res) => {
  try {
    const { search, startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.created_at = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }

    const users = await User.findAll({
      where: dateFilter,
      attributes: ['id', 'email', 'role_name', 'status', 'created_at'],
      include: [
        { model: Admin, as: 'admin', attributes: ['first_name', 'last_name', 'phone'] }, 
        { model: Mentor, as: 'mentor', attributes: ['first_name', 'last_name', 'phone', 'gender', 'job_title', 'company_name'] }, 
        { model: AccUser, as: 'accUser', attributes: ['first_name', 'last_name', 'phone', 'gender', 'types_user', 'institution_name'] }, 
        { 
          model: User, 
          as: 'creator', 
          attributes: ['id', 'email', 'role_name'],
          include: [{ model: Admin, as: 'admin', attributes: ['first_name', 'last_name'] }]
        }
      ],
      order: [['created_at', 'DESC']],
    });

    const formatted = users.map(u => {
      let name = 'N/A';
      if (u.role_name === 'admin' && u.admin) name = `${u.admin.first_name} ${u.admin.last_name}`;
      else if (u.role_name === 'mentor' && u.mentor) name = `${u.mentor.first_name} ${u.mentor.last_name}`;
      else if (u.role_name === 'user' && u.accUser) name = `${u.accUser.first_name} ${u.accUser.last_name}`;

      let createdBy = 'Self-Registered'; 
      if (u.creator) {
        if (u.creator.admin) { 
           const adminProfile = u.creator.admin;
           createdBy = `${adminProfile.first_name} ${adminProfile.last_name} (Admin)`;
        } else {
           createdBy = u.creator.email;
        }
      }

      return {
        id: u.id, email: u.email, role_name: u.role_name, status: u.status,
        created_at: u.created_at, name: name, created_by: createdBy, 
        admin: u.admin, mentor: u.mentor, accUser: u.accUser
      };
    });

    if (search) {
      const lowerSearch = search.toLowerCase();
      const result = formatted.filter(u => 
        u.name.toLowerCase().includes(lowerSearch) ||
        u.email.toLowerCase().includes(lowerSearch) ||
        u.role_name.toLowerCase().includes(lowerSearch)
      );
      return res.json(result);
    }
    res.json(formatted);
  } catch (error) {
    console.error('getAllUsers error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// ==========================================
// 3. GET USER DETAILS
// ==========================================
exports.getUserDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id, {
      attributes: ['id', 'email', 'role_name', 'status', 'created_at'],
      include: [
        { model: Admin, as: 'admin' },
        { 
          model: Mentor, as: 'mentor',
          include: [
            { model: MentorEducation, as: 'education' }, 
            { model: db.Position, as: 'position' },
            { model: db.Industry, as: 'industry' }
          ]
        },
        { model: AccUser, as: 'accUser' }
      ]
    });

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ==========================================
// 4. DELETE USER
// ==========================================
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  const requesterId = req.user ? req.user.id : null;

  if (requesterId && parseInt(id) === parseInt(requesterId)) {
    return res.status(403).json({ message: "Security Alert: You cannot delete your own account!" });
  }

  const t = await sequelize.transaction();
  try {
    const user = await User.findByPk(id);
    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role_name === 'admin') {
        await t.rollback();
        return res.status(403).json({ message: "Access Denied: You cannot delete another Admin account." });
    }

    if (user.role_name === 'mentor') {
      const mentor = await Mentor.findOne({ where: { user_id: id } });
      if (mentor) {
        await MentorEducation.destroy({ where: { mentor_id: mentor.id }, transaction: t });
        await Mentor.destroy({ where: { user_id: id }, transaction: t });
      }
    } else if (user.role_name === 'user') {
      await AccUser.destroy({ where: { user_id: id }, transaction: t });
    }

    await LoginSession.destroy({ where: { user_id: id }, transaction: t });
    await user.destroy({ transaction: t });

    await t.commit();
    res.json({ message: 'User deleted successfully' });

  } catch (error) {
    await t.rollback();
    if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({ message: 'Cannot delete: This user is linked to other data.' });
    }
    res.status(500).json({ message: 'Failed to delete user: ' + error.message });
  }
};

// ==========================================
// 5. CREATE INITIAL ADMIN (Setup)
// ==========================================
exports.createInitialAdmin = async (req, res) => {
  const { email, password, first_name, last_name, phone } = req.body;
  try {
    const existing = await User.findOne({ where: { role_name: 'admin' } });
    if (existing) return res.status(403).json({ message: 'Admin already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    const t = await sequelize.transaction();
    try {
      await User.create({
        id: userId,
        email,
        password: hashedPassword,
        role_name: 'admin',
        status: 'active',
      }, { transaction: t });

      await Admin.create({
        id: uuidv4(),
        user_id: userId,
        first_name,
        last_name,
        phone,
      }, { transaction: t });

      await t.commit();
      res.status(201).json({ message: 'Initial admin created successfully' });
    } catch (err) {
      await t.rollback();
      throw err;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};