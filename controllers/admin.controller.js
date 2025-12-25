// // controllers/admin.controller.js (FULLY FIXED & COMPLETE)
// const { sendTelegramNotification } = require('../services/telegram.service');
// const bcrypt = require('bcryptjs');
// const { v4: uuidv4 } = require('uuid');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const sequelize = require('../config/database');
// const User = require('../models/user.model');
// const Admin = require('../models/admin.model');
// const MentorEducation = require('../models/mentorEdu.model');
// const AccUser = require('../models/accountUser.model');  
// const Mentor = require('../models/mentor.model');
// const { sendVerificationEmail,sendMentorApprovalEmail, sendMentorRejectionEmail,sendResetPasswordEmail } = require('../services/email.service');
// const Industry = require("../models/industry.model");
// const Position = require("../models/position.model");
// const { Op } = require('sequelize');
// const LoginSession = require('../models/loginSession.model');

// // Multer for profile images
// const profileStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const dir = 'uploads/profiles';
//     if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
//     cb(null, dir);
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   }
// });
// const uploadProfile = multer({ storage: profileStorage });



// // Multer for position images
// const positionStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const dir = 'uploads/positions';
//     if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
//     cb(null, dir);
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   }
// });
// const uploadPosition = multer({ storage: positionStorage });

// // Initial Admin
// const createInitialAdmin = async (req, res) => {
//   const { email, password, first_name, last_name, phone } = req.body;
//   try {
//     const existing = await User.findOne({ where: { role_name: 'admin' } });
//     if (existing) return res.status(403).json({ message: 'Admin already exists' });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const userId = uuidv4();

//     const t = await sequelize.transaction();
//     try {
//       await User.create({
//         id: userId,
//         email,
//         password: hashedPassword,
//         role_name: 'admin',
//         status: 'active',
//       }, { transaction: t });

//       await Admin.create({
//         id: uuidv4(),
//         user_id: userId,
//         first_name,
//         last_name,
//         phone,
//       }, { transaction: t });

//       await t.commit();
//       res.status(201).json({ message: 'Initial admin created successfully' });
//     } catch (err) {
//       await t.rollback();
//       throw err;
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Mentor Stats
// const getMentorStats = async (req, res) => {
//   try {
//     const [total, accepted, rejected, pending] = await Promise.all([
//       Mentor.count(),
//       Mentor.count({ where: { approval_status: 'approved' } }),
//       Mentor.count({ where: { approval_status: 'rejected' } }),
//       Mentor.count({ where: { approval_status: 'pending' } }),
//     ]);

//     res.json({ total, accepted, rejected, pending });
//   } catch (error) {
//     console.error(error);
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
//   const userStatus = action === 'accept' ? 'active' : 'inactive'; 

//   const t = await sequelize.transaction();
//   try {
//     // 1. កែត្រង់នេះ! (ដក as: 'user' ចេញ)
//     const mentor = await Mentor.findByPk(mentorId, {
//         include: [{ model: User }] // 👈 ទុកតែ model: User បានហើយ (Sequelize នឹងស្គាល់ថា User)
//     });

//     if (!mentor) {
//       await t.rollback();
//       return res.status(404).json({ message: 'Mentor not found' });
//     }

//     mentor.approval_status = mentorStatus;
//     await mentor.save({ transaction: t });

//     // 2. កែត្រង់នេះដែរ! (ប្តូរ mentor.user ទៅ mentor.User - អក្សរធំ)
//     // ព្រោះពេលយើងអត់ដាក់ alias, Sequelize យកឈ្មោះ Model មកប្រើ (User)
//     if (mentor.User) {
//         mentor.User.status = userStatus;
//         await mentor.User.save({ transaction: t });
//     }

//     await t.commit(); 

//     // 3. ផ្ញើ Email (កែ mentor.user ទៅ mentor.User ដែរ)
//     try {
//         const userEmail = mentor.User ? mentor.User.email : null; // 👈 mentor.User
        
//         if (userEmail) {
//             if (action === 'accept') {
//                 await sendMentorApprovalEmail(userEmail, mentor.first_name);
//                 console.log(`Approval email sent to ${userEmail}`);
//             } else {
//                 await sendMentorRejectionEmail(userEmail, mentor.first_name);
//                 console.log(`Rejection email sent to ${userEmail}`);
//             }
//         }
//     } catch (emailError) {
//         console.error("Failed to send notification email:", emailError);
//     }

//     res.json({ message: `Mentor ${mentorStatus} successfully and email notification sent.` });

//   } catch (error) {
//     await t.rollback();
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };



// const listPendingMentors = async (req, res) => {
//  try {
//   //  const mentors = await Mentor.findAll({
//   //    where: { approval_status: 'pending' },
//   //    include: [
//   //      { model: Position, as: 'position', attributes: ['position_name'] },
//   //    ],
//   //    order: [['created_at', 'DESC']],
//   //  });
//   const mentors = await Mentor.findAll({
//   where: { approval_status: 'pending' },
//   include: [
//     {
//       model: Position,
//       as: "position"
//     },
//     {
//       model: Industry,
//       as: "industry"
//     }
//   ]
// });


//    const formatted = mentors.map(m => ({
//      id: m.id,
//      first_name: m.first_name,
//      last_name: m.last_name,
//      gender: m.gender,
//      job_title: m.job_title,
//      created_at: m.created_at,
//      position_name: m.position?.position_name || null,
//      document_url: null
//    }));

//    res.json(formatted);
//  } catch (error) {
//    console.error(error);
//    res.status(500).json({ message: 'Server error' });
//  }
// };



// // Industry CRUD
// const createIndustry = async (req, res) => {
//   const { industry_name } = req.body;
//   if (!industry_name) return res.status(400).json({ message: 'Industry name required' });

//   try {
//     const industry = await Industry.create({ industry_name });
//     res.status(201).json(industry);
//   } catch (error) {
//     if (error.name === 'SequelizeUniqueConstraintError') {
//       return res.status(409).json({ message: 'Industry already exists' });
//     }
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// const getIndustries = async (req, res) => {
//   try {
//     const industries = await Industry.findAll({ order: [['created_at', 'DESC']] });
//     res.json(industries);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// const updateIndustry = async (req, res) => {
//   const { id } = req.params;
//   const { industry_name } = req.body;
//   try {
//     const industry = await Industry.findByPk(id);
//     if (!industry) return res.status(404).json({ message: 'Industry not found' });

