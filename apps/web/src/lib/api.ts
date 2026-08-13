import type { Animal } from "@myapp/shared";

export interface HealthResponse {
  status: "ok" | "error";
  db: "connected" | "disconnected";
}

export async function getHealth(): Promise<HealthResponse | null> {
  const apiUrl = process.env.API_URL ?? "http://localhost:3001";
  try {
    const res = await fetch(`${apiUrl}/health`, { cache: "no-store" });
    if (!res.ok) return null;
    const body = await res.json();
    if (
      typeof body !== "object" ||
      body === null ||
      (body.status !== "ok" && body.status !== "error") ||
      (body.db !== "connected" && body.db !== "disconnected")
    ) {
      return null;
    }
    return body as HealthResponse;
  } catch {
    return null;
  }
}

export async function getAnimals(): Promise<Animal[] | null> {
  const apiUrl = process.env.API_URL ?? "http://localhost:3001";
  try {
    const res = await fetch(`${apiUrl}/animals`, { cache: "no-store" });
    if (!res.ok) return null;
    const body = await res.json();
    if (!body || !Array.isArray(body.data)) return null;
    return body.data as Animal[];
  } catch {
    return null;
  }
}
