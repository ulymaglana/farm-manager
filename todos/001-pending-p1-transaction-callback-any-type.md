---
status: resolved
priority: p1
issue_id: "001"
tags: [code-review, typescript, type-safety, testing]
---

# P1: `(tx: any)` in transaction mock callbacks defeats type safety

## Problem Statement

`runner.test.ts` uses `(tx: any)` in all 4 `$transaction.mockImplementation` calls. This defeats the entire purpose of `DeepMockProxy<PrismaClient>` — the transaction callback in `runner.ts` receives a typed `Prisma.TransactionClient`, and the `any` cast means structural mismatches go undetected by TypeScript.

## Findings

`apps/worker/src/jobs/runner.test.ts` — 4 occurrences (lines ~36, 49, 67, 93):
```typescript
// Current — wrong:
prismaMock.$transaction.mockImplementation((callback: (tx: any) => any) =>
  callback(prismaMock)
);
```

## Proposed Solution

Import `Prisma` namespace and use the actual type:

```typescript
import type { Prisma } from "@prisma/client";

prismaMock.$transaction.mockImplementation(
  (callback: (tx: Prisma.TransactionClient) => Promise<unknown>) =>
    callback(prismaMock as unknown as Prisma.TransactionClient)
);
```

The single `as unknown as Prisma.TransactionClient` cast on `prismaMock` is acceptable here (structural compatibility, documented with a comment). Move this to a `beforeEach` (see issue 005) to avoid 4 repetitions.

## Acceptance Criteria

- [ ] All 4 `(tx: any)` occurrences replaced with `Prisma.TransactionClient`
- [ ] `import type { Prisma } from "@prisma/client"` added at top of runner.test.ts
- [ ] `pnpm test:run` still passes all 12 tests
