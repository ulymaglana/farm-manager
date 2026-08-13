---
status: resolved
priority: p3
issue_id: "016"
tags: [code-review, testing, auth, refresh-token]
---

# P3: POST /auth/refresh has no test coverage

## Problem Statement

`apps/api/src/routes/auth.ts` implements `POST /auth/refresh` (token rotation) but `apps/api/src/routes/auth.test.ts` has zero tests for this endpoint. Token rotation is a security-critical path: it must invalidate the old session, create a new one, and reject expired or invalid tokens. Any regression here could allow refresh token reuse attacks.

## Findings

`apps/api/src/routes/auth.test.ts`: Tests cover register, login, me, logout — but not `/auth/refresh`.

`apps/api/src/routes/auth.ts:193-236`: The refresh endpoint handles:
- Missing refresh token cookie → 401
- Token not in DB → 401
- Expired token → 401 + delete expired session
- Valid token → rotate (delete old, create new) + return new tokens

## Proposed Solution

Add a `describe("POST /auth/refresh")` block in `auth.test.ts`:

```typescript
describe("POST /auth/refresh", () => {
  const MOCK_SESSION_WITH_USER = {
    id: "session-cuid-1",
    userId: MOCK_USER.id,
    token: "refresh-token-abc",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    user: MOCK_USER_PUBLIC,
  };

  it("returns 200 and rotates tokens on valid refresh token", async () => {
    prisma.session.findUnique.mockResolvedValue(MOCK_SESSION_WITH_USER);
    prisma.session.delete.mockResolvedValue(MOCK_SESSION_WITH_USER);
    prisma.session.create.mockResolvedValue({ ...MOCK_SESSION, token: "new-refresh-token" });

    const res = await app.inject({
      method: "POST",
      url: "/auth/refresh",
      headers: { cookie: "refreshToken=refresh-token-abc" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json<{ token: string }>().token).toBeTruthy();
  });

  it("returns 401 when refresh token cookie is absent", async () => { ... });
  it("returns 401 when session not found", async () => { ... });
  it("returns 401 and deletes session when token is expired", async () => { ... });
});
```

## Acceptance Criteria

- [ ] At least 4 tests for `/auth/refresh`: success, missing cookie, invalid token, expired token
- [ ] Expired session deletion is verified in the expired token test
- [ ] All tests pass with `pnpm --filter api test`

## Work Log

- 2026-08-13: Identified during `/workflows:review` code review pass
