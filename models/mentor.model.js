const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Mentor = sequelize.define('Mentor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
  },
  position_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  industry_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // --- ADDED MISSING FIELDS ---
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'), // Matches your DB Enum
    allowNull: false
  },
  dob: {
    type: DataTypes.DATEONLY, // Use DATEONLY for SQL 'date' type
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  job_title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  expertise_areas: {
    type: DataTypes.TEXT,
  },
  experience_years: {
    type: DataTypes.INTEGER,
  },
  company_name: {
    type: DataTypes.STRING,
  },
  social_media: {
    type: DataTypes.STRING,
  },
  about_mentor: {
    type: DataTypes.TEXT,
  },
  profile_image: {
    type: DataTypes.STRING,
  },
  approval_status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  approved_by: {
    type: DataTypes.UUID,
  },
  approved_at: {
    type: DataTypes.DATE,
  }
}, {
  tableName: 'mentor',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Association method
Mentor.associate = (db) => {
  Mentor.belongsTo(db.User, { foreignKey: 'user_id' });
  Mentor.belongsTo(db.Position, { foreignKey: 'position_id', as: 'position' });
  Mentor.belongsTo(db.Industry, { foreignKey: 'industry_id', as: 'industry' });
  Mentor.hasMany(db.MentorEducation, { foreignKey: 'mentor_id', as: 'education' });
};

module.exports = Mentor;