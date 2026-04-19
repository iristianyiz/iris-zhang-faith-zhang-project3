import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function navLinkClass({ isActive }) {
  return `nav-link${isActive ? " active" : ""}`;
}

export function Navbar() {
  const { isLoggedIn, username, loading, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="app-header">
      <nav className="nav container" aria-label="Primary">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `nav-title${isActive ? " active" : ""}`
          }
        >
          Sudoku Master
        </NavLink>
        <button
          type="button"
          className="nav-toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="nav-toggle-bar" aria-hidden />
          <span className="nav-toggle-bar" aria-hidden />
          <span className="nav-toggle-bar" aria-hidden />
        </button>

        <div className={menuOpen ? "nav-links open" : "nav-links"}>
          <div className="nav-links-primary">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/games" className={navLinkClass}>
              Games
            </NavLink>
            <NavLink to="/rules" className={navLinkClass}>
              Rules
            </NavLink>
            <NavLink to="/scores" className={navLinkClass}>
              High Scores
            </NavLink>
          </div>

          <div className="nav-auth" role="navigation" aria-label="Account">
            {loading ? (
              <span className="nav-muted">…</span>
            ) : isLoggedIn ? (
              <>
                <span className="nav-user-inline">
                  Hi,{" "}
                  <span className="username-pill" title={`Signed in as ${username}`}>
                    {username}
                  </span>
                </span>
                <button
                  type="button"
                  className="btn btn-nav-logout"
                  onClick={() => void handleLogout()}
                  disabled={loggingOut}
                >
                  {loggingOut ? "Logging out…" : "Log out"}
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="nav-link nav-link-auth">
                  Log in
                </NavLink>
                <span className="nav-auth-sep" aria-hidden>
                  |
                </span>
                <NavLink to="/register" className="nav-link nav-link-auth nav-link-register">
                  Register
                </NavLink>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
