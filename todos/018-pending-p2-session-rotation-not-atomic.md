---
status: resolved
priority: p2
issue_id: "018"
tags: [code-review, database, transactions, security, sessions]
---

# P2: Session token rotation in `/auth/refresh` is not atomic

## Problem Statement

`apps/api/src/routes/auth.ts:224-232` deletes the old session and creates the new one in two separate Prisma calls with no transaction. If the process crashes between the delete and create, the user's session is permanently lost (logged out with no recovery path). Under concurrent requests with the same refresh token, both can pass the `findUnique` check before either deletes, potentially causing duplicate sessions or a unique constraint error on the new token.

## Findings

```typescript
// NON-ATOMIC — crash between these loses the user's session:
await prisma.session.delete({ where: { id: session.id } });
const newRefreshToken = generateRefreshToken();
await prisma.session.create({
  data: { userId: session.user.id, token: newRefreshToken, expiresAt: ... },
});
```

The worker (`apps/worker/src/jobs/runner.ts`) already correctly uses `prisma.$transaction` for atomic job claiming — this endpoint should follow the same pattern.

## Proposed Solution

```typescript
const newRefreshToken = generateRefreshToken();
await prisma.$transaction([
  prisma.session.delete({ where: { id: session.id } }),
  prisma.session.create({
    data: {
      userId: session.user.id,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  }),
]);
```

## Acceptance Criteria

- [ ] Delete and create wrapped in `prisma.$transaction`
- [ ] If create fails, delete is rolled back (old session remains valid)
- [ ] All refresh token tests continue to pass

## Work Log

- 2026-08-13: Identified by architecture strategist and data integrity guardian agents
