# Bonus Points Write-Up

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

## Custom Games (Bonus)

We added a Custom Game creator flow that lets a signed-in user build a new **9×9** Sudoku puzzle from scratch.

On the frontend, the **Select a Game** page (`/games`) includes a new button **Create Custom Game** that routes to `/custom`. The `/custom` page shows an empty 9×9 board where the user can enter “given” values, highlights conflicts in real time, and submits the grid to the backend. On success, the user is redirected to the newly created game at `/game/:gameId`.

On the backend, `POST /api/sudoku/custom` accepts `initialBoard` (a 9×9 grid of integers 0–9 where 0 means empty), rejects invalid shapes/values, rejects conflicting givens, and then runs a backtracking solver that **counts solutions and requires exactly one** (uniquely solvable). If accepted, the server creates a `Game` document with `difficulty: "CUSTOM"`, stores `initialBoard` and `currentBoard` as the submitted grid, stores the unique `solution`, and returns `{ gameId }`.

Assumptions:
- **Auth required**: only logged-in users can submit (`requireAuth`); signed-out users can view the page but cannot create a custom game.
- **Standard rules**: custom games are classic **9×9** Sudoku with **3×3** boxes and digits **1–9**.
- **Input encoding**: boards are sent as a **9×9 integer grid** with values **0–9**, where `0` means blank.
- **Uniqueness definition**: a puzzle is accepted only if it has **exactly one valid solution**; unsolvable or multi-solution puzzles are rejected.
- **Persistence model**: custom puzzles are stored in MongoDB in the `games` collection as a normal `Game` document with `difficulty: "CUSTOM"`.
