---
status: resolved
priority: p2
issue_id: "019"
tags: [code-review, performance, auth, jwt]
---

# P2: `requireRole` re-fetches role from DB on every admin request (role already in JWT)

## Problem Statement

`apps/api/src/hooks/requireRole.ts:10-13` calls `prisma.user.findUnique` to get `role` on every admin-protected request. The JWT payload (`JwtPayload`) already contains `role`, and `requireAuth` already verifies the JWT before `requireRole` runs — making `request.user.role` available. The DB query adds a round-trip with zero informational value.

## Findings

```typescript
// CURRENT — unnecessary DB query:
const user = await prisma.user.findUnique({
  where: { id: request.user.sub },
  select: { role: true },
});
if (!user || !roles.includes(user.role as UserRole)) { ... }

// request.user.role is ALREADY available from the verified JWT!
```

`apps/api/src/routes/auth.ts:62`: The JWT payload includes role: `const payload: JwtPayload = { sub: userId, role };`

## Proposed Solution

```typescript
export function requireRole(...roles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!roles.includes(request.user.role)) {
      await reply.status(403).send({ error: "Forbidden" });
      return;
    }
  };
}
```

Remove the `prisma` import from `requireRole.ts` entirely.

If real-time role changes need to take effect within the 15-minute JWT window, the correct solution is a token revocation list or short JWT TTL — not a DB hit on every request.

## Acceptance Criteria

- [ ] `requireRole` reads `request.user.role` from the JWT (no DB query)
- [ ] `prisma` import removed from `requireRole.ts`
- [ ] Admin tests still pass (403 for USER, 200 for ADMIN)
- [ ] Admin endpoint no longer makes N+1 DB queries

## Work Log

- 2026-08-13: Identified by performance oracle, architecture strategist, and TypeScript reviewer agents