//     industry.industry_name = industry_name;
//     await industry.save();
//     res.json(industry);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// const deleteIndustry = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const industry = await Industry.findByPk(id);
//     if (!industry) return res.status(404).json({ message: 'Industry not found' });

//     await industry.destroy();
//     res.json({ message: 'Industry deleted successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Position CRUD
// const createPosition = async (req, res) => {
//   const { industry_id, position_name, description } = req.body;
//   if (!industry_id || !position_name) {
//     return res.status(400).json({ message: 'industry_id and position_name required' });
//   }

//   const image_position = req.file ? req.file.filename : null;

//   try {
//     const position = await Position.create({
//       industry_id,
//       position_name,
//       description,
//       image_position,
//     });
//     res.status(201).json(position);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// const getPositions = async (req, res) => {
//   try {
//     const positions = await Position.findAll({
//       include: [{ model: Industry, attributes: ['industry_name'] }],
//       order: [['created_at', 'DESC']],
//     });

//     const formatted = positions.map(p => ({
//       ...p.toJSON(),
//       industry: p.Industry?.industry_name,
//       image_url: p.image_position ? `/uploads/positions/${p.image_position}` : null,
//     }));

//     res.json(formatted);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// const updatePosition = async (req, res) => {
//   const { id } = req.params;
//   const { industry_id, position_name, description } = req.body;
//   const image_position = req.file ? req.file.filename : undefined;

//   try {
//     const position = await Position.findByPk(id);
//     if (!position) return res.status(404).json({ message: 'Position not found' });

//     position.industry_id = industry_id;
//     position.position_name = position_name;
//     position.description = description;
//     if (image_position) position.image_position = image_position;

//     await position.save();
//     res.json(position);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// const deletePosition = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const position = await Position.findByPk(id);
//     if (!position) return res.status(404).json({ message: 'Position not found' });

//     await position.destroy();
//     res.json({ message: 'Position deleted successfully' });
//   } catch (error) {
//     console.error(error);
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

//   if (!email || !password || !first_name || !last_name || !role_name) {
//     return res.status(400).json({ message: 'Required fields missing' });
//   }

//   if (/\d/.test(first_name)) {
//     return res.status(400).json({ message: 'First name cannot contain numbers' });
//   }

//   try {
//     const existing = await User.findOne({ where: { email } });
//     if (existing) return res.status(409).json({ message: 'Email already exists' });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const userId = uuidv4();
//     const t = await sequelize.transaction();

//     try {
//       await User.create({
//         id: userId,
//         email,
//         password: hashedPassword,
//         role_name,
//         status: 'unverified',
//         created_by: req.user.id,
//       }, { transaction: t });

//       // Create role-specific record
//       if (role_name === 'admin') {
//         await Admin.create({
//           id: uuidv4(),
//           user_id: userId,
//           first_name,
//           last_name,
//           phone,
//           profile_image,
//         }, { transaction: t });
//       } else if (role_name === 'user') {
//         await AccUser.create({
//           id: uuidv4(),
//           user_id: userId,
//           first_name,
//           last_name,
//           phone,
//           gender,
//           dob,
//           types_user,
//           institution_name,
//           profile_image,
//         }, { transaction: t });
//       } else if (role_name === 'mentor') {
//         const mentorId = uuidv4();
//         await Mentor.create({
//           id: mentorId,
//           user_id: userId,
//           first_name,
//           last_name,
//           gender,
//           dob,
//           phone,
//           position_id,
//           industry_id,
//           job_title,
//           expertise_areas,
//           experience_years,
//           company_name,
//           social_media,
//           about_mentor,
//           profile_image,
//           approval_status: 'pending',
//         }, { transaction: t });

//         if (education) {
//           const eduList = typeof education === 'string' ? JSON.parse(education) : education;
//           for (const edu of eduList) {
//             await MentorEducation.create({
//               id: uuidv4(),
//               mentor_id: mentorId,
//               university_name: edu.university_name,
//               degree_name: edu.degree_name,
//               field_of_study: edu.field_of_study || null,
//               year_graduated: edu.year_graduated ? parseInt(edu.year_graduated) : null,
//               grade_gpa: edu.grade_gpa ? parseFloat(edu.grade_gpa) : null,
//               activities: edu.activities || null,
//             }, { transaction: t });
//           }
//         }
//       }

//       // Create Verification Token
//       const verificationToken = uuidv4();
//       const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

//       await LoginSession.create({
//         user_id: userId,
//         refresh_token: verificationToken,
//         access_token: 'temp_verification',
//         expired_at: expiredAt,
//       }, { transaction: t });

//       // ✅ Commit Transaction (ទិន្នន័យចូល DB ជោគជ័យហើយ)
//       await t.commit();

//       // ============================================================
//       // 🔥 SEND TELEGRAM NOTIFICATION (ដាក់នៅទីនេះ!)
//       // ============================================================
//       try {
//         // ១. រកឈ្មោះអ្នកបង្កើត (យក Email របស់ Admin បច្ចុប្បន្ន)
//         const creatorName = req.user ? req.user.email : 'System/Admin';

//         // ២. រៀបចំទិន្នន័យទាំងអស់ដែលត្រូវផ្ញើ
//         const telegramData = {
//            first_name, 
//            last_name, 
//            email, 
//            phone, 
//            gender,
//            role_name,
           
//            // សម្រាប់ User (Student)
//            types_user, 
//            institution_name, 
           
//            // សម្រាប់ Mentor
//            company_name,
//            job_title,
//            expertise_areas,
           
//            status: 'Unverified'
//         };

//         // ៣. ហៅ Service
//         // (ចំណាំ: យើងមិនប្រើ await ទេ ដើម្បីកុំអោយ User រង់ចាំយូរពេក ទុកអោយវាធ្វើការនៅ Background)
//         sendTelegramNotification(telegramData, creatorName);
        
