import { useParams } from "react-router-dom";

export function GamePage() {
  const { gameId } = useParams();
  return (
    <section>
      <h1>Game</h1>
      <p>
        Game ID: <code>{gameId}</code>
      </p>
      <p>Board and controls (TODO).</p>
    </section>
  );
}
