import { Router } from "express";

export const highscoreRouter = Router();

highscoreRouter.get("/", (req, res) => {
  // TODO: sorted list (username + game per brief)
  res.json([]);
});

highscoreRouter.post("/", (req, res) => {
  // TODO: update high score for a game
  res.status(501).json({ error: "Not implemented" });
});

highscoreRouter.get("/:gameId", (req, res) => {
  // TODO: high score for specific game
  res.status(501).json({ error: "Not implemented" });
});
