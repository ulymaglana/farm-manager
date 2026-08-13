---
status: resolved
priority: p3
issue_id: "009"
tags: [code-review, coverage, configuration]
---

# P3: `db.ts` files not excluded from coverage — creates 0% noise

## Problem Statement

`apps/api/src/db.ts` and `apps/worker/src/db.ts` are PrismaClient singletons that are always mocked in tests. They appear in coverage with 0% coverage, inflating uncovered line counts. The coverage config already excludes `index.ts` for the same reason but omits `db.ts`.

## Proposed Solution

Add to the `exclude` array in root `vitest.config.ts`:
```typescript
"apps/*/src/db.ts",
"packages/*/src/db.ts",
```

## Acceptance Criteria

- [ ] `pnpm coverage` report no longer shows `db.ts` files
- [ ] Coverage percentages reflect only tested application code
