// // carrear-server/routes/auth.routes.js
// const express = require('express');
// const router = express.Router();
// const authController = require('../controllers/auth.controller');
// const authMiddleware = require('../middleware/auth.middleware');

// // Public routes
// router.post('/register/user', authController.registerUser);
// router.post('/register/mentor', authController.registerMentor);
// router.get('/verify-email', authController.verifyEmail);
// router.post('/login', authController.login);
// router.post('/token/refresh', authController.refreshToken); // Refresh token
// router.post('/logout', authController.logout);

// // Example of a protected route (e.g., fetching current user info)
// router.get('/me', authMiddleware, authController.getMe); 

// module.exports = router;



// const express = require('express');
// const router = express.Router();
// const authController = require('../controllers/auth.controller');
// const authMiddleware = require('../middleware/auth.middleware');

// // Public routes (only use controller functions that are actually exported)
// router.post('/register/mentor', authController.registerMentor);
// router.post('/login', authController.login);
// router.post('/token/refresh', authController.refreshToken);
// router.post('/forgot-password', authController.forgotPassword);
// router.post('/reset-password', authController.resetPassword);

// // Protected
// router.get('/auth/me', authMiddleware, authController.getMe);
// router.post('/update-password', authMiddleware, authController.updatePassword);

// module.exports = router;




const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/register/mentor', authController.registerMentor);
router.post('/login', authController.login);
router.post('/token/refresh', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/auth/me', authMiddleware(), authController.getMe); // Protected
router.post('/update-password', authMiddleware(), authController.updatePassword);
router.get('/verify-email', authController.verifyEmail);
router.post('/logout', authController.logout);

module.exports = router;