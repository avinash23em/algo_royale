
const axios = require('axios');
const Problem = require('../models/Problem');
const User = require('../models/User');

// Judge0 API configuration
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

const submitCode = async (req, res) => {
  try {
    const { code, language, problemId, mode } = req.body;
    const userId = req.user?.id; // From auth middleware (optional)

    console.log('=== CODE SUBMISSION ===');
    console.log('Problem ID:', problemId);
    console.log('Language:', language);
    console.log('Mode:', mode);
    console.log('Code length:', code?.length);
    console.log('User ID:', userId);

    // Get problem details
    const problem = await Problem.findById(problemId);
    if (!problem) {
      console.error('Problem not found:', problemId);
      return res.status(404).json({ error: 'Problem not found' });
    }
    
    console.log('Problem found:', problem.title);
    console.log('Test cases:', problem.testCases?.length);

    // Language mapping
    const languageMap = {
      'cpp': 54, // C++17
      'python': 71, // Python 3
      'javascript': 63, // Node.js
      'java': 62 // Java
    };

    const languageId = languageMap[language] || 54;

    // Prepare test cases based on mode
    let testCases = problem.testCases || [];
    
    // If practice mode, only use sample test cases
    if (mode === 'practice') {
      testCases = testCases.filter(test => test.isSample !== false);
    }
    // If battle mode, use all test cases (including hidden ones)
    
    const results = [];

    // Execute code for each test case
    for (const testCase of testCases) {
      try {
        // If no Judge0 API key, use simulation
        if (!JUDGE0_API_KEY || JUDGE0_API_KEY === 'your_judge0_api_key_here') {
          // Simulate code execution for demo
          const simulatedResult = simulateCodeExecution(code, language, testCase);
          results.push(simulatedResult);
          continue;
        }

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
        const maxAttempts = 30;

        while (!result && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const resultResponse = await axios.get(
            `${JUDGE0_API_URL}/submissions/${submissionId}`,
            {
              headers: {
                'x-rapidapi-key': JUDGE0_API_KEY,
                'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
              }
            }
          );

          if (resultResponse.data.status.id > 2) { // Status > 2 means completed
            result = resultResponse.data;
            break;
          }
          attempts++;
        }

        if (result) {
          const passed = result.status.id === 3;
          results.push({
            status: getStatusDescription(result.status.id),
            passed: passed,
            time: result.time,
            memory: result.memory,
            input: testCase.input,
            expectedOutput: testCase.output || testCase.expectedOutput,
            actualOutput: passed ? (testCase.output || testCase.expectedOutput) : (result.stdout?.trim() || result.stderr?.trim() || 'No output'),
            isHidden: testCase.isHidden || false
          });
        } else {
          results.push({
            status: 'Time Limit Exceeded',
            passed: false,
            time: null,
            memory: null,
            input: testCase.input,
            expectedOutput: testCase.output || testCase.expectedOutput,
            actualOutput: 'Time Limit Exceeded',
            isHidden: testCase.isHidden || false
          });
        }
      } catch (error) {
        console.error('Judge0 API error:', error.message);
        // Fallback to simulation
        const simulatedResult = simulateCodeExecution(code, language, testCase);
        results.push(simulatedResult);
      }
    }

    // Calculate final result
    const passedTests = results.filter(r => r.passed).length;
    const totalTests = results.length;
    const allPassed = passedTests === totalTests;

    let verdict = 'Wrong Answer';
    if (allPassed) {
      verdict = 'Accepted';
    } else if (results.some(r => r.status === 'Time Limit Exceeded')) {
      verdict = 'Time Limit Exceeded';
    } else if (results.some(r => r.status === 'Runtime Error')) {
      verdict = 'Runtime Error';
    }

    // Update user stats if authenticated and in practice mode
    if (mode === 'practice' && userId && allPassed) {
      const user = await User.findById(userId);
      if (user) {
        // Calculate XP based on difficulty
        let xpGain = 50; // default
        if (problem.difficulty === 'Easy') xpGain = 30;
        else if (problem.difficulty === 'Medium') xpGain = 50;
        else if (problem.difficulty === 'Hard') xpGain = 100;

        // Check if problem was already solved
        const alreadySolved = user.solvedProblems.includes(problemId);
        
        if (!alreadySolved) {
          user.solvedProblems.push(problemId);
          user.xp += xpGain;
          user.practiceProblemsSolved += 1;
          
          // Update difficulty stats
          if (problem.difficulty === 'Easy') user.problemsSolvedByDifficulty.easy += 1;
          else if (problem.difficulty === 'Medium') user.problemsSolvedByDifficulty.medium += 1;
          else if (problem.difficulty === 'Hard') user.problemsSolvedByDifficulty.hard += 1;
        }

        // Track submission
        user.submissions.push({
          problemId,
          problemTitle: problem.title,
          code,
          language,
          status: verdict,
          runtime: results[0]?.time || 0,
          memory: results[0]?.memory || 0
        });

        // Update language stats
        user.totalCodeSubmissions += 1;
        user.totalLinesOfCode += code.split('\n').length;
        const langCount = user.languageStats.get(language) || 0;
        user.languageStats.set(language, langCount + 1);
        
        // Update favorite language
        let maxLang = language;
        let maxCount = langCount + 1;
        user.languageStats.forEach((count, lang) => {
          if (count > maxCount) {
            maxCount = count;
            maxLang = lang;
          }
        });
        user.favoriteLanguage = maxLang;

        await user.save();
      }
    }

    const response = {
      status: verdict,
      passed: passedTests,
      total: totalTests,
      execution_time: results.length > 0 ? `${results[0].time || 0}s` : '0s',
      results: results,
      testResults: results // For compatibility with frontend
    };
    
    console.log('Sending response:', JSON.stringify(response, null, 2));
    res.json(response);

  } catch (error) {
    console.error('Submission error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to execute code', details: error.message });
  }
};

