const User = require('../models/User');

const getLeaderboard = async (req, res) => {
  try {
    console.log('Fetching leaderboard...');
    
    // Check if User model is available
    if (!User) {
      throw new Error('User model not found');
    }
    
    const users = await User.find({})
      .sort({ xp: -1 })
      .limit(10)
      .select('username xp rank totalMatches wins losses practiceProblemsSolved')
      .lean()
      .exec();
    
    console.log(`Found ${users?.length || 0} users`);
    
    // If no users found, return empty array
    if (!users || users.length === 0) {
      console.log('No users in database yet');
      return res.json([]);
    }
    
    // Ensure we always return an array with safe defaults
    const leaderboard = users.map(user => ({
      _id: user._id?.toString() || '',
      username: user.username || 'Unknown',
      xp: Number(user.xp) || 0,
      rank: user.rank || 'Unranked',
      totalMatches: Number(user.totalMatches) || 0,
      wins: Number(user.wins) || 0,
      losses: Number(user.losses) || 0,
      practiceProblemsSolved: Number(user.practiceProblemsSolved) || 0
    }));
    
    console.log('Sending leaderboard:', leaderboard.length, 'players');
    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: error.message, 
      details: 'Failed to fetch leaderboard. Please check server logs.' 
    });
  }
};

const getUserStats = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getLeaderboard,
  getUserStats
};

