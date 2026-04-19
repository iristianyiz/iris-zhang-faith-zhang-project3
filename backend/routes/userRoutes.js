import { Router } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";

export const userRouter = Router();

userRouter.use(optionalAuth);

userRouter.get("/isLoggedIn", (req, res) => {
  if (req.authUser) {
    res.json({ username: req.authUser.username });
    return;
  }
  res.json({ error: "Not logged in" });
});

userRouter.post("/register", async (req, res) => {
  const { username, password } = req.body ?? {};
  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    !username.trim() ||
    !password
  ) {
    res.status(400).json({ error: "Username and password are required" });
    return;
  }
  const trimmed = username.trim();
  if (trimmed.length < 2 || trimmed.length > 32) {
    res.status(400).json({ error: "Invalid username" });
    return;
  }
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username: trimmed, passwordHash });
    req.session.userId = user._id.toString();
    res.status(201).json({ username: user.username });
  } catch (err) {
    if (err.code === 11000) {
      res.status(409).json({ error: "Username already taken" });
      return;
    }
    res.status(500).json({ error: "Registration failed" });
  }
});

userRouter.post("/login", async (req, res) => {
  const { username, password } = req.body ?? {};
  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    !username.trim() ||
    !password
  ) {
    res.status(400).json({ error: "Username and password are required" });
    return;
  }
  try {
    const user = await User.findOne({ username: username.trim() });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    req.session.userId = user._id.toString();
    res.json({ username: user.username });
  } catch {
    res.status(500).json({ error: "Login failed" });
  }
});

userRouter.post("/logout", requireAuth, (req, res) => {
  const secure = process.env.NODE_ENV === "production";
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: "Logout failed" });
      return;
    }
    res.clearCookie("sudoku.sid", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure,
    });
    res.json({ ok: true });
  });
});
