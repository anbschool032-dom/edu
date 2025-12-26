// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public routes
router.post('/login', authController.login);
router.post('/register/mentor', authController.registerMentor);
router.post('/token/refresh', authController.refreshToken);
router.get('/verify-email', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword); // Input Email
router.post('/reset-password', authController.resetPassword);

// Protected routes (Require Login)
router.use(authMiddleware()); // Apply middleware to all routes below

router.get('/me', authController.getMe);
router.post('/logout', authController.logout);
router.post('/update-password', authController.updatePassword); // ✅ Added

module.exports = router;