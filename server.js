// // // carrear-server/server.js
// // const express = require('express');
// // const bodyParser = require('body-parser');
// // const cookieParser = require('cookie-parser');
// // const cors = require('cors');
// // const db = require('./config/database');
// // require('dotenv').config();

// // const authRoutes = require('./routes/auth.routes');
// // const mentorRoutes = require('./routes/mentor.routes');
// // const adminRoutes = require('./routes/admin.routes');

// // const app = express();
// // const PORT = process.env.PORT || 3000;

// // // Optional: increase max listeners if you saw warnings
// // process.setMaxListeners(20);

// // // Middleware Setup
// // app.use(cookieParser());
// // app.use(bodyParser.json());
// // app.use(cors({
// //     origin: [process.env.CLIENT_BASE_URL_PUBLIC, process.env.CLIENT_BASE_URL_ADMIN].filter(Boolean),
// //     credentials: true,
// // }));

// // app.use(cors({
// //   origin: ['http://localhost:5173', 'http://localhost:5174'],
// //   credentials: true, // Allow sending cookies
// //   methods: ['GET','POST','PUT','DELETE','OPTIONS'],
// //   allowedHeaders: ['Content-Type','Authorization']
// // }));

// // // Routes
// // app.use('/api/v1/auth', authRoutes);
// // app.use('/api/v1/mentors', mentorRoutes);
// // app.use('/api/v1/admin', adminRoutes);

// // // app.use('/api/v1', industryRoutes); // /api/v1/industries
// // // app.use('/api/v1', positionRoutes); // /api/v1/positions


// // // General health check
// // app.get('/', (req, res) => {
// //     res.send('CareerSync Server Running!');
// // });

// // // Centralized error handler
// // const errorHandler = (err, req, res, next) => {
// //     console.error('Unhandled error:', err && (err.stack || err));
// //     const status = (err && err.status) || 500;
// //     const message = (err && err.message) || 'Internal Server Error';
// //     res.status(status).json({ message });
// // };
// // app.use(errorHandler);

// // app.listen(PORT, () => {
// //     console.log(`Server running on http://localhost:${PORT}`);
// // });




// // require('dotenv').config();








// // // console.log('🔥 DB_HOST:', process.env.DB_HOST);
// // // console.log('🔥 DB_NAME:', process.env.DB_NAME);
// // // console.log('🔥 DB_USER:', process.env.DB_USER);


// // // // Test database connection
// // // app.get('/db-test', async (req, res) => {
// // //   try {
// // //     const result = await db.query('SELECT NOW()');
// // //     res.json({
// // //       success: true,
// // //       time: result.rows[0].now,
// // //     });
// // //   } catch (err) {
// // //     console.error(err);
// // //     res.status(500).json({
// // //       success: false,
// // //       error: err.message,
// // //     });
// // //   }
// // // });



// // // carrear-server/server.js
// // const express = require('express');
// // const bodyParser = require('body-parser');
// // const cookieParser = require('cookie-parser');
// // const cors = require('cors');
// // const db = require('./config/database');
// // require('dotenv').config();

// // const authRoutes = require('./routes/auth.routes');
// // const mentorRoutes = require('./routes/mentor.routes');
// // const adminRoutes = require('./routes/admin.routes');
// // // --- FIX 1: Import the new route files ---
// // const industryRoutes = require('./routes/industry.routes');
// // const positionRoutes = require('./routes/position.routes');

// // const app = express();
// // const PORT = process.env.PORT || 3000;

// // // Optional: increase max listeners if you saw warnings
// // process.setMaxListeners(20);

// // // Middleware Setup
// // app.use(cookieParser());
// // app.use(bodyParser.json());
// // app.use(cors({
// //     origin: [process.env.CLIENT_BASE_URL_PUBLIC, process.env.CLIENT_BASE_URL_ADMIN].filter(Boolean),
// //     credentials: true,
// // }));

// // app.use(cors({
// //   origin: ['http://localhost:5173', 'http://localhost:5174'],
// //   credentials: true, // Allow sending cookies
// //   methods: ['GET','POST','PUT','DELETE','OPTIONS'],
// //   allowedHeaders: ['Content-Type','Authorization']
// // }));

// // // Routes
// // app.use('/api/v1/auth', authRoutes);
// // app.use('/api/v1/mentors', mentorRoutes);
// // app.use('/api/v1/admin', adminRoutes);

// // // --- FIX 2: Mount the new routes under /api/v1 ---
// // app.use('/api/v1', industryRoutes); 
// // app.use('/api/v1', positionRoutes);

// // // General health check
// // app.get('/', (req, res) => {
// //     res.send('CareerSync Server Running!');
// // });

// // // Centralized error handler
// // const errorHandler = (err, req, res, next) => {
// //     console.error('Unhandled error:', err && (err.stack || err));
// //     const status = (err && err.status) || 500;
// //     const message = (err && err.message) || 'Internal Server Error';
// //     res.status(status).json({ message });
// // };
// // app.use(errorHandler);

// // app.listen(PORT, () => {
// //     console.log(`Server running on http://localhost:${PORT}`);
// // });



// const express = require('express');
// const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');
// const cors = require('cors');
// const db = require('./config/database'); // Assuming this is needed for database setup/check
// require('dotenv').config();

// // --- Import all route handlers ---
// const authRoutes = require('./routes/auth.routes'); 
// const mentorRoutes = require('./routes/mentor.routes');
// const adminRoutes = require('./routes/admin.routes');
// // const industryRoutes = require('./routes/industry.routes'); // <-- Added
// // const positionRoutes = require('./routes/position.routes'); // <-- Added

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Optional: increase max listeners if you saw warnings
// process.setMaxListeners(20);

// // Middleware Setup
// app.use(cookieParser());
// app.use(bodyParser.json());

// // CORS Configuration (Use the more permissive one provided in your initial snippet)
// app.use(cors({
//   origin: ['http://localhost:5173', 'http://localhost:5174'],
//   credentials: true, // Allow sending cookies
//   methods: ['GET','POST','PUT','DELETE','OPTIONS'],
//   allowedHeaders: ['Content-Type','Authorization']
// }));
// // app.options('*', cors());

// // // Body parsers AFTER cors
// // app.use(express.json());
// // app.use(express.urlencoded({ extended: true }));

// // --- Routes Configuration (The fix for 404s) ---

// app.get('/api/v1/test', (req, res) => {
//   res.json({ message: 'API OK' });
// });

// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/mentors', mentorRoutes);
// app.use('/api/v1/admin', adminRoutes);
// // app.use('/api/v1/', adminRoutes);


// // General health check
// app.get('/', (req, res) => {
//     res.send('CareerSync Server Running!');
// });

// // Centralized error handler
// const errorHandler = (err, req, res, next) => {
//     console.error('Unhandled error:', err && (err.stack || err));
//     const status = (err && err.status) || 500;
//     const message = (err && err.message) || 'Internal Server Error';
//     res.status(status).json({ message });
// };

// app.use(errorHandler);

// app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });


const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const mentorRoutes = require('./routes/mentor.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔥 CORS (THIS ALONE IS ENOUGH)
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/mentors', mentorRoutes);
app.use('/api/v1/admin', adminRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('CareerSync Server Running!');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
