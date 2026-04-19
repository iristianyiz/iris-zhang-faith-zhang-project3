import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <section>
      <h1>Sudoku</h1>
      <p>Full-stack Sudoku (Project 3).</p>
      <ul>
        <li>
          <Link to="/rules">Rules</Link>
        </li>
        <li>
          <Link to="/games">Play</Link>
        </li>
      </ul>
    </section>
  );
}
