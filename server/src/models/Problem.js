const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  statement: {
    type: String,
    required: true
  },
  inputFormat: {
    type: String,
    required: true
  },
  outputFormat: {
    type: String,
    required: true
  },
  constraints: {
    type: String,
    required: true
  },
  sampleInput: {
    type: String,
    required: true
  },
  sampleOutput: {
    type: String,
    required: true
  },
  testCases: [{
    input: String,
    output: String
  }],
  timeLimit: {
    type: Number,
    default: 1000 // milliseconds
  },
  memoryLimit: {
    type: Number,
    default: 256 // MB
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Problem', problemSchema);

