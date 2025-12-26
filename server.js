const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const sequelize = require('./config/database');

const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const mentorRoutes = require('./routes/mentor.routes');

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174',
    'http://13.53.46.167',
    'https://ptascloud.online',       
    'https://www.ptascloud.online'    
  ],
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ==========================================
// 📂 2. UPLOADS HANDLING (The Fix & Auto Create)
// ==========================================
const uploadPath = path.join(process.cwd(), 'uploads');

// A. បង្កើត Folder ស្វ័យប្រវត្តិ (ការពារក្រែងលោ Server ថ្មីអត់ទាន់មាន)
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log('✅ Created uploads folder automatically');
}

// B. បើកឱ្យចូលតាមរយៈ /uploads (Standard Link)
app.use('/uploads', express.static(uploadPath));

// C. ✅ Fix សំខាន់៖ បើកឱ្យចូលតាមរយៈ /api/v1/uploads (សម្រាប់ Position Images ដែល Error)
app.use('/api/v1/uploads', express.static(uploadPath));

console.log('📂 Serving static files from:', uploadPath);

// ==========================================
// 🔗 3. API ROUTES
// ==========================================
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/mentors', mentorRoutes);


const frontendPath = path.join(__dirname, '../frontend/dist');

if (fs.existsSync(frontendPath)) {
  console.log('✅ Found React build folder:', frontendPath);
  
  // បម្រើឯកសារ Static (css, js, images របស់ React)
  app.use(express.static(frontendPath));



  // Handle SPA (Single Page Application)
  // ✅ FIX: ប្រើ Regex /(.*)/ ជំនួសឱ្យ '*' ឬ '/*' ដើម្បីដោះស្រាយ PathError
  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });

} else {
  console.log('⚠️ Warning: Could not find React build folder at:', frontendPath);
  console.log('👉 Please run "npm run build" in your client folder first.');
}

// ==========================================
// 🚨 5. GLOBAL ERROR HANDLER
// ==========================================
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// ==========================================
// 🚀 6. START SERVER
// ==========================================
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connected (no sync)');
    
    // ចំណាំ៖ យើងបានបង្កើត folder uploads នៅខាងលើរួចហើយ មិនបាច់ដាក់ក្នុងនេះទៀតទេ

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();