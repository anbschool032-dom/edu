const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); // ថែម fs ដើម្បីឆែកមើល folder
require('dotenv').config();
const sequelize = require('./config/database');

const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const mentorRoutes = require('./routes/mentor.routes');
const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// 🔥 1. កែ CORS (បន្ថែម Domain បងចូល)
// ==========================================
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174',
    'http://13.53.46.167',
    'https://ptascloud.online',       // ✅ ដាក់ Domain បងចូលនៅទីនេះ
    'https://www.ptascloud.online'    // ✅ ដាក់ www ផង
  ],
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// កំណត់ Upload Folder
const uploadPath = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadPath));
console.log('📂 Serving static files from:', uploadPath);

// ==========================================
// 🔗 2. API Routes (ទុកដដែល)
// ==========================================
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/mentors', mentorRoutes);


// ==========================================
// 🔥 3. ផ្នែកសំខាន់បំផុត! បង្ហាញ React Frontend
// ==========================================

// 👉 ចំណាំ: សូមបងឆែកមើលថា React Build folder របស់បងឈ្មោះអី? (dist ឬ build?)
// ជាធម្មតា Vite ប្រើ 'dist', CRA ប្រើ 'build'។ ខ្ញុំដាក់ 'dist' ជាឧទាហរណ៍។
// ទីតាំង '../client/dist' គឺសន្មតថា folder `client` នៅក្បែរ folder `server`។

const frontendPath = path.join(__dirname, '../frontend/dist');

// បើមាន folder frontend, ឱ្យ Express យកមកប្រើ
if (fs.existsSync(frontendPath)) {
  console.log('✅ Found React build folder:', frontendPath);
  
  // 1. បម្រើឯកសារ Static (css, js, images របស់ React)
  app.use(express.static(frontendPath));

// ✅ កូដថ្មី (ដាក់បែបនេះវិញ)
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});


} else {
  console.log('⚠️ Warning: Could not find React build folder at:', frontendPath);
  console.log('👉 Please run "npm run build" in your client folder first.');
}


// ==========================================
// Global Error Handler
// ==========================================
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// Start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connected (no sync)');
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();