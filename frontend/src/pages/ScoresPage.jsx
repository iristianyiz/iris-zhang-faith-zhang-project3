import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";

export function ScoresPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError("");
      try {
        const data = await api.listWinCounts();
        if (!cancelled) {
          setRows(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) {
          setError("Could not load scores.");
          setRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section>
      <h1>Scores</h1>
      <p style={{ color: "#64748b" }}>
        Wins per user (read-only for everyone).{" "}
        <Link to="/games">Browse games</Link>
      </p>
      {loading ? <p>Loading…</p> : null}
      {error ? (
        <p role="alert" style={{ color: "#b91c1c" }}>
          {error}
        </p>
      ) : null}
      {!loading && !error && rows.length === 0 ? (
        <p style={{ color: "#64748b" }}>No wins recorded yet.</p>
      ) : null}
      {!loading && rows.length > 0 ? (
        <table
          style={{
            borderCollapse: "collapse",
            marginTop: "0.75rem",
            minWidth: "16rem",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "left",
                  borderBottom: "2px solid #cbd5e1",
                  padding: "0.35rem 0.75rem 0.35rem 0",
                }}
              >
                User
              </th>
              <th
                style={{
                  textAlign: "right",
                  borderBottom: "2px solid #cbd5e1",
                  padding: "0.35rem 0 0.35rem 0.75rem",
                }}
              >
                Wins
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.username}>
                <td
                  style={{
                    borderBottom: "1px solid #e2e8f0",
                    padding: "0.45rem 0.75rem 0.45rem 0",
                  }}
                >
                  {row.username}
                </td>
                <td
                  style={{
                    textAlign: "right",
                    borderBottom: "1px solid #e2e8f0",
                    padding: "0.45rem 0 0.45rem 0.75rem",
                  }}
                >
                  {row.wins}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </section>
  );
}
