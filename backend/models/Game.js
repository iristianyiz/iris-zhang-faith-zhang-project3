import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    difficulty: { type: String, enum: ["EASY", "NORMAL"], required: true },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    initialBoard: { type: mongoose.Schema.Types.Mixed, required: true },
    currentBoard: { type: mongoose.Schema.Types.Mixed, required: true },
    solution: { type: mongoose.Schema.Types.Mixed, required: true },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

gameSchema.index({ createdAt: -1 });
gameSchema.index({ creator: 1, createdAt: -1 });
gameSchema.index({ completedBy: 1 });

export const Game = mongoose.model("Game", gameSchema);
