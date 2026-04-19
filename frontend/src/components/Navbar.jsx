import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const linkStyle = ({ isActive }) => ({
  fontWeight: isActive ? 600 : 400,
  textDecoration: isActive ? "underline" : "none",
});

export function Navbar() {
  const { username, isLoggedIn, logout, loading } = useAuth();

  return (
    <header
      style={{
        borderBottom: "1px solid #e2e8f0",
        background: "#fff",
      }}
    >
      <nav
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "0.75rem 1rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem 1rem",
          alignItems: "center",
        }}
      >
        <NavLink to="/" end style={linkStyle}>
          Home
        </NavLink>
        <NavLink to="/games" style={linkStyle}>
          Games
        </NavLink>
        <NavLink to="/rules" style={linkStyle}>
          Rules
        </NavLink>
        <NavLink to="/scores" style={linkStyle}>
          Scores
        </NavLink>
        <span style={{ flex: 1 }} />
        {loading ? (
          <span style={{ color: "#64748b" }}>…</span>
        ) : isLoggedIn ? (
          <>
            <span style={{ color: "#0f172a", fontWeight: 600 }}>
              {username}
            </span>
            <button type="button" onClick={() => void logout()}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
