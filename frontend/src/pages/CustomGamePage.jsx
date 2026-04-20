import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { SudokuBoard } from "../components/SudokuBoard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getApiErrorMessage } from "../utils/apiError.js";
import { conflictGrid } from "../utils/sudokuValidate.js";

function makeEmpty9x9() {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

export function CustomGamePage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [board, setBoard] = useState(() => makeEmpty9x9());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const initialBoard = useMemo(() => makeEmpty9x9(), []);

  const invalidGrid = useMemo(() => conflictGrid(board, 3, 3), [board]);
  const hasConflicts = useMemo(
    () => invalidGrid.some((row) => row.some(Boolean)),
    [invalidGrid],
  );

  function handleCellChange(r, c, v) {
    setBoard((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = v;
      return next;
    });
  }

  async function handleSubmit() {
    if (!isLoggedIn || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api.createCustomGame({ initialBoard: board });
      if (res?.gameId) {
        navigate(`/game/${res.gameId}`);
        return;
      }
      setError("Server did not return a game id.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not create custom game."));
    } finally {
      setBusy(false);
    }
  }

  function handleClear() {
    setBoard(makeEmpty9x9());
    setError(null);
  }

  return (
    <div className="container page stack">
      <p>
        <Link to="/games">← Back to games</Link>
      </p>

      <header>
        <h1 className="page-title" style={{ marginBottom: "0.35rem" }}>
          Create a Custom Game
        </h1>
        <p className="muted" style={{ marginBottom: 0, maxWidth: "62ch" }}>
          Enter your clues on an empty <strong>9×9</strong> board, then submit.
          The server will accept it only if the puzzle has <strong>exactly one</strong>{" "}
          valid solution.
        </p>
      </header>

      {!isLoggedIn ? (
        <div className="banner-info" role="status">
          Please <Link to="/login">log in</Link> to submit a custom puzzle.
        </div>
      ) : null}

      {hasConflicts ? (
        <div className="banner-error" role="status">
          Some entries conflict (row/column/box). Fix those before submitting.
        </div>
      ) : null}

      {error ? <div className="banner-error">{error}</div> : null}

      <div className="sudoku-wrap">
        <SudokuBoard
          initialBoard={initialBoard}
          currentBoard={board}
          onCellChange={handleCellChange}
          readOnly={busy}
          boxRows={3}
          boxCols={3}
          invalidGrid={invalidGrid}
        />
      </div>

      <div className="row" style={{ justifyContent: "center", gap: "0.75rem" }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleClear}
          disabled={busy}
        >
          Clear
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => void handleSubmit()}
          disabled={!isLoggedIn || busy || hasConflicts}
          aria-disabled={!isLoggedIn || busy || hasConflicts}
          title={
            !isLoggedIn
              ? "Sign in to submit"
              : hasConflicts
                ? "Fix conflicts before submitting"
                : undefined
          }
        >
          {busy ? "Submitting…" : "Submit"}
        </button>
      </div>
    </div>
  );
}

