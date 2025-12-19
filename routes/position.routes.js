// const express = require('express');
// const router = express.Router();
// const pool = require('../config/database');
// const multer = require('multer');
// const path = require('path');

// // Configure multer for image upload
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/positions/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + '-' + file.originalname);
//   }
// });

// const upload = multer({ 
//   storage: storage,
//   fileFilter: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
//       return cb(new Error('Only images are allowed'));
//     }
//     cb(null, true);
//   }
// });

// // GET all positions with industry info
// router.get('/positions', async (req, res) => {
//   const { industry_id } = req.query;
  
//   try {
//     let query = `
//       SELECT p.*, i.industry_name 
//       FROM Position p
//       LEFT JOIN Industry i ON p.industry_id = i.id
//       WHERE p.deleted_at IS NULL
//     `;
//     const params = [];
    
//     if (industry_id) {
//       query += ' AND p.industry_id = $1';
//       params.push(industry_id);
//     }
    
//     query += ' ORDER BY p.created_at DESC';
    
//     const result = await pool.query(query, params);
//     res.json(result.rows);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching positions', error: error.message });
//   }
// });

// // POST create position
// router.post('/positions', upload.single('image_position'), async (req, res) => {
//   const { industry_id, position_name, description } = req.body;
//   const image_position = req.file ? req.file.filename : null;
  
//   try {
//     const result = await pool.query(
//       'INSERT INTO Position (industry_id, position_name, image_position, description) VALUES ($1, $2, $3, $4) RETURNING *',
//       [industry_id, position_name, image_position, description]
//     );
//     res.status(201).json(result.rows[0]);
//   } catch (error) {
//     res.status(500).json({ message: 'Error creating position', error: error.message });
//   }
// });

// // PUT update position
// router.put('/positions/:id', upload.single('image_position'), async (req, res) => {
//   const { id } = req.params;
//   const { industry_id, position_name, description } = req.body;
//   const image_position = req.file ? req.file.filename : null;
  
//   try {
//     let query = 'UPDATE Position SET industry_id = $1, position_name = $2, description = $3, updated_at = NOW()';
//     const params = [industry_id, position_name, description];
    
//     if (image_position) {
//       query += ', image_position = $4 WHERE id = $5 RETURNING *';
//       params.push(image_position, id);
//     } else {
//       query += ' WHERE id = $4 RETURNING *';
//       params.push(id);
//     }
    
//     const result = await pool.query(query, params);
//     res.json(result.rows[0]);
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating position', error: error.message });
//   }
// });

// // DELETE position (soft delete)
// router.delete('/positions/:id', async (req, res) => {
//   const { id } = req.params;
//   try {
//     const result = await pool.query(
//       'UPDATE Position SET deleted_at = NOW() WHERE id = $1 RETURNING *',
//       [id]
//     );
//     res.json({ message: 'Position deleted successfully', data: result.rows[0] });
//   } catch (error) {
//     res.status(500).json({ message: 'Error deleting position', error: error.message });
//   }
// });

// module.exports = router;

// carrear-server/routes/position.routes.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database'); 
const multer = require('multer');
const path = require('path');

// Configure multer for image upload (Ensure 'uploads/positions/' directory exists)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Check if the directory exists before using it
    cb(null, 'uploads/positions/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
      return cb(new Error('Only images are allowed'));
    }
    cb(null, true);
  }
});

// GET all positions with industry info
router.get('/positions', async (req, res) => {
  const { industry_id } = req.query;
  
  try {
    let query = `
      SELECT p.*, i.industry_name AS industry 
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
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching positions', error: error.message });
  }
});

// POST create position
router.post('/positions', upload.single('image_position'), async (req, res) => {
  const { industry_id, position_name, description } = req.body;
  if (!industry_id || !position_name) return res.status(400).json({ message: 'industry_id and position_name are required.' });
  
  const image_position = req.file ? req.file.filename : null;
  
  try {
    const result = await pool.query(
      'INSERT INTO Position (industry_id, position_name, image_position, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [industry_id, position_name, image_position, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error creating position', error: error.message });
  }
});

// PUT update position
router.put('/positions/:id', upload.single('image_position'), async (req, res) => {
  const { id } = req.params;
  const { industry_id, position_name, description } = req.body;
  if (!industry_id || !position_name) return res.status(400).json({ message: 'industry_id and position_name are required.' });
  
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
    
    const result = await pool.query(query, params);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating position', error: error.message });
  }
});

// DELETE position (soft delete)
router.delete('/positions/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE Position SET deleted_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );
    res.json({ message: 'Position deleted successfully', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting position', error: error.message });
  }
});

module.exports = router;