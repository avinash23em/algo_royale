import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { problemsAPI, submissionsAPI } from '../utils/api';
import CodeEditor from '../components/CodeEditor';

const Practice = ({ user, onUserUpdate }) => {
  const [searchParams] = useSearchParams();
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [verdict, setVerdict] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [solvedProblems, setSolvedProblems] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTestCase, setSelectedTestCase] = useState(0);

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

  useEffect(() => {
    fetchProblems();
  }, []);

  // Initialize solved problems from user data
  useEffect(() => {
    if (user && user.solvedProblems) {
      setSolvedProblems(new Set(user.solvedProblems));
    }
  }, [user]);

  // Handle language change - load boilerplate for new language
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    setCode(getBoilerplateCode(newLanguage));
    setVerdict(null);
  };

  const fetchProblems = async () => {
    try {
      const data = await problemsAPI.getAll();
      setProblems(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching problems:', error);
      setLoading(false);
    }
  };

  const handleProblemClick = async (problemId) => {
    setSelectedProblem(null);
    try {
      const response = await problemsAPI.getById(problemId);
      setSelectedProblem(response);
      setVerdict(null);
      
      // Check if user has already solved this problem
      const isSolved = solvedProblems.has(problemId);
      
      if (isSolved) {
        console.log('Problem already solved, fetching last submission...');
        console.log('Problem ID:', problemId);
        
        // Fetch last submission
        try {
          const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
          const url = `${API_URL}/api/submissions/last/${problemId}`;
          console.log('Fetching from:', url);
          
          const submissionResponse = await fetch(url, {
            credentials: 'include'
          });
          
          console.log('Response status:', submissionResponse.status);
          
          if (submissionResponse.ok) {
            const submissionData = await submissionResponse.json();
            console.log('Response data:', submissionData);
            
            if (submissionData.found) {
              console.log('Last submission found!');
              console.log('Language:', submissionData.language);
              console.log('Code length:', submissionData.code?.length);
              
              // Set the language from last submission
              setLanguage(submissionData.language);
              
              // Set the code from last submission
              setCode(submissionData.code);
              
              console.log(`Loaded previous ${submissionData.language} solution`);
            } else {
              console.log('No submission found in response');
              // No submission found, use boilerplate
              setCode(getBoilerplateCode(language));
            }
          } else {
            console.error('Response not OK:', submissionResponse.status);
            const errorText = await submissionResponse.text();
            console.error('Error response:', errorText);
            // Error fetching, use boilerplate
            setCode(getBoilerplateCode(language));
          }
        } catch (submissionError) {
          console.error('Error fetching last submission:', submissionError);
          console.error('Error details:', submissionError.message);
          // Fallback to boilerplate
          setCode(getBoilerplateCode(language));
        }
      } else {
        console.log('Problem not solved yet, using boilerplate');
        // Not solved yet, use boilerplate
        setCode(getBoilerplateCode(language));
      }
    } catch (error) {
      console.error('Error fetching problem:', error);
    }
  };

  // Update boilerplate when language changes
  useEffect(() => {
    if (selectedProblem && !code.trim()) {
      setCode(getBoilerplateCode(language));
    }
  }, [language]);

  const handleSubmitCode = async () => {
    if (!code.trim()) return;
    
    setIsSubmitting(true);
    setVerdict(null);

    try {
      const result = await submissionsAPI.submit({
        code,
        language,
        problemId: selectedProblem._id,
        mode: 'practice'
      });

      setVerdict(result);
      
      if (result.status === 'Accepted') {
        setSolvedProblems(prev => new Set([...prev, selectedProblem._id]));
        if (onUserUpdate) {
          onUserUpdate();
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      console.error('Error details:', error.response?.data || error.message);
      setVerdict({
        status: 'Error',
        message: error.response?.data?.error || error.message || 'Failed to submit code',
        passed: 0,
        total: 0
      });
    } finally {
      setIsSubmitting(false);
      setSelectedTestCase(0); // Reset to first test case
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please sign in to start practicing</p>
        </div>
      </div>
    );
  }

  const filteredProblems = Array.isArray(problems) ? problems
    .filter(p => {
      const matchesDifficulty = difficultyFilter === 'All' || p.difficulty === difficultyFilter;
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDifficulty && matchesSearch;
    }) : [];

  if (!selectedProblem) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-white mb-8">Practice Problems</h1>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="card">
              <div className="text-2xl font-bold text-white">{problems.length || 0}</div>
              <div className="text-sm text-gray-400">Total Problems</div>
            </div>
            <div className="card">
              <div className="text-2xl font-bold text-green-400">{solvedProblems.size}</div>
              <div className="text-sm text-gray-400">Solved</div>
            </div>
            <div className="card">
              <div className="text-2xl font-bold text-blue-400">
                {problems.length > 0 ? Math.round((solvedProblems.size / problems.length) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-400">Progress</div>
            </div>
            <div className="card">
              <div className="text-2xl font-bold text-purple-400">{user?.xp || 0}</div>
              <div className="text-sm text-gray-400">Total XP</div>
            </div>
          </div>

          {/* Filters */}
          <div className="card mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search problems..."
                className="input-field flex-1"
              />
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="input-field"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div className="mt-4 text-sm text-gray-400">
              Showing {filteredProblems.length} of {problems.length} problems
            </div>
          </div>

          {/* Problems Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProblems.map((problem) => (
              <div
                key={problem._id}
                onClick={() => handleProblemClick(problem._id)}
                className={`card-hover ${
                  solvedProblems.has(problem._id) ? 'border-green-500' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-white">{problem.title}</h3>
                  <span className={`badge badge-${problem.difficulty.toLowerCase()}`}>
                    {problem.difficulty}
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  {solvedProblems.has(problem._id) ? (
                    <span className="text-green-400">Solved</span>
                  ) : (
                    'Not attempted'
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredProblems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">No problems found</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => setSelectedProblem(null)}
              className="text-purple-400 hover:text-purple-300 mb-2"
            >
              ← Back to Problems
            </button>
            <h1 className="text-3xl font-bold text-white">{selectedProblem.title}</h1>
            <span className={`badge badge-${selectedProblem.difficulty.toLowerCase()} mt-2`}>
              {selectedProblem.difficulty}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Problem Statement */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Problem Statement</h3>
            <div className="text-gray-300 mb-6 whitespace-pre-wrap">
              {selectedProblem.statement}
            </div>

            {/* Sample Input/Output */}
            <div className="card mb-4">
              <div className="text-sm font-semibold text-white mb-2">Sample Input</div>
              <pre className="bg-slate-900 p-2 rounded text-sm text-gray-300">{selectedProblem.sampleInput}</pre>
            </div>
            <div className="card mb-4">
              <div className="text-sm font-semibold text-white mb-2">Sample Output</div>
              <pre className="bg-slate-900 p-2 rounded text-sm text-gray-300">{selectedProblem.sampleOutput}</pre>
            </div>

            {/* Constraints */}
            <div className="card mb-4">
              <div className="text-sm font-semibold text-white mb-2">Constraints</div>
              <div className="text-sm text-gray-300">{selectedProblem.constraints}</div>
            </div>

            {/* Input/Output Format */}
            <div className="card mb-4">
              <div className="text-sm font-semibold text-white mb-2">Input Format</div>
              <div className="text-sm text-gray-300">{selectedProblem.inputFormat}</div>
            </div>
            <div className="card mb-4">
              <div className="text-sm font-semibold text-white mb-2">Output Format</div>
              <div className="text-sm text-gray-300">{selectedProblem.outputFormat}</div>
            </div>
          </div>

          {/* Code Editor */}
          <div>
            <div className="card mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Code Editor</h3>
                <div className="flex items-center gap-2">
                  <select
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="input-field text-sm"
                  >
                    <option value="cpp">C++</option>
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="java">Java</option>
                  </select>
                  <button
                    onClick={() => setCode(getBoilerplateCode(language))}
                    className="text-xs px-3 py-1 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded"
                    title="Reset to boilerplate code"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <CodeEditor
                value={code}
                onChange={setCode}
                language={language}
                height="400px"
                onSubmit={handleSubmitCode}
                isSubmitting={isSubmitting}
                verdict={verdict}
              />
            </div>

            {/* Test Results - LeetCode Style */}
            {verdict && verdict.testResults && (
              <div className="card mt-4">
                <h3 className="text-lg font-semibold text-white mb-4">Test Cases</h3>
                
                {/* Test Case Tabs */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  {verdict.testResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedTestCase(index)}
                      className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                        selectedTestCase === index
                          ? result.passed
                            ? 'bg-green-600 text-white'
                            : 'bg-red-600 text-white'
                          : result.passed
                          ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                          : 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                      }`}
                    >
                      Case {index + 1} {result.passed ? '✓' : '✗'}
                    </button>
                  ))}
                </div>

                {/* Selected Test Case Details */}
                {selectedTestCase !== null && verdict.testResults[selectedTestCase] && (
                  <div className="space-y-4">
                    {/* Status */}
                    <div className={`p-4 rounded-lg ${
                      verdict.testResults[selectedTestCase].passed
                        ? 'bg-green-900/20 border border-green-500/30'
                        : 'bg-red-900/20 border border-red-500/30'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-lg font-bold ${
                          verdict.testResults[selectedTestCase].passed ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {verdict.testResults[selectedTestCase].status}
                        </span>
                        <div className="flex gap-4 text-sm text-gray-400">
                          {verdict.testResults[selectedTestCase].time && (
                            <span>Runtime: {verdict.testResults[selectedTestCase].time}s</span>
                          )}
                          {verdict.testResults[selectedTestCase].memory && (
                            <span>Memory: {verdict.testResults[selectedTestCase].memory} KB</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Input */}
                    <div>
                      <div className="text-sm font-semibold text-gray-400 mb-2">Input:</div>
                      <pre className="bg-slate-900 p-3 rounded-lg text-sm text-gray-300 overflow-x-auto">
                        {verdict.testResults[selectedTestCase].input || 'N/A'}
                      </pre>
                    </div>

                    {/* Expected Output */}
                    <div>
                      <div className="text-sm font-semibold text-gray-400 mb-2">Expected Output:</div>
                      <pre className="bg-slate-900 p-3 rounded-lg text-sm text-green-400 overflow-x-auto">
                        {verdict.testResults[selectedTestCase].expectedOutput || 'N/A'}
                      </pre>
                    </div>

                    {/* Actual Output */}
                    {!verdict.testResults[selectedTestCase].passed && (
                      <div>
                        <div className="text-sm font-semibold text-gray-400 mb-2">Your Output:</div>
                        <pre className="bg-slate-900 p-3 rounded-lg text-sm text-red-400 overflow-x-auto">
                          {verdict.testResults[selectedTestCase].actualOutput || 'N/A'}
                        </pre>
                      </div>
                    )}
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

export default Practice;
