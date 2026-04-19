# Project 3 — Fullstack Sudoku App

**Source materials:** Course assignment (Fullstack Sudoku) + deployment tips / gotchas.

This document captures **requirements**, a **proposed design**, and **task lists** aligned with the rubric and common pitfalls.

---

## 1. Goals and scope

Build a **full-stack Sudoku** application on top of Project 2 concepts: **record behavior**, **high scores**, **auth via cookies**, **MongoDB + Mongoose**, and **RESTful Express APIs**. Users can browse the app when logged out (read-only where specified) and get full interaction when logged in.

**Suggested baseline:** Start from the course template when possible to reduce setup friction:

`https://github.com/ajorgense1-chwy/cs5610_project3_template`

---

## 2. Rubric alignment (what graders weight)

| Area | Weight | What “done” means |
|------|--------|-------------------|
| Core functionality | 25% | All required pages, flows, and game behavior work end-to-end |
| GitHub + deployed app | 5% | Repo shared with TAs; live URL works |
| Pages + styling | 10% | Cohesive UI, not default browser chrome; **mobile + desktop** |
| RESTful APIs | 20% | Correct verbs, predictable semantics, no surprise side effects |
| MongoDB, Mongoose, security | 20% | ≥2 collections, persistence, session/cookie handling as specified |
| JavaScript quality | 10% | Small functions, DRY backend helpers, lean React components |
| Writeup | 10% | Required prompts answered clearly |
| Bonus | Optional | See §10 |

---

## 3. Functional requirements

### 3.1 Pages and routes

| Route | Purpose |
|-------|---------|
| `/` | **Home:** game title (may rename), art/branding, navigation to **rules** and **play** (game entry). |
| `/games` | **Selection:** “Create Normal Game” and “Create Easy Game” → `POST` build-game API → redirect to `/game/{id}`. List **all** games with **name**, **difficulty**, **creator username**, **created date** formatted like `Jan 1, 2020`. Clicking a list item opens that game. |
| `/game/{gameId}` | **Play:** Same Sudoku UX as Project 2 for Normal/Easy; **no** bottom “New Game” flow like P2; include a **Reset** control for the current game (assignment text emphasizes reset at bottom—implement reset; omit separate “new random game” if that was P2 wording). If user **already completed** this game, revisiting shows **completed state + solution**. |
| `/rules` | Rules text + **credits** (“made by”) with links (email, GitHub, LinkedIn—**fake data OK**). |
| `/scores` | **High scores:** all users who have **≥1 win**, ordered **most wins → least**; **ties broken by username**; **hide users with 0 wins**. |
| `/login` | Username + **password** (`type="password"`), submit **disabled** if either field blank. Success → redirect **`/games`**. Sets auth **cookie**. |
| `/register` | Username, password, verify password; obscured fields; submit disabled while any field blank; **reject duplicate username**. Success sets **cookie**. |

**Spec note:** The written brief both discourages a reset/new-game pair and later asks for a reset button—**implement reset** for the active board and avoid an extra “spawn unrelated new puzzle” control unless you intentionally scope it as bonus.

### 3.2 Logged-out vs logged-in experience

- **Logged out:** User may **see** all pages **including games** but **must not interact** where interaction implies mutating state (playing moves, creating games, etc.). Treat this as a **read-only mode** with UI affordances disabled or gated behind login.
- **Logged in:** Full interaction.

### 3.3 Global navigation

**Navbar on every page:**

- Always: link **Home**.
- Logged out: links to **Login** and **Register**.
- Logged in: **Home**, **Logout**, and a **styled username** reference (pattern similar to Redfin-style switch in brief).

### 3.4 Sudoku rules (content)

Standard rules: each **row**, **column**, and **sub-grid** contains digits **1…N** exactly once (N = board dimension).

### 3.5 Game creation and naming

- New games created via **`POST /api/sudoku`** with difficulty **EASY** or **NORMAL**.
- Each game needs a **unique name**: maintain a **word list (1000+)** and pick **3 random words** (e.g., `Coconut Red House`).

---

## 4. API requirements (REST semantics)

Use **POST, GET, PUT, DELETE** responsibly (no “GET that deletes,” etc.). Minimum surface:

### 4.1 Users

| Method | Path | Behavior |
|--------|------|----------|
| `GET` | `/api/user/isLoggedIn` | Read cookie; return **username** or **error** if not authenticated |
| `POST` | `/api/user/login` | Body: `username`, `password`; on success **set cookie** |
| `POST` | `/api/user/register` | Body: `username`, `password`; create user; **set cookie** |
| `POST` | `/api/user/logout` | Clear auth cookies |

### 4.2 Sudoku

