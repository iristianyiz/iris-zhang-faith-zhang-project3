/** @typedef {number[][]} Grid */

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
 */
function isValidPlacement(grid, row, col, num) {
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] === num) return false;
  }
  for (let x = 0; x < 9; x++) {
    if (grid[x][col] === num) return false;
  }
  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[br + i][bc + j] === num) return false;
    }
  }
  return true;
}

/**
 * Fills grid in-place with a valid solution (randomized search order).
 * @param {Grid} grid
 * @returns {boolean}
 */
function fillGrid(grid) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        const nums = shuffleInPlace([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of nums) {
          if (isValidPlacement(grid, row, col, num)) {
            grid[row][col] = num;
            if (fillGrid(grid)) return true;
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

/** @returns {Grid} */
export function generateSolvedGrid() {
  /** @type {Grid} */
  const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
  fillGrid(grid);
  return grid;
}

/**
 * @param {Grid} solution
 * @param {number} cellsToRemove
 * @returns {{ puzzle: Grid, solution: Grid }}
 */
export function makePuzzleFromSolution(solution, cellsToRemove) {
  const puzzle = solution.map((row) => [...row]);
  const indices = shuffleInPlace(
    Array.from({ length: 81 }, (_, i) => i),
  );
  let removed = 0;
  for (const idx of indices) {
    if (removed >= cellsToRemove) break;
    const r = Math.floor(idx / 9);
    const c = idx % 9;
    if (puzzle[r][c] === 0) continue;
    puzzle[r][c] = 0;
    removed++;
  }
  return { puzzle, solution: solution.map((row) => [...row]) };
}

/** EASY keeps more givens (fewer removals). */
export const CELLS_TO_REMOVE = {
  EASY: 34,
  NORMAL: 46,
};

/**
 * @param {Grid} current
 * @param {Grid} initial
 */
export function givensPreserved(current, initial) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
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
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (current[r][c] !== solution[r][c]) return false;
    }
  }
  return true;
}

/**
 * @param {unknown} v
 * @returns {v is Grid}
 */
export function isValidGridShape(v) {
  if (!Array.isArray(v) || v.length !== 9) return false;
  return v.every(
    (row) =>
      Array.isArray(row) &&
      row.length === 9 &&
      row.every((cell) => Number.isInteger(cell) && cell >= 0 && cell <= 9),
  );
}
