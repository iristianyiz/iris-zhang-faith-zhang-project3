export function RulesPage() {
  return (
    <div className="page stack">
      <section>
        <h1>Rules</h1>
        <p>
          Sudoku is played on a 9×9 grid divided into nine 3×3 boxes. The goal
          is to fill every empty cell with a digit from <strong>1</strong> to{" "}
          <strong>9</strong> so that:
        </p>
        <ul>
          <li>Each <strong>row</strong> contains every digit exactly once.</li>
          <li>
            Each <strong>column</strong> contains every digit exactly once.
          </li>
          <li>
            Each <strong>3×3 box</strong> contains every digit exactly once.
          </li>
        </ul>
        <p>
          Digits given at the start cannot be changed. Use logic to deduce the
          rest—there is exactly one valid solution for each puzzle here.
        </p>
      </section>
      <section>
        <h2>Credits</h2>
        <p>Built for CS 5610 Web — Project 3 (full-stack Sudoku).</p>
        <ul className="credits-list">
          <li>
            Email:{" "}
            <a href="mailto:student@example.edu">student@example.edu</a>
          </li>
          <li>
            GitHub:{" "}
            <a
              href="https://github.com/example"
              target="_blank"
              rel="noreferrer"
            >
              github.com/example
            </a>
          </li>
          <li>
            LinkedIn:{" "}
            <a
              href="https://www.linkedin.com/in/example"
              target="_blank"
              rel="noreferrer"
            >
              linkedin.com/in/example
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
