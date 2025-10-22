import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const Result = ({ user, onUserUpdate }) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { matchId } = useParams();

  useEffect(() => {
    const fetchMatchResult = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching match result...');
        
        // First, refresh user data to get updated XP
        if (onUserUpdate) {
          console.log('Refreshing user data...');
          await onUserUpdate();
        }
        
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        let url;
        if (matchId) {
          // Fetch specific match by ID
          url = `${API_URL}/api/match/result/${matchId}`;
          console.log('Fetching match by ID:', matchId);
        } else {
          // Fetch latest match for user
          url = `${API_URL}/api/match/latest`;
          console.log('Fetching latest match for user');
        }
        
        const response = await fetch(url, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            console.log('No match found, redirecting to home');
            navigate('/');
            return;
          }
          throw new Error('Failed to fetch match result');
        }
        
        const data = await response.json();
        console.log('Match result received:', data);
        setResult(data);
      } catch (err) {
        console.error('Error fetching match result:', err);
        setError(err.message);
        // Redirect to home after error
        setTimeout(() => navigate('/'), 2000);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMatchResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  const getResultIcon = (winner, currentUserIsPlayer1) => {
    if (winner === 'draw') return '🤝';
    // Current user wins if: (winner is player1 AND user is player1) OR (winner is player2 AND user is NOT player1)
    const userWon = (winner === 'player1' && currentUserIsPlayer1) || (winner === 'player2' && !currentUserIsPlayer1);
    return userWon ? '🏆' : '😔';
  };

  const getResultColor = (winner, currentUserIsPlayer1) => {
    if (winner === 'draw') return 'text-gray-600';
    // Current user wins if: (winner is player1 AND user is player1) OR (winner is player2 AND user is NOT player1)
    const userWon = (winner === 'player1' && currentUserIsPlayer1) || (winner === 'player2' && !currentUserIsPlayer1);
    return userWon ? 'text-green-600' : 'text-red-600';
  };

  const getResultText = (winner, currentUserIsPlayer1) => {
    if (winner === 'draw') return 'Draw!';
    // Current user wins if: (winner is player1 AND user is player1) OR (winner is player2 AND user is NOT player1)
    const userWon = (winner === 'player1' && currentUserIsPlayer1) || (winner === 'player2' && !currentUserIsPlayer1);
    return userWon ? 'Victory!' : 'Defeat';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading match results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex justify-center items-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Results</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-900 flex justify-center items-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-white mb-2">No Match Found</h2>
          <p className="text-gray-400 mb-4">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  const isPlayer1 = result.player1Username === user?.username;
  const xpChange = isPlayer1 ? (result.player1XP || 0) : (result.player2XP || 0);

  // Debug logging
  console.log('Result Debug Info:');
  console.log('- Current user:', user?.username);
  console.log('- Player 1:', result.player1Username);
  console.log('- Player 2:', result.player2Username);
  console.log('- Winner:', result.winner);
  console.log('- Is current user Player1?', isPlayer1);
  console.log('- Comparison:', `"${result.player1Username}" === "${user?.username}"`, '=', result.player1Username === user?.username);
  
  const userWon = (result.winner === 'player1' && isPlayer1) || (result.winner === 'player2' && !isPlayer1);
  console.log('- User won?', userWon);
  console.log('- Breakdown:');
  console.log('  * winner === player1:', result.winner === 'player1');
  console.log('  * isPlayer1:', isPlayer1);
  console.log('  * (winner === player1 && isPlayer1):', result.winner === 'player1' && isPlayer1);
  console.log('  * winner === player2:', result.winner === 'player2');
  console.log('  * !isPlayer1:', !isPlayer1);
  console.log('  * (winner === player2 && !isPlayer1):', result.winner === 'player2' && !isPlayer1);

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="text-8xl mb-8">
            {getResultIcon(result.winner, isPlayer1)}
          </div>
          <h1 className={`text-5xl font-bold mb-6 ${getResultColor(result.winner, isPlayer1)}`}>
            {getResultText(result.winner, isPlayer1)}
          </h1>
          <p className="text-xl text-gray-400">
            Battle completed • {result.difficulty} difficulty • {new Date(result.endTime).toLocaleString()}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Problem Info Card */}
          {result.problem && (
            <div className="card mb-8 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/30">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{result.problem}</h3>
                  <p className="text-sm text-gray-400">Battle Problem • {result.difficulty} Difficulty</p>
                </div>
              </div>
              <p className="text-gray-300 mb-4">
                This was the problem you competed on. Want to solve it again or review your approach?
              </p>
              <button
                onClick={() => navigate(`/practice?problem=${result.problemId}`)}
                className="btn-primary w-full sm:w-auto"
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Practice This Problem
              </button>
            </div>
          )}

          <div className="card mb-8">
            <h2 className="text-2xl font-semibold text-white mb-8 text-center">
              Match Results
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Current User Stats */}
              <div className={`text-center p-8 rounded-xl border-2 ${
                (isPlayer1 && result.winner === 'player1') || (!isPlayer1 && result.winner === 'player2')
                  ? 'bg-green-900/20 border-green-500/50'
                  : 'bg-slate-700/50 border-slate-600'
              }`}>
                <div className="flex items-center justify-center gap-2 mb-4">
                  {user?.avatar && (
                    <img src={user.avatar} alt="You" className="w-10 h-10 rounded-full" />
                  )}
                  <h3 className="text-xl font-semibold text-white">
                    {user?.username} <span className="text-purple-400">(You)</span>
                  </h3>
                </div>
                <div className="text-4xl font-bold text-blue-400 mb-3">
                  {isPlayer1 ? (result.player1Progress?.toFixed(1) || 0) : (result.player2Progress?.toFixed(1) || 0)}%
                </div>
                <div className="text-sm text-gray-400 mb-4">Progress</div>
                {(isPlayer1 ? result.player1Verdict : result.player2Verdict) && (
                  <div className={`inline-block px-4 py-2 rounded-lg text-sm font-medium ${
                    (isPlayer1 ? result.player1Verdict : result.player2Verdict) === 'Accepted' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/50'
                  }`}>
                    {isPlayer1 ? result.player1Verdict : result.player2Verdict}
                  </div>
                )}
              </div>

              {/* Opponent Stats */}
              <div className={`text-center p-8 rounded-xl border-2 ${
                (!isPlayer1 && result.winner === 'player1') || (isPlayer1 && result.winner === 'player2')
                  ? 'bg-green-900/20 border-green-500/50'
                  : 'bg-slate-700/50 border-slate-600'
              }`}>
                <h3 className="text-xl font-semibold text-white mb-4">
                  {isPlayer1 ? result.player2Username : result.player1Username}
                </h3>
                <div className="text-4xl font-bold text-red-400 mb-3">
                  {isPlayer1 ? (result.player2Progress?.toFixed(1) || 0) : (result.player1Progress?.toFixed(1) || 0)}%
                </div>
                <div className="text-sm text-gray-400 mb-4">Progress</div>
                {(isPlayer1 ? result.player2Verdict : result.player1Verdict) && (
                  <div className={`inline-block px-4 py-2 rounded-lg text-sm font-medium ${
                    (isPlayer1 ? result.player2Verdict : result.player1Verdict) === 'Accepted' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/50'
                  }`}>
                    {isPlayer1 ? result.player2Verdict : result.player1Verdict}
                  </div>
                )}
              </div>
            </div>

            {/* XP Change */}
            <div className="mt-8 text-center p-6 bg-slate-800/50 rounded-xl">
              <div className="text-sm text-gray-400 mb-2">Your XP Change</div>
              <div className={`text-5xl font-bold mb-2 ${
                xpChange > 0 ? 'text-green-400' : xpChange < 0 ? 'text-red-400' : 'text-gray-400'
              }`}>
                {xpChange > 0 ? '+' : ''}{xpChange}
              </div>
              <div className="text-sm text-gray-400">
                {xpChange > 0 ? '🎉 XP Gained!' : xpChange < 0 ? '📉 XP Lost' : 'No XP Change'}
              </div>
              {user && (
                <div className="mt-4 space-y-2">
                  <div className="text-sm text-gray-400">
                    Current XP: <span className="text-white font-semibold text-lg">{user.xp || 0}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Rank: <span className="text-purple-400 font-semibold text-lg">{user.rank || 'Unranked'}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Total Battles: {user.totalMatches || 0} | Wins: {user.wins || 0} | Losses: {user.losses || 0}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <button
              onClick={() => navigate('/battle')}
              className="btn-danger flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Battle Again
            </button>
            <button
              onClick={() => navigate('/practice')}
              className="btn-primary flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Practice Mode
            </button>
            <button
              onClick={() => navigate('/leaderboard')}
              className="btn-secondary flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Leaderboard
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn-secondary flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </button>
          </div>

          {/* Tips */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Tips for Next Battle</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start">
                <span className="text-purple-400 mr-3">•</span>
                Read the problem statement carefully before coding
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-3">•</span>
                Test your solution with sample inputs first
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-3">•</span>
                Don't panic if your opponent is ahead - focus on your solution
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-3">•</span>
                Practice more problems to improve your speed and accuracy
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Result;

