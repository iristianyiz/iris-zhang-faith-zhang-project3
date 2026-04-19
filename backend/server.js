import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { userRouter } from "./routes/userRoutes.js";
import { sudokuRouter } from "./routes/sudokuRoutes.js";
import { highscoreRouter } from "./routes/highscoreRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8000;

const staticDir = path.join(__dirname, "..", "frontend", "dist");

app.use(express.json());
app.use(cookieParser());

app.use("/api/user", userRouter);
app.use("/api/sudoku", sudokuRouter);
app.use("/api/highscore", highscoreRouter);

app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/api")) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  next();
});

app.use(express.static(staticDir));

app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(staticDir, "index.html"));
});

const mongoUri =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sudoku-app";

async function start() {
  if (process.env.SKIP_MONGO === "1") {
    console.warn("SKIP_MONGO=1 — API persistence disabled until MongoDB is configured.");
  } else {
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log("MongoDB connected");
    } catch (err) {
      console.error("MongoDB connection failed:", err.message);
      console.error("Set MONGODB_URI, start MongoDB, or use SKIP_MONGO=1 for UI-only preview.");
      process.exit(1);
    }
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

start();
