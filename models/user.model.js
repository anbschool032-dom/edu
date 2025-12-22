// src/models/user.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  // ✅ THIS WAS MISSING OR HIDDEN - IT MUST BE HERE
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role_name: {
    type: DataTypes.ENUM('user', 'mentor', 'admin'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('unverified', 'active', 'inactive'),
    defaultValue: 'unverified',
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  // Timestamps are handled automatically by 'timestamps: true' below
}, {
  tableName: 'users', // Must match Postgres table name exactly (usually lowercase 'users')
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

User.associate = (db) => {
  User.hasOne(db.Admin, { foreignKey: 'user_id', as: 'admin' });
  User.hasOne(db.Mentor, { foreignKey: 'user_id', as: 'mentor' });
  User.hasOne(db.AccUser, { foreignKey: 'user_id', as: 'accUser' });
  
  // Self-reference for 'created_by'
  User.belongsTo(db.User, { as: 'creator', foreignKey: 'created_by' });
};

module.exports = User;