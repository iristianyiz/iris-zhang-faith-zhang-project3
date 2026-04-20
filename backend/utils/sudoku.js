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
 * Validates that all pre-filled (non-zero) cells do not conflict with each other.
 * @param {Grid} grid
 * @param {number} size
 * @param {number} maxDigit
 * @param {number} boxRows
 * @param {number} boxCols
 */
export function isValidGivenGrid(grid, size, maxDigit, boxRows, boxCols) {
  if (!isValidGridShape(grid, size, maxDigit)) return false;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const v = grid[r][c];
      if (v === 0) continue;
      grid[r][c] = 0;
      const ok = isValidPlacement(grid, r, c, v, size, boxRows, boxCols);
      grid[r][c] = v;
      if (!ok) return false;
    }
  }
  return true;
}

function cloneGrid(grid) {
  return grid.map((row) => [...row]);
}

/**
 * Counts solutions for a given grid, with early-exit once `limit` is reached.
 * Also returns the first solution found (if any).
 *
 * @param {Grid} grid
 * @param {{ size: number, boxRows: number, boxCols: number }} layout
 * @param {number} limit
 * @returns {{ count: number, solution: Grid | null }}
 */
export function countSolutions(grid, layout, limit = 2) {
  const { size, boxRows, boxCols } = layout;
  const working = cloneGrid(grid);

  /** @type {Grid | null} */
  let firstSolution = null;
  let count = 0;

  function findBestEmptyCell() {
    let best = null;
    let bestCandidates = null;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (working[r][c] !== 0) continue;
        const candidates = [];
        for (let n = 1; n <= size; n++) {
          if (isValidPlacement(working, r, c, n, size, boxRows, boxCols)) {
            candidates.push(n);
          }
        }
        if (candidates.length === 0) return { deadEnd: true };
        if (!best || candidates.length < bestCandidates.length) {
          best = { r, c };
          bestCandidates = candidates;
          if (bestCandidates.length === 1) return { ...best, candidates };
        }
      }
    }

    if (!best) return null; // solved
    return { ...best, candidates: bestCandidates };
  }

  function backtrack() {
    if (count >= limit) return;

    const next = findBestEmptyCell();
    if (next === null) {
      count++;
      if (!firstSolution) firstSolution = cloneGrid(working);
      return;
    }
    if (next.deadEnd) return;

    const { r, c, candidates } = next;
    for (const n of candidates) {
      working[r][c] = n;
      backtrack();
      working[r][c] = 0;
      if (count >= limit) return;
    }
  }

  backtrack();
  return { count, solution: firstSolution };
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
