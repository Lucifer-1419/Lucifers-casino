const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const gameController = require('../controllers/gameController');
const { auth } = require('../middleware/auth');

// Validation middleware
const betValidation = [
  body('betAmount').isInt({ min: 1, max: 10000 }).withMessage('Bet amount must be between 1 and 10,000 chips')
];

// Public routes
router.get('/available', gameController.getAvailableGames);

// Protected routes (require authentication)
router.use(auth);

// Slot games
router.post('/slots/fire-joker', betValidation, gameController.playFireJoker);

// Game history
router.get('/history', gameController.getGameHistory);

module.exports = router;
