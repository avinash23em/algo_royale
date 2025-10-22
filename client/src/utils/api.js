import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 second timeout for code execution
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('algo_royale_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Cannot connect to server. Please make sure the backend is running.');
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('algo_royale_token');
      window.location.href = '/login';
    }
    throw error;
  }
);

// Auth API
export const authAPI = {
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Problems API
export const problemsAPI = {
  getAll: () => api.get('/problems'),
  getById: (id) => api.get(`/problems/${id}`),
};

// Submissions API
export const submissionsAPI = {
  submit: (data) => api.post('/submissions', data),
  getLastSubmission: (problemId) => api.get(`/submissions/last/${problemId}`),
};

// Leaderboard API
export const leaderboardAPI = {
  getTopPlayers: () => api.get('/leaderboard'),
  getUserStats: (username) => api.get(`/leaderboard/${username}`),
};

// Admin API
export const adminAPI = {
  addProblem: (data) => api.post('/admin/problems', data),
  seedProblems: () => api.post('/admin/seed'),
};

export default api;
