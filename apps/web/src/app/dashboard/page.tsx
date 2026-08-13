import { redirect } from "next/navigation";
import { getCurrentUser, logoutAction } from "../../lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <main style={{ fontFamily: "monospace", padding: "2rem" }}>
      <h1>Dashboard</h1>
      <p>
        Welcome, <strong>{user.name ?? user.email}</strong>
      </p>
      <p>
        Role: <code>{user.role}</code>
      </p>
      <form action={logoutAction} style={{ marginTop: "1rem" }}>
        <button
          type="submit"
          style={{
            padding: "0.5rem 1rem",
            background: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </form>
    </main>
  );
}
