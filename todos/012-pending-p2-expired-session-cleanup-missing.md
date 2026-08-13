---
status: resolved
priority: p2
issue_id: "012"
tags: [code-review, database, sessions, maintenance, prisma]
---

# P2: No mechanism to clean up expired sessions

## Problem Statement

The `Session` table accumulates expired rows indefinitely. The only time a session is deleted is: (a) on explicit logout, (b) on token refresh (rotation), or (c) if an expired token is encountered during `/auth/refresh`. Sessions that expire naturally (7-day TTL, user never refreshes) are never removed. At scale, this table will grow unboundedly and degrade query performance on `findUnique({ where: { token } })` even with the index.

## Findings

`apps/api/prisma/schema.prisma`: Session model has `expiresAt DateTime` but no cleanup mechanism.

`apps/api/src/routes/auth.ts:200-220`: Only deletes sessions found during a `/auth/refresh` call if they're expired. Sessions that are just abandoned accumulate.

The worker (`apps/worker`) polls for jobs every 5 seconds — it's the natural place to add a session cleanup task.

## Proposed Solution

Add a session cleanup job to the worker:

**`apps/worker/src/jobs/sessionCleanup.ts`**
```typescript
import { prisma } from "../db.js";
import { createLogger } from "@myapp/shared";

const logger = createLogger("session-cleanup");

export async function cleanupExpiredSessions(): Promise<void> {
  const { count } = await prisma.session.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  if (count > 0) {
    logger.info("Cleaned up expired sessions", { count });
  }
}
```

Run hourly from the worker poll loop, or add it as a scheduled task. Alternatively, a simple DB-level approach using PostgreSQL's `pg_cron` extension can be used, but the worker approach fits the existing architecture.

## Acceptance Criteria

- [ ] Expired sessions are periodically deleted (at least daily)
- [ ] Cleanup is logged with count of deleted rows
- [ ] No impact on active sessions (only `expiresAt < now()` rows deleted)

## Work Log

- 2026-08-13: Identified during `/workflows:review` code review pass
