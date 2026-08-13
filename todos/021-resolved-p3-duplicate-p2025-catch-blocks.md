---
status: pending
priority: p3
issue_id: "021"
tags: [code-review, quality]
dependencies: []
---

# Duplicate P2025 Catch Blocks in PUT and DELETE Handlers

## Problem Statement

Both the PUT and DELETE handlers in `animals.ts` contain identical try/catch blocks for Prisma `P2025` (record not found) errors. This is a minor DRY violation — if the error handling logic changes (e.g., adding logging, changing the error message), it must be changed in two places.

## Findings

- `apps/api/src/routes/animals.ts:110-121` — PUT handler P2025 catch
- `apps/api/src/routes/animals.ts:130-138` — DELETE handler identical P2025 catch
- Both throw the same `notFound` object with 404 status

## Proposed Solutions

### Option 1: Extract reusable error handler helper

**Approach:** Extract to a small inline helper:

```typescript
function handlePrismaError(err: unknown, reply: FastifyReply): FastifyReply | void {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
    return reply.status(404).send(notFound);
  }
  throw err;
}
```

**Pros:**
- DRY
- One place to update error handling

**Cons:**
- Extra function for a small pattern

**Effort:** 20 minutes

**Risk:** Low

---

### Option 2: Leave as-is (acceptable for 2 occurrences)

**Approach:** Two occurrences of an identical 3-line block is acceptable duplication. No change needed.

**Effort:** 0

**Risk:** None

## Recommended Action

**To be filled during triage.**

## Technical Details

**Affected files:**
- `apps/api/src/routes/animals.ts:110-121,130-138`

## Resources

- **PR:** https://github.com/ulymaglana/farm-manager/pull/2

## Acceptance Criteria

- [ ] P2025 handling extracted to helper OR decision made to keep duplication

## Work Log

### 2026-08-14 - Code Review Discovery

**By:** Claude Code (review agent synthesis)

---
