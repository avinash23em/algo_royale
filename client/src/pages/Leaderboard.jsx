import React, { useState, useEffect } from 'react';

const LeaderboardPage = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/leaderboard`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      
      const data = await response.json();
      setPlayers(data);
    } catch (err) {
      console.error('Leaderboard error:', err);
      setError('Failed to load leaderboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  const getRankColor = (rank) => {
    const colors = {
      'Platinum': 'bg-purple-900/30 text-purple-400 border-purple-500/50',
      'Gold': 'bg-yellow-900/30 text-yellow-400 border-yellow-500/50',
      'Silver': 'bg-gray-700/30 text-gray-400 border-gray-500/50',
      'Bronze': 'bg-orange-900/30 text-orange-400 border-orange-500/50'
    };
    return colors[rank] || 'bg-slate-700/30 text-gray-400 border-slate-500/50';
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">🏆 Leaderboard</h1>
          <p className="text-xl text-gray-400">
            Top players ranked by XP
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="max-w-2xl mx-auto">
            <div className="card text-center">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-xl font-bold text-white mb-2">Error</h3>
              <p className="text-gray-400 mb-6">{error}</p>
              <button onClick={fetchLeaderboard} className="btn-primary">
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        {!loading && !error && (
          <div className="max-w-4xl mx-auto">
            <div className="card">
              {players.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎮</div>
                  <h3 className="text-xl font-bold text-white mb-2">No Players Yet</h3>
                  <p className="text-gray-400">Be the first to join the leaderboard!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-700/50">
                  {players.map((player, index) => (
                    <div
                      key={player._id || index}
                      className="p-6 hover:bg-slate-700/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        {/* Left: Rank & Player Info */}
                        <div className="flex items-center gap-4">
                          {/* Rank */}
                          <div className="text-3xl font-bold min-w-[60px] text-center">
                            {getRankIcon(index)}
                          </div>

                          {/* Player Info */}
                          <div>
                            <h3 className="text-xl font-bold text-white mb-2">
                              {player.username || 'Unknown Player'}
                            </h3>
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 text-sm font-semibold rounded-lg border ${getRankColor(player.rank)}`}>
                                {player.rank || 'Unranked'}
                              </span>
                              <span className="text-purple-400 font-bold">
                                {player.xp || 0} XP
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Stats */}
                        <div className="text-right">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-gray-400">Battles</div>
                              <div className="text-white font-bold">{player.totalMatches || 0}</div>
                            </div>
                            <div>
                              <div className="text-gray-400">Wins</div>
                              <div className="text-green-400 font-bold">{player.wins || 0}</div>
                            </div>
                            <div>
                              <div className="text-gray-400">Losses</div>
                              <div className="text-red-400 font-bold">{player.losses || 0}</div>
                            </div>
                            <div>
                              <div className="text-gray-400">Practice</div>
                              <div className="text-blue-400 font-bold">{player.practiceProblemsSolved || 0}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <div className="mt-6 text-center">
              <button
                onClick={fetchLeaderboard}
                className="btn-secondary"
                disabled={loading}
              >
                {loading ? 'Refreshing...' : '🔄 Refresh'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
