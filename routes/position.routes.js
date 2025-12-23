const express = require('express');
const router = express.Router();
const db = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ 1. Config Upload Folder (ដោះស្រាយបញ្ហារូបបាត់)
const uploadDir = 'uploads/positions/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!['.png', '.jpg', '.jpeg'].includes(ext)) {
      return cb(new Error('Only PNG, JPG, JPEG allowed'));
    }
    cb(null, true);
  }
});

// ✅ 2. GET positions
router.get('/', async (req, res) => {
  const { industry_id } = req.query;
  try {
    let query = `
      SELECT p.id, p.position_name, p.description, p.image_position, p.industry_id,
             i.industry_name as industry
      FROM Position p
      LEFT JOIN Industry i ON p.industry_id = i.id
      WHERE p.deleted_at IS NULL
    `;
    const params = [];
    if (industry_id) {
      query += ' AND p.industry_id = $1';
      params.push(industry_id);
    }
    query += ' ORDER BY p.created_at DESC';

    const result = await db.query(query, params);
    const positions = result.rows.map(pos => ({
      ...pos,
      image_url: pos.image_position ? `/uploads/positions/${pos.image_position}` : null
    }));
    res.json(positions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching positions' });
  }
});

// ✅ 3. POST create position
router.post('/', upload.single('image_position'), async (req, res) => {
  const { industry_id, position_name, description } = req.body;
  if (!industry_id || !position_name) {
    return res.status(400).json({ message: 'industry_id and position_name required' });
  }
  const image_position = req.file ? req.file.filename : null;

  try {
    const result = await db.query(
      `INSERT INTO Position (industry_id, position_name, description, image_position)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [industry_id, position_name, description || null, image_position]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating position' });
  }
});

// ✅ 4. PUT update position (ដែលបងបាត់)
router.put('/:id', upload.single('image_position'), async (req, res) => {
  const { id } = req.params;
  const { industry_id, position_name, description } = req.body;
  const image_position = req.file ? req.file.filename : null;

  try {
    let query = 'UPDATE Position SET industry_id = $1, position_name = $2, description = $3, updated_at = NOW()';
    const params = [industry_id, position_name, description];
    
    if (image_position) {
      query += ', image_position = $4 WHERE id = $5 RETURNING *';
      params.push(image_position, id);
    } else {
      query += ' WHERE id = $4 RETURNING *';
      params.push(id);
    }
    
    const result = await db.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Position not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating position' });
  }
});

// ✅ 5. DELETE position (ដែលបងបាត់)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'UPDATE Position SET deleted_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );
    res.json({ message: 'Position deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting position' });
  }
});

module.exports = router;