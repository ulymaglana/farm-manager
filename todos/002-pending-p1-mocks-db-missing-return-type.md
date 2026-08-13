---
status: resolved
priority: p1
issue_id: "002"
tags: [code-review, typescript, type-safety, testing]
---

# P1: `__mocks__/db.ts` missing explicit return type causes `as unknown as` casts in tests

## Problem Statement

`apps/api/src/__mocks__/db.ts` and `apps/worker/src/__mocks__/db.ts` export `prisma` without an explicit type annotation. After `vi.mock("../db.js")`, TypeScript sees the imported `prisma` as the original `PrismaClient` type, forcing tests to use `prisma as unknown as DeepMockProxy<PrismaClient>`.

## Findings

```typescript
// Current — both __mocks__/db.ts files:
export const prisma = mockDeep<PrismaClient>();
// TypeScript infers: prisma: DeepMockProxy<PrismaClient>
// But after vi.mock(), the import sees: prisma: PrismaClient
// → tests must do: const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>
```

## Proposed Solution

Add explicit type annotation to the export in both mock files:

```typescript
// apps/api/src/__mocks__/db.ts
import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset, type DeepMockProxy } from "vitest-mock-extended";
import { beforeEach } from "vitest";

export const prisma: DeepMockProxy<PrismaClient> = mockDeep<PrismaClient>();

beforeEach(() => {
  mockReset(prisma);
});
```

Then in test files, remove the `as unknown as` cast:
```typescript
import { prisma } from "../db.js";
// prisma is already DeepMockProxy<PrismaClient> — no cast needed
```

## Acceptance Criteria

- [ ] `apps/api/src/__mocks__/db.ts` exports `prisma: DeepMockProxy<PrismaClient>`
- [ ] `apps/worker/src/__mocks__/db.ts` exports `prisma: DeepMockProxy<PrismaClient>`
- [ ] `as unknown as DeepMockProxy<PrismaClient>` casts removed from health.test.ts and runner.test.ts
- [ ] All 12 tests still pass
