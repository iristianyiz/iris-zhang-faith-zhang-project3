/**
 * 9×9 board: 0 = empty in data; displayed as blank.
 * Clues (initial !== 0) cannot be edited when the board is interactive.
 */
export function SudokuBoard({ initialBoard, currentBoard, onCellChange, readOnly }) {
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
    if (n >= 1 && n <= 9) {
      onCellChange(row, col, n);
    }
  };

  return (
    <div
      className="sudoku-board"
      role="grid"
      aria-label="Sudoku puzzle grid"
    >
      {currentBoard.map((row, r) =>
        row.map((value, c) => {
          const given = initialBoard[r][c] !== 0;
          const locked = readOnly || given;

          return (
            <div
              key={`${r}-${c}`}
              className={[
                "sudoku-cell-wrap",
                given ? "is-given" : "",
                locked && !given ? "is-readonly" : "",
                r % 3 === 0 ? "thick-top" : "",
                c % 3 === 0 ? "thick-left" : "",
                c === 8 ? "thick-right" : "",
                r === 8 ? "thick-bottom" : "",
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
