---
title: "feat: Add Authentication and Authorization"
type: feat
status: active
date: 2026-08-13
deepened: 2026-08-13
---

# feat: Add Authentication and Authorization

## Enhancement Summary

**Deepened on:** 2026-08-13
**Research agents used:** Security Sentinel, TypeScript Reviewer, Architecture Strategist, Performance Oracle, Best Practices Researcher, Framework Docs Researcher, Spec Flow Analyzer, Data Integrity Guardian, Code Simplicity Reviewer, Pattern Recognition Specialist

### Key Improvements Added
1. **Short-lived access tokens (15 min) + refresh token pattern** — the original 7-day JWT is a critical security liability (no revocation mechanism)
2. **Argon2id with explicit parameters** — memoryCost 65536 KiB, timeCost 3, parallelism 1 (OWASP 2024 recommended)
3. **Timing-safe login** — dummy hash verification for non-existent users to prevent user enumeration
4. **Zod validation at every boundary** — route bodies, Prisma-to-shared-type narrowing, Server Action return types
5. **Type-safe JWT augmentation** — `JwtPayload` named type eliminates `as` casts throughout; `satisfies` for route options
6. **Docker API_URL split** — `API_URL` (server-side internal) vs `NEXT_PUBLIC_API_URL` (browser); fixes broken Server Action routing in Docker
7. **Role as Prisma enum** — database-level enforcement replaces `String` field with unconstrained values
8. **Security headers** — `@fastify/helmet` + CSRF protection added to dependencies

### New Considerations Discovered
- `import argon2 from "argon2"` (default import) fails under NodeNext ESM — use named imports `{ hash, verify }`
- Next.js middleware cannot verify JWTs (no Node.js crypto in edge runtime) — document as UX redirect only, use `jose` if edge-level verification is needed
- `NEXT_PUBLIC_API_URL=http://localhost:3001` does not resolve inside Docker web container — `localhost` refers to self
- `passwordHash` must never appear in shared types or API responses; create separate `UserPublic` type
- Add `noImplicitReturns: true` + `noUncheckedIndexedAccess: true` to `tsconfig.base.json` before writing auth code
- Re-verify role from database on every `/admin/*` request — JWT role claim goes stale on downgrade

---

## Overview

Add a full authentication and authorization system to the MyApp monorepo. Users will be able to register with email + password, log in to receive a short-lived JWT access token and a long-lived refresh token (both in httpOnly cookies), and access protected API endpoints. Role-based authorization (`USER` / `ADMIN` Prisma enum) will gate privileged routes. The Next.js frontend will gain login/register pages and route-level protection via Next.js middleware.

## Problem Statement

The application currently has a `User` model in the database schema but no way to authenticate or authorize requests. Any caller can hit any API route without credentials. The web frontend has no concept of identity. This blocks multi-tenant features, personalization, and admin capabilities.

## Proposed Solution

- **API (Fastify):** Short-lived JWT access token (15 min) via `@fastify/jwt`, passwords hashed with `argon2` (Argon2id). A `requireAuth` preHandler verifies the JWT. A `requireRole` factory enables RBAC. Refresh tokens stored in `Session` table for revocability.
- **Transport:** Access JWT in httpOnly `token` cookie (15 min); refresh token in httpOnly `refreshToken` cookie (7 days). Both XSS-safe. Server components read cookies with `next/headers`.
- **Web (Next.js 14 App Router):** Login + register pages with Server Actions. `middleware.ts` is a UX redirect (cookie presence check only — not a security boundary). All security enforced at API layer.

## Technical Approach

### Architecture

```
Browser ──POST /auth/login──▶ API (Fastify)
         ◀── Set-Cookie: token=<JWT 15min>; HttpOnly; SameSite=Lax
         ◀── Set-Cookie: refreshToken=<opaque 7day>; HttpOnly; SameSite=Lax

         ──GET /auth/me (token cookie auto-sent)──▶ API
         ◀── { id, email, role } ──

         ──POST /auth/refresh (refreshToken cookie)──▶ API
         ◀── new token cookie (rotation) ──

Next.js SSR ──GET /api/* (Cookie header forwarded)──▶ API (via API_URL)
             ◀── response ──

Next.js middleware ──check token cookie exists──▶ redirect /login if absent
                   (UX redirect ONLY — not a security control)
```

