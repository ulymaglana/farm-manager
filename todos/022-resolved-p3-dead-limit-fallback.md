---
status: pending
priority: p3
issue_id: "022"
tags: [code-review, quality]
dependencies: []
---

# Dead `?? 20` Limit Fallback — Schema Default Already Applies

## Problem Statement

`apps/api/src/routes/animals.ts:53` has `const limit = req.query.limit ?? 20`. This fallback is dead code — the `listQuerySchema` defines `default: 20` for the `limit` field, so Fastify's AJV validation layer always sets `req.query.limit = 20` when the client omits it. The `?? 20` never fires.

## Findings

- `apps/api/src/routes/animals.ts:40-41` — `listQuerySchema.properties.limit` has `default: 20`
- `apps/api/src/routes/animals.ts:53` — `const limit = req.query.limit ?? 20` — dead fallback

## Proposed Solutions

### Option 1: Remove the `?? 20` fallback

**Approach:** Change `const limit = req.query.limit ?? 20` → `const limit = req.query.limit!` or just `req.query.limit` (TypeScript type already reflects it's always a number after schema processing).

**Pros:**
- Removes dead code
- Clearer intent

**Cons:**
- None

**Effort:** 5 minutes

**Risk:** Low

## Recommended Action

**To be filled during triage.**

## Technical Details

**Affected files:**
- `apps/api/src/routes/animals.ts:53`

## Resources

- **PR:** https://github.com/ulymaglana/farm-manager/pull/2

## Acceptance Criteria

- [ ] Dead `?? 20` removed
- [ ] Tests still pass

## Work Log

### 2026-08-14 - Code Review Discovery

**By:** Claude Code (review agent synthesis)

---
