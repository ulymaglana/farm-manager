---
status: resolved
priority: p3
issue_id: "010"
tags: [code-review, documentation, testing]
---

# P3: `beforeEach` in `__mocks__/db.ts` is non-obvious — add explanatory comment

## Problem Statement

Both `__mocks__/db.ts` files register a `beforeEach` hook inside a mock module file. This is an established `vitest-mock-extended` pattern but is invisible to readers of the test files, who may be confused why mock state resets without any visible `beforeEach` in the test.

## Proposed Solution

Add a comment to both `__mocks__/db.ts` files:

```typescript
import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset, type DeepMockProxy } from "vitest-mock-extended";
import { beforeEach } from "vitest";

export const prisma: DeepMockProxy<PrismaClient> = mockDeep<PrismaClient>();

// Auto-reset mock state before each test.
// This beforeEach runs in the test context (not at mock evaluation time)
// because Vitest processes __mocks__ files in the test runner environment.
// See: https://vitest.dev/guide/mocking.html#automocking-algorithm
beforeEach(() => {
  mockReset(prisma);
});
```

## Acceptance Criteria

- [ ] Both `__mocks__/db.ts` files have an explanatory comment above `beforeEach`
