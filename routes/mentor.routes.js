const express = require('express');
const router = express.Router();
// ✅ ចង្អុលទៅ Folder ថ្មី
const mentorController = require('../controllers/admin/mentor.controller');
const authMiddleware = require('../middleware/auth.middleware');

const ensureHandler = (fn) => (typeof fn === 'function' ? fn : (req, res) => res.status(501).json({ message: 'Not implemented' }));

router.use(authMiddleware(['admin']));

// ✅ ហៅ Function ដែលមាននៅក្នុង mentor.controller.js ថ្មី
router.get('/', ensureHandler(mentorController.listMentors));
router.get('/:id', ensureHandler(mentorController.getMentorById));
router.put('/:id', ensureHandler(mentorController.updateMentor));
router.delete('/:id', ensureHandler(mentorController.deleteMentor));

// Routes ចាស់ៗ (ទុកក៏បាន ដកក៏បាន បើលែងប្រើ)
router.get('/stats', ensureHandler(mentorController.getMentorStats));
router.get('/pending', ensureHandler(mentorController.listPendingMentors));
router.patch('/:mentorId/review', ensureHandler(mentorController.reviewMentor));

module.exports = router;