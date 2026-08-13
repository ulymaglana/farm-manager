---
status: resolved
priority: p2
issue_id: "008"
tags: [code-review, dependencies, monorepo]
---

# P2: `vitest-mock-extended` imported in packages that don't declare it as a dep

## Problem Statement

`apps/api/src/__mocks__/db.ts` and `apps/worker/src/__mocks__/db.ts` both import from `vitest-mock-extended`, but neither `apps/api/package.json` nor `apps/worker/package.json` declares it as a devDependency. It works via pnpm hoisting from root but is architecturally fragile.

## Proposed Solution

Add to `apps/api/package.json` and `apps/worker/package.json`:
```json
{
  "devDependencies": {
    "vitest": "catalog:*",
    "vitest-mock-extended": "catalog:*"
  }
}
```

Or use `workspace:*` / `catalog:*` if the monorepo defines a catalog. At minimum, the explicit dep should match the root-installed version.

## Acceptance Criteria

- [ ] `apps/api/package.json` declares `vitest-mock-extended` in devDependencies
- [ ] `apps/worker/package.json` declares `vitest-mock-extended` in devDependencies
- [ ] `pnpm install` succeeds without hoisting warnings
