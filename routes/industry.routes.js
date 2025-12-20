// const express = require('express');
// const router = express.Router();
// const pool = require('../config/database');

// // GET all industries
// router.get('/industries', async (req, res) => {
//   try {
//     const result = await pool.query(
//       'SELECT * FROM Industry WHERE deleted_at IS NULL ORDER BY created_at DESC'
//     );
//     res.json(result.rows);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching industries', error: error.message });
//   }
// });

// // POST create industry
// router.post('/industries', async (req, res) => {
//   const { industry_name } = req.body;
//   try {
//     const result = await pool.query(
//       'INSERT INTO Industry (industry_name) VALUES ($1) RETURNING *',
//       [industry_name]
//     );
//     res.status(201).json(result.rows[0]);
//   } catch (error) {
//     res.status(500).json({ message: 'Error creating industry', error: error.message });
//   }
// });

// // PUT update industry
// router.put('/industries/:id', async (req, res) => {
//   const { id } = req.params;
//   const { industry_name } = req.body;
//   try {
//     const result = await pool.query(
//       'UPDATE Industry SET industry_name = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
//       [industry_name, id]
//     );
//     res.json(result.rows[0]);
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating industry', error: error.message });
//   }
// });

// // DELETE industry (soft delete)
// router.delete('/industries/:id', async (req, res) => {
//   const { id } = req.params;
//   try {
//     const result = await pool.query(
//       'UPDATE Industry SET deleted_at = NOW() WHERE id = $1 RETURNING *',
//       [id]
//     );
//     res.json({ message: 'Industry deleted successfully', data: result.rows[0] });
//   } catch (error) {
//     res.status(500).json({ message: 'Error deleting industry', error: error.message });
//   }
// });

// module.exports = router;


// routes/industry.routes.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET all industries
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT id, industry_name FROM Industry WHERE deleted_at IS NULL ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching industries' });
  }
});

// POST create industry
router.post('/', async (req, res) => {
  const { industry_name } = req.body;
  if (!industry_name) return res.status(400).json({ message: 'Industry name required' });
  try {
    const result = await db.query(
      'INSERT INTO Industry (industry_name) VALUES ($1) RETURNING id, industry_name',
      [industry_name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating industry' });
  }
});

module.exports = router;