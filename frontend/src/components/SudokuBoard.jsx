/**
 * Square Sudoku board: 0 = empty. Clues (initial !== 0) stay locked when interactive.
 * @param {{ boxRows?: number, boxCols?: number, invalidGrid?: boolean[][] | null }} props
 */
export function SudokuBoard({
  initialBoard,
  currentBoard,
  onCellChange,
  readOnly,
  boxRows: boxRowsProp,
  boxCols: boxColsProp,
  invalidGrid = null,
}) {
  const size = currentBoard.length;
  const boxRows = boxRowsProp ?? (size === 6 ? 2 : 3);
  const boxCols = boxColsProp ?? (size === 6 ? 3 : 3);
  const maxDigit = size;

  const handleInput = (row, col, raw) => {
    if (readOnly) return;
    const g = initialBoard[row][col];
    if (g !== 0) return;
    const v = String(raw).replace(/\D/g, "").slice(-1);
    if (v === "") {
      onCellChange(row, col, 0);
      return;
    }
    const n = Number(v);
    if (n >= 1 && n <= maxDigit) {
      onCellChange(row, col, n);
    }
  };

  return (
    <div
      className="sudoku-board"
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
      role="grid"
      aria-readonly={readOnly ? true : undefined}
      aria-label={`Sudoku grid ${size} by ${size}${readOnly ? ", view only" : ""}`}
    >
      {currentBoard.map((row, r) =>
        row.map((value, c) => {
          const given = initialBoard[r][c] !== 0;
          const locked = readOnly || given;
          const conflict = invalidGrid?.[r]?.[c] ?? false;

          return (
            <div
              key={`${r}-${c}`}
              className={[
                "sudoku-cell-wrap",
                given ? "is-given" : "",
                locked && !given ? "is-readonly" : "",
                conflict ? "is-conflict" : "",
                r % boxRows === 0 ? "thick-top" : "",
                c % boxCols === 0 ? "thick-left" : "",
                c === size - 1 ? "thick-right" : "",
                r === size - 1 ? "thick-bottom" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              role="gridcell"
            >
              {locked ? (
                <span className="sudoku-cell-static">
                  {value === 0 ? "" : value}
                </span>
              ) : (
                <input
                  className="sudoku-cell-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  autoComplete="off"
                  aria-label={`Row ${r + 1} column ${c + 1}`}
                  value={value === 0 ? "" : String(value)}
                  onChange={(e) => handleInput(r, c, e.target.value)}
                />
              )}
            </div>
          );
        }),
      )}
    </div>
  );
}
