import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import { SudokuBoard } from "../components/SudokuBoard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getApiErrorMessage } from "../utils/apiError.js";
import { formatGameDate } from "../utils/formatDate.js";
import { conflictGrid } from "../utils/sudokuValidate.js";

export function GamePage() {
  const { gameId } = useParams();
  const { isLoggedIn, username } = useAuth();
  const [game, setGame] = useState(null);
  const [board, setBoard] = useState(null);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [loading, setLoading] = useState(true);

  const debounceRef = useRef(null);
  const playStartRef = useRef(null);
  const postedHighscoreRef = useRef(false);

  const loadGame = useCallback(async () => {
    if (!gameId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getGame(gameId);
      setGame(data);
      setBoard(data.currentBoard.map((row) => [...row]));
      if (isLoggedIn && !data.completed) {
        playStartRef.current ??= Date.now();
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load game."));
      setGame(null);
      setBoard(null);
    } finally {
      setLoading(false);
    }
  }, [gameId, isLoggedIn]);

  useEffect(() => {
    postedHighscoreRef.current = false;
    playStartRef.current = null;
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [gameId]);

  useEffect(() => {
    void loadGame();
  }, [loadGame]);

  const readOnly = !isLoggedIn || Boolean(game?.completed);

  const layout = useMemo(() => {
    if (!game?.initialBoard) {
      return { size: 9, boxRows: 3, boxCols: 3 };
    }
    const size = game.boardSize ?? game.initialBoard.length;
    const boxRows = game.boxRows ?? (size === 6 ? 2 : 3);
    const boxCols = game.boxCols ?? (size === 6 ? 3 : 3);
    return { size, boxRows, boxCols };
  }, [game]);

  const invalidGrid = useMemo(() => {
    if (!board || readOnly) return null;
    return conflictGrid(board, layout.boxRows, layout.boxCols);
  }, [board, layout.boxRows, layout.boxCols, readOnly]);

  const flushSave = useCallback(
    async (grid) => {
      if (!gameId || !isLoggedIn) return;
      try {
        setSaveError(null);
        const data = await api.updateGame(gameId, { currentBoard: grid });
        setGame(data);
        setBoard(data.currentBoard.map((row) => [...row]));
        if (data.completed && isLoggedIn && !postedHighscoreRef.current) {
          postedHighscoreRef.current = true;
          const start = playStartRef.current ?? Date.now();
          const elapsed = Math.max(1, Math.round((Date.now() - start) / 1000));
          try {
            await api.postHighscore({ gameId, elapsedSeconds: elapsed });
          } catch {
            postedHighscoreRef.current = false;
          }
        }
      } catch (err) {
        setSaveError(getApiErrorMessage(err, "Could not save your move."));
        await loadGame();
      }
    },
    [gameId, isLoggedIn, loadGame],
  );

  const scheduleSave = useCallback(
    (grid) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        void flushSave(grid);
      }, 450);
    },
    [flushSave],
  );

  function handleCellChange(r, c, v) {
    if (!game || readOnly) return;
    setBoard((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = v;
      scheduleSave(next);
      return next;
    });
  }

  async function handleReset() {
    if (!gameId || !isLoggedIn || game?.completed) return;
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    try {
      setSaveError(null);
      const data = await api.updateGame(gameId, { reset: true });
      setGame(data);
      setBoard(data.currentBoard.map((row) => [...row]));
      playStartRef.current = Date.now();
    } catch (err) {
      setSaveError(getApiErrorMessage(err, "Could not reset the board."));
    }
  }

  const viewerIsCompleter = Boolean(
    game?.completed &&
      username &&
      game.completedByUsername &&
      game.completedByUsername === username,
  );

  return (
    <div className="container page page-game stack">
      <p>
        <Link to="/games">← All games</Link>
      </p>

      {loading ? <p className="muted">Loading puzzle…</p> : null}
      {error ? <div className="banner-error">{error}</div> : null}

      {!loading && game && board ? (
        <>
          <header>
            <h1 style={{ marginBottom: "0.35rem" }}>{game.name}</h1>
            <p className="muted" style={{ marginBottom: 0 }}>
              <span className="tag">{game.difficulty}</span>
              {" · "}
              {layout.size}×{layout.size}
              {" · "}
              {formatGameDate(game.createdAt)}
              {game.creatorUsername ? <> · by {game.creatorUsername}</> : null}
            </p>
          </header>

          {game.completed ? (
            <div className="banner-success">
              This puzzle is solved
              {game.completedByUsername
                ? ` (completed by ${game.completedByUsername})`
                : ""}
              .
              {viewerIsCompleter && game.solution
                ? " Your solution is shown below with clues."
                : null}
            </div>
          ) : null}

          {!isLoggedIn ? (
            <div className="banner-info">
              Log in to enter numbers and save progress. You can still view this
              board read-only.
            </div>
          ) : null}

          {saveError ? <div className="banner-error">{saveError}</div> : null}

          <div
            className={`sudoku-wrap${layout.size === 6 ? " is-mini" : ""}`}
          >
            <SudokuBoard
              initialBoard={game.initialBoard}
              currentBoard={board}
              onCellChange={handleCellChange}
              readOnly={readOnly}
              boxRows={layout.boxRows}
              boxCols={layout.boxCols}
              invalidGrid={invalidGrid}
            />
          </div>

          <div className="row" style={{ justifyContent: "center" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => void handleReset()}
              disabled={!isLoggedIn || Boolean(game.completed)}
            >
              Reset puzzle
            </button>
          </div>
          <p className="muted" style={{ textAlign: "center", marginBottom: 0 }}>
            Reset restores the original clues and clears your entries for this
            game.
          </p>
        </>
      ) : null}
    </div>
  );
}
