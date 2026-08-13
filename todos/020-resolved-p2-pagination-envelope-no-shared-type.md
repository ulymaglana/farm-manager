---
status: pending
priority: p2
issue_id: "020"
tags: [code-review, architecture, quality]
dependencies: []
---

# Pagination Envelope Has No Shared Type Contract

## Problem Statement

The `GET /animals` response returns `{ data: Animal[], pagination: { hasNextPage: boolean, nextCursor: string | null } }` but this envelope shape is not defined anywhere in the shared package. The web `getAnimals()` function in `api.ts` uses an inline `as { data: Animal[] }` cast that only accesses `data` and silently ignores `pagination`. If the web ever needs to implement "load more", there's no shared type to use.

## Findings

- `apps/api/src/routes/animals.ts:69-77` — returns `{ data, pagination: { hasNextPage, nextCursor } }`
- `apps/web/src/lib/api.ts:26` — casts response as `{ data: Animal[] }` — pagination field ignored
- `packages/shared/src/types/animal.ts` — no `PaginatedResponse` or `Pagination` type exported
- Type drift risk: API adds fields to pagination, web silently loses them

## Proposed Solutions

### Option 1: Add shared PaginatedResponse type

**Approach:** Add to `packages/shared/src/types/animal.ts`:

```typescript
export interface Pagination {
  hasNextPage: boolean;
  nextCursor: string | null;
}
export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}
```

Use `PaginatedResponse<Animal>` in both API and web.

**Pros:**
- Single source of truth
- Enables web to implement pagination UI
- Generic — usable for other resources

**Cons:**
- Minor refactor

**Effort:** 30 minutes

**Risk:** Low

---

### Option 2: Keep inline types, add comment

**Approach:** Add comment in `api.ts` noting pagination is intentionally ignored. Acceptable if pagination UI is out of scope.

**Effort:** 5 minutes

**Risk:** Low (short term only)

## Recommended Action

**To be filled during triage.**

## Technical Details

**Affected files:**
- `packages/shared/src/types/animal.ts` — add shared types
- `apps/api/src/routes/animals.ts:69-77` — use shared type
- `apps/web/src/lib/api.ts:26` — use shared type

## Resources

- **PR:** https://github.com/ulymaglana/farm-manager/pull/2

## Acceptance Criteria

- [ ] `Pagination` and `PaginatedResponse<T>` types exported from shared package
- [ ] API and web use shared types
- [ ] TypeScript compiles without errors

## Work Log

### 2026-08-14 - Code Review Discovery

**By:** Claude Code (review agent synthesis)

---
