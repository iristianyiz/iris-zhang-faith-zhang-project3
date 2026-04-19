import mongoose from "mongoose";

/** Best elapsed time (seconds) for a completed game, one row per game. */
const highScoreSchema = new mongoose.Schema(
  {
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    elapsedSeconds: { type: Number, required: true, min: 1 },
  },
  { timestamps: true },
);

highScoreSchema.index({ elapsedSeconds: 1 });
highScoreSchema.index({ user: 1 });

export const HighScore = mongoose.model("HighScore", highScoreSchema);
