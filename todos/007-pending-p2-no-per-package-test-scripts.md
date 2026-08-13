---
status: resolved
priority: p2
issue_id: "007"
tags: [code-review, dx, monorepo, ci]
---

# P2: No `test` script in per-package `package.json` — can't run targeted tests

## Problem Statement

`pnpm test` at root runs all packages. There is no way to run `pnpm --filter @myapp/api test` to test a single package in isolation. This slows CI on PRs that only touch one package.

## Findings

All 4 package.json files (`apps/api`, `apps/worker`, `apps/web`, `packages/shared`) are missing `test` scripts. Only root `package.json` has them.

## Proposed Solution

Add to each per-package `package.json`:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

Vitest will automatically pick up the local `vitest.config.ts`.

## Acceptance Criteria

- [ ] `pnpm --filter @myapp/api test` runs only API tests
- [ ] `pnpm --filter @myapp/worker test` runs only worker tests
- [ ] `pnpm --filter @myapp/web test` runs only web tests
- [ ] `pnpm --filter @myapp/shared test` runs only shared tests
- [ ] Root `pnpm test` still runs all 4 packages
