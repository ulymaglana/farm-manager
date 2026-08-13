---
status: pending
priority: p1
issue_id: "012"
tags: [code-review, security, architecture]
dependencies: []
---

# NEXT_PUBLIC_API_URL Leaks Internal API URL to Browser Bundle

## Problem Statement

`apps/web/src/lib/api.ts` fetches from `process.env.NEXT_PUBLIC_API_URL`. The `NEXT_PUBLIC_` prefix in Next.js means this value is inlined into the client-side JavaScript bundle and exposed to every browser. This leaks the internal API URL (e.g., `http://api:3001` in Docker, or a private VPC address) to end users, which is both a security concern and an architectural mistake — these fetches happen in React Server Components (RSC) and should never reach the browser.

## Findings

- `apps/web/src/lib/api.ts:9,22` — uses `process.env.NEXT_PUBLIC_API_URL` in `getHealth()` and `getAnimals()`
- `apps/web/src/app/page.tsx` — calls these functions as a Server Component; the fetches run server-side only
- Server Components never run in the browser, so `NEXT_PUBLIC_` is unnecessary and harmful
- Private variable `API_URL` (without prefix) stays server-side; `NEXT_PUBLIC_API_URL` is baked into the JS bundle

## Proposed Solutions

### Option 1: Rename to `API_URL`

**Approach:** Change `NEXT_PUBLIC_API_URL` → `API_URL` in `api.ts` and `.env` / `docker-compose.yml`. Next.js will keep it server-side only.

**Pros:**
- Minimal change, fixes the root cause
- No bundle exposure

**Cons:**
- Requires updating env var name in all deployment environments

**Effort:** 30 minutes

**Risk:** Low

---

### Option 2: Use Next.js Route Handlers as API proxy

**Approach:** Create `apps/web/src/app/api/animals/route.ts` that proxies to the backend. Frontend fetches `/api/animals` instead of the backend directly.

**Pros:**
- Clean separation — browser never needs to know backend URL
- Enables edge caching, auth middleware at proxy layer

**Cons:**
- More files to maintain
- Extra hop adds latency

**Effort:** 2 hours

**Risk:** Low

## Recommended Action

**To be filled during triage.**

## Technical Details

**Affected files:**
- `apps/web/src/lib/api.ts:9,22`
- `.env` / `docker-compose.yml` (env var rename)
- `apps/web/.env.local` (if exists)

## Resources

- **PR:** https://github.com/ulymaglana/farm-manager/pull/2
- **Next.js env docs:** https://nextjs.org/docs/app/building-your-application/configuring/environment-variables

## Acceptance Criteria

- [ ] No `NEXT_PUBLIC_API_URL` reference in `api.ts`
- [ ] Server-only env var used for backend fetches
- [ ] Existing page renders correctly
- [ ] Internal URL not visible in built JS bundle

## Work Log

### 2026-08-14 - Code Review Discovery

**By:** Claude Code (review agent synthesis)

**Actions:**
- Identified `NEXT_PUBLIC_` prefix on server-only env var
- Confirmed fetches run in RSC context only

---
