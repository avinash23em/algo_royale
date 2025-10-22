const express = require('express');
const router = express.Router();
const { getLeaderboard, getUserStats } = require('../controllers/leaderboardController');

// GET /api/leaderboard - Get top players
router.get('/', getLeaderboard);

// GET /api/leaderboard/:username - Get specific user stats
router.get('/:username', getUserStats);

module.exports = router;

