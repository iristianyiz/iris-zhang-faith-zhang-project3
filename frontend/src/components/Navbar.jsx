import { Link, NavLink } from "react-router-dom";

const linkStyle = ({ isActive }) => ({
  fontWeight: isActive ? 600 : 400,
  textDecoration: isActive ? "underline" : "none",
});

export function Navbar() {
  // TODO: wire to GET /api/user/isLoggedIn
  const loggedIn = false;
  const username = null;

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
        {loggedIn ? (
          <>
            <span style={{ color: "#64748b" }}>Hi, {username}</span>
            <button type="button">Log out</button>
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
