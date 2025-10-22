// Load environment variables FIRST
require('dotenv').config();

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'algo-royale-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/algoroyale';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB - Algo Royale'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/problems', require('./routes/problems'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/match', require('./routes/match'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Algo Royale API is running',
    timestamp: new Date().toISOString()
  });
});

// Socket.io connection handling
const { handleSocketConnection } = require('./socket');
handleSocketConnection(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Algo Royale Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});

