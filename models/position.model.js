const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Position = sequelize.define("Position", {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  position_name: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  image_position: DataTypes.STRING
}, {
  tableName: "position",
  timestamps: true,
  underscored: true
});

Position.associate = (db) => {
  Position.belongsTo(db.Industry, { foreignKey: "industry_id" });
  Position.hasMany(db.Mentor, { foreignKey: "position_id" });
};

module.exports = Position;
