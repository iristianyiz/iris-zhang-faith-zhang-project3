import { User } from "../models/User.js";

/**
 * Attaches `req.authUser` when session has a user id (may be null).
 */
export async function optionalAuth(req, res, next) {
  req.authUser = null;
  try {
    const userId = req.session?.userId;
    if (!userId) {
      next();
      return;
    }
    const user = await User.findById(userId).select("username");
    if (user) {
      req.authUser = user;
    } else {
      req.session.userId = undefined;
    }
    next();
  } catch (err) {
    next(err);
  }
}

export function requireAuth(req, res, next) {
  if (!req.authUser) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  next();
}
