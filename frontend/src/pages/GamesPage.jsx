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
    load();
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
    <div className="page stack">
      <header>
        <h1>Games</h1>
        <p className="muted">
          Create a new puzzle or open one you have already started. Dates use
          your browser locale.
        </p>
      </header>

      {!isLoggedIn ? (
        <div className="banner-info">
          You can browse puzzles, but you need to{" "}
          <Link to="/login">log in</Link> to create a game or save moves.
        </div>
      ) : null}

      <div className="row">
        <button
          type="button"
          className="btn btn-primary"
          disabled={!isLoggedIn || busy !== null}
          onClick={() => create("NORMAL")}
        >
          {busy === "NORMAL" ? "Creating…" : "Create normal game"}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          disabled={!isLoggedIn || busy !== null}
          onClick={() => create("EASY")}
        >
          {busy === "EASY" ? "Creating…" : "Create easy game"}
        </button>
      </div>

      {error ? <div className="banner-error">{error}</div> : null}

      <section className="card stack">
        <h2 style={{ marginTop: 0 }}>All games</h2>
        {loading ? (
          <p className="muted">Loading games…</p>
        ) : games.length === 0 ? (
          <p className="muted">No games yet. Create one to get started.</p>
        ) : (
          <ul className="game-list">
            {games.map((g) => (
              <li key={g.id}>
                <Link to={`/game/${g.id}`}>
                  <strong>{g.name}</strong>{" "}
                  <span className="tag">{g.difficulty}</span>
                  <div className="meta">
                    {formatGameDate(g.createdAt)}
                    {g.creatorUsername ? (
                      <> · by {g.creatorUsername}</>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
