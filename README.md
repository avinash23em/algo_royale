# Algo Royale
  
[home](assets/home.png)

A competitive coding platform where developers can practice algorithms and battle against each other in real-time.

## What is this?

Algo Royale is a web app for coding enthusiasts who want to sharpen their problem-solving skills. You can solve coding problems at your own pace in Practice Mode, or compete head-to-head with other players in Battle Mode. Think LeetCode meets multiplayer gaming.

## Tech Stack

**Frontend:**
- React 18
- React Router for navigation
- Monaco Editor (the same editor VS Code uses)
- Tailwind CSS for styling
- Socket.io for real-time features
- Axios for API calls

**Backend:**
- Node.js + Express
- MongoDB for database
- Passport.js for Google OAuth
- Socket.io for real-time battles
- Judge0 API for code execution
- JWT for authentication

## Features

### Practice Mode
[practice](assets/practice.png)
- 50+ coding problems across Easy, Medium, and Hard difficulties
- Support for C++, Python, JavaScript, and Java
- Real-time code execution with test cases
- Track your progress and solved problems
- XP system and ranking (Bronze → Silver → Gold → Platinum)

### Battle Mode
[battle](assets/battle.png)
- Real-time 1v1 coding battles
- Matchmaking system
- Live opponent tracking
- Win/loss statistics
- Competitive leaderboard
[leaderboard](assets/leaderboard.png)

### Other Stuff
- Google sign-in (no password needed)
- Global leaderboard
- User profiles with stats
- Problem filtering and search
- Responsive design (works on mobile too)

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Google OAuth credentials
- Judge0 API key (from RapidAPI)

### Installation

1. Clone the repo
```bash
git clone https://github.com/avinash23em/algo_royale.git
cd algo_royale
```

2. Install dependencies for both client and server
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. Set up environment variables

Create `server/.env`:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
CLIENT_URL=http://localhost:3000
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_judge0_api_key
```

Create `client/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

4. Run the app
```bash
# From root directory
npm run dev
```

This starts both the frontend (port 3000) and backend (port 5000).

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Client Secret to your `.env` file

### Judge0 Setup

1. Sign up at [RapidAPI](https://rapidapi.com)
2. Subscribe to Judge0 CE (has a free tier)
3. Copy your API key to the `.env` file

## Project Structure

```
algo_royale/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/     # Reusable components
│       ├── contexts/       # React contexts (Auth)
│       ├── pages/          # Page components
│       └── utils/          # API utilities
├── server/                 # Express backend
│   └── src/
│       ├── config/         # Passport, DB config
│       ├── controllers/    # Route handlers
│       ├── middleware/     # Auth middleware
│       ├── models/         # MongoDB schemas
│       └── routes/         # API routes
└── package.json           # Root package (runs both)
```

## How It Works

1. **Sign in** with your Google account
2. **Practice Mode**: Pick a problem, write code, run tests, submit
3. **Battle Mode**: Click "Find Match" and get paired with another player
4. **Compete**: Both players solve the same problem, first to pass all tests wins
5. **Earn XP**: Gain experience points and climb the ranks

## Deployment

The app is deployed on:
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas

Check `vercel.json` and `render.yaml` for deployment configs.

## Known Issues

- Judge0 API has rate limits on the free tier (50 requests/day)
- Battle mode requires at least 2 players online
- Code execution timeout is set to 60 seconds

## Future Ideas

- More problems (targeting 100+)
- Tournament mode
- Team battles
- Code review feature
- Discussion forums
- More languages (Go, Rust, etc.)

## Contributing

Feel free to open issues or submit PRs. This is a learning project, so any feedback is welcome!

## License

MIT

---

Built with ☕ and 💻 by developers, for developers.
