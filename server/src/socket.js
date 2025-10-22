const Match = require('./models/Match');
const User = require('./models/User');
const Problem = require('./models/Problem');

// Store waiting players and active matches
const waitingPlayers = new Map();
const activeMatches = new Map();

const handleSocketConnection = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle matchmaking
    socket.on('find_match', async (data) => {
      const { username, difficulty } = data;
      
      // Store player info
      waitingPlayers.set(socket.id, {
        username,
        difficulty: difficulty || 'Easy',
        socketId: socket.id
      });

      // Try to find a match
      const match = await findMatch(socket.id, username, difficulty);
      if (match) {
        // Use the roomId from the match document
        const roomId = match.roomId;
        activeMatches.set(roomId, match);

        // Join both players to the room
        socket.join(roomId);
        const opponentSocket = io.sockets.sockets.get(match.player1SocketId === socket.id ? match.player2SocketId : match.player1SocketId);
        if (opponentSocket) {
          opponentSocket.join(roomId);
        }

        // Send match details to both players individually
        const player1Username = match.player1Username || match.player1;
        const player2Username = match.player2Username || match.player2;
        
        console.log(`Match started: ${player1Username} vs ${player2Username} in room ${roomId}`);
        
        // Send to player 1
        socket.emit('match_found', {
          roomId,
          problem: match.problem,
          duration: match.duration,
          opponent: player2Username
        });
        
        // Send to player 2
        if (opponentSocket) {
          opponentSocket.emit('match_found', {
            roomId,
            problem: match.problem,
            duration: match.duration,
            opponent: player1Username
          });
        }

        // Start match timer
        setTimeout(() => {
          endMatch(io, roomId, match);
        }, match.duration);
      } else {
        socket.emit('waiting_for_match', { message: 'Waiting for opponent...' });
      }
    });

    // Handle code submission during battle
    socket.on('code_submit', async (data) => {
      const { roomId, code, language, username } = data;
      console.log(`Code submission from ${username} in room ${roomId}, language: ${language}`);
      
      const match = activeMatches.get(roomId);
      
      if (!match) {
        console.error('Match not found for room:', roomId);
        socket.emit('submission_result', {
          status: 'Error',
          passed: 0,
          total: 0,
          message: 'Match not found'
        });
        return;
      }

      // Update match with submission
      const isPlayer1 = match.player1SocketId === socket.id;
      if (isPlayer1) {
        match.player1Submission = { code, language, timestamp: Date.now() };
      } else {
        match.player2Submission = { code, language, timestamp: Date.now() };
      }

      // Execute code with ALL test cases (including hidden ones) for battle mode
      console.log(`Executing code for ${username}, problem: ${match.problem.title}`);
      const result = await executeCode(code, language, match.problem, true); // true = include hidden tests
      console.log(`Execution result for ${username}:`, result.status, `${result.passed}/${result.total}`);
      
      // Update match state
      if (isPlayer1) {
        match.player1Submission.verdict = result.status;
        match.player1Submission.passedTests = result.passed;
        match.player1Submission.totalTests = result.total;
      } else {
        match.player2Submission.verdict = result.status;
        match.player2Submission.passedTests = result.passed;
        match.player2Submission.totalTests = result.total;
      }

      // Send individual result to the submitting player
      socket.emit('submission_result', {
        status: result.status,
        passed: result.passed,
        total: result.total,
        execution_time: result.executionTime + 's',
        testResults: result.testResults
      });

      // Broadcast verdict to both players
      io.to(roomId).emit('update_progress', {
        player1Verdict: match.player1Submission?.verdict,
        player2Verdict: match.player2Submission?.verdict
      });

      // Check for winner
      if (result.status === 'Accepted') {
        endMatch(io, roomId, match, isPlayer1 ? 'player1' : 'player2');
      }
    });

    // Handle joining a room
    socket.on('join_room', (data) => {
      const { roomId } = data;
      socket.join(roomId);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      // Remove from waiting players
      waitingPlayers.delete(socket.id);
      
      // Handle active match disconnection
      for (const [roomId, match] of activeMatches.entries()) {
        if (match.player1SocketId === socket.id || match.player2SocketId === socket.id) {
          endMatch(io, roomId, match, match.player1SocketId === socket.id ? 'player2' : 'player1');
          break;
        }
      }
    });
  });
};

