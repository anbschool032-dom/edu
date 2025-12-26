const path = require('path');
const fs = require('fs');
const db = require('../../models'); // Go up 2 levels
const Admin = db.Admin;
const User = db.User;
const Mentor = db.Mentor;

exports.getFullDashboard = async (req, res) => {
  try {
    const [userCount, pendingMentors] = await Promise.all([
      User.count(),
      Mentor.count({ where: { approval_status: 'pending' } }),
    ]);

    res.json({
      stats: {
        totalUsers: userCount,
        pendingMentors,
        totalBookings: 3435, // Demo data
        totalRevenue: 23569, // Demo data
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

exports.updateProfile = async (req, res) => {
  const { first_name, last_name, phone } = req.body;
  const userId = req.user.id; 

  try {
    const admin = await Admin.findOne({ where: { user_id: userId } });
    if (!admin) return res.status(404).json({ message: 'Admin profile not found' });

    if (req.file) {
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