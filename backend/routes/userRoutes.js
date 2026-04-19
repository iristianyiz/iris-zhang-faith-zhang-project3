import { Router } from "express";

export const userRouter = Router();

userRouter.get("/isLoggedIn", (req, res) => {
  // TODO: read session cookie; return { username } or { error }
  res.json({ error: "Not logged in" });
});

userRouter.post("/login", (req, res) => {
  // TODO: validate body, set cookie
  res.status(501).json({ error: "Not implemented" });
});

userRouter.post("/register", (req, res) => {
  // TODO: create user, set cookie
  res.status(501).json({ error: "Not implemented" });
});

userRouter.post("/logout", (req, res) => {
  // TODO: clear cookies
  res.json({ ok: true });
});
