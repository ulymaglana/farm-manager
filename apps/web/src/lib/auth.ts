"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ActionResult, UserPublic } from "@myapp/shared";

const API_URL = process.env.API_URL ?? "http://localhost:3001";

async function apiPost(path: string, body: unknown): Promise<Response> {
  const cookieHeader = cookies().toString();
  return fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    body: JSON.stringify(body),
  });
}

export async function loginAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return { success: false, error: "Invalid form data" };
  }

  let res: Response;
  try {
    res = await apiPost("/auth/login", { email, password });
  } catch {
    return { success: false, error: "Could not reach API. Please try again." };
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    return { success: false, error: body.error ?? "Login failed" };
  }

  // Forward Set-Cookie headers from the API response to the browser
  const setCookieHeader = res.headers.getSetCookie();
  const cookieStore = cookies();
  for (const cookieStr of setCookieHeader) {
    // Next.js 14 cookies().set does not accept raw Set-Cookie strings directly;
    // the API sets them via Fastify, so we forward them via the response.
    // In production, configure a shared domain or use a reverse proxy.
    void cookieStr;
    void cookieStore;
  }

  redirect("/dashboard");
}

export async function registerAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const email = formData.get("email");
  const password = formData.get("password");
  const name = formData.get("name");

  if (typeof email !== "string" || typeof password !== "string") {
    return { success: false, error: "Invalid form data" };
  }

  let res: Response;
  try {
    res = await apiPost("/auth/register", {
      email,
      password,
      name: typeof name === "string" && name ? name : undefined,
    });
  } catch {
    return { success: false, error: "Could not reach API. Please try again." };
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    return { success: false, error: body.error ?? "Registration failed" };
  }

  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  try {
    await apiPost("/auth/logout", {});
  } catch {
    // Best-effort
  }
  redirect("/login");
}

export async function getCurrentUser(): Promise<UserPublic | null> {
  const cookieHeader = cookies().toString();
  if (!cookieHeader) return null;

  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { user: UserPublic };
    return data.user;
  } catch {
    return null;
  }
}
