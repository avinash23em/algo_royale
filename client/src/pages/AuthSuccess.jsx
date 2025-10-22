import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Save token and redirect
      login(token);
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } else {
      // No token, redirect to login
      navigate('/login?error=auth_failed');
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mb-4"></div>
        <h2 className="text-2xl font-bold text-white mb-2">Signing you in...</h2>
        <p className="text-gray-400">Please wait while we set up your account</p>
      </div>
    </div>
  );
};

export default AuthSuccess;
