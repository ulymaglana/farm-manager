---
status: pending
priority: p1
issue_id: "013"
tags: [code-review, architecture, database]
dependencies: []
---

# db:push and prisma migrate Coexist — Mutually Exclusive Strategies

## Problem Statement

`apps/api/package.json` has both `db:push` (prisma db push) and `db:migrate:dev` / `db:migrate:deploy` scripts. These are fundamentally different database management strategies that should not coexist. `db push` is for prototyping — it directly syncs schema without creating migration files. `migrate dev/deploy` is for production — it creates reproducible, versioned migration files. Using both simultaneously leads to drift between the schema and migration history.

## Findings

- `apps/api/package.json` — defines `db:push`, `db:migrate:dev`, and `db:migrate:deploy`
- `apps/api/prisma/migrations/` — no migration files committed (or directory missing)
- `CLAUDE.md` documents `pnpm --filter api run db:push` as the standard command for schema changes
- The Animal model was added via `db push` not `migrate dev`, so no migration history exists
- Production deployments running `migrate deploy` would fail with no migrations

## Proposed Solutions

### Option 1: Commit to migrate workflow (recommended for production)

**Approach:** Remove `db:push` from package.json. Run `prisma migrate dev --name add_animal_model` to generate migration files from current schema state. Commit the migration files. Update CLAUDE.md to document `db:migrate:dev` as the standard.

**Pros:**
- Reproducible deployments
- Full audit trail of schema changes
- `migrate deploy` works in production

**Cons:**
- Slightly slower development iteration

**Effort:** 1 hour

**Risk:** Low

---

### Option 2: Commit to db push workflow (prototyping only)

**Approach:** Remove `db:migrate:dev` and `db:migrate:deploy` scripts. Document explicitly that this project uses `db push` for schema management. Add warning that this is not production-safe without baseline snapshots.

**Pros:**
- Simple, fast iteration

**Cons:**
- Not production-safe
- No reproducible migration history

**Effort:** 15 minutes

**Risk:** Medium (future operational risk)

## Recommended Action

**To be filled during triage.**

## Technical Details

**Affected files:**
- `apps/api/package.json` — conflicting scripts
- `apps/api/prisma/migrations/` — missing migration files
- `CLAUDE.md` — documents `db:push` as standard

## Resources

- **PR:** https://github.com/ulymaglana/farm-manager/pull/2
- **Prisma migrate vs db push:** https://www.prisma.io/docs/orm/prisma-migrate/workflows/prototyping-your-schema

## Acceptance Criteria

- [ ] Only one schema management strategy documented and used
- [ ] If migrate: migration files committed and `migrate deploy` works from scratch
- [ ] CLAUDE.md updated with correct workflow
- [ ] `db:push` removed OR `migrate` scripts removed

## Work Log

### 2026-08-14 - Code Review Discovery

**By:** Claude Code (review agent synthesis)

**Actions:**
- Identified coexistence of both db management strategies
- Confirmed no migration files exist for Animal model addition

---
