import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { getApiErrorMessage } from "../utils/apiError.js";

export function ScoresPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listWinCounts();
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load scores."));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="container page">
      <h1 className="page-title">High Scores</h1>
      <p className="muted" style={{ maxWidth: "52ch" }}>
        Wins come from games you completed while logged in. Users with zero wins
        are hidden. Ties are broken alphabetically by username.
      </p>

      {error ? <div className="banner-error">{error}</div> : null}

      {loading ? (
        <p className="muted">Loading leaderboard…</p>
      ) : rows.length === 0 ? (
        <div className="card">
          <p className="muted" style={{ marginBottom: 0 }}>
            No wins recorded yet. <Link to="/games">Play a game</Link> and
            finish a puzzle while logged in.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="table-p2">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Sudokus completed</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.username}>
                  <td>{i + 1}</td>
                  <td>{row.username}</td>
                  <td>{row.wins}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
