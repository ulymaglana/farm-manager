interface HealthResponse {
  status: string;
  db: string;
}

async function getHealth(): Promise<HealthResponse | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  try {
    const res = await fetch(`${apiUrl}/health`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json() as Promise<HealthResponse>;
  } catch {
    return null;
  }
}

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
