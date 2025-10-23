import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = ({ user, isAuthenticated }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const getRankDisplay = (xp) => {
    if (xp >= 2000) return 'Platinum';
    if (xp >= 1000) return 'Gold';
    if (xp >= 500) return 'Silver';
    return 'Bronze';
  };

  return (
    <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <span className="text-lg sm:text-xl font-bold text-white hidden sm:inline">ALGO ROYALE</span>
            <span className="text-lg font-bold text-white sm:hidden">AR</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-2 lg:space-x-4">
            <Link
              to="/practice"
              className={`px-3 lg:px-4 py-2 rounded-lg font-medium text-sm lg:text-base ${
                isActive('/practice')
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              Practice
            </Link>
            <Link
              to="/battle"
              className={`px-3 lg:px-4 py-2 rounded-lg font-medium text-sm lg:text-base ${
                isActive('/battle')
                  ? 'bg-red-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              Battle
            </Link>
            <Link
              to="/leaderboard"
              className={`px-3 lg:px-4 py-2 rounded-lg font-medium text-sm lg:text-base ${
                isActive('/leaderboard')
                  ? 'bg-yellow-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              Leaderboard
            </Link>
          </div>

          {/* Desktop User Info */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            {isAuthenticated && user ? (
              <>
                <div className="text-right">
                  <div className="text-sm font-medium text-white">{user.username}</div>
                  <div className="text-xs text-gray-400">
                    {getRankDisplay(user.xp)} • {user.xp} XP
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="text-xs lg:text-sm text-red-400 hover:text-red-300 px-2 lg:px-3 py-1 border border-red-500 rounded-lg hover:bg-red-900/20"
                >
                  Logout
                </button>
              </>
            ) : (
              <a
                href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/google`}
                className="btn-primary text-xs lg:text-sm px-3 lg:px-4 py-2"
              >
                Sign in
              </a>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-300 hover:bg-slate-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              to="/practice"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-4 py-2 rounded-lg font-medium ${
                isActive('/practice')
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              Practice
            </Link>
            <Link
              to="/battle"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-4 py-2 rounded-lg font-medium ${
                isActive('/battle')
                  ? 'bg-red-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              Battle
            </Link>
            <Link
              to="/leaderboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-4 py-2 rounded-lg font-medium ${
                isActive('/leaderboard')
                  ? 'bg-yellow-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              Leaderboard
            </Link>
            
            {/* Mobile User Info */}
            <div className="pt-4 border-t border-slate-700">
              {isAuthenticated && user ? (
                <>
                  <div className="px-4 py-2 text-white">
                    <div className="font-medium">{user.username}</div>
                    <div className="text-sm text-gray-400">
                      {getRankDisplay(user.xp)} • {user.xp} XP
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded-lg"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <a
                  href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/google`}
                  className="block px-4 py-2 bg-purple-600 text-white text-center rounded-lg hover:bg-purple-700"
                >
                  Sign in with Google
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