//       } catch (tgError) {
//         console.error("❌ Telegram Notification Error:", tgError.message);
//         // យើងមិន throw error ទេ ដើម្បីកុំអោយខូច process បង្កើត user
//       }
//       // ============================================================


//       // Send email verification
//       try {
//         await sendVerificationEmail(email, verificationToken, role_name);
//         res.status(201).json({ 
//           message: `${role_name} created successfully! Verification email sent to ${email}` 
//         });
//       } catch (emailError) {
//         console.error('Email send failed:', emailError);
//         res.status(201).json({ 
//           message: `${role_name} created, but email failed to send. Contact admin.`,
//           warning: 'Email not sent'
//         });
//       }

//     } catch (err) {
//       // បើមានបញ្ហា DB -> Rollback
//       await t.rollback();
//       throw err;
//     }
//   } catch (error) {
//     console.error('Create user error:', error);
//     res.status(500).json({ 
//       message: 'Failed to create user', 
//       error: error.message 
//     });
//   }
// };



//   try {
//     const { search, startDate, endDate } = req.query;

//     let dateFilter = {};
//     if (startDate && endDate) {
//       dateFilter.created_at = { [Op.between]: [new Date(startDate), new Date(endDate)] };
//     }

//     const users = await User.findAll({
//       where: dateFilter,
//       attributes: ['id', 'email', 'role_name', 'status', 'created_at'],
//       include: [
//         // 1. Details of the user themselves
//         { model: Admin, as: 'admin', attributes: ['first_name', 'last_name'], required: false },
//         { model: Mentor, as: 'mentor', attributes: ['first_name', 'last_name'], required: false },
//         { model: AccUser, as: 'accUser', attributes: ['first_name', 'last_name'], required: false },
        
//         // 2. ✅ DETAILS OF THE CREATOR (Who created this user?)
//         { 
//           model: User, 
//           as: 'creator', 
//           attributes: ['id', 'role_name'],
//           include: [
//              // We need the creator's name, which is likely in the Admin table
//              { model: Admin, as: 'admin', attributes: ['first_name', 'last_name'], required: false }
//           ]
//         }
//       ],
//       order: [['created_at', 'DESC']],
//     });

//     const formatted = users.map(u => {
//       // Format User Name
//       let name = 'N/A';
//       if (u.role_name === 'admin' && u.admin) name = `${u.admin.first_name} ${u.admin.last_name}`;
//       else if (u.role_name === 'mentor' && u.mentor) name = `${u.mentor.first_name} ${u.mentor.last_name}`;
//       else if (u.role_name === 'user' && u.accUser) name = `${u.accUser.first_name} ${u.accUser.last_name}`;

//       // ✅ Format Creator Name
//       let createdBy = '-'; // Default if self-registered
//       if (u.creator) {
//         if (u.creator.role_name === 'admin' && u.creator.admin) {
//            createdBy = `${u.creator.admin.first_name} ${u.creator.admin.last_name} (Admin)`;
//         } else {
//            createdBy = 'System/Other';
//         }
//       }

//       return {
//         id: u.id,
//         email: u.email,
//         role_name: u.role_name,
//         status: u.status,
//         created_at: u.created_at,
//         name: name,
//         created_by: createdBy, // ✅ Sending this to frontend
//       };
//     });

//     // Search Filter
//     if (search) {
//       const lowerSearch = search.toLowerCase();
//       // Update filter to flatten result first
//       const result = formatted.filter(u => 
//         u.name.toLowerCase().includes(lowerSearch) ||
//         u.email.toLowerCase().includes(lowerSearch) ||
//         u.role_name.toLowerCase().includes(lowerSearch)
//       );
//       return res.json(result);
//     }

//     res.json(formatted);
//   } catch (error) {
//     console.error('getAllUsers error:', error);
//     res.status(500).json({ message: 'Failed to fetch users' });
//   }
// // };


// // const getAllUsers = async (req, res) => {
// //   try {
// //     const users = await User.findAll({
// //       attributes: ['id', 'email', 'role_name', 'status', 'created_at'],
// //       include: [
// //         { model: Admin, as: 'admin', attributes: ['first_name', 'last_name'], required: false },
// //         { model: Mentor, as: 'mentor', attributes: ['first_name', 'last_name'], required: false },
// //         { model: AccUser, as: 'accUser', attributes: ['first_name', 'last_name'], required: false },
// //       ],
// //       order: [['created_at', 'DESC']],
// //     });

// //     const formatted = users.map(u => {
// //       let name = '';
// //       if (u.role_name === 'admin' && u.admin) name = `${u.admin.first_name} ${u.admin.last_name}`;
// //       else if (u.role_name === 'mentor' && u.mentor) name = `${u.mentor.first_name} ${u.mentor.last_name}`;
// //       else if (u.role_name === 'user' && u.accUser) name = `${u.accUser.first_name} ${u.accUser.last_name}`;

// //       return {
// //         id: u.id,
// //         email: u.email,
// //         role_name: u.role_name,
// //         status: u.status,
// //         created_at: u.created_at,
// //         name,
// //       };
// //     });

// //     res.json(formatted);
// //   } catch (error) {
// //     console.error('getAllUsers error:', error);
// //     res.status(500).json({ message: 'Failed to fetch users' });
// //   }
// // };





// const getAllUsers = async (req, res) => {
//   try {
//     const { search, startDate, endDate } = req.query;

//     let dateFilter = {};
//     if (startDate && endDate) {
//       dateFilter.created_at = { [Op.between]: [new Date(startDate), new Date(endDate)] };
//     }

//     const users = await User.findAll({
//       where: dateFilter,
//       attributes: ['id', 'email', 'role_name', 'status', 'created_at'],
//       include: [
//         // 1. ព័ត៌មាន User ផ្ទាល់ (ត្រូវដាក់ alias ដូចដើមវិញ)
//         { model: Admin, as: 'admin', attributes: ['first_name', 'last_name'], required: false },
//         { model: Mentor, as: 'mentor', attributes: ['first_name', 'last_name'], required: false },
//         { model: AccUser, as: 'accUser', attributes: ['first_name', 'last_name'], required: false },
        
