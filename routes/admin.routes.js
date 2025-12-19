// const express = require('express');
// const router = express.Router();
// const adminController = require('../controllers/admin.controller');
// const authMiddleware = require('../middleware/auth.middleware');

// // =======================
// // INDUSTRY ROUTES
// // =======================
// router.get('/industry', (req, res, next) => {
//   console.log('✅ HIT /industry');
//   next();
// }, adminController.getIndustries);

// router.get('/industry', adminController.getIndustries);
// router.post('/industry', adminController.createIndustry);
// router.put('/industry/:id', adminController.updateIndustry);
// router.delete('/industry/:id', adminController.deleteIndustry);

// // =======================
// // POSITION ROUTES
// // =======================
// router.get('/position', adminController.getPositions);

// router.post(
//   '/position',
//   adminController.upload.single('image_position'),
//   adminController.createPosition
// );

// router.put(
//   '/position/:id',
//   adminController.upload.single('image_position'),
//   adminController.updatePosition
// );

// router.delete('/position/:id', adminController.deletePosition);

// // =======================
// // OTHER ADMIN ROUTES
// // =======================
// router.post('/create-initial-admin', adminController.createInitialAdmin);
// // router.post('/review-mentor', adminController.reviewMentor);
// router.patch(
//   '/mentors/:mentorId/review',
//   adminController.reviewMentor
// );

// router.get('/mentors/pending', adminController.listPendingMentors);

// // router.post(
// //   '/create-user',
// //   adminController.upload.single('profile_image'),
// //   adminController.createRole
// // );



// router.post(
//   '/create-user',
//   authMiddleware,                     // ✅ attach logged-in user
//   adminController.upload.single('profile_image'),
//   adminController.createRole
// );


// router.get('/users', adminController.getAllUsers);
// router.get('/mentors/stats', adminController.getMentorStats);

// module.exports = router;



const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Apply auth and role check to all admin routes
router.use(authMiddleware(['admin']));

router.post('/create-initial-admin', adminController.createInitialAdmin);
router.get('/industry', adminController.getIndustries);
router.post('/industry', adminController.createIndustry);
router.put('/industry/:id', adminController.updateIndustry);
router.delete('/industry/:id', adminController.deleteIndustry);

router.get('/position', adminController.getPositions);
router.post(
  '/position',
  adminController.upload.single('image_position'),
  adminController.createPosition
);
router.put(
  '/position/:id',
  adminController.upload.single('image_position'),
  adminController.updatePosition
);
router.delete('/position/:id', adminController.deletePosition);

router.patch('/mentors/:mentorId/review', adminController.reviewMentor);
router.get('/mentors/pending', adminController.listPendingMentors);
router.get('/mentors/stats', adminController.getMentorStats);

router.post(
  '/create-user',
  adminController.upload.single('profile_image'),
  adminController.createRole
);
router.get('/users', adminController.getAllUsers);

module.exports = router;