"use client";

import { useFormState, useFormStatus } from "react-dom";
import { registerAction } from "../../lib/auth";
import type { ActionResult } from "@myapp/shared";

const initialState: ActionResult = { success: false, error: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        padding: "0.5rem 1rem",
        background: pending ? "#999" : "#0070f3",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: pending ? "not-allowed" : "pointer",
      }}
    >
      {pending ? "Creating account…" : "Create account"}
    </button>
  );
}

export default function RegisterPage() {
  const [state, formAction] = useFormState(registerAction, initialState);

  return (
    <main style={{ fontFamily: "monospace", padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
      <h1>Create account</h1>
      <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label htmlFor="name">Name (optional)</label>
          <br />
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <br />
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </div>
        <div>
          <label htmlFor="password">Password (min 12 characters)</label>
          <br />
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={12}
            autoComplete="new-password"
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </div>
        {!state.success && state.error ? (
          <p style={{ color: "red", margin: 0 }}>{state.error}</p>
        ) : null}
        <SubmitButton />
      </form>
      <p style={{ marginTop: "1rem" }}>
        Have an account? <a href="/login">Sign in</a>
      </p>
    </main>
  );
}
