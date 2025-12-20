const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MentorEducation = sequelize.define('MentorEducation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  mentor_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  university_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  degree_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  field_of_study: {
    type: DataTypes.STRING,
  },
  year_graduated: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  grade_gpa: {
    type: DataTypes.STRING, // Kept as STRING to match your SQL 'varchar(10)', but can store numbers like "3.5"
  },
  activities: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'mentor_education', // Make sure this matches your DB table name exactly
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Association method
MentorEducation.associate = (db) => {
  MentorEducation.belongsTo(db.Mentor, { foreignKey: 'mentor_id' });
};

module.exports = MentorEducation;