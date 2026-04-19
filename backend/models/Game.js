import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    difficulty: { type: String, enum: ["EASY", "NORMAL"], required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    // Add initialBoard, currentBoard, solution, completed flags, etc. when implementing gameplay
  },
  { timestamps: true },
);

export const Game = mongoose.model("Game", gameSchema);