| Method | Path | Behavior |
|--------|------|----------|
| `GET` | `/api/sudoku` | List all games: **name, id, creation date, difficulty** |
| `POST` | `/api/sudoku` | Body includes **EASY** or **NORMAL**; returns **game id**; unique random name |
| `PUT` | `/api/sudoku/{gameId}` | Update game state (required for grading even if UI doesn’t call it) |
| `DELETE` | `/api/sudoku/{gameId}` | Delete game (required for grading even if UI doesn’t call it) |

### 4.3 High scores

| Method | Path | Behavior |
|--------|------|----------|
| `GET` | `/api/highscore` | Sorted list: **username + game** (per brief) |
| `POST` | `/api/highscore` | Update high score for a **specific game** |
| `GET` | `/api/highscore/:gameId` | High score for that game |

You may add supporting routes (e.g., move submission) **if** they remain REST-shaped and documented in your writeup/video.

---

## 5. Data and security requirements

- **MongoDB + Mongoose** with **at least two collections** (e.g., `User`, `Game`, and/or `HighScore`—design so relationships stay clear).
- Persist games, users, and win/score accounting suitable for `/scores` and high-score APIs.
- **Cookies** for session identity after login/register.
- **Bonus (+2):** **hash passwords** in the database (bcrypt or similar)—still required to behave correctly for graders if you skip bonus, but plaintext is weaker and costs bonus.

**Threat model (practical minimum):** HTTP-only / sensible cookie flags where applicable, validate bodies server-side, never trust client-only win claims without server verification.

---

## 6. Non-functional requirements

- **Styling:** Distinct visual identity; **responsive**; minimal “raw HTML defaults.” Third-party UI libs allowed (Tailwind, MUI, React Bootstrap, etc.).
- **JavaScript:** Readable decomposition; helpers on server; **no requirement** for Redux/advanced patterns.
- **Hosting:** Render recommended; any host OK if stable.
- **Repo naming:** `{firstname}-{lastname}-project3`; collaborators’ names reflected as instructed; **add TAs as collaborators**.

---

## 7. Proposed architecture and design

### 7.1 Repository layout (matches tips doc)

- **Monorepo** with **three `package.json` files**:
  - **Root:** orchestration (`install`, `build`, `dev` scripts wiring frontend + backend).
  - **`frontend/`:** React app (Vite **dist** or CRA **build**—see §8).
  - **`backend/`:** Express + Mongoose + session/cookie middleware.
- **`.gitignore`:** exclude `node_modules` everywhere; verify nothing huge is committed.

### 7.2 Runtime model

- Express serves **API** under `/api/...`.
- Express serves **static frontend** build output in production (path matches your bundler).
- Single origin in production simplifies cookies; if you split origins, plan CORS + cookie `SameSite` carefully.

### 7.3 Suggested collections (example)

1. **Users:** `username`, `passwordHash`, timestamps.
2. **Games:** `name` (unique index), `difficulty`, `creatorId`, `createdAt`, `initialBoard`, `currentBoard`, `solution`, `completedBy` / `completedAt`, flags for immutability of givens, etc.
3. **Scores / wins:** Either embed win counts on `User` **or** separate `GameCompletion` / `WinEvent` collection for auditability—choose one and keep aggregation for `/scores` straightforward.

### 7.4 Client state

- **Route-level data fetching** for game list and game detail.
- **Optimistic UI optional**; server must be source of truth for completion and wins.
- Central small **auth context** or hook: `isLoggedIn`, `username`, `refresh()` calling `GET /api/user/isLoggedIn`.

### 7.5 REST discipline

- **GET:** safe, cache-friendly lists/reads.
- **POST:** create or non-idempotent actions (login, register, create game, record win/update score).
- **PUT:** replace/update full game document or defined subset.
- **DELETE:** remove game by id.

---

## 8. Deployment and local parity (from Tips / Gotchas PDF)

- **Render:** follow course deployment guide; set **`NODE_VERSION`** in environment variables.
- **Static path in `server.js`:** match your frontend tool—**`dist`** (Vite) vs **`build`** (CRA).
- **Local “Render-like” smoke test** from repo root:

  `npm install && npm run build && npm run dev`

  Then open the app on the port your `server.js` uses (commonly **8000**).

- Confirm **no `node_modules`** in git; delete locally if accidentally tracked.

---

## 9. Deliverables and writeup

**Canvas submission (each member, even in a group):**

1. GitHub repo link (shared repo OK if identical).
2. Walkthrough **video** (< ~5 min typical): each page, highlights, play a few rounds.
3. Deployed app link.
4. **Writeup** covering:
   - Challenges
   - What you’d add with more time
   - Assumptions
   - Time spent
   - **Bonus completed** + links to relevant code

**Bonus survey (+1):** complete linked Google form; submit screenshot with **date/time** visible and note whose screenshot if paired.

**Early submit (+3):** ≥ **48 hours** before deadline.

---

## 10. Optional bonus features (staff may not debug these)