const getStatusDescription = (statusId) => {
  const statusMap = {
    1: 'In Queue',
    2: 'Processing',
    3: 'Accepted',
    4: 'Wrong Answer',
    5: 'Time Limit Exceeded',
    6: 'Compilation Error',
    7: 'Runtime Error',
    8: 'Memory Limit Exceeded'
  };
  return statusMap[statusId] || 'Unknown';
};

// Simulate code execution for demo purposes
const simulateCodeExecution = (code, language, testCase) => {
  const expectedOut = testCase.output || testCase.expectedOutput;
  
  // Simple simulation logic
  const hasMainFunction = code.includes('main') || code.includes('def main') || code.includes('function main');
  const hasReturn = code.includes('return') || code.includes('print') || code.includes('cout');
  
  if (!hasMainFunction || !hasReturn) {
    return {
      status: 'Compilation Error',
      passed: false,
      time: null,
      memory: null,
      input: testCase.input,
      expectedOutput: expectedOut,
      actualOutput: 'Compilation Error',
      isHidden: testCase.isHidden || false
    };
  }

  // Simulate random results for demo
  const random = Math.random();
  const passed = random > 0.3; // 70% chance of passing
  
  if (random > 0.7) {
    return {
      status: 'Accepted',
      passed: true,
      time: (Math.random() * 2 + 0.1).toFixed(2),
      memory: Math.floor(Math.random() * 100 + 50),
      input: testCase.input,
      expectedOutput: expectedOut,
      actualOutput: expectedOut,
      isHidden: testCase.isHidden || false
    };
  } else if (random > 0.4) {
    return {
      status: 'Wrong Answer',
      passed: false,
      time: (Math.random() * 2 + 0.1).toFixed(2),
      memory: Math.floor(Math.random() * 100 + 50),
      input: testCase.input,
      expectedOutput: expectedOut,
      actualOutput: 'Wrong output',
      isHidden: testCase.isHidden || false
    };
  } else {
    return {
      status: 'Time Limit Exceeded',
      passed: false,
      time: null,
      memory: null,
      input: testCase.input,
      expectedOutput: expectedOut,
      actualOutput: 'Time Limit Exceeded',
      isHidden: testCase.isHidden || false
    };
  }
};

const getLastSubmission = async (req, res) => {
  try {
    const {problemId } = req.params;
    const userId = req.user?.userId;

    console.log('Fetching last submission for problem:', problemId);
    console.log('User ID:', userId);

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Total submissions for user:', user.submissions?.length || 0);

    // Find the last submission for this problem
    const lastSubmission = user.submissions
      .filter(sub => sub.problemId.toString() === problemId)
      .sort((a, b) => b.submittedAt - a.submittedAt)[0];

    if (!lastSubmission) {
      console.log('No submission found for this problem');
      return res.json({ found: false });
    }

    console.log('Last submission found:', {
      language: lastSubmission.language,
      status: lastSubmission.status,
      codeLength: lastSubmission.code?.length || 0
    });

    res.json({
      found: true,
      code: lastSubmission.code,
      language: lastSubmission.language,
      status: lastSubmission.status,
      submittedAt: lastSubmission.submittedAt
    });
  } catch (error) {
    console.error('Get last submission error:', error);
    console.error(error.stack);
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
};

module.exports = {
  submitCode,
  getLastSubmission
};
