// models/notification.model.js
module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define("Notification", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: true }, // អ្នកទទួល (NULL = គ្រប់គ្នា/Admin)
    title: { type: DataTypes.STRING },
    message: { type: DataTypes.STRING },
    type: { type: DataTypes.STRING, defaultValue: 'info' }, // info, warning, success
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false }
  });
  return Notification;
};