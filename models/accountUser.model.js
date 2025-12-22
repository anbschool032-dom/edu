// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');
// const User = require('./user.model');

// const AccUser = sequelize.define('AccUser', {
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
//   phone: DataTypes.STRING,
//   gender: DataTypes.STRING,
//   dob: DataTypes.DATE,
//   types_user: DataTypes.STRING,
//   institution_name: DataTypes.STRING,
//   profile_image: DataTypes.STRING,
// }, {
//   tableName: 'Acc_User',
//   timestamps: true,
//   createdAt: 'created_at',
//   updatedAt: 'updated_at',
// });

// AccUser.belongsTo(User, { foreignKey: 'user_id' });
// User.hasOne(AccUser, { foreignKey: 'user_id' });

// module.exports = AccUser;



// models/accountUser.model.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AccUser = sequelize.define('AccUser', {
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
  gender: DataTypes.STRING,
  dob: DataTypes.DATE,
  types_user: DataTypes.STRING,
  institution_name: DataTypes.STRING,
  profile_image: DataTypes.STRING,
}, {
  tableName: 'acc_user',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Proper association using associate()
AccUser.associate = function(models) {
  AccUser.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user'
  });
};

module.exports = AccUser;