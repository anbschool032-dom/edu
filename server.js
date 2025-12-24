// const express = require('express');
// const cookieParser = require('cookie-parser');
// const cors = require('cors');
// const path = require('path');
// require('dotenv').config();
// const sequelize = require('./config/database');

// const authRoutes = require('./routes/auth.routes');
// const adminRoutes = require('./routes/admin.routes');
// const mentorRoutes = require('./routes/mentor.routes');
// const app = express();
// const PORT = process.env.PORT || 3000;

// // Middleware
// app.use(cors({
//   origin: ['http://localhost:5173', 'http://localhost:5174'],
//   credentials: true,
//   methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
//   allowedHeaders: ['Content-Type','Authorization']
// }));
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// app.use(cookieParser());
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Routes
// // app.use('/api/v1/auth', authRoutes);

// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/admin', adminRoutes);
// app.use('/api/v1/mentors', mentorRoutes);


// // Global error handler
// app.use((err, req, res, next) => {
//   console.error('🔥 Error:', err);
//   res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
// });

// // Start server
// const startServer = async () => {
//   try {
//     await sequelize.authenticate();
//     console.log('✅ DB connected');
//     // await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
//     // console.log('✅ Models synced');
//     await sequelize.authenticate();
//     console.log('✅ DB connected (no sync)');


//     app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
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

// 1. CORS Configuration (សំខាន់សម្រាប់ Frontend ហៅមក)
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174',
    'http://13.53.46.167',       // IP Server របស់បង
    'http://13.53.46.167:5173'
  ],
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 🔥 2. បន្ទាត់សំខាន់បំផុតសម្រាប់ឱ្យចេញរូបភាព! 🔥
// នេះជាកន្លែងដែលប្រាប់ Express ថា "បើគេហៅ /uploads ឱ្យទៅយកឯកសារក្នុង folder uploads មកបង្ហាញ"
const uploadPath = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadPath));
console.log('📂 Serving static files from:', uploadPath); // <-- មើល Log នេះក្នុង Terminal

// Routes
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
    console.log('✅ DB connected (no sync)');
    
    // បង្កើត Folder uploads ស្វ័យប្រវត្តិបើមិនទាន់មាន
    const fs = require('fs');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log('📂 Created uploads folder automatically');
    }

    // ប្រើ 0.0.0.0 ដើម្បីឱ្យចូលបានពីគ្រប់ IP (ល្អសម្រាប់ Server AWS)
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
      console.log(`✅ Images folder is exposed at http://localhost:${PORT}/uploads`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();