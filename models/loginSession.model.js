const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LoginSession = sequelize.define('LoginSession', {
  user_id: {
    type: DataTypes.UUID,
    primaryKey: true,          // 👈 THIS
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  refresh_token: DataTypes.TEXT,
  access_token: DataTypes.TEXT,
  expired_at: DataTypes.DATE
}, {
  tableName: 'login_session',
  timestamps: false,
  freezeTableName: true
});


module.exports = LoginSession;
