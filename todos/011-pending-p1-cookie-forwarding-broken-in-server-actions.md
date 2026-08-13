---
status: resolved
priority: p1
issue_id: "011"
tags: [code-review, security, auth, next.js, cookies]
---

# P1: Cookie forwarding broken in Server Actions — auth flow doesn't work end-to-end

## Problem Statement

`loginAction` and `registerAction` in `apps/web/src/lib/auth.ts` read the `Set-Cookie` headers from the API response but then discard them with `void cookieStr` and `void cookieStore`. The browser never receives the `token` or `refreshToken` cookies, so after a successful login/register the middleware immediately redirects the user back to `/login` from `/dashboard`.

## Findings

`apps/web/src/lib/auth.ts:45-53`:
```typescript
const setCookieHeader = res.headers.getSetCookie();
const cookieStore = cookies();
for (const cookieStr of setCookieHeader) {
  // Next.js 14 cookies().set does not accept raw Set-Cookie strings directly;
  // the API sets them via Fastify, so we forward them via the response.
  // In production, configure a shared domain or use a reverse proxy.
  void cookieStr;        // no-op — cookie is discarded
  void cookieStore;      // no-op
}
redirect("/dashboard");  // middleware bounces back to /login — no cookie set
```

The comment acknowledges the limitation but the implemented solution is wrong. `void` expressions are no-ops.

## Proposed Solutions

### Option A: Parse and forward Set-Cookie headers (Recommended)

Parse each `Set-Cookie` header string and call `cookies().set()`:

```typescript
import { parse as parseCookie } from "cookie"; // add `cookie` dep or use manual parsing

const setCookieHeader = res.headers.getSetCookie();
const cookieStore = cookies();
for (const cookieStr of setCookieHeader) {
  // Set-Cookie format: "name=value; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800"
  const [nameValue, ...attrs] = cookieStr.split(";").map((s) => s.trim());
  const [name, ...rest] = nameValue.split("=");
  const value = rest.join("="); // handle = in value
  const opts: Record<string, string | boolean | number> = {};
  for (const attr of attrs) {
    const [k, v] = attr.split("=");
    const key = k.trim().toLowerCase();
    if (key === "max-age") opts.maxAge = Number(v);
    else if (key === "path") opts.path = v ?? "/";
    else if (key === "samesite") opts.sameSite = (v ?? "lax").toLowerCase() as "lax" | "strict" | "none";
    else if (key === "httponly") opts.httpOnly = true;
    else if (key === "secure") opts.secure = true;
  }
  cookieStore.set(name, value, opts);
}
```

### Option B: Reverse proxy / shared domain (Production)

Configure Next.js and the API on the same domain (e.g., `app.example.com` and `app.example.com/api`). The Fastify cookie `Domain` attribute would be set, and browsers would receive/send cookies without any Server Action forwarding. This requires infrastructure changes.

### Option C: Return tokens in response body and set via Next.js

The API already returns `token` in the response body. Use the token returned by the API body to set the cookie manually, rather than forwarding the `Set-Cookie` header.

## Recommended Action

Implement Option A (parse and forward) as the minimal fix. It works with the current architecture.

## Acceptance Criteria

- [ ] After `loginAction`, the browser receives `token` and `refreshToken` cookies
- [ ] After `registerAction`, the browser receives `token` and `refreshToken` cookies
- [ ] Navigating to `/dashboard` after login/register stays on `/dashboard`
- [ ] Existing auth tests continue to pass

## Work Log

- 2026-08-13: Identified during `/workflows:review` code review pass