### Security Model

**The API is the sole security boundary.** Every protected route must enforce `requireAuth`. The Next.js middleware is a user-experience optimization (prevents loading a page that will immediately redirect) — not a security guarantee. A request with an invalid or expired cookie that passes the middleware will be rejected by the API with 401.

### Prisma Schema Changes

`apps/api/prisma/schema.prisma`:

```prisma
enum Role {
  USER
  ADMIN
}

model User {
  id              String    @id @default(cuid())
  email           String    @unique
  name            String?
  passwordHash    String
  role            Role      @default(USER)
  failedLoginCount Int       @default(0)
  lastFailedLoginAt DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  sessions        Session[]
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique  // opaque random refresh token (hashed)
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([token])
  @@index([userId])
}
```

**Research Insights — Schema:**

- Use a Prisma `enum Role` instead of `String` — enforces valid values at the database level. Without this, a direct DB insert with `"Admin"` (capital A) silently breaks role checks.
- `passwordHash String` is non-nullable and has no default. `db push` on an existing table with rows will fail unless all existing rows are handled first. For this app (dev environment, no prod data yet), this is fine. For production migrations, use `prisma migrate dev`.
- `failedLoginCount` + `lastFailedLoginAt` enable progressive login delay without a Redis dependency.
- `Session` table with a hashed opaque refresh token enables true revocation. The `onDelete: Cascade` ensures sessions are cleaned up when users are deleted.
- The `email` field already has `@unique` — Prisma will use this for login lookups without an explicit `@@index`.
- **`passwordHash` must NEVER appear in shared types or API response bodies.** Create separate internal vs. public user types.

Run after schema changes:
```bash
pnpm --filter api run db:push   # dev only
# For production: pnpm --filter api run db:migrate
```

### TypeScript Setup (Do First)

Before writing any auth code, add to `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": true
  }
}
```

**Why:** `noImplicitReturns` catches forgotten `return` in Server Action error branches (a common security bug). `noUncheckedIndexedAccess` catches silent `undefined` when indexing JWT claim objects.

### Shared Types

`packages/shared/src/types/user.ts`:

```typescript
export type UserRole = "USER" | "ADMIN";

// JWT payload — what travels in the signed token
export interface JwtPayload {
  sub: string;    // user ID (not email — email is PII, don't log it)
  role: UserRole;
  // iat and exp added automatically by @fastify/jwt
}

// Public user shape — safe to send to clients, NEVER includes passwordHash
export interface UserPublic {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// Input types
export interface CreateUserInput {
  email: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserPublic;
  token: string;
}
```

**Research Insights — Types:**

- Use `sub` (subject) for user ID in JWT payload — standard JWT claim. Do NOT include `email` — email is PII and will appear in logs/proxies that decode the base64 payload.
- `JwtPayload` is defined once in shared and referenced in the Fastify type augmentation. This prevents the `payload` and `user` augmentation slots from drifting apart.
- `UserPublic` omits `passwordHash`, `failedLoginCount`, `lastFailedLoginAt`, `sessions` — only safe fields for client consumption.
- The Prisma `Role` enum returns as a string in TypeScript — use a Zod `z.nativeEnum(Role)` or explicit narrowing function when converting from Prisma result to `UserRole` type.

### New API Files

#### `apps/api/src/types/fastify-jwt.d.ts`

```typescript
import type { JwtPayload } from "@myapp/shared";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}
```

**Note:** This file belongs in the API package only — `@fastify/jwt` is an API-only dependency. Do not put this augmentation in shared.

#### `apps/api/src/plugins/jwt.ts`

Registers JWT + cookie globally (must break encapsulation with `fastify-plugin` so decorators are visible to all routes):

```typescript
// apps/api/src/plugins/jwt.ts
import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import jwt from "@fastify/jwt";
import cookie from "@fastify/cookie";

const jwtPlugin: FastifyPluginAsync = async (app) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  await app.register(cookie);
  await app.register(jwt, {
    secret: process.env.JWT_SECRET,
    cookie: { cookieName: "token", signed: false },
  });
};

export const authPlugin = fp(jwtPlugin);
```

**Research Insights — Fastify Plugin Encapsulation:**

