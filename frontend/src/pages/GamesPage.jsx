import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { getApiErrorMessage } from "../utils/apiError.js";
import { formatGameDate } from "../utils/formatDate.js";

export function GamesPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.listGames();
      setGames(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load games."));
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function create(difficulty) {
    if (!isLoggedIn) return;
    setBusy(difficulty);
    setError(null);
    try {
      const res = await api.createGame({ difficulty });
      if (res?.gameId) {
        navigate(`/game/${res.gameId}`);
        return;
      }
      setError("Server did not return a game id.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not create game."));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="container page">
      <h1 className="page-title">Select a Game</h1>
      <p className="muted" style={{ maxWidth: "52ch" }}>
        <strong>Easy</strong> is <strong>6×6</strong> (digits 1–6).{" "}
        <strong>Normal</strong> is <strong>9×9</strong> (digits 1–9). Create a
        new saved game or continue one from the list. Dates use your browser
        locale.
      </p>

      {!isLoggedIn ? (
        <div
          id="games-readonly-hint"
          className="banner-info banner-centered"
          role="status"
        >
          You can browse puzzles, but you need to{" "}
          <Link to="/login">log in</Link> to create a game or save moves.
        </div>
      ) : null}

      <div className={`cta-row${!isLoggedIn ? " cta-row-readonly" : ""}`}>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!isLoggedIn || busy !== null}
          aria-disabled={!isLoggedIn || busy !== null}
          aria-describedby={!isLoggedIn ? "games-readonly-hint" : undefined}
          title={!isLoggedIn ? "Sign in to create a game" : undefined}
          onClick={() => void create("NORMAL")}
        >
          {busy === "NORMAL" ? "Creating…" : "Create normal game (9×9)"}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          disabled={!isLoggedIn || busy !== null}
          aria-disabled={!isLoggedIn || busy !== null}
          aria-describedby={!isLoggedIn ? "games-readonly-hint" : undefined}
          title={!isLoggedIn ? "Sign in to create a game" : undefined}
          onClick={() => void create("EASY")}
        >
          {busy === "EASY" ? "Creating…" : "Create easy game (6×6)"}
        </button>
      </div>

      {error ? <div className="banner-error">{error}</div> : null}

      <div className="card stack" style={{ marginTop: "1rem", textAlign: "left" }}>
        <h2 style={{ marginTop: 0 }}>All games</h2>
        {loading ? (
          <p className="muted" style={{ marginBottom: 0 }}>
            Loading games…
          </p>
        ) : games.length === 0 ? (
          <p className="muted" style={{ marginBottom: 0 }}>
            {isLoggedIn
              ? "No games yet. Create one to get started."
              : "No games yet. Log in to create the first puzzle."}
          </p>
        ) : (
          <ul className="list-p2">
            {games.map((g) => (
              <li key={g.id} className="list-item-p2">
                <div>
                  <Link to={`/game/${g.id}`}>
                    <strong>{g.name}</strong>
                  </Link>
                  <div className="muted" style={{ marginTop: "0.25rem" }}>
                    <span className="tag">{g.difficulty}</span>
                    {g.boardSize ? (
                      <>
                        {" "}
                        ({g.boardSize}×{g.boardSize})
                      </>
                    ) : null}
                    {" · "}
                    {formatGameDate(g.createdAt)}
                    {g.creatorUsername ? <> · by {g.creatorUsername}</> : null}
                  </div>
                </div>
                <Link className="btn btn-primary btn-small" to={`/game/${g.id}`}>
                  Play
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
