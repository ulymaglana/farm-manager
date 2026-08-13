---
status: resolved
priority: p1
issue_id: "017"
tags: [code-review, security, auth, fastify]
---

# P1: `requireRole` missing `return` after sending 403 — route handler continues executing

## Problem Statement

`apps/api/src/hooks/requireRole.ts:14-16` sends a 403 but doesn't return. Fastify's `reply.send()` marks the reply as sent but does not throw or stop execution. The route handler (the admin endpoint) continues running after the 403 is sent, processing the forbidden request and potentially leaking data via "Reply already sent" errors or executing business logic for unauthorized users.

## Findings

```typescript
// WRONG — route handler still runs after this:
if (!user || !roles.includes(user.role as UserRole)) {
  await reply.status(403).send({ error: "Forbidden" });
}
// execution falls through to route handler!
```

## Proposed Solution

```typescript
if (!user || !roles.includes(user.role as UserRole)) {
  await reply.status(403).send({ error: "Forbidden" });
  return; // <-- add this
}
```

Same fix should be applied to `requireAuth`:
```typescript
try {
  await request.jwtVerify();
} catch {
  await reply.status(401).send({ error: "Unauthorized" });
  return; // <-- add this
}
```

## Acceptance Criteria

- [ ] `return` added after `reply.send()` in `requireRole`
- [ ] `return` added after `reply.send()` in `requireAuth`
- [ ] Admin route handler does not execute when 403 is returned
- [ ] All tests still pass

## Work Log

- 2026-08-13: Identified by TypeScript reviewer and security sentinel agents
