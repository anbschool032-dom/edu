const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Industry = sequelize.define("Industry", {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  industry_name: { type: DataTypes.STRING, unique: true, allowNull: false }
}, {
  tableName: "industry",
  timestamps: true,
  underscored: true
});

Industry.associate = (db) => {
  Industry.hasMany(db.Position, { foreignKey: "industry_id" });
  Industry.hasMany(db.Mentor, { foreignKey: "industry_id" });
};

module.exports = Industry;
