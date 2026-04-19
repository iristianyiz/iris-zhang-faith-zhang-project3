# Fullstack Sudoku (Project 3)

Monorepo: **Vite + React** (`frontend/`), **Express + Mongoose** (`backend/`), orchestrated from the **root** `package.json`.

## Repository layout

```
iris-zhang-faith-zhang-project3/
├── package.json                 # npm workspaces + root scripts
├── Requirements.md
├── README.md
├── frontend/
│   ├── package.json             # Vite, React, React Router
│   ├── vite.config.js           # dev: proxy /api → http://localhost:8000
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx              # Routes: /, /games, /game/:gameId, /rules, /scores, /login, /register
│       ├── index.css
│       ├── api/
│       │   └── client.js        # fetch helpers (credentials: include)
│       ├── components/
│       │   ├── AppLayout.jsx
│       │   └── Navbar.jsx
│       └── pages/
│           ├── HomePage.jsx   # need to hide path
│           ├── GamesPage.jsx
│           ├── GamePage.jsx
│           ├── RulesPage.jsx
│           ├── ScoresPage.jsx
│           ├── LoginPage.jsx
│           └── RegisterPage.jsx
└── backend/
    ├── package.json             # Express, Mongoose, cookie-parser, dotenv
    ├── .env.example
    ├── server.js                # /api/* + static frontend/dist + SPA fallback
    ├── models/
    │   ├── User.js
    │   └── Game.js
    └── routes/
        ├── userRoutes.js
        ├── sudokuRoutes.js
        └── highscoreRoutes.js
```

## Commands

Run these from the **repository root** unless noted.

| Command | What it does |
|--------|----------------|
| `npm install` | Installs dependencies for root workspace packages (`frontend`, `backend`). |
| `npm run build` | Production build of the frontend into `frontend/dist`. |
| `npm run dev` | Runs `npm run build` on the frontend, then starts the backend dev server (`node --watch server.js`). Matches a “build then serve” flow similar to deployment. |
| `npm start` | Runs the backend in production mode (`node server.js`). Build the frontend first so `frontend/dist` exists. |

### Backend only (from root)

| Command | What it does |
|--------|----------------|
| `npm run dev -w backend` | Dev server on port **8000** (default), with `--watch`. Requires MongoDB unless you use `SKIP_MONGO` (see below). |
| `npm run start -w backend` | Same server without `--watch`. |

### Frontend only (from root)

| Command | What it does |
|--------|----------------|
| `npm run dev -w frontend` | Vite dev server (default **5173**). Proxies `/api` to **http://localhost:8000** — run the backend separately for API calls. |

### Environment

- Copy `backend/.env.example` to `backend/.env` and set **`MONGODB_URI`** (and **`PORT`** if needed).
- **`SKIP_MONGO=1`:** Optional. Starts the HTTP server without connecting to MongoDB so you can preview the UI and stub APIs while setting up a database. Example:  
  `SKIP_MONGO=1 npm run dev -w backend`  
  Do not use this for real grading behavior once persistence is required.

### Local parity (Render-style)

From the project root, after configuring Mongo (or using `SKIP_MONGO=1` for a quick UI check):

```bash
npm install && npm run build && npm run dev
```

Then open **http://localhost:8000** (or the `PORT` you set).

## Related docs

See **`Requirements.md`** for assignment-aligned features, APIs, and task breakdown.
