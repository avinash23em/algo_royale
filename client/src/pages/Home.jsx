import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Home = ({ user, isAuthenticated }) => {
  const [showModes, setShowModes] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          {/* Logo */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center">
              <svg className="w-12 h-12 sm:w-14 sm:h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4">
            Algo Royale
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 mb-6 sm:mb-8">
            Where Code Meets Competition
          </p>
          
          {!isAuthenticated && (
            <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
              <p className="text-yellow-200">
                <span className="font-semibold">Ready to code?</span> Sign in with Google to begin.
              </p>
            </div>
          )}

          {isAuthenticated && user && (
            <div className="bg-purple-900 border border-purple-700 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
              <p className="text-purple-200">
                <span className="font-semibold">Welcome back, {user.username}!</span> Ready to compete?
              </p>
            </div>
          )}

          {/* Main Button */}
          {!showModes ? (
            <div>
              <button
                onClick={() => setShowModes(true)}
                className="btn-primary text-lg sm:text-xl px-8 sm:px-12 py-3 sm:py-4"
              >
                Explore Platform
              </button>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-8 sm:mt-12 max-w-md mx-auto">
                <div className="card text-center p-3 sm:p-6">
                  <div className="text-2xl sm:text-3xl font-bold text-purple-400">50+</div>
                  <div className="text-gray-400 text-xs sm:text-sm">Problems</div>
                </div>
                <div className="card text-center p-3 sm:p-6">
                  <div className="text-2xl sm:text-3xl font-bold text-purple-400">4</div>
                  <div className="text-gray-400 text-xs sm:text-sm">Languages</div>
                </div>
                <div className="card text-center p-3 sm:p-6">
                  <div className="text-2xl sm:text-3xl font-bold text-purple-400">∞</div>
                  <div className="text-gray-400 text-xs sm:text-sm">Possibilities</div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Choose Your Mode</h2>
              
              {/* Mode Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto mb-6 sm:mb-8">
                <Link to="/practice" className="card-hover p-6 sm:p-8 text-left">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Practice Mode</h3>
                  <p className="text-sm sm:text-base text-gray-300 mb-4">
                    Solve problems at your own pace and improve your skills.
                  </p>
                  <div className="text-purple-400 font-semibold">
                    Start Practicing →
                  </div>
                </Link>

                <Link to="/battle" className="card-hover p-6 sm:p-8 text-left">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Battle Mode</h3>
                  <p className="text-sm sm:text-base text-gray-300 mb-4">
                    Compete against other players in real-time coding duels.
                  </p>
                  <div className="text-red-400 font-semibold">
                    Enter Battle →
                  </div>
                </Link>
              </div>

              <button
                onClick={() => setShowModes(false)}
                className="btn-secondary text-sm sm:text-base"
              >
                Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
