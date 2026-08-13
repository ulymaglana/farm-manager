---
status: resolved
priority: p3
issue_id: "015"
tags: [code-review, performance, startup, argon2]
---

# P3: Top-level await for DUMMY_HASH adds ~2s startup delay

## Problem Statement

`apps/api/src/routes/auth.ts:17` computes the dummy hash at module load time:

```typescript
const DUMMY_HASH = await hash("dummy_password_for_timing_safety", ARGON2_OPTIONS);
```

With the OWASP-recommended Argon2id settings (memoryCost: 65536, timeCost: 3), this hash takes approximately 1-2 seconds to compute. This delays server startup and every test `buildApp()` call by that duration, since the module is imported during app construction.

In the test suite (11 auth tests + 3 admin tests), each `beforeEach` calls `buildApp()` — though module caching means the `await` only runs once per test file, startup is still slowed.

## Findings

`apps/api/src/routes/auth.ts:9-17`: Argon2id options with memoryCost=65536 + top-level await.

In test suite: vitest mocks `argon2`, so `hash` is mocked in tests. However, the top-level await runs before vi.mock hoisting when not properly controlled.

## Proposed Solution

Lazily initialize `DUMMY_HASH` on first request rather than at module load:

```typescript
let DUMMY_HASH: string | null = null;

async function getDummyHash(): Promise<string> {
  if (!DUMMY_HASH) {
    DUMMY_HASH = await hash("dummy_password_for_timing_safety", ARGON2_OPTIONS);
  }
  return DUMMY_HASH;
}

// In login handler when user not found:
await verify(await getDummyHash(), password);
```

This delays the first hash computation to the first login attempt for a non-existent user, which is acceptable. The result is cached so subsequent calls are instant.

## Acceptance Criteria

- [ ] Server starts without the ~2s Argon2 blocking
- [ ] Timing safety on login is preserved (dummy hash is still used for non-existent users)
- [ ] DUMMY_HASH is computed at most once and cached

## Work Log

- 2026-08-13: Identified during `/workflows:review` code review pass
