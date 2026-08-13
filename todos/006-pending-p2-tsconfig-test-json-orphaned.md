---
status: resolved
priority: p2
issue_id: "006"
tags: [code-review, configuration, typescript, testing]
---

# P2: `tsconfig.test.json` files are orphaned — not referenced by Vitest configs

## Problem Statement

4 `tsconfig.test.json` files exist but no `vitest.config.ts` references them. Vitest does not auto-discover `tsconfig.test.json` by name. The `Bundler` moduleResolution override is silently ignored — TypeScript uses the base `tsconfig.json` with `NodeNext` resolution when type-checking tests.

## Findings

All 4 files (`apps/api/`, `apps/worker/`, `apps/web/`, `packages/shared/`) contain:
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": { "module": "ESNext", "moduleResolution": "Bundler", "noEmit": true },
  "include": ["src"]
}
```

None of the `vitest.config.ts` files have `test.typecheck.tsconfig` or similar pointing to them.

## Proposed Solution

**Option A (Wire them up):** In each `vitest.config.ts`, pass the tsconfig to `tsconfigPaths`:
```typescript
plugins: [tsconfigPaths({ projects: ["./tsconfig.test.json"] })],
```
And optionally for type-checking:
```typescript
test: {
  typecheck: { tsconfig: "./tsconfig.test.json" },
  ...
}
```

**Option B (Delete 3, keep 1 root):** Since all 4 files are identical, create one root `tsconfig.test.json` extending `tsconfig.base.json` and reference it from all per-package vitest configs.

**Option C (Delete all 4):** If Vitest's Vite bundler already handles ESM resolution correctly at runtime (which the passing tests confirm it does), and `pnpm type-check` is run separately via `tsc --noEmit`, these files may be unnecessary. Delete all 4 and rely on the existing `tsconfig.json` + Vite's own bundler for test transforms.

Option C is the simplest — tests already pass without them.

## Acceptance Criteria

- [ ] Either: all 4 tsconfig.test.json files referenced in vitest configs
- [ ] Or: all 4 deleted (and tests confirmed still passing)
- [ ] No orphaned config files remain
