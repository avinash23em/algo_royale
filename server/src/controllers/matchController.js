const Match = require('../models/Match');
const User = require('../models/User');

// Get match result by ID
const getMatchResult = async (req, res) => {
  try {
    const { matchId } = req.params;
    
    console.log('Fetching match result for ID:', matchId);
    
    const match = await Match.findById(matchId)
      .populate('problemId', 'title difficulty')
      .populate('player1UserId', 'username avatar')
      .populate('player2UserId', 'username avatar');
    
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    // Format response
    const result = {
      matchId: match._id,
      roomId: match.roomId,
      winner: match.winner,
      player1Username: match.player1,
      player2Username: match.player2,
      player1Progress: match.player1Progress,
      player2Progress: match.player2Progress,
      player1Verdict: match.player1Submission?.verdict || 'No Submission',
      player2Verdict: match.player2Submission?.verdict || 'No Submission',
      player1XP: match.player1XP,
      player2XP: match.player2XP,
      problem: match.problemTitle,
      problemId: match.problemId,
      difficulty: match.difficulty,
      duration: match.duration,
      startTime: match.startTime,
      endTime: match.endTime,
      status: match.status
    };
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching match result:', error);
    res.status(500).json({ error: 'Failed to fetch match result' });
  }
};

// Get user's match history
const getUserMatches = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Find all matches where user participated
    const matches = await Match.find({
      $or: [
        { player1: user.username },
        { player2: user.username }
      ],
      status: 'completed'
    })
    .sort({ endTime: -1 })
    .limit(20)
    .populate('problemId', 'title difficulty');
    
    const formattedMatches = matches.map(match => ({
      matchId: match._id,
      opponent: match.player1 === user.username ? match.player2 : match.player1,
      problem: match.problemTitle,
      difficulty: match.difficulty,
      result: match.winner === 'draw' ? 'draw' : 
              (match.player1 === user.username && match.winner === 'player1') ||
              (match.player2 === user.username && match.winner === 'player2') ? 'win' : 'loss',
      xpGained: match.player1 === user.username ? match.player1XP : match.player2XP,
      endTime: match.endTime
    }));
    
    res.json(formattedMatches);
  } catch (error) {
    console.error('Error fetching user matches:', error);
    res.status(500).json({ error: 'Failed to fetch match history' });
  }
};

// Get latest match for user
const getLatestMatch = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Find the most recent completed match
    const match = await Match.findOne({
      $or: [
        { player1: user.username },
        { player2: user.username }
      ],
      status: 'completed'
    })
    .sort({ endTime: -1 })
    .populate('problemId', 'title difficulty');
    
    if (!match) {
      return res.status(404).json({ error: 'No matches found' });
    }
    
    // Format response
    const result = {
      matchId: match._id,
      roomId: match.roomId,
      winner: match.winner,
      player1Username: match.player1,
      player2Username: match.player2,
      player1Progress: match.player1Progress,
      player2Progress: match.player2Progress,
      player1Verdict: match.player1Submission?.verdict || 'No Submission',
      player2Verdict: match.player2Submission?.verdict || 'No Submission',
      player1XP: match.player1XP,
      player2XP: match.player2XP,
      problem: match.problemTitle,
      problemId: match.problemId,
      difficulty: match.difficulty,
      duration: match.duration,
      startTime: match.startTime,
      endTime: match.endTime,
      status: match.status
    };
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching latest match:', error);
    res.status(500).json({ error: 'Failed to fetch latest match' });
  }
};

module.exports = {
  getMatchResult,
  getUserMatches,
  getLatestMatch
};