- `fastify-plugin` (fp wrapper) is required here because `@fastify/jwt` adds decorators (`request.jwtVerify`, `app.jwt.sign`) that must be accessible to route plugins registered after this one. Without fp, these decorators are scoped to the plugin's encapsulation boundary and routes outside it cannot access them.
- Route plugins (auth.ts, admin.ts) do NOT need `fastify-plugin` — they should be encapsulated.
- Register `authPlugin` first in `buildApp()`, before any route plugins.
- Fail fast on missing `JWT_SECRET` — never allow the app to start with an undefined secret.

#### `apps/api/src/plugins/cors.ts`

```typescript
// apps/api/src/plugins/cors.ts
import fp from "fastify-plugin";
import cors from "@fastify/cors";

export const corsPlugin = fp(async (app) => {
  await app.register(cors, {
    origin: process.env.WEB_URL ?? "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  });
});
```

**Research Insights — CORS:**

- `credentials: true` is required for cross-origin cookie sending. Without it, browsers will not include httpOnly cookies in cross-origin requests.
- `origin` must be a strict allowlist — never `true` (which reflects the incoming Origin header back). Reflecting the Origin enables CSRF from any origin.
- In production, set `WEB_URL` to the exact frontend domain (e.g., `https://app.example.com`).

#### `apps/api/src/hooks/requireAuth.ts`

```typescript
// apps/api/src/hooks/requireAuth.ts
import type { FastifyRequest, FastifyReply } from "fastify";

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    await request.jwtVerify();
  } catch {
    await reply.status(401).send({ error: "Unauthorized" });
  }
}
```

**Research Insights — preHandler:**

- `request.user` is fully typed as `JwtPayload` after `jwtVerify()` succeeds — no casts needed anywhere downstream.
- Always `await reply.send(...)` in preHandlers to prevent the route handler from executing after an error response.

#### `apps/api/src/hooks/requireRole.ts`

```typescript
// apps/api/src/hooks/requireRole.ts
import type { FastifyRequest, FastifyReply } from "fastify";
import type { UserRole } from "@myapp/shared";
import { prisma } from "../db.js";

export function requireRole(...roles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    // Re-fetch role from DB on every admin request — JWT role claim goes stale on downgrade
    const user = await prisma.user.findUnique({
      where: { id: request.user.sub },
      select: { role: true },
    });
    if (!user || !roles.includes(user.role as UserRole)) {
      await reply.status(403).send({ error: "Forbidden" });
    }
  };
}
```

**Research Insights — RBAC:**

- For admin routes, re-verify role from the database on every request. The JWT role claim goes stale when a user's role is downgraded — with a 15-min access token, the exposure window is manageable, but for `ADMIN` actions the DB re-check is required.
- For regular `requireAuth` (non-admin routes), reading role from the JWT is acceptable.
- No `as` cast for `request.user` — it's already typed as `JwtPayload` via the module augmentation.
- `requireRole` takes `...UserRole[]` (a rest parameter of the union type) — fully type-safe, TypeScript will error if you pass an invalid role string.

#### `apps/api/src/routes/auth.ts`

```typescript
// apps/api/src/routes/auth.ts
import type { FastifyInstance, RouteShorthandOptions } from "fastify";
import { hash, verify } from "argon2";   // named imports — default import fails under NodeNext ESM
import { prisma } from "../db.js";
import { requireAuth } from "../hooks/requireAuth.js";
import { z } from "zod";

// IMPORTANT: Use named imports from argon2, not default import
// `import argon2 from "argon2"` fails at runtime under NodeNext ESM (CJS-only package)

const ARGON2_OPTIONS = {
  type: 2,          // Argon2id (most resistant to side-channel + GPU attacks)
  memoryCost: 65536, // 64 MiB — OWASP 2024 minimum recommendation
  timeCost: 3,       // 3 iterations
  parallelism: 1,
} as const;

// Dummy hash for timing-safe login — prevents user enumeration via response time
const DUMMY_HASH = await hash("dummy", ARGON2_OPTIONS);

const RegisterBody = z.object({
  email: z.string().email().max(255),
  password: z.string().min(12).max(128), // NIST SP 800-63B: min 12 chars
  name: z.string().max(100).optional(),
});

const LoginBody = z.object({
  email: z.string().email(),
  password: z.string(),
});

const protectedOpts = {
  preHandler: [requireAuth],
} satisfies RouteShorthandOptions;  // `satisfies` catches misconfig without widening type

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // POST /auth/register
  app.post("/auth/register", async (request, reply) => { /* ... */ });

  // POST /auth/login
  app.post("/auth/login", async (request, reply) => { /* ... */ });

  // POST /auth/refresh
  app.post("/auth/refresh", async (request, reply) => { /* ... */ });

  // GET /auth/me
  app.get("/auth/me", protectedOpts, async (request, reply) => { /* ... */ });

  // POST /auth/logout
  app.post("/auth/logout", protectedOpts, async (request, reply) => { /* ... */ });
}
```

