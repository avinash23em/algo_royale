import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Practice from './pages/Practice';
import Battle from './pages/Battle';
import Leaderboard from './pages/Leaderboard';
import Result from './pages/Result';
import Login from './pages/Login';
import AuthSuccess from './pages/AuthSuccess';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <h2 className="text-2xl font-bold text-white">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppContent() {
  const { user, isAuthenticated, loading, updateUsername, refreshUser } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <h2 className="text-2xl font-bold text-white">Loading Algo Royale...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar 
        user={user}
        isAuthenticated={isAuthenticated}
        onUsernameChange={updateUsername}
      />
      
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        
        <Route path="/" element={<Home user={user} isAuthenticated={isAuthenticated} />} />
        
        <Route 
          path="/practice" 
          element={
            <ProtectedRoute>
              <Practice user={user} onUserUpdate={refreshUser} />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/battle" 
          element={
            <ProtectedRoute>
              <Battle user={user} onUserUpdate={refreshUser} />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/leaderboard" 
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/result" 
          element={
            <ProtectedRoute>
              <Result user={user} onUserUpdate={refreshUser} />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/result/:matchId" 
          element={
            <ProtectedRoute>
              <Result user={user} onUserUpdate={refreshUser} />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;

