import { Router } from "express";
import mongoose from "mongoose";
import { Game } from "../models/Game.js";
import { HighScore } from "../models/HighScore.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { generateRandomGameName } from "../utils/gameName.js";
import {
  DIFFICULTY_LAYOUT,
  countSolutions,
  generateSolvedGrid,
  givensPreserved,
  isValidGivenGrid,
  isValidGridShape,
  isWinningBoard,
  makePuzzleFromSolution,
} from "../utils/sudoku.js";

export const sudokuRouter = Router();
sudokuRouter.use(optionalAuth);

function serializeListItem(game) {
  const boardSize = Array.isArray(game.initialBoard)
    ? game.initialBoard.length
    : 9;
  return {
    id: game._id.toString(),
    name: game.name,
    difficulty: game.difficulty,
    boardSize,
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

  const boardSize = Array.isArray(game.initialBoard)
    ? game.initialBoard.length
    : 9;
  const boxRows = boardSize === 6 ? 2 : 3;
  const boxCols = boardSize === 6 ? 3 : 3;

  return {
    id: game._id.toString(),
    name: game.name,
    difficulty: game.difficulty,
    boardSize,
    boxRows,
    boxCols,
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
  const layout = DIFFICULTY_LAYOUT[difficulty];
  const solution = generateSolvedGrid(layout);
  const { puzzle } = makePuzzleFromSolution(
    solution,
    layout.cellsToRemove,
    layout.size,
  );

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

sudokuRouter.post("/custom", requireAuth, async (req, res) => {
  const puzzle = req.body?.initialBoard ?? req.body?.board ?? req.body?.puzzle;
  const layout = DIFFICULTY_LAYOUT.NORMAL; // standard 9×9
  const { size, boxRows, boxCols } = layout;
  const maxDigit = size;

  if (!isValidGridShape(puzzle, size, maxDigit)) {
    res.status(400).json({
      error: `initialBoard must be a ${size}×${size} grid with values 0–${maxDigit}`,
    });
    return;
  }

  // Validate givens don't already violate Sudoku constraints.
  const puzzleCopy = puzzle.map((row) => [...row]);
  if (!isValidGivenGrid(puzzleCopy, size, maxDigit, boxRows, boxCols)) {
    res.status(400).json({ error: "Invalid puzzle (conflicting givens)" });
    return;
  }

  // Must have exactly 1 solution.
  const { count, solution } = countSolutions(puzzleCopy, layout, 2);
  if (count === 0) {
    res.status(400).json({ error: "Puzzle is unsolvable" });
    return;
  }
  if (count !== 1 || !solution) {
    res.status(400).json({ error: "Puzzle must have exactly one solution" });
    return;
  }

  for (let attempt = 0; attempt < 50; attempt++) {
    const name = `Custom ${generateRandomGameName()}`;
    try {
      const game = await Game.create({
        name,
        difficulty: "CUSTOM",
        creator: req.authUser._id,
        initialBoard: puzzle,
        currentBoard: puzzle.map((row) => [...row]),
        solution,
      });
      res.status(201).json({ gameId: game._id.toString() });
      return;
    } catch (err) {
      if (err.code !== 11000) {
        res.status(500).json({ error: "Could not create custom game" });
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
    const resetBoard = game.initialBoard.map((row) => [...row]);
    await Game.findByIdAndUpdate(
      gameId,
      { currentBoard: resetBoard },
      { new: false },
    );
    const populated = await Game.findById(gameId)
      .populate("creator", "username")
      .populate("completedBy", "username");
    res.json(serializeGameDetail(populated, req.authUser._id));
    return;
  }

  const board = req.body?.currentBoard;
  const size = game.initialBoard.length;
  const maxDigit = size;
  if (!isValidGridShape(board, size, maxDigit)) {
    res.status(400).json({
      error: `currentBoard must be a ${size}×${size} grid with values 0–${maxDigit}`,
    });
    return;
  }
  if (!givensPreserved(board, game.initialBoard)) {
    res.status(400).json({ error: "Cannot change given cells" });
    return;
  }

  const nextBoard = board.map((row) => [...row]);
  const updates = { currentBoard: nextBoard };
  if (isWinningBoard(nextBoard, game.solution)) {
    updates.completedBy = req.authUser._id;
    updates.completedAt = new Date();
  }

  // Avoid crashing the server on concurrent saves (VersionError from optimistic concurrency).
  await Game.findByIdAndUpdate(gameId, updates, { new: false });

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