//         // 2. ព័ត៌មានអ្នកបង្កើត (Creator)
//         { 
//           model: User, 
//           as: 'creator', 
//           attributes: ['id', 'email', 'role_name'],
//           include: [
//              // អ្នកបង្កើតក៏ជា User ដែរ ដូច្នេះត្រូវហៅ Admin តាម alias 'admin' ដូចគ្នា
//              { model: Admin, as: 'admin', attributes: ['first_name', 'last_name'], required: false }
//           ]
//         }
//       ],
//       order: [['created_at', 'DESC']],
//     });

//     const formatted = users.map(u => {
//       // A. រៀបចំឈ្មោះរបស់ User ខ្លួនឯង
//       let name = 'N/A';
//       // ដោយសារដាក់ alias វិញ, យើងហៅតាមឈ្មោះ alias (អក្សរតូច)
//       if (u.role_name === 'admin' && u.admin) name = `${u.admin.first_name} ${u.admin.last_name}`;
//       else if (u.role_name === 'mentor' && u.mentor) name = `${u.mentor.first_name} ${u.mentor.last_name}`;
//       else if (u.role_name === 'user' && u.accUser) name = `${u.accUser.first_name} ${u.accUser.last_name}`;

//       // B. ✅ រៀបចំឈ្មោះរបស់អ្នកបង្កើត (Created By)
//       let createdBy = 'Self-Registered'; 

//       if (u.creator) {
//         // បើអ្នកបង្កើតជា Admin ហើយមានឈ្មោះ
//         if (u.creator.admin) { 
//            const adminProfile = u.creator.admin;
//            createdBy = `${adminProfile.first_name} ${adminProfile.last_name} (Admin)`;
//         } 
//         // បើអត់មានឈ្មោះ (យក Email)
//         else {
//            createdBy = u.creator.email;
//         }
//       }

//       return {
//         id: u.id,
//         email: u.email,
//         role_name: u.role_name,
//         status: u.status,
//         created_at: u.created_at,
//         name: name,
//         created_by: createdBy, 
//       };
//     });

//     // Search Filter
//     if (search) {
//       const lowerSearch = search.toLowerCase();
//       const result = formatted.filter(u => 
//         u.name.toLowerCase().includes(lowerSearch) ||
//         u.email.toLowerCase().includes(lowerSearch) ||
//         u.role_name.toLowerCase().includes(lowerSearch) ||
//         u.created_by.toLowerCase().includes(lowerSearch)
//       );
//       return res.json(result);
//     }

//     res.json(formatted);
//   } catch (error) {
//     console.error('getAllUsers error:', error);
//     res.status(500).json({ message: 'Failed to fetch users' });
//   }
// };





// const getFullDashboard = async (req, res) => {
//   try {
//     const [userCount, pendingMentors, bookingCount, revenueResult] = await Promise.all([
//       User.count(),
//       Mentor.count({ where: { approval_status: 'pending' } }),
//       // Add Booking model count when ready
//       3435, // placeholder
//       // Add Invoice sum when ready
//       { total: 23569 } // placeholder
//     ]);

//     res.json({
//       stats: {
//         totalUsers: userCount,
//         pendingMentors,
//         totalBookings: bookingCount,
//         totalRevenue: revenueResult.total || 0,
//       },
//       // Keep demo data for charts until real data ready
//       monthlyBookings: [1200,1500,1800,2200,2800,3200,3500,3800,4100,4500,4800,5200],
//       topMentors: [
//         { name: "James Wilson", bookings: 245, revenue: 12250 },
//         { name: "Sarah Johnson", bookings: 189, revenue: 9450 },
//         { name: "David Brown", bookings: 156, revenue: 4680 },
//       ],
//       recentActivity: [
//         { message: "New student registered", time: "5 min ago" },
//         { message: "Mentor approved", time: "20 min ago" },
//         { message: "New booking created", time: "1 hour ago" },
//       ]
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Dashboard error' });
//   }
// };

// // 1. Update Admin Profile (FIXED)
// const updateProfile = async (req, res) => {
//   const { first_name, last_name, phone } = req.body;
//   const userId = req.user.id; 

//   try {
//     const admin = await Admin.findOne({ where: { user_id: userId } });
    
//     if (!admin) {
//       return res.status(404).json({ message: 'Admin profile not found' });
//     }

//     // Handle Image Upload
//     if (req.file) {
//       // ✅ FIX: លុបរូបចាស់ដោយប្រើ process.cwd()
//       if (admin.profile_image) {
//         const oldPath = path.join(process.cwd(), 'uploads/profiles', admin.profile_image);
//         if (fs.existsSync(oldPath)) {
//             try {
//                 fs.unlinkSync(oldPath);
//             } catch (err) {
//                 console.error("Could not delete old image:", err);
//             }
//         }
//       }
//       admin.profile_image = req.file.filename;
//     }

//     // Update Text Fields
//     admin.first_name = first_name;
//     admin.last_name = last_name;
//     admin.phone = phone;
    
//     await admin.save();

//     res.json({ 
//       message: 'Profile updated successfully',
//       // Return path ដែលចាប់ផ្តើមដោយ /uploads/...
//       profile_image: admin.profile_image ? `/uploads/profiles/${admin.profile_image}` : null
//     });

//   } catch (error) {
//     console.error('Update profile error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // ✅ FIXED: getUserDetails
// const getUserDetails = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const user = await User.findByPk(id, {
//       attributes: ['id', 'email', 'role_name', 'status', 'created_at'],
//       include: [
//         { model: Admin, as: 'admin' },
//         { 
//           model: Mentor, 
//           as: 'mentor',
//           include: [
//             // 🔧 FIX: Changed 'educations' to 'education' to match your model alias
//             { model: MentorEducation, as: 'education' }, 
//             { model: Position, as: 'position' },
//             { model: Industry, as: 'industry' }
//           ]
//         },
//         { model: AccUser, as: 'accUser' }
//       ]
//     });

//     if (!user) return res.status(404).json({ message: 'User not found' });

//     res.json(user);
//   } catch (error) {
//     console.error('Get user details error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


// // adminController.js (ឬ userController.js របស់បង)

