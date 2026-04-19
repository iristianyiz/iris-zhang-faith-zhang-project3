import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export function HomePage() {
  const { isLoggedIn, username } = useAuth();

  return (
    <div className="container page">
      <section className="hero">
        <h1>Sudoku Master</h1>
        <p>
          Challenge your mind with the classic number puzzle—now backed by a
          server so you can save games, compete on wins, and pick up where you
          left off when signed in.
        </p>
        <div className="cta-row">
          <Link className="btn btn-primary" to="/games">
            Start Playing
          </Link>
          <Link className="btn btn-secondary" to="/rules">
            Learn the Rules
          </Link>
        </div>
        <div className="home-art" aria-hidden="true">
          <img className="home-art-img" src="/chessboard.svg" alt="" />
        </div>
      </section>

      <div className="card stack" style={{ marginTop: "1.5rem" }}>
        <h2 className="page-title" style={{ marginTop: 0, marginBottom: 0 }}>
          Quick start
        </h2>
        <ul className="credits-list" style={{ textAlign: "left" }}>
          <li>
            <Link to="/games">Open the game list</Link> to create a{" "}
            <strong>6×6 Easy</strong> or <strong>9×9 Normal</strong> puzzle.
          </li>
          <li>
            <Link to="/scores">High Scores</Link> ranks players by completed
            wins.
          </li>
          <li>
            {isLoggedIn ? (
              <>
                Signed in as <strong>{username}</strong>. Your board updates
                save to the server automatically.
              </>
            ) : (
              <>
                <Link to="/login">Log in</Link> or{" "}
                <Link to="/register">register</Link> to play interactively;
                logged-out visitors can still browse in read-only mode.
              </>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
}
