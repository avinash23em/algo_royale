const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  player1: {
    type: String,
    required: true
  },
  player2: {
    type: String,
    required: true
  },
  player1UserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  player2UserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  problemTitle: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  winner: {
    type: String,
    enum: ['player1', 'player2', 'draw', 'ongoing'],
    default: 'ongoing'
  },
  player1Progress: {
    type: Number,
    default: 0
  },
  player2Progress: {
    type: Number,
    default: 0
  },
  player1Submission: {
    code: String,
    language: String,
    verdict: String,
    passedTests: Number,
    totalTests: Number,
    executionTime: Number,
    timestamp: Date
  },
  player2Submission: {
    code: String,
    language: String,
    verdict: String,
    passedTests: Number,
    totalTests: Number,
    executionTime: Number,
    timestamp: Date
  },
  player1XP: {
    type: Number,
    default: 0
  },
  player2XP: {
    type: Number,
    default: 0
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  duration: {
    type: Number,
    default: 600000 // 10 minutes in milliseconds
  },
  status: {
    type: String,
    enum: ['ongoing', 'completed', 'cancelled'],
    default: 'ongoing'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Match', matchSchema);

