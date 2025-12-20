// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');

// const Admin = sequelize.define('Admin', {
//   id: {
//     type: DataTypes.UUID,
//     defaultValue: DataTypes.UUIDV4,
//     primaryKey: true,
//   },
//   user_id: {
//     type: DataTypes.UUID,
//     allowNull: false,
//     unique: true,
//   },
//   first_name: DataTypes.STRING,
//   last_name: DataTypes.STRING,
// }, {
//   tableName: 'Admin',
//   timestamps: true,
//   createdAt: 'created_at',  // ✅ ADD THIS
//   updatedAt: 'updated_at',  // ✅ ADD THIS
// });

// Admin.associate = function(models) {
//   Admin.belongsTo(models.User, {
//     foreignKey: 'user_id',
//     as: 'user'
//   });
// };

// module.exports = Admin;



// models/admin.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Admin = sequelize.define('Admin', {
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
  first_name: DataTypes.STRING,
  last_name: DataTypes.STRING,
  phone: DataTypes.STRING,
  profile_image: DataTypes.STRING,
}, {
  tableName: 'Admin',
  timestamps: true,
  createdAt: 'created_at',  // ✅ ADD THIS - THIS IS THE FIX!
  updatedAt: 'updated_at',  // ✅ ADD THIS - THIS IS THE FIX!
});

Admin.associate = function(models) {
  Admin.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user'
  });
};

module.exports = Admin;