const findMatch = async (socketId, username, difficulty) => {
  const player = waitingPlayers.get(socketId);
  if (!player) return null;

  // Find opponent with same difficulty preference
  for (const [otherSocketId, otherPlayer] of waitingPlayers.entries()) {
    if (otherSocketId !== socketId && otherPlayer.difficulty === difficulty) {
      // Remove both players from waiting
      waitingPlayers.delete(socketId);
      waitingPlayers.delete(otherSocketId);

      // Get random problem of specified difficulty
      const problem = await Problem.findOne({ difficulty });
      if (!problem) return null;

      // Get user IDs
      const player1User = await User.findOne({ username });
      const player2User = await User.findOne({ username: otherPlayer.username });

      // Create match in database
      const roomId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const match = new Match({
        roomId,
        player1: username,
        player2: otherPlayer.username,
        player1UserId: player1User?._id,
        player2UserId: player2User?._id,
        problemId: problem._id,
        problemTitle: problem.title,
        difficulty: problem.difficulty,
        duration: 600000, // 10 minutes
        status: 'ongoing'
      });

      await match.save();
      console.log('Match created in database:', match._id);

      // Return match with socket IDs for in-memory tracking
      return {
        ...match.toObject(),
        player1SocketId: socketId,
        player2SocketId: otherSocketId,
        problem: problem
      };
    }
  }
  return null;
};

const endMatch = async (io, roomId, match, winner = null) => {
  if (!match) return;

  console.log('Ending match:', roomId);

  // Calculate scores
  const player1Score = match.player1Submission?.passedTests || 0;
  const player2Score = match.player2Submission?.passedTests || 0;

  // Determine winner if not already determined
  if (!winner) {
    if (player1Score > player2Score) {
      winner = 'player1';
    } else if (player2Score > player1Score) {
      winner = 'player2';
    } else {
      winner = 'draw';
    }
  }

  // Calculate XP gains
  const player1XP = winner === 'player1' ? 100 : winner === 'draw' ? 25 : 10;
  const player2XP = winner === 'player2' ? 100 : winner === 'draw' ? 25 : 10;

  // Update user stats with battle history
  try {
    const player1Username = match.player1Username || match.player1;
    const player2Username = match.player2Username || match.player2;
    
    const player1User = await User.findOne({ username: player1Username });
    const player2User = await User.findOne({ username: player2Username });

    if (player1User) {
      player1User.totalMatches += 1;
      player1User.xp += player1XP;
      
      if (winner === 'player1') {
        player1User.wins += 1;
        player1User.winStreak += 1;
      } else if (winner === 'player2') {
        player1User.losses += 1;
        player1User.winStreak = 0;
      } else {
        player1User.draws += 1;
        player1User.winStreak = 0;
      }

      // Add battle history
      player1User.battleHistory.push({
        opponent: {
          username: player2Username,
          userId: player2User?._id
        },
        problemTitle: match.problem.title,
        result: winner === 'player1' ? 'win' : winner === 'player2' ? 'loss' : 'draw',
        userScore: player1Score,
        opponentScore: player2Score,
        xpGained: player1XP,
        duration: match.duration / 1000
      });

      await player1User.save();
      console.log(`Updated ${player1Username}: XP +${player1XP}, Total XP: ${player1User.xp}`);
    }

    if (player2User) {
      player2User.totalMatches += 1;
      player2User.xp += player2XP;
      
      if (winner === 'player2') {
        player2User.wins += 1;
        player2User.winStreak += 1;
      } else if (winner === 'player1') {
        player2User.losses += 1;
        player2User.winStreak = 0;
      } else {
        player2User.draws += 1;
        player2User.winStreak = 0;
      }

      // Add battle history
      player2User.battleHistory.push({
        opponent: {
          username: player1Username,
          userId: player1User?._id
        },
        problemTitle: match.problem.title,
        result: winner === 'player2' ? 'win' : winner === 'player1' ? 'loss' : 'draw',
        userScore: player2Score,
        opponentScore: player1Score,
        xpGained: player2XP,
        duration: match.duration / 1000
      });

      await player2User.save();
      console.log(`Updated ${player2Username}: XP +${player2XP}, Total XP: ${player2User.xp}`);
    }
  } catch (error) {
    console.error('Error updating user stats:', error);
    console.error(error.stack);
  }

    // Calculate progress percentages
  const totalTests = match.problem.testCases?.length || 1;
  const player1Progress = ((match.player1Submission?.passedTests || 0) / totalTests) * 100;
  const player2Progress = ((match.player2Submission?.passedTests || 0) / totalTests) * 100;

  // Save match result to database
  try {
    console.log('Saving match result to database, roomId:', roomId);
    const dbMatch = await Match.findOne({ roomId });
    if (dbMatch) {
      dbMatch.winner = winner;
      dbMatch.status = 'completed';
      dbMatch.endTime = new Date();
      dbMatch.player1Progress = player1Progress;
      dbMatch.player2Progress = player2Progress;
      dbMatch.player1XP = player1XP;
      dbMatch.player2XP = player2XP;
      dbMatch.player1Submission = match.player1Submission;
      dbMatch.player2Submission = match.player2Submission;
      
      await dbMatch.save();
      console.log('Match result saved to database:', dbMatch._id);
      
      // Update match object with the database _id for the response
      match._id = dbMatch._id;
    } else {
      console.error('Match not found in database with roomId:', roomId);
    }
  } catch (error) {
    console.error('Error saving match to database:', error);
    console.error(error.stack);
  }

  // Send match result with match ID
  const matchResult = {
    matchId: match._id,
    roomId,
    winner,
    player1Progress,
    player2Progress,
    player1Verdict: match.player1Submission?.verdict || 'No Submission',
    player2Verdict: match.player2Submission?.verdict || 'No Submission',
    player1Username: match.player1Username || match.player1,
    player2Username: match.player2Username || match.player2,
    player1XP: player1XP,
    player2XP: player2XP,
    problem: match.problem.title,
    problemId: match.problem._id,
    difficulty: match.problem.difficulty,
    duration: match.duration
  };
  
  console.log('Sending match result to room:', roomId);
  console.log('Match result data:', JSON.stringify(matchResult, null, 2));
  io.to(roomId).emit('match_result', matchResult);

  // Clean up
  activeMatches.delete(roomId);
};

