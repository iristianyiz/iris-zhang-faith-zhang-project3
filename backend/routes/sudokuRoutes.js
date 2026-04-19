import { Router } from "express";
import mongoose from "mongoose";
import { Game } from "../models/Game.js";
import { HighScore } from "../models/HighScore.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { generateRandomGameName } from "../utils/gameName.js";
import {
  CELLS_TO_REMOVE,
  generateSolvedGrid,
  givensPreserved,
  isValidGridShape,
  isWinningBoard,
  makePuzzleFromSolution,
} from "../utils/sudoku.js";

export const sudokuRouter = Router();
sudokuRouter.use(optionalAuth);

function serializeListItem(game) {
  return {
    id: game._id.toString(),
    name: game.name,
    difficulty: game.difficulty,
    createdAt: game.createdAt,
    creatorUsername: game.creator?.username ?? null,
  };
}

function serializeGameDetail(game, viewerUserId) {
  const completed = Boolean(game.completedBy);
  const viewerOwnsCompletion =
    viewerUserId &&
    game.completedBy &&
    game.completedBy._id.equals(viewerUserId);

  return {
    id: game._id.toString(),
    name: game.name,
    difficulty: game.difficulty,
    createdAt: game.createdAt,
    creatorUsername: game.creator?.username ?? null,
    completed,
    completedAt: game.completedAt,
    completedByUsername: game.completedBy?.username ?? null,
    initialBoard: game.initialBoard,
    currentBoard: game.currentBoard,
    solution: viewerOwnsCompletion ? game.solution : null,
  };
}

sudokuRouter.get("/", async (req, res) => {
  const games = await Game.find()
    .sort({ createdAt: -1 })
    .populate("creator", "username")
    .lean();
  res.json(games.map(serializeListItem));
});

sudokuRouter.post("/", requireAuth, async (req, res) => {
  const raw =
    req.body?.difficulty ?? req.body?.level ?? req.body?.mode ?? null;
  const difficulty =
    typeof raw === "string" ? raw.toUpperCase() : String(raw ?? "");
  if (difficulty !== "EASY" && difficulty !== "NORMAL") {
    res.status(400).json({ error: "difficulty must be EASY or NORMAL" });
    return;
  }
  const cellsToRemove = CELLS_TO_REMOVE[difficulty];
  const solution = generateSolvedGrid();
  const { puzzle } = makePuzzleFromSolution(solution, cellsToRemove);

  for (let attempt = 0; attempt < 50; attempt++) {
    const name = generateRandomGameName();
    try {
      const game = await Game.create({
        name,
        difficulty,
        creator: req.authUser._id,
        initialBoard: puzzle,
        currentBoard: puzzle.map((row) => [...row]),
        solution,
      });
      res.status(201).json({ gameId: game._id.toString() });
      return;
    } catch (err) {
      if (err.code !== 11000) {
        res.status(500).json({ error: "Could not create game" });
        return;
      }
    }
  }
  res.status(503).json({ error: "Could not allocate a unique game name" });
});

sudokuRouter.get("/:gameId", async (req, res) => {
  const { gameId } = req.params;
  if (!mongoose.isValidObjectId(gameId)) {
    res.status(400).json({ error: "Invalid game id" });
    return;
  }
  const game = await Game.findById(gameId)
    .populate("creator", "username")
    .populate("completedBy", "username");
  if (!game) {
    res.status(404).json({ error: "Game not found" });
    return;
  }
  const viewerId = req.authUser?._id ?? null;
  res.json(serializeGameDetail(game, viewerId));
});

sudokuRouter.put("/:gameId", requireAuth, async (req, res) => {
  const { gameId } = req.params;
  if (!mongoose.isValidObjectId(gameId)) {
    res.status(400).json({ error: "Invalid game id" });
    return;
  }
  const game = await Game.findById(gameId);
  if (!game) {
    res.status(404).json({ error: "Game not found" });
    return;
  }

  if (game.completedBy) {
    const populated = await Game.findById(gameId)
      .populate("creator", "username")
      .populate("completedBy", "username");
    res.json(serializeGameDetail(populated, req.authUser._id));
    return;
  }

  if (req.body?.reset === true) {
    game.currentBoard = game.initialBoard.map((row) => [...row]);
    await game.save();
    const populated = await Game.findById(gameId)
      .populate("creator", "username")
      .populate("completedBy", "username");
    res.json(serializeGameDetail(populated, req.authUser._id));
    return;
  }

  const board = req.body?.currentBoard;
  if (!isValidGridShape(board)) {
    res.status(400).json({ error: "currentBoard must be a 9x9 grid of 0–9" });
    return;
  }
  if (!givensPreserved(board, game.initialBoard)) {
    res.status(400).json({ error: "Cannot change given cells" });
    return;
  }

  game.currentBoard = board.map((row) => [...row]);
  if (isWinningBoard(game.currentBoard, game.solution)) {
    game.completedBy = req.authUser._id;
    game.completedAt = new Date();
  }
  await game.save();

  const populated = await Game.findById(gameId)
    .populate("creator", "username")
    .populate("completedBy", "username");
  res.json(serializeGameDetail(populated, req.authUser._id));
});

sudokuRouter.delete("/:gameId", requireAuth, async (req, res) => {
  const { gameId } = req.params;
  if (!mongoose.isValidObjectId(gameId)) {
    res.status(400).json({ error: "Invalid game id" });
    return;
  }
  const game = await Game.findById(gameId);
  if (!game) {
    res.status(404).json({ error: "Game not found" });
    return;
  }
  if (!game.creator.equals(req.authUser._id)) {
    res.status(403).json({ error: "Only the creator may delete this game" });
    return;
  }
  await HighScore.deleteMany({ game: game._id });
  await Game.deleteOne({ _id: game._id });
  res.status(204).send();
});
