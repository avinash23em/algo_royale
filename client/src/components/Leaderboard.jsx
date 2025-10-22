import React, { useState, useEffect } from 'react';
import { leaderboardAPI } from '../utils/api';

const Leaderboard = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await leaderboardAPI.getTopPlayers();
      setPlayers(response.data);
    } catch (err) {
      setError('Failed to fetch leaderboard');
      console.error('Leaderboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 'Platinum': return 'text-purple-600 bg-purple-100';
      case 'Gold': return 'text-yellow-600 bg-yellow-100';
      case 'Silver': return 'text-gray-600 bg-gray-100';
      case 'Bronze': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchLeaderboard}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="card">
        <div className="px-6 py-4 border-b border-slate-700/50">
          <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
          <p className="text-gray-400 mt-1">Top players by XP</p>
        </div>

        <div className="divide-y divide-slate-700/50">
          {players.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-400">
              No players found. Be the first to join the leaderboard!
            </div>
          ) : (
            players.map((player, index) => (
              <div key={player._id} className="px-6 py-4 hover:bg-slate-700/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl font-bold text-gray-400 w-8">
                      {getRankIcon(index)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {player.username}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full border ${getRankColor(
                            player.rank
                          )}`}
                        >
                          {player.rank}
                        </span>
                        <span className="text-sm text-gray-400">
                          {player.xp} XP
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-gray-400">
                      <div>Matches: {player.totalMatches || 0}</div>
                      <div>Wins: {player.wins || 0} • Losses: {player.losses || 0}</div>
                      <div>Practice: {player.practiceProblemsSolved || 0} solved</div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={fetchLeaderboard}
          className="btn-primary"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export default Leaderboard;

