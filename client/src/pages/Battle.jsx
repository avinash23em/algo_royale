import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import BattleRoom from '../components/BattleRoom';

const Battle = ({ user, onUserUpdate }) => {
  const [socket, setSocket] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [difficulty, setDifficulty] = useState('Easy');
  const [matchFound, setMatchFound] = useState(false);
  const [matchData, setMatchData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  const startMatchmaking = () => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);
    setIsSearching(true);

    newSocket.emit('find_match', {
      username: user.username,
      difficulty
    });

    newSocket.on('match_found', (data) => {
      setMatchFound(true);
      setMatchData(data);
      setIsSearching(false);
    });

    newSocket.on('waiting_for_match', () => {
      console.log('Waiting for opponent...');
    });
  };

  const cancelMatchmaking = () => {
    if (socket) {
      socket.disconnect();
      setIsSearching(false);
    }
  };

  const handleMatchEnd = async (result) => {
    console.log('Handling match end:', result);
    
    // Update user data to reflect XP changes
    if (onUserUpdate) {
      console.log('Updating user data...');
      await onUserUpdate();
    }

    // Navigate to result page with match ID
    if (result.matchId) {
      console.log('Navigating to /result with match ID:', result.matchId);
      navigate(`/result/${result.matchId}`);
    } else {
      console.error('No match ID received from server');
      // Fallback: navigate to result page and it will fetch latest match
      navigate('/result');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please sign in to start battling</p>
        </div>
      </div>
    );
  }

  if (matchFound && matchData) {
    return (
      <BattleRoom
        username={user.username}
        roomId={matchData.roomId}
        problem={matchData.problem}
        opponent={matchData.opponent}
        duration={matchData.duration}
        onMatchEnd={handleMatchEnd}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Battle Arena</h1>
          <p className="text-xl text-gray-300">
            Challenge other players in real-time coding duels
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="card">
            {!isSearching ? (
              <div className="text-center">
                <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-8">
                  <span className="text-4xl font-bold text-white">VS</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-6">
                  Ready to Battle?
                </h2>
                <p className="text-gray-300 mb-8 text-lg">
                  You'll be matched with another player and given the same problem. 
                  Race to solve it first!
                </p>

                <div className="mb-8">
                  <label className="block text-lg font-semibold text-white mb-4">
                    Select Difficulty
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {['Easy', 'Medium', 'Hard'].map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setDifficulty(diff)}
                        className={`p-4 rounded-lg border-2 font-semibold ${
                          difficulty === diff
                            ? diff === 'Easy'
                              ? 'border-green-500 bg-green-900 text-green-300'
                              : diff === 'Medium'
                              ? 'border-yellow-500 bg-yellow-900 text-yellow-300'
                              : 'border-red-500 bg-red-900 text-red-300'
                            : 'border-slate-600 bg-slate-700 text-gray-400'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={startMatchmaking}
                  className="btn-danger text-lg px-12 py-4"
                >
                  Find Match
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-red-500 mx-auto mb-8"></div>
                <h2 className="text-3xl font-bold text-white mb-6">
                  Searching for Opponent...
                </h2>
                <p className="text-gray-300 mb-8 text-lg">
                  Looking for another player with <span className="text-red-400 font-semibold">{difficulty}</span> difficulty
                </p>
                <button
                  onClick={cancelMatchmaking}
                  className="btn-secondary"
                >
                  Cancel Search
                </button>
              </div>
            )}
          </div>

          {/* Battle Rules */}
          <div className="mt-8 card">
            <h3 className="text-xl font-semibold text-white mb-6">Battle Rules</h3>
            <ul className="space-y-3 text-gray-300">
              <li>• You have 10 minutes to solve the problem</li>
              <li>• First player to get "Accepted" wins instantly</li>
              <li>• If time runs out, player with more test cases passed wins</li>
              <li>• Winner gets +100 XP, loser gets -20 XP</li>
              <li>• You can see your opponent's progress in real-time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Battle;
