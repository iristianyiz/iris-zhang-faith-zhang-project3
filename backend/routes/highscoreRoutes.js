import { Router } from "express";
import mongoose from "mongoose";
import { Game } from "../models/Game.js";
import { HighScore } from "../models/HighScore.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";

export const highscoreRouter = Router();
highscoreRouter.use(optionalAuth);

highscoreRouter.get("/", async (req, res) => {
  const entries = await HighScore.find()
    .populate("user", "username")
    .populate("game", "name difficulty")
    .sort({ elapsedSeconds: 1, createdAt: 1 })
    .lean();

  const rows = entries.map((row) => ({
    username: row.user?.username ?? "unknown",
    gameId: row.game?._id?.toString(),
    gameName: row.game?.name ?? null,
    difficulty: row.game?.difficulty ?? null,
    elapsedSeconds: row.elapsedSeconds,
  }));

  rows.sort((a, b) => {
    if (a.elapsedSeconds !== b.elapsedSeconds) {
      return a.elapsedSeconds - b.elapsedSeconds;
    }
    return String(a.username).localeCompare(String(b.username));
  });

  res.json(rows);
});

highscoreRouter.get("/leaderboard/wins", async (req, res) => {
  const winsAgg = await Game.aggregate([
    { $match: { completedBy: { $ne: null } } },
    { $group: { _id: "$completedBy", wins: { $sum: 1 } } },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "u",
      },
    },
    {
      $addFields: {
        username: { $arrayElemAt: ["$u.username", 0] },
      },
    },
    { $match: { wins: { $gt: 0 } } },
    { $sort: { wins: -1, username: 1 } },
    { $project: { _id: 0, username: 1, wins: 1 } },
  ]);

  res.json(winsAgg);
});

highscoreRouter.post("/", requireAuth, async (req, res) => {
  const { gameId, elapsedSeconds } = req.body ?? {};
  if (!mongoose.isValidObjectId(gameId)) {
    res.status(400).json({ error: "gameId is required" });
    return;
  }
  const secs = Number(elapsedSeconds);
  if (!Number.isFinite(secs) || secs < 1 || secs > 1e7) {
    res.status(400).json({ error: "elapsedSeconds must be a positive number" });
    return;
  }
  const rounded = Math.round(secs);

  const game = await Game.findById(gameId);
  if (!game || !game.completedBy) {
    res.status(400).json({ error: "Game is not completed" });
    return;
  }
  if (!game.completedBy.equals(req.authUser._id)) {
    res.status(403).json({ error: "Only the completing user may record a score" });
    return;
  }

  const existing = await HighScore.findOne({ game: game._id });
  if (existing) {
    if (!existing.user.equals(req.authUser._id)) {
      res.status(409).json({ error: "High score already recorded for this game" });
      return;
    }
    if (rounded >= existing.elapsedSeconds) {
      res.json({
        ok: true,
        elapsedSeconds: existing.elapsedSeconds,
        idempotent: true,
      });
      return;
    }
    existing.elapsedSeconds = rounded;
    await existing.save();
    res.json({ ok: true, elapsedSeconds: rounded, updated: true });
    return;
  }

  await HighScore.create({
    game: game._id,
    user: req.authUser._id,
    elapsedSeconds: rounded,
  });
  res.status(201).json({ ok: true, elapsedSeconds: rounded });
});

highscoreRouter.get("/:gameId", async (req, res) => {
  const { gameId } = req.params;
  if (!mongoose.isValidObjectId(gameId)) {
    res.status(400).json({ error: "Invalid game id" });
    return;
  }
  const row = await HighScore.findOne({ game: gameId })
    .populate("user", "username")
    .populate("game", "name")
    .lean();
  if (!row) {
    res.json({
      gameId,
      highScore: null,
    });
    return;
  }
  res.json({
    gameId,
    highScore: {
      username: row.user?.username ?? null,
      elapsedSeconds: row.elapsedSeconds,
      gameName: row.game?.name ?? null,
    },
  });
});