**Research Insights — Auth Routes:**

- **Argon2 named imports**: `import { hash, verify } from "argon2"` — default import (`import argon2 from "argon2"`) fails at runtime under `"type": "module"` + NodeNext module resolution because argon2 is CJS-only. Named imports work reliably under `esModuleInterop`.
- **Dummy hash for timing safety**: Always run `verify(DUMMY_HASH, password)` when user is not found, then return 401. Without this, login for unknown emails returns in ~2ms (DB miss) vs. ~300ms (Argon2 verify), enabling user enumeration by timing.
- **Zod for body validation**: Use Zod schemas at the route level. This gives runtime validation (400 on bad input), TypeScript inference (`z.infer<typeof LoginBody>`), and reusable schemas that work in Server Actions too. Alternative: Fastify's built-in JSON Schema body validation is faster but doesn't compose with the web layer.
- **`satisfies` for route options**: TypeScript 5 `satisfies` validates the shape of the options object without widening it, catching misconfigured preHandlers at compile time.
- **Password minimum 12 characters**: Per NIST SP 800-63B (2024). Consider also checking against HaveIBeenPwned k-anonymity API on registration.
- **Login error messages**: Always return the same message for "user not found" and "wrong password": `{ error: "Invalid credentials" }` with 401. Different messages enable enumeration.

#### `apps/api/src/routes/admin.ts`

```typescript
// apps/api/src/routes/admin.ts — separate file from auth.ts
import type { FastifyInstance, RouteShorthandOptions } from "fastify";
import { prisma } from "../db.js";
import { requireAuth } from "../hooks/requireAuth.js";
import { requireRole } from "../hooks/requireRole.js";

const adminOpts = {
  preHandler: [requireAuth, requireRole("ADMIN")],
} satisfies RouteShorthandOptions;

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  // GET /admin/users — paginated, never returns passwordHash
  app.get("/admin/users", adminOpts, async (request, reply) => {
    // cursor-based pagination — never return all users in one response
    // select: explicitly list safe fields, never use `select: *`
    /* ... */
  });
}
```

**Research Insights — Admin Routes:**

- Separate file from `auth.ts` — admin routes have different access level concerns. Mixing public auth endpoints with admin routes in one file forces readers to inspect each route's preHandler individually to understand the security model.
- Always use explicit `select` in Prisma queries on admin routes — never `.findMany()` without it. This prevents `passwordHash` leaking into responses if the `User` model gains new sensitive fields.
- Cursor-based pagination on `GET /admin/users` — returning all users in a single response is a DoS vector on large tables and a data exposure risk.
- Audit log every admin action with timestamp + requesting user ID + source IP.

#### `apps/api/src/app.ts` (updated)

```typescript
// apps/api/src/app.ts
import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import { authPlugin } from "./plugins/jwt.js";
import { corsPlugin } from "./plugins/cors.js";
import { healthRoutes } from "./routes/health.js";
import { authRoutes } from "./routes/auth.js";
import { adminRoutes } from "./routes/admin.js";

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: false });
  // Order matters: plugins with fastify-plugin (fp) must be registered first
  app.register(corsPlugin);
  app.register(authPlugin);  // registers @fastify/jwt + @fastify/cookie globally
  // Route plugins (encapsulated)
  app.register(healthRoutes);
  app.register(authRoutes, { prefix: "/auth" });
  app.register(adminRoutes, { prefix: "/admin" });
  return app;
}
```

**Research Insights — buildApp:**

