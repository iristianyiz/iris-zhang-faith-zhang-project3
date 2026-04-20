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
