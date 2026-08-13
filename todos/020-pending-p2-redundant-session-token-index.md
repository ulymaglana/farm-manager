---
status: resolved
priority: p2
issue_id: "020"
tags: [code-review, database, schema, performance, prisma]
---

# P2: Redundant `@@index([token])` on Session — `@unique` already creates the index

## Problem Statement

`apps/api/prisma/schema.prisma:36-37` has both `token String @unique` and `@@index([token])`. In PostgreSQL, `@unique` automatically creates a B-tree unique index. The explicit `@@index([token])` creates a second, non-unique index on the same column. Every session insert and delete now updates two indexes where one suffices, adding unnecessary write overhead.

## Findings

```prisma
model Session {
  ...
  token     String   @unique   // creates unique index automatically
  ...
  @@index([token])             // creates SECOND index — redundant!
  @@index([userId])            // useful, keep this
}
```

## Proposed Solution

Remove `@@index([token])` from the Session model. Keep `@@index([userId])`.

```prisma
model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

Also consider adding `@@index([expiresAt])` to support the session cleanup query (`deleteMany({ where: { expiresAt: { lt: new Date() } } })`) efficiently at scale.

## Acceptance Criteria

- [ ] `@@index([token])` removed from Session model
- [ ] `@@index([userId])` retained
- [ ] Schema applied successfully (`prisma db push` or migration)

## Work Log

- 2026-08-13: Identified by architecture strategist and data integrity guardian agents