- `corsPlugin` must be registered before route plugins so preflight responses work correctly.
- `authPlugin` must be registered before any route that uses `request.jwtVerify()`.
- Route plugins use `{ prefix: "/auth" }` — this means individual route definitions use `/register` not `/auth/register`.
- `healthRoutes` is public — no auth plugin needed, and it remains first so it's always reachable.

### New Web Files

#### `apps/web/src/middleware.ts`

```typescript
// apps/web/src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// NOTE: This middleware is a UX redirect only — NOT a security control.
// The cookie existence check does NOT verify the JWT signature.
// Security is enforced by the API's requireAuth preHandler on every protected endpoint.
// A tampered or expired cookie that passes this check will be rejected by the API with 401.
export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

**Research Insights — Next.js Middleware:**

- Next.js edge middleware runs in the V8 isolate (Cloudflare Workers-like environment) without access to Node.js `crypto`. JWT signature verification is NOT possible here without the `jose` library (pure Web Crypto API).
- If you need edge-level JWT verification (e.g., to prevent SSR secrets from rendering before an API 401 is returned), install `jose` and use `jose.jwtVerify()` in middleware. For this app, the cookie presence check is sufficient.
- `matcher: ["/dashboard/:path*"]` — update this as new protected routes are added.

#### `apps/web/src/lib/auth.ts`

```typescript
// apps/web/src/lib/auth.ts — Server Actions and auth API helpers
"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Use API_URL (internal Docker service URL) for server-side calls
// NOT NEXT_PUBLIC_API_URL (which is the browser-visible URL)
const API_URL = process.env.API_URL ?? "http://localhost:3001";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function loginAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  /* ... forward cookies, call API, set response cookies, redirect */
}

export async function registerAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  /* ... */
}

export async function logoutAction(): Promise<void> {
  /* call POST /auth/logout to invalidate session, clear cookies, redirect */
}
```

**Research Insights — Server Actions + Docker:**

- **CRITICAL: `API_URL` vs `NEXT_PUBLIC_API_URL`**: Inside a Docker container, `localhost` refers to the container itself — not the API container. Server Actions run server-side inside the Next.js container. They must use `http://api:3001` (Docker service name) for internal network calls. Add a non-public `API_URL` env var for this. `NEXT_PUBLIC_API_URL` stays for any client-side fetch calls.
- Server Actions must forward the `Cookie` header from `next/headers` so the API receives the JWT on authenticated requests: `const cookieHeader = cookies().toString()`.
- `ActionResult<T>` discriminated union — every code path in a Server Action must return this shape. TypeScript will enforce this with `noImplicitReturns: true`.
- `"use server"` directive at the file top applies to all exports in the file.

#### `apps/web/src/app/login/page.tsx`

```typescript
// apps/web/src/app/login/page.tsx
"use client";  // needs useFormState
import { useFormState } from "react-dom";
import { loginAction } from "../../lib/auth";
```

#### `apps/web/src/app/register/page.tsx`

Similar pattern — `useFormState` with `registerAction`.

#### `apps/web/src/app/dashboard/page.tsx`

```typescript
// apps/web/src/app/dashboard/page.tsx
// Server Component — fetches current user from API, forwarding cookie
import { cookies } from "next/headers";

export default async function DashboardPage() {
  const apiUrl = process.env.API_URL ?? "http://localhost:3001";
  const cookieHeader = cookies().toString();
  const res = await fetch(`${apiUrl}/auth/me`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });
  if (!res.ok) redirect("/login");
  const { user } = await res.json();
  return <div>Welcome, {user.name ?? user.email}</div>;
}
```

### Environment Variables

`apps/api/.env.example`:
```bash
DATABASE_URL="postgresql://myapp:myapp_password@localhost:5432/myapp_db"
PORT=3001
NODE_ENV=development
# Generate a strong secret: openssl rand -base64 32
JWT_SECRET="CHANGEME_run_openssl_rand_-base64_32"
# Frontend URL for CORS allowlist
WEB_URL="http://localhost:3000"
```

`apps/web/.env.example`:
```bash
# Public URL (used by browser for client-side fetch)
NEXT_PUBLIC_API_URL=http://localhost:3001
# Internal URL (used by server-side Next.js / Server Actions — use Docker service name in Docker)
API_URL=http://localhost:3001
```

