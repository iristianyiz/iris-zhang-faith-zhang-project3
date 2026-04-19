import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function GamesPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [games, setGames] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [creating, setCreating] = useState(null);

  const loadGames = useCallback(async () => {
    setLoadError("");
    try {
      const list = await api.listGames();
      setGames(Array.isArray(list) ? list : []);
    } catch {
      setLoadError("Could not load games.");
      setGames([]);
    }
  }, []);

  useEffect(() => {
    void loadGames();
  }, [loadGames]);

  async function handleCreate(difficulty) {
    if (!isLoggedIn || creating) return;
    setCreating(difficulty);
    try {
      const { gameId } = await api.createGame({ difficulty });
      if (gameId) {
        navigate(`/game/${gameId}`);
      }
    } catch {
      setLoadError("Could not create a game. Try signing in again.");
    } finally {
      setCreating(null);
    }
  }

  return (
    <section>
      <h1>Games</h1>
      <p style={{ color: "#64748b", marginBottom: "1rem" }}>
        {isLoggedIn
          ? "Create a new puzzle or open one from the list."
          : "You can browse games below. Log in or register to create new games."}
      </p>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button
          type="button"
          disabled={!isLoggedIn || Boolean(creating)}
          onClick={() => void handleCreate("NORMAL")}
          title={
            isLoggedIn ? undefined : "Sign in to create a game"
          }
        >
          {creating === "NORMAL" ? "Creating…" : "Create Normal Game"}
        </button>
        <button
          type="button"
          disabled={!isLoggedIn || Boolean(creating)}
          onClick={() => void handleCreate("EASY")}
          title={isLoggedIn ? undefined : "Sign in to create a game"}
        >
          {creating === "EASY" ? "Creating…" : "Create Easy Game"}
        </button>
      </div>
      {loadError ? (
        <p role="alert" style={{ color: "#b91c1c", marginTop: "1rem" }}>
          {loadError}
        </p>
      ) : null}
      <h2 style={{ marginTop: "1.5rem", fontSize: "1.1rem" }}>All games</h2>
      {games.length === 0 ? (
        <p style={{ color: "#64748b" }}>No games yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {games.map((g) => (
            <li
              key={g.id}
              style={{
                borderBottom: "1px solid #e2e8f0",
                padding: "0.65rem 0",
              }}
            >
              <Link to={`/game/${g.id}`} style={{ fontWeight: 600 }}>
                {g.name}
              </Link>
              <span style={{ color: "#64748b", marginLeft: "0.5rem" }}>
                · {g.difficulty} · {g.creatorUsername ?? "—"} ·{" "}
                {g.createdAt
                  ? dateFmt.format(new Date(g.createdAt))
                  : "—"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
