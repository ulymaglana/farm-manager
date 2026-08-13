import { getHealth, getAnimals } from "../lib/api";

export default async function HomePage() {
  const [health, animals] = await Promise.all([getHealth(), getAnimals()]);

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
      <h2>Animals</h2>
      {/* Shows first page only (up to 20 animals). Pagination not yet implemented. */}
      {animals === null ? (
        <p style={{ color: "red" }}>Could not load animals</p>
      ) : animals.length === 0 ? (
        <p style={{ color: "#888" }}>No animals yet.</p>
      ) : (
        <ul style={{ paddingLeft: "1.5rem" }}>
          {animals.map((animal) => (
            <li key={animal.id}>
              <strong>{animal.name}</strong> — {animal.species}
              {animal.age !== null ? ` (age: ${animal.age})` : ""}
              {animal.description ? ` — ${animal.description}` : ""}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
