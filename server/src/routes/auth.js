const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=auth_failed`,
    session: false 
  }),
  authController.googleAuthSuccess
);

// Protected routes (require authentication)
router.get('/me', authenticateToken, authController.getCurrentUser);
router.put('/username', authenticateToken, authController.updateUsername);
router.get('/stats', authenticateToken, authController.getUserStats);
router.get('/submissions', authenticateToken, authController.getSubmissionHistory);
router.get('/battles', authenticateToken, authController.getBattleHistory);
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;
