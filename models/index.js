const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const db = {};
const basename = path.basename(__filename);

// 1. Dynamic Loader (Loads all files in this folder automatically)
fs.readdirSync(__dirname)
  .filter(file =>
    file !== basename &&
    file.endsWith('.js')
  )
  .forEach(file => {
    const model = require(path.join(__dirname, file));
    // model.name comes from sequelize.define('ModelName') inside the file
    db[model.name] = model;
  });

// 2. Manual Import (Explicitly adding PasswordReset as requested)
// Note: This requires that 'passwordReset.model.js' exists in this folder
try {
  const PasswordReset = require('./passwordReset.model');
  db.PasswordReset = PasswordReset;
} catch (error) {
  console.warn("Could not manually load PasswordReset model (it might be missing or already loaded).");
}

// 3. Run associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;