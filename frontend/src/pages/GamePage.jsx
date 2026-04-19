import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

function cloneGrid(grid) {
  if (!Array.isArray(grid)) return null;
  return grid.map((row) => [...row]);
}

function cellBorderStyle(row, col) {
  return {
    borderTop: row % 3 === 0 ? "2px solid #0f172a" : "1px solid #94a3b8",
    borderLeft: col % 3 === 0 ? "2px solid #0f172a" : "1px solid #94a3b8",
    borderRight: col === 8 ? "2px solid #0f172a" : undefined,
    borderBottom: row === 8 ? "2px solid #0f172a" : undefined,
  };
}

export function GamePage() {
  const { gameId } = useParams();
  const { isLoggedIn } = useAuth();
  const [detail, setDetail] = useState(null);
  const [board, setBoard] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadGame = useCallback(async () => {
    if (!gameId) return;
    setLoading(true);
    setLoadError("");
    try {
      const data = await api.getGame(gameId);
      setDetail(data);
      setBoard(cloneGrid(data.currentBoard));
      setDirty(false);
      setSaveError("");
    } catch {
      setLoadError("Game not found or could not be loaded.");
      setDetail(null);
      setBoard(null);
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    void loadGame();
  }, [loadGame]);

  const completed = Boolean(detail?.completed);
  const canPlay = isLoggedIn && !completed;
  const initial = detail?.initialBoard;

  function setCell(row, col, digit) {
    if (!canPlay || !board || !initial) return;
    if (initial[row][col] !== 0) return;
    const next = board.map((r) => [...r]);
    next[row][col] = digit;
    setBoard(next);
    setDirty(true);
    setSaveError("");
  }

  async function persist(body) {
    if (!gameId || !canPlay) return;
    setSaving(true);
    setSaveError("");
    try {
      const data = await api.updateGame(gameId, body);
      setDetail(data);
      setBoard(cloneGrid(data.currentBoard));
      setDirty(false);
    } catch (err) {
      setSaveError(err?.data?.error || "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section>
        <h1>Game</h1>
        <p>Loading…</p>
      </section>
    );
  }

  if (loadError || !detail || !board || !initial) {
    return (
      <section>
        <h1>Game</h1>
        <p role="alert">{loadError || "Missing data."}</p>
        <p>
          <Link to="/games">Back to games</Link>
        </p>
      </section>
    );
  }

  return (
    <section>
      <p>
        <Link to="/games">← Games</Link>
      </p>
      <h1>{detail.name}</h1>
      <p style={{ color: "#64748b" }}>
        {detail.difficulty} · by {detail.creatorUsername ?? "—"}
      </p>
      {!isLoggedIn ? (
        <p
          style={{
            background: "#e0f2fe",
            border: "1px solid #7dd3fc",
            padding: "0.65rem 0.75rem",
            borderRadius: "6px",
            marginBottom: "1rem",
          }}
        >
          You are viewing this game in <strong>read-only</strong> mode.{" "}
          <Link to="/login">Log in</Link> or{" "}
          <Link to="/register">register</Link> to play and save moves.
        </p>
      ) : null}
      {completed ? (
        <p style={{ marginBottom: "1rem" }}>
          Completed
          {detail.completedByUsername
            ? ` by ${detail.completedByUsername}`
            : ""}
          {detail.completedAt
            ? ` on ${new Date(detail.completedAt).toLocaleString()}`
            : ""}
          .
        </p>
      ) : null}
      <div
        style={{
          display: "inline-block",
          background: "#fff",
          padding: "0.75rem",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
        }}
      >
        <table
          className="sudoku-board"
          style={{ borderCollapse: "collapse", margin: 0 }}
        >
          <tbody>
            {board.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => {
                  const given = initial[r][c] !== 0;
                  const readOnly = !canPlay || given;
                  return (
                    <td
                      key={c}
                      style={{
                        width: "2.25rem",
                        height: "2.25rem",
                        padding: 0,
                        ...cellBorderStyle(r, c),
                        background: given ? "#f1f5f9" : "#fff",
                      }}
                    >
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        disabled={readOnly}
                        aria-label={`Row ${r + 1} column ${c + 1}`}
                        value={cell === 0 ? "" : String(cell)}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "").slice(-1);
                          if (v === "") {
                            setCell(r, c, 0);
                            return;
                          }
                          const n = Number(v);
                          if (n >= 1 && n <= 9) setCell(r, c, n);
                        }}
                        style={{
                          width: "100%",
                          height: "100%",
                          border: "none",
                          textAlign: "center",
                          fontSize: "1.1rem",
                          fontWeight: given ? 700 : 500,
                          background: "transparent",
                          color: "#0f172a",
                        }}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {canPlay ? (
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            disabled={saving || !dirty}
            onClick={() =>
              void persist({ currentBoard: board.map((row) => [...row]) })
            }
          >
            {saving ? "Saving…" : "Save progress"}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void persist({ reset: true })}
          >
            Reset
          </button>
        </div>
      ) : null}
      {saveError ? (
        <p role="alert" style={{ color: "#b91c1c", marginTop: "0.75rem" }}>
          {saveError}
        </p>
      ) : null}
      {detail.solution ? (
        <div style={{ marginTop: "1.5rem" }}>
          <h2 style={{ fontSize: "1rem" }}>Solution</h2>
          <pre
            style={{
              fontSize: "0.75rem",
              overflow: "auto",
              background: "#f8fafc",
              padding: "0.75rem",
              borderRadius: "6px",
            }}
          >
            {JSON.stringify(detail.solution)}
          </pre>
        </div>
      ) : null}
    </section>
  );
}
