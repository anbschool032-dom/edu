// carrear-server/config/database.js
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD || '', 
  port: Number(process.env.DB_PORT) || 5432,
});

// Log successful connection
pool.on('connect', () => {
  // console.log('✅ PostgreSQL connected');
});

// Handle unexpected errors
pool.on('error', (err) => {
  console.error('❌ PostgreSQL error:', err);
  process.exit(1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
