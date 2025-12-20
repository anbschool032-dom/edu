// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');

// const User = sequelize.define('User', {
//   id: {
//     type: DataTypes.UUID,
//     primaryKey: true
//   },
//   email: DataTypes.STRING,
//   password: DataTypes.STRING,
//   role_name: DataTypes.STRING,
//   status: DataTypes.STRING
// }, {
//   tableName: 'users',
//   timestamps: true,
//   createdAt: 'created_at',
//   updatedAt: 'updated_at'
// });

// User.associate = models => {
//   User.hasOne(models.Admin, { foreignKey: 'user_id', as: 'admin' });
//   User.hasOne(models.Mentor, { foreignKey: 'user_id', as: 'mentor' });
//   User.hasOne(models.AccUser, { foreignKey: 'user_id', as: 'accUser' });
// };

// module.exports = User;


// src/models/user.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  // ... your existing columns ...
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
  // ... other columns like password, created_at, etc ...
}, {
  tableName: 'users', // Note: Check if your table is 'Users' (capital) or 'users' (lowercase) in Postgres
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

User.associate = (db) => {
  // Existing associations
  User.hasOne(db.Admin, { foreignKey: 'user_id', as: 'admin' });
  User.hasOne(db.Mentor, { foreignKey: 'user_id', as: 'mentor' });
  User.hasOne(db.AccUser, { foreignKey: 'user_id', as: 'accUser' });
  
  // ✅ NEW ASSOCIATION: Self-reference for 'created_by'
  User.belongsTo(db.User, { as: 'creator', foreignKey: 'created_by' });
};

module.exports = User;