import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function navClass({ isActive }) {
  return `nav-link${isActive ? " is-active" : ""}`;
}

export function Navbar() {
  const { isLoggedIn, username, loading, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="Primary">
        <NavLink to="/" end className={navClass}>
          Home
        </NavLink>
        <NavLink to="/games" className={navClass}>
          Games
        </NavLink>
        <NavLink to="/rules" className={navClass}>
          Rules
        </NavLink>
        <NavLink to="/scores" className={navClass}>
          Scores
        </NavLink>
        <span className="site-nav-spacer" />
        {loading ? (
          <span className="muted">…</span>
        ) : isLoggedIn ? (
          <>
            <span className="nav-user">
              Hi, <span className="username-pill">{username}</span>
            </span>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? "Logging out…" : "Log out"}
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">
              Log in
            </Link>
            <Link to="/register" className="nav-link">
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
