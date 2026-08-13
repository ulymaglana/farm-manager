---
status: resolved
priority: p2
issue_id: "014"
tags: [code-review, database, migrations, prisma, deployment]
---

# P2: Using `prisma db push` — no migration history for production deployments

## Problem Statement

`apps/api/package.json` uses `prisma db push` as the schema change mechanism. `db push` is destructive: it can silently drop columns/tables that no longer appear in the schema, does not generate a migration history, and cannot be used to safely deploy schema changes to production. The `User` model was completely replaced (dropped `id`, `createdAt`, `updatedAt`, re-added them with new fields), which would destroy all existing user data in production.

## Findings

`apps/api/package.json:11`: `"db:push": "prisma db push"`

No `apps/api/prisma/migrations/` directory exists. Every schema change since project creation has been applied via `db push`.

Differences between `main` and `add-authentication` branch schema that would be destructive if pushed to a live DB with data:
- Old `User` model had `id, email, name, createdAt, updatedAt`
- New `User` model has `id, email, name, passwordHash, role, failedLoginCount, lastFailedLoginAt, createdAt, updatedAt, sessions`

## Proposed Solution

Switch to `prisma migrate`:

```bash
# Development (generates migration files)
npx prisma migrate dev --name init

# CI/Production (runs migration files safely, no destructive operations)
npx prisma migrate deploy
```

Update `apps/api/package.json`:
```json
"db:migrate:dev": "prisma migrate dev",
"db:migrate:deploy": "prisma migrate deploy",
"db:push": "prisma db push"  // keep for rapid prototyping only, document the risk
```

Add `apps/api/prisma/migrations/` to version control.

For this PR specifically, generate an initial migration that captures the current schema state.

## Acceptance Criteria

- [ ] `apps/api/prisma/migrations/` directory created with initial migration
- [ ] `db:migrate:dev` and `db:migrate:deploy` scripts added to package.json
- [ ] CLAUDE.md or README documents when to use `db:push` vs migrations
- [ ] `prisma migrate deploy` is safe to run on a live database

## Work Log

- 2026-08-13: Identified during `/workflows:review` code review pass
