import { getHealth } from "../lib/api";

export default async function HomePage() {
  const health = await getHealth();

  return (
    <main style={{ fontFamily: "monospace", padding: "2rem" }}>
      <h1>MyApp</h1>
      <h2>API Health</h2>
      {health ? (
        <pre style={{ background: "#f4f4f4", padding: "1rem" }}>
          {JSON.stringify(health, null, 2)}
        </pre>
      ) : (
        <p style={{ color: "red" }}>API unreachable</p>
      )}
    </main>
  );
}
