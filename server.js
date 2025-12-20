// // const express = require('express');
// // const cookieParser = require('cookie-parser');
// // const cors = require('cors');
// // require('dotenv').config();

// // const authRoutes = require('./routes/auth.routes');
// // const mentorRoutes = require('./routes/mentor.routes');
// // const adminRoutes = require('./routes/admin.routes');

// // const app = express();
// // const PORT = process.env.PORT || 3000;

// // // 🔥 CORS (THIS ALONE IS ENOUGH)
// // app.use(cors({
// //   origin: ['http://localhost:5173', 'http://localhost:5174'],
// //   credentials: true,
// //   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
// //   allowedHeaders: ['Content-Type', 'Authorization']
// // }));

// // // Middleware
// // app.use(cookieParser());
// // app.use(express.json());
// // app.use(express.urlencoded({ extended: true }));

// // // Routes
// // app.use('/api/v1/auth', authRoutes);
// // app.use('/api/v1/mentors', mentorRoutes);
// // app.use('/api/v1/admin', adminRoutes);

// // // Health check
// // app.get('/', (req, res) => {
// //   res.send('CareerSync Server Running!');
// // });

// // // Error handler
// // app.use((err, req, res, next) => {
// //   console.error(err);
// //   res.status(500).json({ message: 'Internal Server Error' });
// // });

// // app.listen(PORT, () => {
// //   console.log(`✅ Server running on http://localhost:${PORT}`);
// // });



// // server.js
// const express = require('express');
// const cookieParser = require('cookie-parser');
// const cors = require('cors');
// const path = require('path');
// require('dotenv').config();

// // Import database (Sequelize)
// const sequelize = require('./config/database');

// // Import routes
// const authRoutes = require('./routes/auth.routes');
// const adminRoutes = require('./routes/admin.routes');
// const mentorRoutes = require('./routes/mentor.routes');
// // Add more routes here if you have user/student routes later

// const app = express();
// const PORT = process.env.PORT || 3000;

// // ========================
// // Middleware
// // ========================

// // CORS - Allow your frontend(s)
// app.use(cors({
//   origin: [
//     'http://localhost:5173',  // Admin panel
//     'http://localhost:5174',  // Public site (if separate)
//     // Add your production domains later
//   ],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// }));

// // Body parsers
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Cookie parser
// app.use(cookieParser());

// // Serve uploaded files statically
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // ========================
// // Routes
// // ========================

// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/admin', adminRoutes);
// app.use('/api/v1/mentors', mentorRoutes);


// // ========================
// // Health Check & Root
// // ========================

// app.get('/api/health', (req, res) => {
//   res.json({
//     status: 'OK',
//     message: 'CareerSync API is running!',
//     timestamp: new Date().toISOString(),
//     environment: process.env.NODE_ENV || 'development'
//   });
// });

// app.get('/', (req, res) => {
//   res.json({
//     message: 'Welcome to CareerSync API 🎯',
//     version: '1.0.0',
//     docs: '/api/health'
//   });
// });

// // ========================
// // 404 Handler
// // ========================

// // app.use('/*', (req, res) => {
// //   res.status(404).json({
// //     error: 'Route not found',
// //     path: req.originalUrl
// //   });
// // });

// // ========================
// // Global Error Handler
// // ========================

// app.use((err, req, res, next) => {
//   console.error('🔥 Unhandled Error:', err);

//   // Handle Sequelize validation errors
//   if (err.name === 'SequelizeValidationError') {
//     return res.status(400).json({
//       message: 'Validation error',
//       errors: err.errors.map(e => e.message)
//     });
//   }

//   // Handle multer errors (file upload)
//   if (err instanceof require('multer').MulterError) {
//     return res.status(400).json({ message: `File upload error: ${err.message}` });
//   }

//   res.status(err.status || 500).json({
//     message: err.message || 'Internal Server Error',
//     ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
//   });
// });

// // ========================
// // Start Server
// // ========================

// const startServer = async () => {
//   try {
//     // Test DB connection
//     await sequelize.authenticate();
//     console.log('✅ Database connected successfully');

//     // Sync models (use { alter: true } in dev, { force: false } in prod)
//     await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
//     console.log('✅ Models synced');

//     app.listen(PORT, '0.0.0.0', () => {
//       console.log(`🚀 Server running on http://localhost:${PORT}`);
//       console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
//     });
//   } catch (error) {
//     console.error('❌ Failed to start server:', error);
//     process.exit(1);
//   }
// };

// startServer();






const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const sequelize = require('./config/database');

const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const mentorRoutes = require('./routes/mentor.routes');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
// app.use('/api/v1/auth', authRoutes);

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/mentors', mentorRoutes);


// Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// Start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connected');
    // await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    // console.log('✅ Models synced');
    await sequelize.authenticate();
    console.log('✅ DB connected (no sync)');


    app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