`apps/web/.env.docker.example` (new, for Docker Compose):
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
API_URL=http://api:3001
```

### New Dependencies

**API (`apps/api`):**
- `@fastify/jwt` — JWT sign/verify with cookie support
- `@fastify/cookie` — Cookie parsing for Fastify
- `@fastify/cors` — Cross-origin credential requests
- `@fastify/helmet` — Security headers (X-Content-Type-Options, CSP, etc.)
- `fastify-plugin` — `fp()` wrapper to break plugin encapsulation
- `argon2` — Password hashing (Argon2id)
- `zod` — Runtime validation + TypeScript inference

**Web (`apps/web`):**
- `zod` — Shared validation schemas (reuse from shared or install separately)

**`packages/shared` (optional):**
- `zod` — If validation schemas are shared between API and web

### Implementation Phases

#### Phase 0: Foundation (Do Before Coding)

**Tasks:**
- Add `noImplicitReturns: true` + `noUncheckedIndexedAccess: true` to `tsconfig.base.json`
- Update `packages/shared/src/types/user.ts` with `JwtPayload`, `UserPublic`, `UserRole`, `ActionResult`
- Update Prisma schema: `Role` enum, `passwordHash`, `role`, `failedLoginCount`, `lastFailedLoginAt`, `Session` model
- Run `pnpm --filter api run db:push`
- Add `JWT_SECRET` placeholder to `apps/api/.env.example`
- Add `API_URL` to `apps/web/.env.example`
- Install new packages: `@fastify/jwt`, `@fastify/cookie`, `@fastify/cors`, `@fastify/helmet`, `fastify-plugin`, `argon2`, `zod`

**Success criteria:**
- `pnpm --filter api run type-check` passes
- `pnpm --filter web run type-check` passes
- `pnpm --filter api run db:push` completes without error

#### Phase 1: API Auth Core

**Tasks:**
- Create `apps/api/src/types/fastify-jwt.d.ts` — JWT type augmentation
- Create `apps/api/src/plugins/jwt.ts` — register `@fastify/jwt` + `@fastify/cookie` with fp
- Create `apps/api/src/plugins/cors.ts` — CORS with strict origin
- Create `apps/api/src/plugins/helmet.ts` — security headers
- Create `apps/api/src/hooks/requireAuth.ts`
- Create `apps/api/src/routes/auth.ts` with `/register`, `/login`, `/refresh`, `/me`, `/logout`
- Update `apps/api/src/app.ts` — register all plugins + routes in order
- Update `apps/api/.env.example` with `JWT_SECRET` and `WEB_URL`

**Success criteria:**
- `POST /auth/register` creates user, hashes password with Argon2id params, returns `{ user: UserPublic, token }` + sets httpOnly cookie
- `POST /auth/login` verifies password, returns same; dummy hash for unknown emails
- `POST /auth/refresh` rotates refresh token
- `GET /auth/me` returns current user; 401 without valid token
- `POST /auth/logout` clears both cookies + deletes Session from DB

#### Phase 2: Authorization (RBAC)

**Tasks:**
- Create `apps/api/src/hooks/requireRole.ts` — factory that re-fetches role from DB for admin routes
- Create `apps/api/src/routes/admin.ts` — `GET /admin/users` with pagination + explicit field select
- Register `adminRoutes` in `app.ts`
- Add progressive login delay: check `failedLoginCount` + `lastFailedLoginAt`, reset on success

**Success criteria:**
- `GET /admin/users` returns 403 for `role: USER`, 200 for `role: ADMIN`
- Admin responses never include `passwordHash`
- Login with 5+ failures triggers a delay response

#### Phase 3: Web Integration

**Tasks:**
- Create `apps/web/src/middleware.ts` with comment documenting UX-only nature
- Create `apps/web/src/lib/auth.ts` with Server Actions (login, register, logout)
- Create `apps/web/src/app/login/page.tsx` with `useFormState`
- Create `apps/web/src/app/register/page.tsx`
- Create `apps/web/src/app/dashboard/page.tsx` — server component fetching from `API_URL`
- Update `apps/web/src/lib/api.ts` to forward `Cookie` header on server-side calls
- Update `docker-compose.yml` — add `API_URL` env var for web service pointing to `http://api:3001`