// const deleteUser = async (req, res) => {
//   const { id } = req.params;

//   // 🛡️ SECURITY CHECK: យក ID របស់ Admin ដែលកំពុង Login មកផ្ទៀងផ្ទាត់
//   // (req.user មកពី Middleware verifyToken)
//   const requesterId = req.user ? req.user.id : null;

//   // 🛑 1. ហាមលុបខ្លួនឯង (Self-Delete Protection)
//   if (requesterId && parseInt(id) === parseInt(requesterId)) {
//     return res.status(403).json({ message: "Security Alert: You cannot delete your own account!" });
//   }

//   // ចាប់ផ្តើម Transaction (ដើម្បីធានាថា បើលុបដាច់ គឺដាច់ទាំងអស់ បើ Error គឺត្រឡប់មកវិញទាំងអស់)
//   const t = await sequelize.transaction();

//   try {
//     const user = await User.findByPk(id);
//     if (!user) {
//       await t.rollback();
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // 🛑 2. ការពារ Admin លុប Admin ផ្សេងទៀត (Admin Safety)
//     if (user.role_name === 'admin') {
//         // បើបងចង់ឱ្យ Super Admin លុបបាន ត្រូវថែមលក្ខខណ្ឌនៅត្រង់នេះ
//         // ប៉ុន្តែសម្រាប់សុវត្ថិភាពទូទៅ យើងហាមឃាត់សិន
//         await t.rollback();
//         return res.status(403).json({ message: "Access Denied: You cannot delete another Admin account. Please deactivate them instead." });
//     }

//     // ✅ 3. លុបព័ត៌មានតាម Role (Role-Specific Data)
//     if (user.role_name === 'mentor') {
//       const mentor = await Mentor.findOne({ where: { user_id: id } });
//       if (mentor) {
//         // លុបការសិក្សា និងជំនាញរបស់ Mentor ជាមុន
//         await MentorEducation.destroy({ where: { mentor_id: mentor.id }, transaction: t });
//         await Mentor.destroy({ where: { user_id: id }, transaction: t });
//       }
//     } else if (user.role_name === 'user') {
//       // លុបព័ត៌មានសិស្ស
//       await AccUser.destroy({ where: { user_id: id }, transaction: t });
//     }

//     // ✅ 4. លុប Login Sessions (សំខាន់! ដើម្បីឱ្យគេ Logout ភ្លាម)
//     await LoginSession.destroy({ where: { user_id: id }, transaction: t });

//     // ✅ 5. ចុងក្រោយ លុប User ធំចេញពី Table Users
//     await user.destroy({ transaction: t });

//     // ជោគជ័យ! Commit ការផ្លាស់ប្តូរ
//     await t.commit();
//     res.json({ message: 'User deleted successfully' });

//   } catch (error) {
//     // មានបញ្ហា! Rollback មកដូចដើមវិញ
//     await t.rollback();
//     console.error('Delete user error:', error);

//     // ពិនិត្យមើលថាជាបញ្ហា Foreign Key ឬអត់ (ឧ. User នេះធ្លាប់បង្កើតអ្នកផ្សេង)
//     if (error.name === 'SequelizeForeignKeyConstraintError') {
//         return res.status(400).json({ 
//             message: 'Cannot delete: This user is linked to other critical data (e.g., they created other users or invoices).' 
//         });
//     }

//     res.status(500).json({ message: 'Failed to delete user: ' + error.message });
//   }
// };

// module.exports = {
//     // ... function ផ្សេងៗ ...
//     deleteUser
// };

// module.exports = {
//   upload: uploadProfile, // for create-user (profile image)
//   uploadPosition,        // for position image
//   createInitialAdmin,
//   getMentorStats,
//   reviewMentor,
//   listPendingMentors,
//   createIndustry,
//   getIndustries,
//   updateIndustry,
//   deleteIndustry,
//   createPosition,
//   getPositions,
//   updatePosition,
//   deletePosition,
//   createRole,
//   getAllUsers,
//   getFullDashboard,
//   updateProfile,
//   getUserDetails,
//   deleteUser,
// };


// controllers/admin.controller.js
const { sendTelegramNotification } = require('../services/telegram.service');
const { sendVerificationEmail, sendMentorApprovalEmail, sendMentorRejectionEmail } = require('../services/email.service');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const db = require('../models');

// Models
const User = db.User;
const Admin = db.Admin;
const Mentor = db.Mentor;
const AccUser = db.AccUser;
const MentorEducation = db.MentorEducation;
const LoginSession = db.LoginSession;
const Industry = db.Industry;
const Position = db.Position;

// ==========================================
// 0. MULTER CONFIGURATION
// ==========================================

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/profiles';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const uploadProfile = multer({ storage: profileStorage });

const positionStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/positions';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const uploadPosition = multer({ storage: positionStorage });

// ==========================================
// 1. ADMIN & DASHBOARD BASICS
// ==========================================

