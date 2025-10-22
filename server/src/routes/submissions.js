const express = require('express');
const router = express.Router();
const { submitCode, getLastSubmission } = require('../controllers/submissionController');
const { optionalAuth, authenticateToken } = require('../middleware/auth');

// POST /api/submissions - Submit code for execution (optional auth)
router.post('/', optionalAuth, submitCode);

// GET /api/submissions/last/:problemId - Get last submission for a problem (requires auth)
router.get('/last/:problemId', authenticateToken, getLastSubmission);

module.exports = router;