**Success criteria:**
- Unauthenticated visit to `/dashboard` redirects to `/login`
- Register form creates account and redirects to `/dashboard`
- Login form authenticates and redirects to `/dashboard`
- `/dashboard` shows authenticated user's name/email
- Server Actions work correctly inside Docker containers

#### Phase 4: Tests

**Tasks:**
- `apps/api/src/routes/auth.test.ts`:
  - Mock `"../db.js"` and `"argon2"` (via `vi.mock`)
  - `POST /auth/register`: 201 on success, 409 on duplicate email, 400 on missing fields/short password
  - `POST /auth/login`: 200 + cookie on success, 401 on wrong password (same message as not found), 401 on unknown email
  - `GET /auth/me`: 200 with valid JWT in cookie, 401 without
  - `POST /auth/logout`: 200 + cleared cookie
- `apps/api/src/hooks/requireRole.test.ts`: 200 for ADMIN, 403 for USER
- `apps/api/src/routes/admin.test.ts`: pagination, no passwordHash in response

**Test pattern for JWT in vitest:**
```typescript
// Mock jwtVerify to simulate authenticated requests
vi.mock("../db.js");
// In beforeEach, set up app with JWT plugin
// Use app.inject with Authorization: Bearer or Cookie header
// Mock request.jwtVerify on the fastify instance
```

## Alternative Approaches Considered

| Approach | Rejected Reason |
|---|---|
| NextAuth.js / Auth.js | Adds significant abstraction; the app has its own Fastify API that should own auth |
| Sessions + Redis | Adds Redis infra dependency; JWT is simpler and we handle revocation via Session table in Postgres |
| localStorage for JWT | Vulnerable to XSS; httpOnly cookies are safer |
| `bcryptjs` for hashing | Argon2id is the current OWASP recommendation (memory-hard, GPU-resistant) |
| Passport.js | Overkill for two strategies; native Fastify approach is cleaner |
| Single 7-day JWT (no refresh) | No revocation possible; role downgrade takes 7 days to take effect |
| Hard account lockout | Creates self-DoS vector — attacker can lock any account by knowing email; progressive delay preferred |
| SameSite=Strict cookies | Breaks login when arriving via email links/bookmarks; Lax is appropriate |

## Acceptance Criteria

### Functional Requirements

- [ ] `POST /auth/register` — accepts `{ email, password (≥12 chars), name? }`, hashes with Argon2id (memoryCost 65536, timeCost 3), stores user, returns `{ user: UserPublic, token }` + sets httpOnly cookies
- [ ] `POST /auth/login` — validates credentials with constant-time comparison + dummy hash for unknown emails; returns same on success; 401 `{ error: "Invalid credentials" }` for both failure cases
- [ ] `POST /auth/refresh` — verifies refresh token from cookie against Session table, rotates token, returns new access token cookie
- [ ] `GET /auth/me` — returns `UserPublic` from JWT; 401 if no/invalid/expired token
- [ ] `POST /auth/logout` — deletes Session from DB, clears both cookies; 200 always
- [ ] `GET /admin/users` — paginated (cursor-based), returns `UserPublic[]` for ADMIN role; 403 for USER role; role re-verified from DB, not JWT
- [ ] `/dashboard` in web inaccessible (redirects to `/login`) without token cookie
- [ ] Register and login Server Actions work correctly in both local and Docker environments

### Non-Functional Requirements

- [ ] Passwords are **never** stored or logged in plaintext
- [ ] `passwordHash` never appears in any API response or shared type
- [ ] JWT payload contains only `sub` (user ID) + `role` + `iat` + `exp` — no PII (no email)
- [ ] JWT access token expiry: 15 minutes
- [ ] Refresh token expiry: 7 days, stored hashed in `Session` table
- [ ] `JWT_SECRET` minimum 32 bytes of cryptographic randomness (`openssl rand -base64 32`)
- [ ] Argon2id parameters: `memoryCost: 65536`, `timeCost: 3`, `parallelism: 1`
- [ ] Cookies: `HttpOnly`, `SameSite=Lax`, `Secure` (production only), no `Domain` attribute
- [ ] CORS origin is a strict allowlist, never reflected from `Origin` header
- [ ] Login endpoint applies progressive delay after 5 failures (`failedLoginCount` on User)
- [ ] All admin API actions are logged with user ID + source IP + timestamp
- [ ] `@fastify/helmet` security headers applied to all responses