const createInitialAdmin = async (req, res) => {
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

const getFullDashboard = async (req, res) => {
  try {
    const [userCount, pendingMentors] = await Promise.all([
      User.count(),
      Mentor.count({ where: { approval_status: 'pending' } }),
    ]);

    res.json({
      stats: {
        totalUsers: userCount,
        pendingMentors,
        totalBookings: 3435, // placeholder
        totalRevenue: 23569, // placeholder
      },
      monthlyBookings: [1200,1500,1800,2200,2800,3200,3500,3800,4100,4500,4800,5200],
      topMentors: [
        { name: "James Wilson", bookings: 245, revenue: 12250 },
        { name: "Sarah Johnson", bookings: 189, revenue: 9450 },
        { name: "David Brown", bookings: 156, revenue: 4680 },
      ],
      recentActivity: [
        { message: "New student registered", time: "5 min ago" },
        { message: "Mentor approved", time: "20 min ago" },
      ]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Dashboard error' });
  }
};

// ==========================================
// 2. MENTOR MANAGEMENT
// ==========================================

const getMentorStats = async (req, res) => {
  try {
    const [total, accepted, rejected, pending] = await Promise.all([
      Mentor.count(),
      Mentor.count({ where: { approval_status: 'approved' } }),
      Mentor.count({ where: { approval_status: 'rejected' } }),
      Mentor.count({ where: { approval_status: 'pending' } }),
    ]);

    res.json({ total, accepted, rejected, pending });
  } catch (error) {
    console.error(error);
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
  const userStatus = action === 'accept' ? 'active' : 'inactive'; 

  const t = await sequelize.transaction();
  try {
    const mentor = await Mentor.findByPk(mentorId, {
        include: [{ model: User }] 
    });

    if (!mentor) {
      await t.rollback();
      return res.status(404).json({ message: 'Mentor not found' });
    }

    mentor.approval_status = mentorStatus;
    await mentor.save({ transaction: t });

    // Handle User status update
    if (mentor.User) {
        mentor.User.status = userStatus;
        await mentor.User.save({ transaction: t });
    } else if (mentor.user) {
        mentor.user.status = userStatus;
        await mentor.user.save({ transaction: t });
    }

    await t.commit(); 

    // Send Email
    try {
        const userEmail = mentor.User ? mentor.User.email : (mentor.user ? mentor.user.email : null);
        
        if (userEmail) {
            if (action === 'accept') {
                await sendMentorApprovalEmail(userEmail, mentor.first_name);
            } else {
                await sendMentorRejectionEmail(userEmail, mentor.first_name);
            }
        }
    } catch (emailError) {
        console.error("Failed to send notification email:", emailError);
    }

    res.json({ message: `Mentor ${mentorStatus} successfully.` });

  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const listPendingMentors = async (req, res) => {
 try {
  const mentors = await Mentor.findAll({
  where: { approval_status: 'pending' },
  include: [
    { model: Position, as: "position" },
    { model: Industry, as: "industry" }
  ]
});

   const formatted = mentors.map(m => ({
     id: m.id,
     first_name: m.first_name,
     last_name: m.last_name,
     gender: m.gender,
     job_title: m.job_title,
     created_at: m.created_at,
     position_name: m.position?.position_name || null,
     document_url: null
   }));

   res.json(formatted);
 } catch (error) {
   console.error(error);
   res.status(500).json({ message: 'Server error' });
 }
};

// ==========================================
// 3. INDUSTRY & POSITION CRUD
// ==========================================

// Industry
const createIndustry = async (req, res) => {
  const { industry_name } = req.body;
  if (!industry_name) return res.status(400).json({ message: 'Industry name required' });
  try {
    const industry = await Industry.create({ industry_name });
    res.status(201).json(industry);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ message: 'Industry already exists' });
    res.status(500).json({ message: 'Server error' });
  }
};

const getIndustries = async (req, res) => {
  try {
    const industries = await Industry.findAll({ order: [['created_at', 'DESC']] });
    res.json(industries);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateIndustry = async (req, res) => {
  const { id } = req.params;
  const { industry_name } = req.body;
  try {
    const industry = await Industry.findByPk(id);
    if (!industry) return res.status(404).json({ message: 'Industry not found' });
    industry.industry_name = industry_name;
    await industry.save();
    res.json(industry);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteIndustry = async (req, res) => {
  const { id } = req.params;
  try {
    const industry = await Industry.findByPk(id);
    if (!industry) return res.status(404).json({ message: 'Industry not found' });
    await industry.destroy();
    res.json({ message: 'Industry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Position
const createPosition = async (req, res) => {
  const { industry_id, position_name, description } = req.body;
  if (!industry_id || !position_name) return res.status(400).json({ message: 'Required fields missing' });
  const image_position = req.file ? req.file.filename : null;

  try {
    const position = await Position.create({ industry_id, position_name, description, image_position });
    res.status(201).json(position);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getPositions = async (req, res) => {
  try {
    const positions = await Position.findAll({
      include: [{ model: Industry, attributes: ['industry_name'] }],
      order: [['created_at', 'DESC']],
    });
    const formatted = positions.map(p => ({
      ...p.toJSON(),
      industry: p.Industry?.industry_name,
      image_url: p.image_position ? `/uploads/positions/${p.image_position}` : null,
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updatePosition = async (req, res) => {
  const { id } = req.params;
  const { industry_id, position_name, description } = req.body;
  const image_position = req.file ? req.file.filename : undefined;

  try {
    const position = await Position.findByPk(id);
    if (!position) return res.status(404).json({ message: 'Position not found' });

    position.industry_id = industry_id;
    position.position_name = position_name;
    position.description = description;
    if (image_position) position.image_position = image_position;

    await position.save();
    res.json(position);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deletePosition = async (req, res) => {
  const { id } = req.params;
  try {
    const position = await Position.findByPk(id);
    if (!position) return res.status(404).json({ message: 'Position not found' });
    await position.destroy();
    res.json({ message: 'Position deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

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

//   if (!email || !password || !first_name || !last_name || !role_name) {
//     return res.status(400).json({ message: 'Required fields missing' });
//   }

//   if (/\d/.test(first_name)) {
//     return res.status(400).json({ message: 'First name cannot contain numbers' });
//   }

//   try {
//     const existing = await User.findOne({ where: { email } });
//     if (existing) return res.status(409).json({ message: 'Email already exists' });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const userId = uuidv4();
//     const t = await sequelize.transaction();

//     try {
//       // 1. Create User
//       await User.create({
//         id: userId,
//         email,
//         password: hashedPassword,
//         role_name,
//         status: 'unverified',
//         created_by: req.user ? req.user.id : null, // Use ID, not email for foreign key usually
//       }, { transaction: t });

//       // 2. Create Profile based on Role
//       if (role_name === 'admin') {
//         await Admin.create({
//           id: uuidv4(),
//           user_id: userId,
//           first_name,
//           last_name,
//           phone,
//           profile_image,
//         }, { transaction: t });

//       } else if (role_name === 'user') {
//         await AccUser.create({
//           id: uuidv4(),
//           user_id: userId,
//           first_name,
//           last_name,
//           phone,
//           gender, // ✅ Save Gender for Student
//           dob,
//           types_user,
//           institution_name,
//           profile_image,
//         }, { transaction: t });

//       } else if (role_name === 'mentor') {
//         const mentorId = uuidv4();
//         await Mentor.create({
//           id: mentorId,
//           user_id: userId,
//           first_name,
//           last_name,
//           gender, // ✅ Save Gender for Mentor
//           dob,
//           phone,
//           position_id,
//           industry_id,
//           job_title,
//           expertise_areas,
//           experience_years,
//           company_name,
//           social_media,
//           about_mentor,
//           profile_image,
//           approval_status: 'pending',
//         }, { transaction: t });

//         if (education) {
//           const eduList = typeof education === 'string' ? JSON.parse(education) : education;
//           for (const edu of eduList) {
//             await MentorEducation.create({
//               id: uuidv4(),
//               mentor_id: mentorId,
//               university_name: edu.university_name,
//               degree_name: edu.degree_name,
//               field_of_study: edu.field_of_study || null,
//               year_graduated: edu.year_graduated ? parseInt(edu.year_graduated) : null,
//               grade_gpa: edu.grade_gpa ? parseFloat(edu.grade_gpa) : null,
//               activities: edu.activities || null,
//             }, { transaction: t });
//           }
//         }
//       }

//       // 3. Create Verification Token
//       const verificationToken = uuidv4();
//       const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
//       await LoginSession.create({
//         user_id: userId,
//         refresh_token: verificationToken,
//         access_token: 'temp_verification',
//         expired_at: expiredAt,
//       }, { transaction: t });

//       // ✅ COMMIT TRANSACTION FIRST
//       await t.commit();

//       // ============================================================
//       // 🔥 SEND TELEGRAM NOTIFICATION (OUTSIDE TRANSACTION)
//       // ============================================================
//       try {
//         const creatorName = req.user ? req.user.email : 'System/Admin';
//         const telegramData = {
//            first_name, 
//            last_name, 
//            email, 
//            phone, 
//            gender: gender || 'N/A',
//            role_name,
//            types_user, institution_name, // Student
//            company_name, job_title, expertise_areas, // Mentor
//            status: 'Unverified'
//         };
        
//         // Ensure this function exists and is imported correctly
//         if (typeof sendTelegramNotification === 'function') {
//             sendTelegramNotification(telegramData, creatorName);
//         } else {
//             console.error("sendTelegramNotification is not a function");
//         }
//       } catch (tgError) {
//         console.error("❌ Telegram Notification Error:", tgError.message);
//       }

//       // Send Verification Email
//       try {
//         await sendVerificationEmail(email, verificationToken, role_name);
//         res.status(201).json({ 
//           message: `${role_name} created successfully! Verification email sent to ${email}` 
//         });
//       } catch (emailError) {
//         console.error('Email send failed:', emailError);
//         res.status(201).json({ 
//           message: `${role_name} created, but email failed to send.`,
//           warning: 'Email not sent'
//         });
//       }

//     } catch (err) {
//       // Only rollback if transaction hasn't finished
//       if (!t.finished) {
//           await t.rollback();
//       }
//       throw err;
//     }
//   } catch (error) {
//     console.error('Create user error:', error);
//     res.status(500).json({ message: 'Failed to create user', error: error.message });
//   }
// };


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

  if (!email || !password || !first_name || !last_name || !role_name) {
    return res.status(400).json({ message: 'Required fields missing' });
  }

  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const t = await sequelize.transaction();

    try {
      // 1. Create User
      await User.create({
        id: userId, email, password: hashedPassword, role_name, status: 'unverified',
        created_by: req.user ? req.user.id : null,
      }, { transaction: t });

      // 2. Create Profile
      if (role_name === 'admin') {
        await Admin.create({ id: uuidv4(), user_id: userId, first_name, last_name, phone, profile_image }, { transaction: t });
      } else if (role_name === 'user') {
        await AccUser.create({ id: uuidv4(), user_id: userId, first_name, last_name, phone, gender, dob, types_user, institution_name, profile_image }, { transaction: t });
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
            await MentorEducation.create({
              id: uuidv4(), mentor_id: mentorId, ...edu
            }, { transaction: t });
          }
        }
      }

      // 3. Verification Token
      const verificationToken = uuidv4();
      await LoginSession.create({
        user_id: userId, refresh_token: verificationToken, access_token: 'temp_verification',
        expired_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }, { transaction: t });

      // ✅ Commit Transaction
      await t.commit();

      // 🔥 TELEGRAM NOTIFICATION
      try {
        const creatorName = req.user ? req.user.email : 'System/Admin';
        const telegramData = {
           first_name, last_name, email, phone, 
           gender: gender || 'N/A', role_name,
           types_user, institution_name, company_name, job_title, expertise_areas,
           status: 'Unverified'
        };
        sendTelegramNotification(telegramData, creatorName);
      } catch (tgError) { console.error("Telegram Error:", tgError.message); }

      // Email Verification
      try {
        await sendVerificationEmail(email, verificationToken, role_name);
        res.status(201).json({ message: `${role_name} created successfully! Verification email sent.` });
      } catch (emailError) {
        res.status(201).json({ message: `${role_name} created, but email failed.`, warning: 'Email not sent' });
      }

    } catch (err) {
      await t.rollback();
      throw err;
    }
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
};


// // 🔥 GET ALL USERS (With "Created By" Fix)
// const getAllUsers = async (req, res) => { 
//   try {
//     const { search, startDate, endDate } = req.query;

//     let dateFilter = {};
//     if (startDate && endDate) {
//       dateFilter.created_at = { [Op.between]: [new Date(startDate), new Date(endDate)] };
//     }

//     const users = await User.findAll({
//       where: dateFilter,
//       attributes: ['id', 'email', 'role_name', 'status', 'created_at'],
//       include: [
//         // 1. User Profile Details
//         { model: Admin, as: 'admin', attributes: ['first_name', 'last_name'], required: false },
//         { model: Mentor, as: 'mentor', attributes: ['first_name', 'last_name'], required: false },
//         { model: AccUser, as: 'accUser', attributes: ['first_name', 'last_name'], required: false },
        
//         // 2. Creator Details
//         { 
//           model: User, 
//           as: 'creator', 
//           attributes: ['id', 'email', 'role_name'],
//           include: [
//              { model: Admin, as: 'admin', attributes: ['first_name', 'last_name'], required: false }
//           ]
//         }
//       ],
//       order: [['created_at', 'DESC']],
//     });

//     const formatted = users.map(u => {
//       // Format Name
//       let name = 'N/A';
//       if (u.role_name === 'admin' && u.admin) name = `${u.admin.first_name} ${u.admin.last_name}`;
//       else if (u.role_name === 'mentor' && u.mentor) name = `${u.mentor.first_name} ${u.mentor.last_name}`;
//       else if (u.role_name === 'user' && u.accUser) name = `${u.accUser.first_name} ${u.accUser.last_name}`;

//       // Format Created By
//       let createdBy = 'Self-Registered'; 
//       if (u.creator) {
//         if (u.creator.admin) { 
//            const adminProfile = u.creator.admin;
//            createdBy = `${adminProfile.first_name} ${adminProfile.last_name} (Admin)`;
//         } else {
//            createdBy = u.creator.email;
//         }
//       }

//       return {
//         id: u.id,
//         email: u.email,
//         role_name: u.role_name,
//         status: u.status,
//         created_at: u.created_at,
//         name: name,
//         created_by: createdBy, 
//         admin: u.admin,
//         mentor: u.mentor,
//         accUser: u.accUser
//       };
//     });

//     // Search Filter
//     if (search) {
//       const lowerSearch = search.toLowerCase();
//       const result = formatted.filter(u => 
//         u.name.toLowerCase().includes(lowerSearch) ||
//         u.email.toLowerCase().includes(lowerSearch) ||
//         u.role_name.toLowerCase().includes(lowerSearch) ||
//         u.created_by.toLowerCase().includes(lowerSearch)
//       );
//       return res.json(result);
//     }

//     res.json(formatted);
//   } catch (error) {
//     console.error('getAllUsers error:', error);
//     res.status(500).json({ message: 'Failed to fetch users' });
//   }
// };

// controllers/admin.controller.js

const getAllUsers = async (req, res) => {
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
        { model: Admin, as: 'admin', attributes: ['first_name', 'last_name', 'phone'] }, // 🔥 ថែម 'phone'
        { model: Mentor, as: 'mentor', attributes: ['first_name', 'last_name', 'phone', 'gender', 'job_title', 'company_name'] }, // 🔥 ថែម fields
        { model: AccUser, as: 'accUser', attributes: ['first_name', 'last_name', 'phone', 'gender', 'types_user', 'institution_name'] }, // 🔥 ថែម fields
        { 
          model: User, 
          as: 'creator', 
          attributes: ['id', 'email', 'role_name'],
          include: [
             { model: Admin, as: 'admin', attributes: ['first_name', 'last_name'] }
          ]
        }
      ],
      order: [['created_at', 'DESC']],
    });

    const formatted = users.map(u => {
      // Name
      let name = 'N/A';
      if (u.role_name === 'admin' && u.admin) name = `${u.admin.first_name} ${u.admin.last_name}`;
      else if (u.role_name === 'mentor' && u.mentor) name = `${u.mentor.first_name} ${u.mentor.last_name}`;
      else if (u.role_name === 'user' && u.accUser) name = `${u.accUser.first_name} ${u.accUser.last_name}`;

      // Created By
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
        id: u.id,
        email: u.email,
        role_name: u.role_name,
        status: u.status,
        created_at: u.created_at,
        name: name,
        created_by: createdBy, 

        // 🔥 IMPORTANT: ត្រូវតែ Return Object ទាំងនេះទៅ Frontend
        admin: u.admin,
        mentor: u.mentor,
        accUser: u.accUser
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


// Update Admin Profile
const updateProfile = async (req, res) => {
  const { first_name, last_name, phone } = req.body;
  const userId = req.user.id; 

  try {
    const admin = await Admin.findOne({ where: { user_id: userId } });
    if (!admin) return res.status(404).json({ message: 'Admin profile not found' });

    if (req.file) {
      // Remove old image
      if (admin.profile_image) {
        const oldPath = path.join(process.cwd(), 'uploads/profiles', admin.profile_image);
        if (fs.existsSync(oldPath)) {
            try { fs.unlinkSync(oldPath); } catch (err) { console.error("Could not delete old image:", err); }
        }
      }
      admin.profile_image = req.file.filename;
    }

    admin.first_name = first_name;
    admin.last_name = last_name;
    admin.phone = phone;
    await admin.save();

    res.json({ 
      message: 'Profile updated successfully',
      profile_image: admin.profile_image ? `/uploads/profiles/${admin.profile_image}` : null
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get User Details for Modal
const getUserDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id, {
      attributes: ['id', 'email', 'role_name', 'status', 'created_at'],
      include: [
        { model: Admin, as: 'admin' },
        { 
          model: Mentor, 
          as: 'mentor',
          include: [
            { model: MentorEducation, as: 'education' }, 
            { model: Position, as: 'position' },
            { model: Industry, as: 'industry' }
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

// 🔥 DELETE USER (Secure)
const deleteUser = async (req, res) => {
  const { id } = req.params;
  const requesterId = req.user ? req.user.id : null;

  // 1. Self-Delete Protection
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

    // 2. Admin Deleting Admin Protection
    if (user.role_name === 'admin') {
        await t.rollback();
        return res.status(403).json({ message: "Access Denied: You cannot delete another Admin account. Please deactivate them instead." });
    }

    // 3. Delete Role Specific Data
    if (user.role_name === 'mentor') {
      const mentor = await Mentor.findOne({ where: { user_id: id } });
      if (mentor) {
        await MentorEducation.destroy({ where: { mentor_id: mentor.id }, transaction: t });
        await Mentor.destroy({ where: { user_id: id }, transaction: t });
      }
    } else if (user.role_name === 'user') {
      await AccUser.destroy({ where: { user_id: id }, transaction: t });
    }

    // 4. Delete Login Sessions
    await LoginSession.destroy({ where: { user_id: id }, transaction: t });

    // 5. Delete User
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

module.exports = {
  upload: uploadProfile,
  uploadPosition,
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
  getFullDashboard,
  updateProfile,
  getUserDetails,
  deleteUser,
};