export function RulesPage() {
  return (
    <div className="container page">
      <h1 className="page-title">Rules</h1>
      <div className="card prose" style={{ textAlign: "left" }}>
        <h2>Goal</h2>
        <p>
          Fill every empty cell so that each row, each column, and each{" "}
          <strong>sub-grid</strong> contains every allowed digit exactly
          once—with no repeats and no missing numbers when you are done.
        </p>

        <h2>How to play (this app)</h2>
        <ul>
          <li>
            <strong>Given cells</strong> from the server cannot be changed.
          </li>
          <li>
            <strong>Empty cells</strong> are yours to fill. Type a digit;
            delete or backspace to clear.
          </li>
          <li>
            A placement breaks the rules if the same digit appears in that{" "}
            <strong>row</strong>, <strong>column</strong>, or{" "}
            <strong>sub-grid</strong>. Conflicting cells are{" "}
            <strong>highlighted in red</strong>, like Project 2.
          </li>
          <li>
            Each saved game has one solution on the server. When every cell
            matches that solution, the game completes and your win can count
            toward <strong>High Scores</strong>.
          </li>
        </ul>

        <h2>Easy mode (6×6)</h2>
        <ul>
          <li>The board is <strong>6 rows × 6 columns</strong>.</li>
          <li>Use digits <strong>1 through 6</strong> only.</li>
          <li>
            The board is divided into six <strong>2×3</strong> blocks. Each
            block must contain 1–6 exactly once, like every row and column.
          </li>
        </ul>

        <h2>Normal mode (9×9)</h2>
        <ul>
          <li>The board is <strong>9 rows × 9 columns</strong>.</li>
          <li>Use digits <strong>1 through 9</strong> only.</li>
          <li>
            The board is divided into nine <strong>3×3</strong> blocks. Each
            block must contain 1–9 exactly once, along with every row and
            column.
          </li>
        </ul>

        <h2>Controls on the play page</h2>
        <ul>
          <li>
            <strong>Reset</strong> restores the original puzzle for{" "}
            <em>this</em> saved game (the same game id). It also restarts the
            local play clock used when posting your time after a win.
          </li>
          <li>
            New random puzzles are created from <strong>Select Game</strong> (
            <code>/games</code>), not from the play screen—matching the Project
            3 spec.
          </li>
          <li>
            Logged-out visitors can view boards in read-only mode; sign in to
            enter numbers and save progress.
          </li>
        </ul>

        <h2>Credits</h2>
        <p>
          <strong>Made by</strong> Iris Zhang &amp; Faith Zhang.
        </p>
        <p className="muted" style={{ marginTop: "0.5rem" }}>
          Contact (demo placeholders):
        </p>
        <ul>
          <li>
            Email:{" "}
            <a href="mailto:sudoku.master.demo@example.com">
              sudoku.master.demo@example.com
            </a>
          </li>
          <li>
            GitHub:{" "}
            <a
              href="https://github.com/faithtzhang/CS5610_WebDevelopment"
              target="_blank"
              rel="noreferrer"
            >
              Project 2 reference repo
            </a>
          </li>
          <li>
            LinkedIn:{" "}
            <a
              href="https://www.linkedin.com/in/example-profile"
              target="_blank"
              rel="noreferrer"
            >
              linkedin.com/in/example-profile
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