| Bonus | Pts | Summary |
|-------|-----|---------|
| AI survey | 1 | Form + proof screenshot |
| Early submit | 3 | 48h early |
| Password encryption | 2 | Store hashed passwords |
| Delete game (UI) | 5 | Creator sees **DELETE** on `/game/{id}`; removes game; **decrements wins** for everyone who completed it |
| Custom games | 10 | `/custom` empty 9×9 editor → **Submit** → server verifies **uniquely solvable** → create game → redirect `/game/{id}` |

---

## 11. Proposed task lists

Work items are grouped so you can parallelize **frontend**, **backend**, and **infra** after the skeleton exists.

### Phase A — Foundation (Days 1–2)

- [ ] Clone/fork template or scaffold **root + frontend + backend** `package.json` scripts mirroring class examples.
- [ ] Wire **Mongo connection** + config via environment variables.
- [ ] Implement **User** model + **Game** (and/or score) models; create **≥2 collections** in practice.
- [ ] Add **session/cookie** middleware and secure-enough defaults for class scope.
- [ ] Implement **`GET /api/user/isLoggedIn`**, **`POST` login/register/logout** with correct cookie behavior.
- [ ] Smoke-test auth against Mongo locally.

### Phase B — Sudoku core API (Days 2–4)

- [ ] Port/reuse **Project 2** generation + validation logic to server utilities (pure functions where possible).
- [ ] Implement **`POST /api/sudoku`** (difficulty param, unique 3-word name with **collision retry** + unique index).
- [ ] Implement **`GET /api/sudoku`** list projection fields required by UI.
- [ ] Implement **`PUT /api/sudoku/:id`** for board/progress/completion updates (even if only used by tests or minimal client calls).
- [ ] Implement **`DELETE /api/sudoku/:id`** (grading checks this).
- [ ] Unit-test or script-test tricky paths: duplicate name, bad id, unauthorized mutation attempts (if you enforce ownership later).

### Phase C — Gameplay client (Days 3–6)

- [ ] Build **`/games`** page: buttons → POST → navigate; list from GET; date formatting **`MMM D, YYYY`**.
- [ ] Build **`/game/:id`**: load game, enforce **read-only** when logged out; play when logged in.
- [ ] Remove P2 **“New Game”** flow from bottom; add **Reset** semantics consistent with your server model.
- [ ] On completion, persist completion and **trigger high-score update path** as designed.
- [ ] Revisit completed game: show **finished UI + solution** without allowing cheating on first play (define rules clearly in writeup).

### Phase D — High scores + scores page (Days 4–6)

- [ ] Implement **`GET /api/highscore`**, **`POST /api/highscore`**, **`GET /api/highscore/:gameId`** consistent with your data model.
- [ ] Build **`/scores`** with sort rules: **wins desc**, **username asc tie-break**, **exclude 0 wins**.
- [ ] Ensure win increments are **server-validated** (completed board matches solution, etc.).

### Phase E — Static pages + nav (Days 2–5, interleaved)

- [ ] **`/`** home, **`/rules`** content + credits.
- [ ] Global **navbar** with auth states as specified.
- [ ] **`/login`** and **`/register`** validation + disabled submit rules.

### Phase F — Quality, styling, and JS cleanup (Days 5–7)

- [ ] Apply cohesive theme; verify **mobile** layouts.
- [ ] Refactor: shared API client, typed DTOs (if using TS), small components.
- [ ] Remove duplicated fetch logic; handle loading/error states consistently.

### Phase G — Deploy + submission (Days 7–8)

- [ ] **Render** (or other) service; set **`NODE_VERSION`** and Mongo connection string secrets.
- [ ] Confirm production **`server.js`** static directory (**`dist` vs `build`**).
- [ ] Run root **`npm install && npm run build && npm run dev`** before tagging release.
- [ ] Add TAs as **GitHub collaborators**; verify live site + cookies on HTTPS.
- [ ] Record **video**; finalize **writeup**; collect **bonus** evidence if attempted.

### Phase H — Optional bonuses (priority order suggested)

1. [ ] **Password hashing (+2)** — low risk, high value.
2. [ ] **Creator DELETE (+5)** — needs cascade rules for wins/high scores.
3. [ ] **Custom games (+10)** — `/custom` UI + server **unique-solution** verifier (backtracking from P2).
4. [ ] **AI survey (+1)** + **early submit (+3)** logistics.

---

## 12. Acceptance checklist (quick pre-submit)

- [ ] All routes exist and match brief paths.
- [ ] Logged-out browsing matches “see but not interact” rule.
- [ ] Cookies set on login/register; cleared on logout; `isLoggedIn` accurate.
- [ ] All required **HTTP verbs** implemented with honest semantics.
- [ ] Mongo shows **≥2 collections** with real documents after typical use.
- [ ] `/scores` ordering + filtering correct.
- [ ] Deployed URL + repo access + video + writeup ready per Canvas list.

---

