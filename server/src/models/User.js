const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  problemTitle: String,
  code: String,
  language: String,
  status: {
    type: String,
    enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compilation Error']
  },
  runtime: Number,
  memory: Number,
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

const battleHistorySchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match'
  },
  opponent: {
    username: String,
    userId: mongoose.Schema.Types.ObjectId
  },
  problemTitle: String,
  result: {
    type: String,
    enum: ['win', 'loss', 'draw']
  },
  userScore: Number,
  opponentScore: Number,
  xpGained: Number,
  duration: Number, // in seconds
  completedAt: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new mongoose.Schema({
  // Google OAuth fields
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  displayName: String,
  avatar: String, // Google profile picture URL
  
  // Game Stats
  xp: {
    type: Number,
    default: 0
  },
  rank: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
    default: 'Bronze'
  },
  
  // Battle Stats
  totalMatches: {
    type: Number,
    default: 0
  },
  wins: {
    type: Number,
    default: 0
  },
  losses: {
    type: Number,
    default: 0
  },
  draws: {
    type: Number,
    default: 0
  },
  winStreak: {
    type: Number,
    default: 0
  },
  bestWinStreak: {
    type: Number,
    default: 0
  },
  
  // Practice Stats
  practiceProblemsSolved: {
    type: Number,
    default: 0
  },
  problemsSolvedByDifficulty: {
    easy: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    hard: { type: Number, default: 0 }
  },
  
  // Submission History
  submissions: [submissionSchema],
  
  // Battle History
  battleHistory: [battleHistorySchema],
  
  // Solved Problems (to track unique problems)
  solvedProblems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem'
  }],
  
  // Activity Stats
  lastActive: {
    type: Date,
    default: Date.now
  },
  totalCodeSubmissions: {
    type: Number,
    default: 0
  },
  totalLinesOfCode: {
    type: Number,
    default: 0
  },
  favoriteLanguage: String,
  languageStats: {
    type: Map,
    of: Number,
    default: {}
  }
}, {
  timestamps: true
});

// Update rank based on XP
userSchema.pre('save', function(next) {
  if (this.xp >= 5000) {
    this.rank = 'Platinum';
  } else if (this.xp >= 2500) {
    this.rank = 'Gold';
  } else if (this.xp >= 1000) {
    this.rank = 'Silver';
  } else {
    this.rank = 'Bronze';
  }
  
  // Update best win streak
  if (this.winStreak > this.bestWinStreak) {
    this.bestWinStreak = this.winStreak;
  }
  
  next();
});

// Calculate win rate
userSchema.virtual('winRate').get(function() {
  if (this.totalMatches === 0) return 0;
  return ((this.wins / this.totalMatches) * 100).toFixed(1);
});

// Get total problems solved
userSchema.virtual('totalProblemsSolved').get(function() {
  return this.solvedProblems.length;
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);

