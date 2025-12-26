const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// Profile Storage
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/profiles';
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Position Storage
const positionStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/positions';
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

exports.uploadProfile = multer({ storage: profileStorage });
exports.uploadPosition = multer({ storage: positionStorage });