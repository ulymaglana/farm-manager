---
status: pending
priority: p1
issue_id: "011"
tags: [code-review, performance, architecture]
dependencies: []
---

# Cursor Pagination Uses Wrong Sort Key

## Problem Statement

The animals list endpoint implements cursor-based pagination ordered by `createdAt DESC`, but the cursor value encodes the row's `id`. This means the DB must do a full sequential scan or use the wrong index. The `@@index([createdAt])` index on the Animal model is never used by the paginator — the DB falls back to PK lookup. At scale this degrades to O(N) scans.

## Findings

- `apps/api/src/routes/animals.ts:58-78` — `findMany` uses `orderBy: { createdAt: "desc" }` but `cursor: { id: cursorId }` (cursor on PK, not sort key)
- Prisma cursor pagination requires the cursor field to match the `orderBy` field for the DB to efficiently seek
- `apps/api/prisma/schema.prisma` — `@@index([createdAt])` defined but unused by query
- Correct approach: use `id` as both sort key and cursor (CUIDs are monotonically increasing by design), OR sort by `createdAt` with a composite cursor `(createdAt, id)`

## Proposed Solutions

### Option 1: Sort by `id` (CUID monotonic order)

**Approach:** Change `orderBy` to `{ id: "desc" }`. CUIDs embed a timestamp so ordering by `id DESC` gives the same chronological order, and the PK index is used for the cursor seek automatically.

**Pros:**
- Uses PK index — already exists, no migration needed
- Zero DB changes
- Cursor logic stays identical

**Cons:**
- CUID sort order is insertion-time approximate, not exact to-the-millisecond

**Effort:** 15 minutes

**Risk:** Low

---

### Option 2: Composite cursor `(createdAt, id)`

**Approach:** Change cursor encoding to encode both `createdAt` and `id`. Use `where: { OR: [{ createdAt: { lt: cursorCreatedAt } }, { createdAt: cursorCreatedAt, id: { lt: cursorId } }] }` for stable pagination.

**Pros:**
- Exact sort order maintained
- Uses `@@index([createdAt])` efficiently

**Cons:**
- More complex cursor encoding/decoding
- Extra `where` clause

**Effort:** 2 hours

**Risk:** Medium

---

### Option 3: Keep cursor on `id`, add `@@index([id])` note

**Approach:** Document that PK is already indexed and the cursor is correct for PK-ordered pagination. Remove `@@index([createdAt])` to avoid dead index overhead.

**Effort:** 30 minutes

**Risk:** Low

## Recommended Action

**To be filled during triage.**

## Technical Details

**Affected files:**
- `apps/api/src/routes/animals.ts:58-78` — pagination query
- `apps/api/prisma/schema.prisma` — Animal model indexes

## Resources

- **PR:** https://github.com/ulymaglana/farm-manager/pull/2
- **Prisma cursor docs:** https://www.prisma.io/docs/orm/prisma-client/queries/pagination#cursor-based-pagination

## Acceptance Criteria

- [ ] Cursor field matches `orderBy` field (or composite cursor used)
- [ ] Existing pagination tests still pass
- [ ] Dead index removed or documented

## Work Log

### 2026-08-14 - Code Review Discovery

**By:** Claude Code (review agent synthesis)

**Actions:**
- Identified mismatch between cursor key (`id`) and sort key (`createdAt`)
- Confirmed `@@index([createdAt])` is unused by current query

---