### Quality Gates

- [ ] All new API routes have vitest tests using `app.inject()` and `vi.mock("../db.js")`
- [ ] TypeScript strict — no `as` casts in auth code; use `satisfies` for route options
- [ ] `noImplicitReturns` and `noUncheckedIndexedAccess` enabled in `tsconfig.base.json`
- [ ] `pnpm --filter api run type-check` passes
- [ ] `pnpm audit --audit-level=high` passes (add to CI)

## Dependencies & Prerequisites

- PostgreSQL running (`docker compose up -d postgres`)
- `pnpm --filter api run db:push` after schema change
- `JWT_SECRET` set in `apps/api/.env` (generate with `openssl rand -base64 32`)
- `API_URL=http://api:3001` in `apps/web/.env` when running in Docker
- New packages: `@fastify/jwt`, `@fastify/cookie`, `@fastify/cors`, `@fastify/helmet`, `fastify-plugin`, `argon2`, `zod`

## Risk Analysis & Mitigation

| Risk | Mitigation |
|---|---|
| JWT secret not set | Fail fast at startup: `if (!process.env.JWT_SECRET) throw new Error(...)` |
| argon2 import fails under NodeNext ESM | Use named imports `{ hash, verify }` — not default import |
| argon2 native binary build issues in CI | Document fallback to `bcryptjs` (pure JS) if native compilation fails |
| CORS misconfiguration | Strict allowlist from `WEB_URL` env var; never `origin: true` |
| Cookie not sent cross-origin | `credentials: true` in CORS + `SameSite=Lax` + no `Domain` attribute |
| User enumeration via timing | Dummy hash verify for unknown emails; same 401 message for all failures |
| Role JWT claim stale after downgrade | Re-fetch role from DB in `requireRole` for all admin routes |
| `passwordHash` leaking in response | Explicit `select` on all Prisma queries; `UserPublic` type never includes `passwordHash` |
| Docker `localhost` routing failure | `API_URL=http://api:3001` for server-side calls inside Docker |
| Refresh token not revocable | Store hashed refresh token in `Session` table; delete on logout |
| Prisma `User` rows during `db push` | Dev environment — no existing rows. Production: use `prisma migrate dev` |
| `passwordHash String` non-nullable | `db push` fails on tables with existing rows unless field is nullable. Make `passwordHash String?` initially if migrating existing data, then backfill + make non-nullable |

## References & Research

### Internal References

- Prisma schema: `apps/api/prisma/schema.prisma`
- Existing route pattern: `apps/api/src/routes/health.ts`
- Existing test pattern: `apps/api/src/routes/health.test.ts`
- App setup (composition root): `apps/api/src/app.ts`
- Shared types: `packages/shared/src/types/user.ts`
- Web API client: `apps/web/src/lib/api.ts`
- Docker config: `docker-compose.yml` (needs `API_URL` for web service)

### External References

- `@fastify/jwt` docs: https://github.com/fastify/fastify-jwt
- `@fastify/cookie` docs: https://github.com/fastify/fastify-cookie
- `@fastify/cors` docs: https://github.com/fastify/fastify-cors
- `@fastify/helmet` docs: https://github.com/fastify/fastify-helmet
- `fastify-plugin` encapsulation: https://fastify.dev/docs/latest/Reference/Plugins/#handle-the-scope
- Argon2 OWASP recommendation: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- NIST SP 800-63B password guidelines: https://pages.nist.gov/800-63-3/sp800-63b.html
- Next.js middleware: https://nextjs.org/docs/app/building-your-application/routing/middleware
- Next.js Server Actions: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- `jose` library (JWT in edge runtime): https://github.com/panva/jose

## ERD

```mermaid
erDiagram
    User {
        String id PK
        String email UK
        String name
        String passwordHash
        Role role
        Int failedLoginCount
        DateTime lastFailedLoginAt
        DateTime createdAt
        DateTime updatedAt
    }
    Session {
        String id PK
        String userId FK
        String token UK
        DateTime expiresAt
        DateTime createdAt
    }
    Job {
        String id PK
        String type
        Json payload
        String status
        String error
        DateTime createdAt
        DateTime updatedAt
    }
    User ||--o{ Session : "has"
```
