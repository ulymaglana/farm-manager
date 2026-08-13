---
status: resolved
priority: p2
issue_id: "005"
tags: [code-review, testing, duplication]
---

# P2: `$transaction` mock setup repeated 4× in runner.test.ts — hoist to `beforeEach`

## Problem Statement

All 4 test cases in `runner.test.ts` repeat the same `$transaction.mockImplementation` setup. `__mocks__/db.ts` already resets mocks in `beforeEach`, so a shared setup in the describe block's `beforeEach` would be DRY and clearer.

## Findings

```typescript
// Repeated 4 times in runner.test.ts:
prismaMock.$transaction.mockImplementation((callback: (tx: any) => any) =>
  callback(prismaMock)
);
```

## Proposed Solution

```typescript
describe("runNextJob", () => {
  beforeEach(() => {
    // All tests use the passthrough transaction pattern
    prismaMock.$transaction.mockImplementation(
      (callback: (tx: Prisma.TransactionClient) => Promise<unknown>) =>
        callback(prismaMock as unknown as Prisma.TransactionClient)
    );
  });

  it("returns false when no pending jobs exist", async () => {
    // $transaction setup already done — only set up what varies:
    prismaMock.job.findFirst.mockResolvedValue(null);
    ...
  });
  // etc.
});
```

## Acceptance Criteria

- [ ] `$transaction.mockImplementation` appears once (in `beforeEach`), not 4 times
- [ ] All 4 runner tests still pass
- [ ] This should be done alongside issue 001 (fixing `tx: any`)
