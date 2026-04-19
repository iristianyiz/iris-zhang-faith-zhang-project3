import { Router } from "express";

export const sudokuRouter = Router();

sudokuRouter.get("/", (req, res) => {
  // TODO: list games (name, id, createdAt, difficulty)
  res.json([]);
});

sudokuRouter.post("/", (req, res) => {
  // TODO: EASY | NORMAL, unique name, return { gameId }
  res.status(501).json({ error: "Not implemented" });
});

sudokuRouter.get("/:gameId", (req, res) => {
  // Extra route: load one game for /game/:gameId (assignment allows more APIs)
  res.status(501).json({ error: "Not implemented" });
});

sudokuRouter.put("/:gameId", (req, res) => {
  // TODO: update game state
  res.status(501).json({ error: "Not implemented" });
});

sudokuRouter.delete("/:gameId", (req, res) => {
  // TODO: delete game
  res.status(501).json({ error: "Not implemented" });
});
