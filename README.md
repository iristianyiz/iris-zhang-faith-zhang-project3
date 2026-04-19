# Fullstack Sudoku (Project 3)

Monorepo: **Vite + React** (`frontend/`), **Express + Mongoose** (`backend/`), orchestrated from the **root** `package.json`.

## From Project 2 (responsive client) → Project 3 (full-stack)

*Project 2 repo (Northeastern GitHub, SSO):* [iris-zhang-faith-zhang-project2](https://github.khoury.northeastern.edu/iriszhang/iris-zhang-faith-zhang-project2)

Your **Project 2** was a **single-page React** Sudoku app (React Router + Context): responsive **home** (title, pitch, CTAs to play vs rules, chessboard-style graphic), **game selection** with a **mocked list** and fake authors, **Easy (6×6)** vs **Normal (9×9)** with a **new client-side puzzle each visit**, **locked givens**, digits **1–N**, clearable cells, **invalid-value highlighting**, **timer**, **Reset** (restore puzzle + restart timer), **New Game** (fresh board), **rules + credits**, **mock high scores**, **login/register** UI (obscured passwords), **navbar on every page** with a **small-screen menu toggle**, and shared styling. Bonuses included **Hint** (highlight a cell with exactly one legal candidate), **localStorage** resume/clear-on-win/reset via Context only, and a **backtracking generator** aimed at **unique** solutions.

**Project 3** keeps the **spirit of the play experience** (board, reset, completion, rules, nav, auth) but changes the **architecture and rules of the road**:

| Project 2 | Project 3 |
|-----------|-----------|
| Mock game list, local routing to “a” puzzle | **Persisted games** in MongoDB; **`GET /api/sudoku`** list; each row has a real **`gameId`**, creator, created date |
| New puzzle every time you open a route | **One stored puzzle per game**; reopening **`/game/:gameId`** loads the **same** saved state from the server |
| Easy **6×6** vs Normal **9×9** (Project 2) | **`EASY`** → **6×6** (2×3 blocks, digits **1–6**); **`NORMAL`** → **9×9** (3×3 blocks, digits **1–9**). See `backend/utils/sudoku.js` **`DIFFICULTY_LAYOUT`**. |
| Timer + localStorage in Context | **Elapsed time** can still be shown in the UI; **persistence** of the board is **`PUT /api/sudoku/:gameId`** (source of truth). localStorage is **optional** (e.g. draft cache), not required for grading |
| Mock high scores | **`GET /api/highscore/leaderboard/wins`** (and related APIs) backed by MongoDB |
| Client-only “win” | **Server** checks completion against the stored **solution**; **`POST /api/highscore`** records time after a win |
| New Game + Reset on play page | **No second “New Game”** on **`/game/:id`**; create games from **`/games`** only. **Single Reset** for the **current** game (server **`reset: true`**) |
| Logged-in assumed for play | **Logged-out users** may **view** pages and boards but **must not mutate** (read-only UI; APIs return **401** for mutations) |

**Parity with your Project 2 (implemented here):** **6×6 Easy** vs **9×9 Normal**, **red conflict highlights** on the board (same idea as P2), **collapsible nav on small screens** (Menu / Close). **Still optional / not wired in this repo:** **Hint** button, visible **timer** UI (elapsed is still sent to **`POST /api/highscore`** after a win), home **chessboard-style graphic**, **localStorage** draft cache, and stricter **unique-solution** dig-holes on the server—add and document in the writeup if you ship them.

---

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
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── components/
│       │   ├── AppLayout.jsx
│       │   ├── Navbar.jsx
│       │   └── SudokuBoard.jsx
│       ├── utils/
│       │   ├── apiError.js
│       │   ├── formatDate.js
│       │   └── sudokuValidate.js
│       └── pages/
│           ├── HomePage.jsx
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
    │   ├── Game.js
    │   └── HighScore.js
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

## REST API checklist (contract with graders)

### Users

| Method | Path | Behavior |
|--------|------|----------|
| GET | `/api/user/isLoggedIn` | Read cookie; return username or error |
| POST | `/api/user/login` | Body: `username`, `password`; set cookie on success |
| POST | `/api/user/register` | Body: `username`, `password`; create user; reject duplicate username; set cookie |
| POST | `/api/user/logout` | Clear auth cookie(s) |

### Sudoku

| Method | Path | Behavior |
|--------|------|----------|
| GET | `/api/sudoku` | List all games: name, id, created date, difficulty |
| POST | `/api/sudoku` | Body: `EASY` or `NORMAL`; create game; **unique name** = 3 random words from 1000+ word list; return **game id** |
| DELETE | `/api/sudoku/:gameId` | Delete game (graded; not required in base UI) |
| PUT | `/api/sudoku/:gameId` | Update game (graded; not required in base UI) |

### High scores

| Method | Path | Behavior |
|--------|------|----------|
| GET | `/api/highscore` | Sorted “username + game” rows (per-time leaderboard shape) |
| GET | `/api/highscore/leaderboard/wins` | Win counts for **`/scores`** (wins desc, username asc; omit 0 wins) |
| POST | `/api/highscore` | Update high score for a specific game |
| GET | `/api/highscore/:gameId` | High score for one game |

Additional routes are OK if they stay REST-shaped and purposeful.

---

## Page & route map

| Route | Purpose |
|-------|---------|
| `/` | Home: title, links to rules + play (likely `/games`) |
| `/games` | Selection: create easy/normal; list existing games |
| `/game/:gameId` | Play or view completed + solution |
| `/rules` | Rules + credits |
| `/scores` | Wins leaderboard (exclude 0 wins) |
| `/login` | Login form; disabled submit if blank; redirect `/games` on success |
| `/register` | Register + verify password; disabled if any blank; duplicate username error |

**Navbar (every page):** Home; login/register **or** logout + stylized username.

---
### Milestone 1 — MongoDB & domain models

- Connect Mongoose; define **at least two** schemas with clear relationships (e.g. user → games created; game → completion / high score).
- Decide fields: puzzle vs solution, user progress, difficulty enum, `completedBy` / `completedAt`, unique game name constraint, indexes for list/sort queries.

### Milestone 2 — Session security & user APIs

- `express-session` (or template equivalent) + HTTP-only cookie settings appropriate for prod (secure, sameSite).
- Implement user routes: register (hash passwords—bcrypt), login, logout, `isLoggedIn`.
- Centralize auth middleware: “optional user” for read-only views vs “required user” for mutations.

### Milestone 3 — Sudoku generation & CRUD

- Word list (1000+) + name generator; enforce uniqueness (retry on collision).
- POST create **EASY** / **NORMAL**: server-side **6×6** (Easy) vs **9×9** (Normal), backtracking fill + controlled removals per `DIFFICULTY_LAYOUT`.
- GET list for `/games`; PUT/DELETE by id with correct status codes and no accidental side effects on GET.

### Milestone 4 — Gameplay persistence & completion

- Model “current board” updates (PUT may mirror this for graders even if UI uses POST elsewhere—keep PUT idempotent where possible).
- Detect win; persist completed state; when reloading `/game/:id`, if **this user** already completed **this** game, show solved grid (spec—confirm “this user” vs “anyone” with examples).

### Milestone 5 — High score APIs & aggregation

- POST update path when a game is won (idempotent handling if replay blocked).
- GET aggregate for `/scores`: win counts per user, sort desc wins, asc username; filter wins > 0.
- GET `/api/highscore/:gameId` for per-game row if UI needs it.

### Milestone 6 — React app structure & styling

- Router setup for all routes; layout shell with navbar wired to `isLoggedIn`.
- Design system: typography, colors, spacing; mobile-first layout; minimal raw browser chrome.

### Milestone 7 — Auth pages & client integration

- Login/register validation UX (disabled buttons, password `type="password"`).
- Handle API errors (duplicate user, bad credentials) without leaking internals.

### Milestone 8 — Games & play pages

- `/games`: create buttons → POST → navigate; list with formatted dates (`Intl` or library).
- `/game/:id`: board UX **inherited from P2 ideas** (locked givens, 1–9 entry, clear) **minus** the extra **“New Game”** control; **one Reset** tied to server state; **logged-out read-only** mode.
- **Optional P2-style polish:** visible **timer** display, **Hint**, decorative home graphic, **localStorage** cache—document if implemented.
- Rules + credits; home copy.

### Milestone 9 — Deploy, writeup, rubric pass

- Deploy API + client (Render or chosen host); env vars for DB and session.
- Record deployed URL in README; final pass on REST verb semantics and grader-only DELETE/PUT.
- **Writeup** (separate doc per course): architecture, challenges, division of labor if group.

---
TODO:

### Setup & repo

- [ ] Clone/fork template into this repo (or merge template) and push to GitHub
- [ ] Document `npm install` / `yarn`, dev commands, and production build
- [ ] Add `.env.example` and **never** commit secrets
- [ ] Invite TAs as collaborators; confirm repo visibility

### Database

- [ ] Mongoose connect with graceful failure message in dev
- [ ] Schema 1 (e.g. User): username unique, password hash, timestamps
- [ ] Schema 2+ (e.g. Game / Score): refs, indexes, validation
- [ ] Seed script (optional) for local demos

### Auth & security

- [ ] Password hashing on register; constant-time-safe comparison on login
- [ ] Session cookie configuration for local vs production
- [ ] `isLoggedIn` returns consistent JSON shape for the client
- [ ] Logout clears session server-side and client expectations documented

### Sudoku backend

- [ ] Word list asset (1000+ words) + triple-name generator + uniqueness
- [ ] POST `/api/sudoku` difficulty validation; return `{ gameId }` (or agreed shape)
- [ ] GET `/api/sudoku` returns fields required for list UI
- [ ] PUT `/api/sudoku/:id` updates stored game state correctly
- [ ] DELETE `/api/sudoku/:id` removes game; 404 if missing

### High scores

- [ ] Design: one document per game vs per user—justify in writeup
- [ ] POST `/api/highscore` validates game + user context
- [ ] GET `/api/highscore` sorted for UI needs
- [ ] GET `/api/highscore/:gameId` implemented and tested

### Frontend — global

- [ ] React Router routes for all pages
- [ ] Navbar: conditional auth controls + username treatment
- [ ] Shared layout, fonts, theme, responsive breakpoints
- [ ] API helper layer (fetch wrapper: credentials, JSON errors)

### Frontend — pages

- [ ] `/` Home: title + navigation to rules + play
- [ ] `/rules` rules text + credits with outbound links
- [ ] `/login` blank-aware disabled submit; success → `/games`
- [ ] `/register` verify password match + server-side duplicate handling
- [ ] `/games` create easy/normal + game list + navigation
- [ ] `/game/:gameId` play UI; completed+solution path; bottom reset only
- [ ] `/scores` sorted table/list; omit 0-win users

### Logged-out behavior

- [ ] Audit each page: which controls are disabled vs hidden when anonymous
- [ ] Ensure API rejects unauthorized mutations with 401/403 consistently

### Deployment & submission

- [ ] Production Mongo (Atlas) wired
- [ ] Deploy client + server; CORS/cookie domain/sameSite verified on HTTPS
- [ ] README section: **live URL**, how to run locally, API overview
- [ ] Writeup PDF/doc per instructor format
- [ ] Final rubric self-check: REST verbs, 2+ collections, pages, styling, JS quality

### Bonus (optional)

- [ ] Extra UX polish (animations, toasts, undo stack)
- [ ] Admin tool or script using DELETE endpoint

---