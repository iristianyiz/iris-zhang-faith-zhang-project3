/** @typedef {number[][]} Grid */

/** Matches typical 6×6 mini-Sudoku (2×3 blocks) and standard 9×9 (3×3). */
export const DIFFICULTY_LAYOUT = {
  EASY: {
    size: 6,
    boxRows: 2,
    boxCols: 3,
    /** Fewer removals ⇒ more givens (easier). */
    cellsToRemove: 10,
  },
  NORMAL: {
    size: 9,
    boxRows: 3,
    boxCols: 3,
    cellsToRemove: 46,
  },
};

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * @param {Grid} grid
 * @param {number} row
 * @param {number} col
 * @param {number} num
 * @param {number} size
 * @param {number} boxRows
 * @param {number} boxCols
 */
function isValidPlacement(grid, row, col, num, size, boxRows, boxCols) {
  for (let x = 0; x < size; x++) {
    if (grid[row][x] === num) return false;
  }
  for (let x = 0; x < size; x++) {
    if (grid[x][col] === num) return false;
  }
  const br = Math.floor(row / boxRows) * boxRows;
  const bc = Math.floor(col / boxCols) * boxCols;
  for (let i = 0; i < boxRows; i++) {
    for (let j = 0; j < boxCols; j++) {
      if (grid[br + i][bc + j] === num) return false;
    }
  }
  return true;
}

/**
 * @param {Grid} grid
 * @param {number} size
 * @param {number} maxDigit
 * @param {number} boxRows
 * @param {number} boxCols
 */
function fillGrid(grid, size, maxDigit, boxRows, boxCols) {
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col] === 0) {
        const nums = shuffleInPlace(
          Array.from({ length: maxDigit }, (_, i) => i + 1),
        );
        for (const num of nums) {
          if (isValidPlacement(grid, row, col, num, size, boxRows, boxCols)) {
            grid[row][col] = num;
            if (fillGrid(grid, size, maxDigit, boxRows, boxCols)) return true;
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

/**
 * @param {{ size: number, boxRows: number, boxCols: number }} layout
 * @returns {Grid}
 */
export function generateSolvedGrid(layout) {
  const { size, boxRows, boxCols } = layout;
  const grid = Array.from({ length: size }, () => Array(size).fill(0));
  fillGrid(grid, size, size, boxRows, boxCols);
  return grid;
}

/**
 * @param {Grid} solution
 * @param {number} cellsToRemove
 * @param {number} size
 */
export function makePuzzleFromSolution(solution, cellsToRemove, size) {
  const puzzle = solution.map((row) => [...row]);
  const total = size * size;
  const indices = shuffleInPlace(Array.from({ length: total }, (_, i) => i));
  let removed = 0;
  for (const idx of indices) {
    if (removed >= cellsToRemove) break;
    const r = Math.floor(idx / size);
    const c = idx % size;
    if (puzzle[r][c] === 0) continue;
    puzzle[r][c] = 0;
    removed++;
  }
  return { puzzle, solution: solution.map((row) => [...row]) };
}

/**
 * @param {Grid} current
 * @param {Grid} initial
 */
export function givensPreserved(current, initial) {
  const n = initial.length;
  if (!current || current.length !== n) return false;
  for (let r = 0; r < n; r++) {
    if (!current[r] || current[r].length !== n) return false;
    for (let c = 0; c < n; c++) {
      const g = initial[r][c];
      if (g !== 0 && current[r][c] !== g) return false;
    }
  }
  return true;
}

/**
 * @param {Grid} current
 * @param {Grid} solution
 */
export function isWinningBoard(current, solution) {
  const n = solution.length;
  if (!current || current.length !== n) return false;
  for (let r = 0; r < n; r++) {
    if (!current[r] || current[r].length !== n) return false;
    for (let c = 0; c < n; c++) {
      if (current[r][c] !== solution[r][c]) return false;
    }
  }
  return true;
}

/**
 * @param {unknown} v
 * @param {number} size
 * @param {number} maxDigit inclusive digit max (same as size for classic Sudoku)
 * @returns {v is Grid}
 */
export function isValidGridShape(v, size, maxDigit) {
  if (!Array.isArray(v) || v.length !== size) return false;
  return v.every(
    (row) =>
      Array.isArray(row) &&
      row.length === size &&
      row.every(
        (cell) =>
          Number.isInteger(cell) && cell >= 0 && cell <= maxDigit,
      ),
  );
}
