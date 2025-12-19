const express = require('express');
const router = express.Router();
const mentorController = require('../controllers/mentor.controller');

const ensureHandler = (fn) => (typeof fn === 'function' ? fn : (req, res) => res.status(501).json({ message: 'Not implemented' }));

router.get('/', ensureHandler(mentorController.listMentors));
router.get('/:id', ensureHandler(mentorController.getMentorById));
router.post('/', ensureHandler(mentorController.createMentor));
router.put('/:id', ensureHandler(mentorController.updateMentor));
router.delete('/:id', ensureHandler(mentorController.deleteMentor));

module.exports = router;