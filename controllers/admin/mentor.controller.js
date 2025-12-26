const sequelize = require('../../config/database');
const db = require('../../models'); // ត្រូវប្រាកដថា path នេះត្រូវនឹង folder structure របស់បង
const { sendMentorApprovalEmail, sendMentorRejectionEmail } = require('../../services/email.service');

const Mentor = db.Mentor;
const User = db.User;
const Position = db.Position;
const Industry = db.Industry;
const MentorEducation = db.MentorEducation;

// ==========================================
// 1. STATS & APPROVALS (Admin Logic)
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

    // Update User Status
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
// 2. GENERAL CRUD (List, Get, Update, Delete)
// ==========================================

// GET ALL MENTORS
const listMentors = async (req, res) => {
  try {
    const mentors = await Mentor.findAll({
      include: [
        { model: User, attributes: ['email', 'status'] },
        { model: Position, as: 'position' },
        { model: Industry, as: 'industry' }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(mentors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching mentors' });
  }
};

// GET MENTOR BY ID
const getMentorById = async (req, res) => {
  try {
    const mentor = await Mentor.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ['email', 'status'] },
        { model: MentorEducation, as: 'education' },
        { model: Position, as: 'position' },
        { model: Industry, as: 'industry' }
      ]
    });
    if (!mentor) return res.status(404).json({ message: 'Mentor not found' });
    res.json(mentor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching mentor details' });
  }
};

// UPDATE MENTOR
const updateMentor = async (req, res) => {
  const { id } = req.params;
  // ឧទាហរណ៍ fields ដែលអាច update បាន
  const { first_name, last_name, phone, job_title, company_name } = req.body;
  
  try {
    const mentor = await Mentor.findByPk(id);
    if (!mentor) return res.status(404).json({ message: 'Mentor not found' });

    // Update fields
    if(first_name) mentor.first_name = first_name;
    if(last_name) mentor.last_name = last_name;
    if(phone) mentor.phone = phone;
    if(job_title) mentor.job_title = job_title;
    if(company_name) mentor.company_name = company_name;
    
    await mentor.save();
    res.json({ message: 'Mentor updated successfully', mentor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating mentor' });
  }
};

// DELETE MENTOR
const deleteMentor = async (req, res) => {
  const { id } = req.params;
  const t = await sequelize.transaction();
  
  try {
    const mentor = await Mentor.findByPk(id);
    if (!mentor) {
      await t.rollback();
      return res.status(404).json({ message: 'Mentor not found' });
    }

    // លុប Education មុន
    await MentorEducation.destroy({ where: { mentor_id: id }, transaction: t });
    
    // លុប Mentor
    await mentor.destroy({ transaction: t });

    // ចំណាំ៖ បើចង់លុប User Account ផង សូមប្រើ deleteUser ក្នុង user.controller ជំនួសវិញល្អជាង
    // ប៉ុន្តែសម្រាប់ Route នេះ យើងលុបតែ Mentor Profile ក៏បាន
    
    await t.commit();
    res.json({ message: 'Mentor deleted successfully' });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ message: 'Error deleting mentor' });
  }
};

module.exports = {
    getMentorStats,
    reviewMentor,
    listPendingMentors,
    listMentors,    // ✅ Added
    getMentorById,  // ✅ Added
    updateMentor,   // ✅ Added
    deleteMentor    // ✅ Added
};