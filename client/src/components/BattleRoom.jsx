import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import CodeEditor from './CodeEditor';

const BattleRoom = ({ username, roomId, problem, opponent, duration, onMatchEnd }) => {
  const getBoilerplateCode = (lang) => {
    const templates = {
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    // Write your C++ solution here
    
    return 0;
}`,
      python: `def solution():
    # Write your Python solution here
    pass

if __name__ == "__main__":
    solution()
`,
      javascript: `function solution() {
    // Write your JavaScript solution here
    
}

solution();
`,
      java: `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        // Write your Java solution here
        
        scanner.close();
    }
}`
    };
    return templates[lang] || '';
  };

  const [socket, setSocket] = useState(null);
  const [code, setCode] = useState(getBoilerplateCode('cpp'));
  const [language, setLanguage] = useState('cpp');
  const [timeLeft, setTimeLeft] = useState(duration / 1000);
  const [playerVerdict, setPlayerVerdict] = useState(null);
  const [opponentVerdict, setOpponentVerdict] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const isMountedRef = React.useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('join_room', { roomId, username });

    newSocket.on('update_progress', (data) => {
      if (isMountedRef.current) {
        setPlayerVerdict(data.player1Verdict);
        setOpponentVerdict(data.player2Verdict);
      }
    });

    newSocket.on('submission_result', (result) => {
      console.log('Submission result received:', result);
      if (isMountedRef.current) {
        setIsSubmitting(false);
        setSubmissionResult(result);
        setShowResults(true);
      }
      
      if (result.status === 'Accepted') {
        console.log('All test cases passed! Waiting for match result...');
      } else {
        console.log(`${result.status}: ${result.passed}/${result.total} test cases passed`);
      }
    });

    newSocket.on('match_result', (result) => {
      console.log('Match result received:', result);
      if (isMountedRef.current) {
        onMatchEnd(result);
      }
    });

    return () => {
      isMountedRef.current = false;
      newSocket.close();
    };
  }, [roomId, username, onMatchEnd]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update boilerplate when language changes
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    if (!code.trim() || code === getBoilerplateCode(language)) {
      setCode(getBoilerplateCode(newLanguage));
    }
  };

  const handleSubmitCode = () => {
    if (!code.trim() || !socket) return;

    setIsSubmitting(true);
    console.log('Submitting code:', { roomId, language, codeLength: code.length });
    socket.emit('code_submit', {
      roomId,
      code,
      language,
      username
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (time) => {
    if (time < 60) return 'text-red-500';
    if (time < 300) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-16 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{problem.title}</h2>
              <p className="text-gray-400">vs <span className="text-red-400 font-semibold">{opponent || 'Opponent'}</span></p>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${getTimeColor(timeLeft)}`}>
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-gray-400">Time Remaining</div>
            </div>
          </div>
        </div>
      </div>

      {/* Battle Status */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">You ({username})</h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Status</span>
              {playerVerdict ? (
                <span className={`font-medium ${
                  playerVerdict === 'Accepted' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {playerVerdict}
                </span>
              ) : (
                <span className="text-gray-400">Not submitted</span>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Opponent ({opponent || 'Unknown'})</h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Status</span>
              {opponentVerdict ? (
                <span className={`font-medium ${
                  opponentVerdict === 'Accepted' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {opponentVerdict}
                </span>
              ) : (
                <span className="text-gray-400">Not submitted</span>
              )}
            </div>
          </div>
        </div>

        {/* Problem and Code Editor - Practice Mode Style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Problem Statement - Left Side */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-2xl font-bold text-white mb-6">{problem.title}</h3>
              
              {/* Difficulty Badge */}
              <div className="mb-6">
                <span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${
                  problem.difficulty === 'Easy' ? 'bg-green-900/30 text-green-400 border border-green-500/50' :
                  problem.difficulty === 'Medium' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/50' :
                  'bg-red-900/30 text-red-400 border border-red-500/50'
                }`}>
                  {problem.difficulty}
                </span>
              </div>

              {/* Problem Statement */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-3">Problem Statement</h4>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {problem.statement}
                </p>
              </div>

              {/* Input Format */}
              {problem.inputFormat && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-white mb-3">Input Format</h4>
                  <p className="text-gray-300 leading-relaxed">{problem.inputFormat}</p>
                </div>
              )}

              {/* Output Format */}
              {problem.outputFormat && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-white mb-3">Output Format</h4>
                  <p className="text-gray-300 leading-relaxed">{problem.outputFormat}</p>
                </div>
              )}

              {/* Constraints */}
              {problem.constraints && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-white mb-3">Constraints</h4>
                  <p className="text-gray-300 leading-relaxed font-mono text-sm">{problem.constraints}</p>
                </div>
              )}

              {/* Sample Test Cases */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Examples</h4>
                {problem.testCases?.filter(tc => !tc.isHidden).map((testCase, index) => (
                  <div key={index} className="mb-4 bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                    <div className="text-sm font-semibold text-purple-400 mb-3">Example {index + 1}</div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs font-semibold text-gray-400 mb-1">Input:</div>
                        <pre className="bg-slate-950 p-3 rounded text-sm text-gray-300 overflow-x-auto border border-slate-800">
{testCase.input}
                        </pre>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-400 mb-1">Output:</div>
                        <pre className="bg-slate-950 p-3 rounded text-sm text-green-400 overflow-x-auto border border-slate-800">
{testCase.output || testCase.expectedOutput}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Code Editor - Right Side */}
          <div className="space-y-6">
            <div className="card">
              {/* Language Selector */}
              <div className="mb-4 flex items-center justify-between border-b border-slate-700 pb-4">
                <h3 className="text-lg font-semibold text-white">Code Editor</h3>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-400">Language:</label>
                  <select
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="bg-slate-700 text-white px-3 py-1 rounded border border-slate-600 focus:border-purple-500 focus:outline-none"
                  >
                    <option value="cpp">C++</option>
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="java">Java</option>
                  </select>
                </div>
              </div>

              <CodeEditor
                value={code}
                onChange={setCode}
                language={language}
                height="600px"
                onSubmit={handleSubmitCode}
                isSubmitting={isSubmitting}
                verdict={submissionResult}
              />
            </div>
            
            {/* Test Results Modal/Panel */}
            {showResults && submissionResult && (
              <div className="card bg-slate-800 border-2 border-purple-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Submission Results</h3>
                  <button 
                    onClick={() => setShowResults(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className={`p-4 rounded-lg mb-4 ${
                  submissionResult.status === 'Accepted' 
                    ? 'bg-green-900/30 border border-green-500/50' 
                    : 'bg-red-900/30 border border-red-500/50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-2xl font-bold ${
                        submissionResult.status === 'Accepted' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {submissionResult.status}
                      </div>
                      <div className="text-lg text-gray-300 mt-1">
                        {submissionResult.passed}/{submissionResult.total} test cases passed
                      </div>
                    </div>
                    <div className="text-4xl">
                      {submissionResult.status === 'Accepted' ? '✅' : '❌'}
                    </div>
                  </div>
                  {submissionResult.execution_time && (
                    <div className="text-sm text-gray-400 mt-2">
                      Execution Time: {submissionResult.execution_time}
                    </div>
                  )}
                </div>
                
                {/* Test Cases Results */}
                {submissionResult.testResults && submissionResult.testResults.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-white mb-2">Test Cases:</h4>
                    {submissionResult.testResults.map((test, index) => (
                      <div 
                        key={index}
                        className={`p-3 rounded-lg border ${
                          test.passed 
                            ? 'bg-green-900/20 border-green-500/30' 
                            : 'bg-red-900/20 border-red-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-white">
                            {test.isHidden ? '🔒 Hidden Test Case' : `Test Case ${index + 1}`}
                          </span>
                          <span className={`font-bold ${
                            test.passed ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {test.passed ? '✓ Passed' : '✗ Failed'}
                          </span>
                        </div>
                        {!test.isHidden && (
                          <div className="text-sm space-y-2">
                            <div>
                              <div className="text-gray-400">Input:</div>
                              <pre className="bg-slate-950 p-2 rounded text-gray-300 overflow-x-auto">{test.input}</pre>
                            </div>
                            <div>
                              <div className="text-gray-400">Expected:</div>
                              <pre className="bg-slate-950 p-2 rounded text-green-400 overflow-x-auto">{test.expectedOutput}</pre>
                            </div>
                            {!test.passed && (
                              <div>
                                <div className="text-gray-400">Your Output:</div>
                                <pre className="bg-slate-950 p-2 rounded text-red-400 overflow-x-auto">{test.actualOutput}</pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {submissionResult.status === 'Accepted' && (
                  <div className="mt-4 p-3 bg-purple-900/30 border border-purple-500/50 rounded-lg text-center">
                    <p className="text-purple-300 font-medium">
                      🎉 Perfect! Waiting for match to end...
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleRoom;
