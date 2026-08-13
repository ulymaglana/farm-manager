---
status: pending
priority: p2
issue_id: "018"
tags: [code-review, security]
dependencies: []
---

# No CORS Configured on Fastify API

## Problem Statement

The Fastify API has no CORS headers configured. If a browser-based client (or the Next.js web app making client-side fetches) tries to call the API directly, all cross-origin requests will be blocked by browsers. Additionally, without explicit CORS configuration, the API implicitly allows all origins if accessed from non-browser clients with no protection against CSRF-style abuse.

## Findings

- `apps/api/src/app.ts` — no `@fastify/cors` plugin registered
- `apps/api/src/routes/animals.ts` — no per-route CORS headers
- Web app currently uses RSC server-side fetches (no CORS needed today), but any future client-side fetch will fail

## Proposed Solutions

### Option 1: Register @fastify/cors with allowlist

**Approach:** `npm install @fastify/cors` then `app.register(cors, { origin: process.env.ALLOWED_ORIGIN ?? 'http://localhost:3000' })` in `app.ts`.

**Pros:**
- Explicit allow list
- Prevents unintended cross-origin access
- Required for any future client-side fetch

**Cons:**
- Adds dependency

**Effort:** 30 minutes

**Risk:** Low

---

### Option 2: Document that CORS is intentionally absent (RSC-only)

**Approach:** Add comment to `app.ts` that CORS is not needed because all web fetches are server-side RSC. Accept risk for now.

**Effort:** 5 minutes

**Risk:** Low (as long as RSC-only pattern is maintained)

## Recommended Action

**To be filled during triage.**

## Technical Details

**Affected files:**
- `apps/api/src/app.ts` — cors plugin registration

**Dependencies:**
- `@fastify/cors` package

## Resources

- **PR:** https://github.com/ulymaglana/farm-manager/pull/2

## Acceptance Criteria

- [ ] CORS configured with explicit origin allowlist, OR decision documented that CORS not needed

## Work Log

### 2026-08-14 - Code Review Discovery

**By:** Claude Code (review agent synthesis)

---
