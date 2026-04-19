import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export function HomePage() {
  const { isLoggedIn, username } = useAuth();

  return (
    <div className="page">
      <section className="hero">
        <h1>Sudoku</h1>
        <p className="muted">
          Play classic 9×9 puzzles, track your wins on the leaderboard, and
          pick up where you left off—saved on the server when you are signed
          in.
        </p>
        <div className="hero-actions">
          <Link to="/games" className="btn btn-primary">
            Play
          </Link>
          <Link to="/rules" className="btn btn-secondary">
            How to play
          </Link>
        </div>
      </section>
      <section className="card stack" style={{ marginTop: "1rem" }}>
        <h2 style={{ marginTop: 0 }}>Quick links</h2>
        <ul className="credits-list">
          <li>
            <Link to="/games">Browse and create games</Link>
          </li>
          <li>
            <Link to="/scores">Win leaderboard</Link>
          </li>
          <li>
            {isLoggedIn ? (
              <>
                Signed in as <strong>{username}</strong>. Use{" "}
                <Link to="/games">Games</Link> to play; your session uses the
                same cookie as the rest of the app.
              </>
            ) : (
              <>
                <Link to="/login">Log in</Link> or{" "}
                <Link to="/register">create an account</Link> to play and save
                progress.
              </>
            )}
          </li>
        </ul>
      </section>
    </div>
  );
}
