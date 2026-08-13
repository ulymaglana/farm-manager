import type { Animal } from "@myapp/shared";

export interface HealthResponse {
  status: "ok" | "error";
  db: "connected" | "disconnected";
}

export async function getHealth(): Promise<HealthResponse | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  try {
    const res = await fetch(`${apiUrl}/health`, { cache: "no-store" });
    if (!res.ok) return null;
    // Note: res.json() returns Promise<any> — the cast to HealthResponse is
    // not validated at runtime. Malformed API responses will silently render null.
    return res.json() as Promise<HealthResponse>;
  } catch {
    return null;
  }
}

export async function getAnimals(): Promise<Animal[] | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  try {
    const res = await fetch(`${apiUrl}/animals`, { cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as { data: Animal[] };
    return body.data;
  } catch {
    return null;
  }
}
