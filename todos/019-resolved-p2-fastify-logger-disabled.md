---
status: pending
priority: p2
issue_id: "019"
tags: [code-review, architecture, quality]
dependencies: []
---

# Fastify Logger Disabled — Shared createLogger Not Wired

## Problem Statement

`apps/api/src/app.ts` creates Fastify with `logger: false`, completely disabling all request/response logging. The shared package (`@myapp/shared`) exports a `createLogger` utility that was presumably designed for this exact purpose, but it is never used in the API. Without logging, debugging production issues and monitoring request patterns is impossible.

## Findings

- `apps/api/src/app.ts:7` — `Fastify({ logger: false })`
- `packages/shared/src/index.ts` — exports `createLogger` (unused by API)
- No request logging anywhere in the API
- Tests with `logger: false` is fine (correct to suppress test output), but production `buildApp()` is the same function

## Proposed Solutions

### Option 1: Wire createLogger from shared + disable only in tests

**Approach:** Change `buildApp()` to accept an options param. Pass `logger: createLogger()` by default. In tests, pass `logger: false` via options.

```typescript
export function buildApp(opts: FastifyServerOptions = {}): FastifyInstance {
  const app = Fastify({ logger: createLogger(), ...opts });
  ...
}
// In tests: buildApp({ logger: false })
```

**Pros:**
- Production gets logging
- Tests stay quiet
- Reuses shared logger

**Cons:**
- Minor test file update

**Effort:** 1 hour

**Risk:** Low

---

### Option 2: Use Fastify's built-in pino logger

**Approach:** Pass `logger: process.env.NODE_ENV !== 'test'` to get Fastify's built-in pino logging in production and silence in tests.

**Pros:**
- One-liner fix
- No shared logger needed

**Cons:**
- Doesn't use shared logger conventions
- Less structured output

**Effort:** 15 minutes

**Risk:** Low

## Recommended Action

**To be filled during triage.**

## Technical Details

**Affected files:**
- `apps/api/src/app.ts:7`
- `apps/api/src/routes/animals.test.ts:33` — `buildApp()` call

## Resources

- **PR:** https://github.com/ulymaglana/farm-manager/pull/2

## Acceptance Criteria

- [ ] Production API has request logging
- [ ] Tests suppress logging
- [ ] Shared `createLogger` is used (or documented reason it's not needed)

## Work Log

### 2026-08-14 - Code Review Discovery

**By:** Claude Code (review agent synthesis)

---
