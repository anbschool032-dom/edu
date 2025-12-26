// // // routes/admin.routes.js
// // const express = require('express');
// // const router = express.Router();
// // const adminController = require('../controllers/admin.controller');
// // const authMiddleware = require('../middleware/auth.middleware');

// // // ✅ Protect ALL admin routes
// // router.use(authMiddleware(['admin']));

// // // Dashboard
// // router.get('/dashboard', adminController.getFullDashboard);

// // // Industry
// // router.get('/industry', adminController.getIndustries);
// // router.post('/industry', adminController.createIndustry);
// // router.put('/industry/:id', adminController.updateIndustry);
// // router.delete('/industry/:id', adminController.deleteIndustry);

// // // Position
// // router.get('/position', adminController.getPositions);
// // router.post('/position', adminController.uploadPosition.single('image_position'), adminController.createPosition);
// // router.put('/position/:id', adminController.uploadPosition.single('image_position'), adminController.updatePosition);
// // router.delete('/position/:id', adminController.deletePosition);

// // // Mentors
// // router.get('/mentors/stats', adminController.getMentorStats);
// // router.get('/mentors/pending', adminController.listPendingMentors);
// // router.patch('/mentors/:mentorId/review', adminController.reviewMentor);

// // // Users
// // router.get('/users', adminController.getAllUsers);
// // router.post('/create-user', adminController.upload.single('profile_image'), adminController.createRole);

// // module.exports = router;



// // routes/admin.routes.js
// const express = require('express');
// const router = express.Router();
// const adminController = require('../controllers/admin.controller');
// const authMiddleware = require('../middleware/auth.middleware');

// // ✅ Protect ALL admin routes
// router.use(authMiddleware(['admin']));

// // Profile Update (Matches frontend: /admin/profile/update)
// router.put('/profile/update', adminController.upload.single('profile_image'), adminController.updateProfile); // ✅ Added

// // Dashboard
// router.get('/dashboard', adminController.getFullDashboard);

// // ... (Rest of your routes: Industry, Position, Mentors, Users) ...
// // Industry
// router.get('/industry', adminController.getIndustries);
// router.post('/industry', adminController.createIndustry);
// router.put('/industry/:id', adminController.updateIndustry);
// router.delete('/industry/:id', adminController.deleteIndustry);

// // Position
// router.get('/position', adminController.getPositions);
// // ✅ ត្រូវដូរទៅប្រើ `uploadPosition` វិញ! (កុំភ្លេចថែម .single(...))
// router.post('/position', adminController.uploadPosition.single('image_position'), adminController.createPosition);
// router.put('/position/:id', adminController.uploadPosition.single('image_position'), adminController.updatePosition);
// router.delete('/position/:id', adminController.deletePosition);

// // Mentors
// router.get('/mentors/stats', adminController.getMentorStats);
// router.get('/mentors/pending', adminController.listPendingMentors);
// router.patch('/mentors/:mentorId/review', adminController.reviewMentor);

// // Users
// router.get('/users', adminController.getAllUsers);
// router.post('/create-user', adminController.upload.single('profile_image'), adminController.createRole);
// router.get('/user/:id', adminController.getUserDetails);
// router.delete('/user/:id', adminController.deleteUser);





// // routes/admin.routes.js
// const express = require('express');
// const router = express.Router();
// const adminController = require('../controllers/admin.controller');
// const authMiddleware = require('../middleware/auth.middleware'); // Make sure path is correct

// // ✅ Protect ALL admin routes
// // This line automatically checks if the user is an 'admin' for ALL routes below
// router.use(authMiddleware(['admin'])); 

// // Profile Update
// router.put('/profile/update', adminController.upload.single('profile_image'), adminController.updateProfile);

// // Dashboard
// router.get('/dashboard', adminController.getFullDashboard);

// // Industry
// router.get('/industry', adminController.getIndustries);
// router.post('/industry', adminController.createIndustry);
// router.put('/industry/:id', adminController.updateIndustry);
// router.delete('/industry/:id', adminController.deleteIndustry);

// // Position
// router.get('/position', adminController.getPositions);
// router.post('/position', adminController.uploadPosition.single('image_position'), adminController.createPosition);
// router.put('/position/:id', adminController.uploadPosition.single('image_position'), adminController.updatePosition);
// router.delete('/position/:id', adminController.deletePosition);

// // Mentors
// router.get('/mentors/stats', adminController.getMentorStats);
// router.get('/mentors/pending', adminController.listPendingMentors);
// router.patch('/mentors/:mentorId/review', adminController.reviewMentor);

// // Users
// router.get('/users', adminController.getAllUsers);
// router.post('/create-user', adminController.upload.single('profile_image'), adminController.createRole);

// router.get('/user/:id', adminController.getUserDetails);
// router.delete('/user/:id', adminController.deleteUser);

// module.exports = router;



const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');

// Import Separate Controllers
const dashboardCtrl = require('../controllers/admin/dashboard.controller');
const userCtrl = require('../controllers/admin/user.controller');
const mentorCtrl = require('../controllers/admin/mentor.controller');
const categoryCtrl = require('../controllers/admin/category.controller');

// Import Upload Middleware
const uploadMiddleware = require('../middleware/upload.middleware');

// ✅ Protect ALL admin routes
router.use(authMiddleware(['admin'])); 

// --- Dashboard & Profile ---
router.get('/dashboard', dashboardCtrl.getFullDashboard);
router.put('/profile/update', uploadMiddleware.uploadProfile.single('profile_image'), dashboardCtrl.updateProfile);

// --- Industry ---
router.get('/industry', categoryCtrl.getIndustries);
router.post('/industry', categoryCtrl.createIndustry);
router.put('/industry/:id', categoryCtrl.updateIndustry);
router.delete('/industry/:id', categoryCtrl.deleteIndustry);

// --- Position ---
router.get('/position', categoryCtrl.getPositions);
router.post('/position', uploadMiddleware.uploadPosition.single('image_position'), categoryCtrl.createPosition);
router.put('/position/:id', uploadMiddleware.uploadPosition.single('image_position'), categoryCtrl.updatePosition);
router.delete('/position/:id', categoryCtrl.deletePosition);

// --- Mentors ---
router.get('/mentors/stats', mentorCtrl.getMentorStats);
router.get('/mentors/pending', mentorCtrl.listPendingMentors);
router.patch('/mentors/:mentorId/review', mentorCtrl.reviewMentor);

// --- Users ---
router.get('/users', userCtrl.getAllUsers);
router.post('/create-user', uploadMiddleware.uploadProfile.single('profile_image'), userCtrl.createRole);
router.get('/user/:id', userCtrl.getUserDetails);
router.delete('/user/:id', userCtrl.deleteUser);

module.exports = router;