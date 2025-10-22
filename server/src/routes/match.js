const express = require('express');
const router = express.Router();
const { getMatchResult, getUserMatches, getLatestMatch } = require('../controllers/matchController');
const { authenticateToken } = require('../middleware/auth');

// Get specific match result by ID (no auth required for viewing results)
router.get('/result/:matchId', getMatchResult);

// Get user's match history (requires auth)
router.get('/history', authenticateToken, getUserMatches);

// Get user's latest match (requires auth)
router.get('/latest', authenticateToken, getLatestMatch);

module.exports = router;
