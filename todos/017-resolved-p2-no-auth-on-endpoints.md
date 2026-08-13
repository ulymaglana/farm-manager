---
status: pending
priority: p2
issue_id: "017"
tags: [code-review, security]
dependencies: []
---

# No Authentication on Any Animal Endpoint

## Problem Statement

All 5 animal CRUD endpoints (GET list, GET by id, POST, PUT/PATCH, DELETE) are completely unauthenticated. Any actor with network access can create, modify, or delete any animal record. This is a significant security gap if this API is intended to be anything beyond a purely public read-only demo.

## Findings

- `apps/api/src/routes/animals.ts` — no auth hooks, no `preHandler`, no bearer token checks on any route
- `apps/api/src/routes/health.ts` — health endpoint also unauthenticated (acceptable)
- `apps/api/src/app.ts` — no global auth plugin registered
- Write operations (POST, PUT, DELETE) are the highest risk

## Proposed Solutions

### Option 1: API key authentication for write operations

**Approach:** Add a Fastify `preHandler` hook on POST, PUT, DELETE routes checking `Authorization: Bearer <API_KEY>` against an env var. GET routes remain public.

**Pros:**
- Simple, no user management needed
- Protects write operations

**Cons:**
- No per-user audit trail
- Single shared secret

**Effort:** 2 hours

**Risk:** Low

---

### Option 2: JWT authentication

**Approach:** Register `@fastify/jwt` plugin. Protect write endpoints with `app.addHook('preHandler', app.authenticate)`.

**Pros:**
- Standard approach, extensible to per-user auth
- Works with most frontend auth libraries

**Cons:**
- Requires issuing JWTs (auth service or external provider)
- More setup

**Effort:** 4-8 hours

**Risk:** Medium

---

### Option 3: Document as intentionally public (for demo/prototype)

**Approach:** Add explicit comment in `animals.ts` and `CLAUDE.md` that auth is intentionally omitted for demo purposes. Add `TODO` tracking issue.

**Effort:** 15 minutes

**Risk:** Accepted risk — fine for demo only

## Recommended Action

**To be filled during triage.**

## Technical Details

**Affected files:**
- `apps/api/src/routes/animals.ts` — all endpoints
- `apps/api/src/app.ts` — global plugins

## Resources

- **PR:** https://github.com/ulymaglana/farm-manager/pull/2

## Acceptance Criteria

- [ ] Write endpoints protected (or explicit decision to leave public documented)
- [ ] Auth strategy documented in CLAUDE.md

## Work Log

### 2026-08-14 - Code Review Discovery

**By:** Claude Code (review agent synthesis)

---
