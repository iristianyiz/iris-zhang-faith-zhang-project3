# Sudoku Master - MERN Project

A full-stack Sudoku app built with the MERN stack:

- **MongoDB** + **Mongoose** for persistence
- **Express.js** for REST APIs and session auth
- **React** + **Vite** for the frontend
- **Node.js** runtime on the backend

This repository is deployed on **Render** as a single web service that serves:

- API routes under `/api/*`
- static frontend assets from `frontend/dist`
- SPA fallback for client-side routing

## Commands

Run from repo root unless noted.

```bash
# install all workspace dependencies
npm install

# build frontend for production
npm run build

# local full-stack dev (build frontend, then start backend with watch)
npm run dev

# production start (expects frontend already built)
npm start
```

Workspace-specific:

```bash
# backend only (watch mode)
npm run dev -w backend

# backend only (prod mode)
npm run start -w backend

# frontend only (Vite dev server)
npm run dev -w frontend

# frontend preview of production build
npm run preview -w frontend
```

## Repository layout

```text
iris-zhang-faith-zhang-project3/
├── package.json                  # npm workspaces + root scripts
├── README.md
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── api/client.js
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── utils/
└── backend/
    ├── package.json
    ├── .env.example
    ├── server.js
    ├── middleware/auth.js
    ├── models/
    │   ├── User.js
    │   ├── Game.js
    │   └── HighScore.js
    ├── routes/
    │   ├── userRoutes.js
    │   ├── sudokuRoutes.js
    │   └── highscoreRoutes.js
    ├── utils/
    └── data/words.txt
```

## Environment

Create `backend/.env` from `backend/.env.example`.

Required / commonly used variables:

- `MONGODB_URI` - MongoDB connection string
- `SESSION_SECRET` - session signing secret
- `PORT` - backend port (default: `8000`)
- `NODE_ENV` - set to `production` in Render
- `SKIP_MONGO=1` - optional local UI-only mode (no DB persistence)

Example local setup:

```bash
cp backend/.env.example backend/.env
# edit backend/.env with your values
```

## REST API checklist

### User APIs

- `GET /api/user/isLoggedIn` - returns current auth state (`username` or error payload)
- `POST /api/user/register` - create account, hash password, start session
- `POST /api/user/login` - authenticate user, start session
- `POST /api/user/logout` - destroy session and clear cookie

### Sudoku APIs

- `GET /api/sudoku` - list games
- `POST /api/sudoku` - create game (`difficulty: EASY | NORMAL`)
- `GET /api/sudoku/:gameId` - get game details + current board state
- `PUT /api/sudoku/:gameId` - update board progress or reset game
- `DELETE /api/sudoku/:gameId` - creator-only delete; removes game and related score rows

### High score APIs

- `GET /api/highscore` - list high score rows
- `GET /api/highscore/leaderboard/wins` - wins leaderboard
- `POST /api/highscore` - record/update elapsed time for completed game
- `GET /api/highscore/:gameId` - fetch high score for a specific game

## Deployment (Render)

This app is configured for Render-style deployment with Node backend serving both API and built frontend.

Recommended build/start flow:

```bash
npm install
npm run build
npm start
```

Render environment variables should include:

- `MONGODB_URI`
- `SESSION_SECRET`
- `NODE_ENV=production`
- `PORT` (provided by Render at runtime)