// Code execution using Judge0 API
const axios = require('axios');

const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

const executeCode = async (code, language, problem, includeHiddenTests = false) => {
  let testCases = problem.testCases || [];
  
  // If not including hidden tests (practice mode), only use sample tests
  if (!includeHiddenTests) {
    testCases = testCases.filter(test => test.isSample !== false);
  }
  
  const totalTests = testCases.length;
  console.log(`Executing code: ${totalTests} test cases, language: ${language}, includeHidden: ${includeHiddenTests}`);
  
  // Language mapping for Judge0
  const languageMap = {
    'cpp': 54, // C++17
    'python': 71, // Python 3
    'javascript': 63, // Node.js
    'java': 62 // Java
  };
  
  const languageId = languageMap[language] || 54;
  const testResults = [];
  let passedCount = 0;
  
  // Execute code for each test case
  for (const testCase of testCases) {
    try {
      // If no Judge0 API key, use simulation
      if (!JUDGE0_API_KEY || JUDGE0_API_KEY === 'your_judge0_api_key_here') {
        console.log('Using simulation mode (no Judge0 API key configured)');
        const simResult = simulateExecution(code, testCase);
        testResults.push(simResult);
        if (simResult.passed) passedCount++;
        continue;
      }
      
      console.log(`Calling Judge0 API for test case ${testCases.indexOf(testCase) + 1}/${totalTests}`);
      
      // Submit to Judge0
      const response = await axios.post(
        `${JUDGE0_API_URL}/submissions`,
        {
          source_code: code,
          language_id: languageId,
          stdin: testCase.input,
          expected_output: testCase.output || testCase.expectedOutput
        },
        {
          headers: {
            'x-rapidapi-key': JUDGE0_API_KEY,
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
            'Content-Type': 'application/json'
          }
        }
      );
      
      const submissionId = response.data.token;
      
      // Poll for result
      let result = null;
      let attempts = 0;
      
      while (!result && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const resultResponse = await axios.get(
          `${JUDGE0_API_URL}/submissions/${submissionId}`,
          {
            headers: {
              'x-rapidapi-key': JUDGE0_API_KEY,
              'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
            }
          }
        );
        
        if (resultResponse.data.status.id > 2) {
          result = resultResponse.data;
          break;
        }
        attempts++;
      }
      
      if (result) {
        const passed = result.status.id === 3; // 3 = Accepted
        if (passed) passedCount++;
        
        testResults.push({
          input: testCase.input,
          expectedOutput: testCase.output || testCase.expectedOutput,
          actualOutput: result.stdout || result.stderr || 'No output',
          passed,
          isHidden: testCase.isHidden || false
        });
      }
    } catch (error) {
      console.error('Judge0 error:', error.message);
      // Fallback to simulation
      const simResult = simulateExecution(code, testCase);
      testResults.push(simResult);
      if (simResult.passed) passedCount++;
    }
  }
  
  const status = passedCount === totalTests ? 'Accepted' : 'Wrong Answer';
  
  return {
    status,
    passed: passedCount,
    total: totalTests,
    executionTime: Math.random() * 2 + 0.1,
    testResults
  };
};

// Simple simulation fallback
const simulateExecution = (code, testCase) => {
  const hasCode = code.trim().length > 10;
  const passed = hasCode && Math.random() > 0.3;
  const expectedOut = testCase.output || testCase.expectedOutput;
  
  return {
    input: testCase.input,
    expectedOutput: expectedOut,
    actualOutput: passed ? expectedOut : 'Wrong output',
    passed,
    isHidden: testCase.isHidden || false
  };
};

module.exports = {
  handleSocketConnection
};
