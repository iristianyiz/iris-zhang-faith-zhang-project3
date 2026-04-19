export function GamesPage() {
  return (
    <section>
      <h1>Games</h1>
      <p>Create or select a game (API wiring TODO).</p>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button type="button">Create Normal Game</button>
        <button type="button">Create Easy Game</button>
      </div>
    </section>
  );
}
