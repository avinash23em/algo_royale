const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email,
      username: user.username 
    },
    process.env.JWT_SECRET || 'algo-royale-secret-key-change-in-production',
    { expiresIn: '30d' }
  );
};

// Google OAuth Success
exports.googleAuthSuccess = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=auth_failed`);
    }

    const token = generateToken(req.user);
    
    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/success?token=${token}`);
  } catch (error) {
    console.error('Auth success error:', error);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=server_error`);
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-__v')
      .lean();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update username
exports.updateUsername = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || username.trim().length === 0) {
      return res.status(400).json({ message: 'Username is required' });
    }

    // Check if username is already taken
    const existingUser = await User.findOne({ 
      username: username.trim(),
      _id: { $ne: req.user.id }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { username: username.trim() },
      { new: true }
    ).select('-__v');

    res.json({ user });
  } catch (error) {
    console.error('Update username error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user stats
exports.getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('xp rank totalMatches wins losses draws winStreak bestWinStreak practiceProblemsSolved problemsSolvedByDifficulty totalCodeSubmissions totalLinesOfCode favoriteLanguage languageStats')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate additional stats
    const winRate = user.totalMatches > 0 
      ? ((user.wins / user.totalMatches) * 100).toFixed(1) 
      : 0;

    res.json({
      ...user,
      winRate
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get submission history
exports.getSubmissionHistory = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const user = await User.findById(req.user.id)
      .select('submissions')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Sort by most recent and paginate
    const submissions = user.submissions
      .sort((a, b) => b.submittedAt - a.submittedAt)
      .slice(offset, offset + parseInt(limit));

    res.json({
      submissions,
      total: user.submissions.length
    });
  } catch (error) {
    console.error('Get submission history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get battle history
exports.getBattleHistory = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const user = await User.findById(req.user.id)
      .select('battleHistory')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Sort by most recent and paginate
    const battles = user.battleHistory
      .sort((a, b) => b.completedAt - a.completedAt)
      .slice(offset, offset + parseInt(limit));

    res.json({
      battles,
      total: user.battleHistory.length
    });
  } catch (error) {
    console.error('Get battle history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Logout
exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
};
