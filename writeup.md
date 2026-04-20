# Writeup & Bonus Points 
## 1) ## Challenges Faced

- **Sudoku correctness and edge cases**: keeping row/column/box rules consistent across frontend validation and backend enforcement, and correctly handling “givens” vs user-entered values.
- **Unique-solution verification**: implementing backtracking in a way that can *count* solutions (and stop early after 2) so custom puzzles are accepted only when they are uniquely solvable.
- **State syncing and reliability**: saving board progress to the server without making the UI feel laggy (debouncing, error recovery, and avoiding accidental overwrites).
- **Configuring MongoDB**: aligning local vs production connection strings (`MONGODB_URI`), handling missing DB setups gracefully during development, and ensuring collections/indexes behaved as expected.
- **Collaborating on MongoDB changes**: coordinating schema changes (like adding a `CUSTOM` difficulty) and API contracts so teammates’ local databases and seeded data didn’t break across branches.
- **Auth-gated features**: supporting read-only browsing while logged out, while ensuring create/update/delete actions are enforced server-side (`requireAuth`).

## 2) Given more time, what additional features, functional or design changes would you make?

If we had more time, we would focus on improving both product polish and technical robustness.

- **Gameplay quality improvements**: add optional hint tiers (single-cell hint vs strategy hint), mistake checking modes, and richer game-completion feedback.
- **Performance and reliability**: introduce caching for expensive leaderboard queries and add more structured API integration tests around auth/session edge cases.
- **Custom game UX**: provide a clearer validation panel (for example, conflict summaries by row/column/box) and a guided “publish checklist” before submitting a custom puzzle.
- **Accessibility and responsive design**: improve keyboard-only board navigation, screen-reader labels for Sudoku cells, and small-screen spacing/typography for longer play sessions.
- **Ops and observability**: add basic monitoring/alerting and deployment health checks so production issues can be identified earlier.

## 3) What assumptions did you make while working on this assignment?

Throughout development, we made a few practical assumptions to keep implementation aligned with the assignment scope:

- **Authentication boundaries**: logged-out users can browse and view boards, but any state-changing action (create, update, delete, high-score write) requires login.
- **Ownership rules**: only the creator of a game can delete it, and this authorization is enforced on the backend (not just hidden in the UI).
- **Leaderboard source of truth**: wins are derived from completed games currently in the database, so deleting a completed game should reduce the corresponding win count.
- **Session model**: server-side sessions with cookies are the primary auth mechanism, and cookies must be configured differently for local development vs production.
- **Sudoku formats**: Easy and Normal game modes follow fixed board sizes/rules, while custom mode uses a standard 9×9 format with uniqueness checks.

## 4) ow long did this assignment take to complete? 

About a week, from start to finish, including recording a walk-through.

# Bonus Points Write-Up
## Total Attainable BONUS points per person = 21: AI Survey(1pt) + Submit Early(3pts) + Password Encryption(2pts) + Delete Game(5pts) + Custom Games(10pts)

## AI Survey - 1pt
[see canvas attachment for screenshots]

## Submit Early - 3pts
We submitted the assignment 48hrs before the deadline.

## Password Encryption (2 pts)

We implemented password encryption using `bcrypt` on the backend so plain-text passwords are never stored in MongoDB.

During registration (`POST /api/user/register`), the server hashes the incoming password with `bcrypt.hash(password, 10)` and stores only the hash in the `User` model (`passwordHash`). During login (`POST /api/user/login`), we validate credentials with `bcrypt.compare(...)` against the stored hash.

A key design choice we made was to keep all password handling server-side and only expose safe fields back to the client (for example, returning `username` on success). This keeps credential logic centralized in one place and avoids leaking sensitive data through the frontend.

## Delete Game (5 pts)

We added full delete-game functionality with both backend enforcement and frontend controls.

On the backend, `DELETE /api/sudoku/:gameId` checks that:

- the game id is valid,
- the game exists, and
- the requesting user is the original creator.

If any of these checks fail, the API returns the appropriate status (`400`, `404`, or `403`). If checks pass, the game is deleted and related high-score rows are removed.

On the frontend, we added a visible `DELETE` button in two places:

- the individual game page (`/game/:gameId`) and
- the games list page (`/games`).

Both are creator-only controls with confirmation prompts to prevent accidental deletion.

For leaderboard correctness, deleting a completed game automatically reduces wins for that user by one because wins are aggregated from existing completed games in the database. Once the game document is removed, it no longer contributes to the win-count query.

## Custom Games (Bonus 10 pts)

We added a Custom Game creator flow that lets a signed-in user build a new **9×9** Sudoku puzzle from scratch.

On the frontend, the **Select a Game** page (`/games`) includes a new button **Create Custom Game** that routes to `/custom`. The `/custom` page shows an empty 9×9 board where the user can enter “given” values, highlights conflicts in real time, and submits the grid to the backend. On success, the user is redirected to the newly created game at `/game/:gameId`.

On the backend, `POST /api/sudoku/custom` accepts `initialBoard` (a 9×9 grid of integers 0–9 where 0 means empty), rejects invalid shapes/values, rejects conflicting givens, and then runs a backtracking solver that **counts solutions and requires exactly one** (uniquely solvable). If accepted, the server creates a `Game` document with `difficulty: "CUSTOM"`, stores `initialBoard` and `currentBoard` as the submitted grid, stores the unique `solution`, and returns `{ gameId }`.

Assumptions:
- **Auth required**: only logged-in users can submit (`requireAuth`); signed-out users can view the page but cannot create a custom game.
- **Standard rules**: custom games are classic **9×9** Sudoku with **3×3** boxes and digits **1–9**.
- **Input encoding**: boards are sent as a **9×9 integer grid** with values **0–9**, where `0` means blank.
- **Uniqueness definition**: a puzzle is accepted only if it has **exactly one valid solution**; unsolvable or multi-solution puzzles are rejected.
- **Persistence model**: custom puzzles are stored in MongoDB in the `games` collection as a normal `Game` document with `difficulty: "CUSTOM"`.
