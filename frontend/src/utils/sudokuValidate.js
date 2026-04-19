/**
 * Classic Sudoku conflict check (row / column / box), ignoring empty (0) cells.
 * @param {number[][]} board
 * @param {number} r
 * @param {number} c
 * @param {number} boxRows
 * @param {number} boxCols
 */
export function cellHasConflict(board, r, c, boxRows, boxCols) {
  const n = board[r][c];
  if (n === 0) return false;
  const size = board.length;

  for (let j = 0; j < size; j++) {
    if (j !== c && board[r][j] === n) return true;
  }
  for (let i = 0; i < size; i++) {
    if (i !== r && board[i][c] === n) return true;
  }

  const br = Math.floor(r / boxRows) * boxRows;
  const bc = Math.floor(c / boxCols) * boxCols;
  for (let i = 0; i < boxRows; i++) {
    for (let j = 0; j < boxCols; j++) {
      const rr = br + i;
      const cc = bc + j;
      if ((rr !== r || cc !== c) && board[rr][cc] === n) return true;
    }
  }
  return false;
}

/**
 * @param {number[][]} board
 * @param {number} boxRows
 * @param {number} boxCols
 * @returns {boolean[][]}
 */
export function conflictGrid(board, boxRows, boxCols) {
  return board.map((row, r) =>
    row.map((_, c) => cellHasConflict(board, r, c, boxRows, boxCols)),
  );
}
