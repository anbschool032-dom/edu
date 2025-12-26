const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const sequelize = require('./config/database');

// Import Routes
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const mentorRoutes = require('./routes/mentor.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// 🔥 1. CORS CONFIGURATION
// ==========================================
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

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ==========================================
// 📂 2. UPLOADS HANDLING (FIXED & SAFE)
// ==========================================

// ✅ FIX 1: Use __dirname instead of process.cwd()
// This ensures the server finds the folder even when run by PM2 from root.
const uploadPath = path.join(__dirname, 'uploads');
const profilePath = path.join(uploadPath, 'profiles');
const positionPath = path.join(uploadPath, 'positions');

// 1. Create Root Folder
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log('✅ Created uploads root folder');
}

// 2. Create Sub-folders (Prevents Upload Errors)
if (!fs.existsSync(profilePath)) {
  fs.mkdirSync(profilePath, { recursive: true });
  console.log('✅ Created uploads/profiles folder');
}

if (!fs.existsSync(positionPath)) {
  fs.mkdirSync(positionPath, { recursive: true });
  console.log('✅ Created uploads/positions folder');
}

// 3. Serve Static Files
// This allows the frontend to access http://domain/uploads/profiles/image.jpg
app.use('/uploads', express.static(uploadPath));
app.use('/api/v1/uploads', express.static(uploadPath));

console.log('📂 Serving static files from:', uploadPath);

// ==========================================
// 🔗 3. API ROUTES
// ==========================================
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/mentors', mentorRoutes);

// ==========================================
// ⚛️ 4. FRONTEND SERVING (React)
// ==========================================
const frontendPath = path.join(__dirname, '../frontend/dist');

if (fs.existsSync(frontendPath)) {
  console.log('✅ Found React build folder:', frontendPath);
  
  // Serve React Static Files
  app.use(express.static(frontendPath));

  // Handle SPA (Single Page Application)
  // ✅ FIX 2: Use Regex /(.*)/ instead of '*'
  // This fixes the "PathError: Missing parameter name" in your PM2 logs
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
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();