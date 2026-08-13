---
status: resolved
priority: p1
issue_id: "003"
tags: [code-review, architecture, testability, worker]
---

# P1: `pollLoop()` is exported but untestable — `running` flag not stoppable from tests

## Problem Statement

`apps/worker/src/index.ts` exports `pollLoop()` but the `running` flag controlling the loop is module-level mutable state with no way to set it from outside. Any test calling `pollLoop()` starts an infinite loop that hangs forever.

## Findings

```typescript
// apps/worker/src/index.ts
let running = true; // not exported, no setter

export async function pollLoop(): Promise<void> {
  while (running) { // infinite unless running is set false
    ...
  }
}
```

Current tests correctly avoid calling `pollLoop()` and test `runNextJob()` directly. But this means the loop lifecycle (graceful drain, shutdown signal) is completely untested.

## Proposed Solution

**Option A (Recommended): AbortSignal parameter**
```typescript
export async function pollLoop(signal?: AbortSignal): Promise<void> {
  logger.info("Worker started", { pollIntervalMs: POLL_INTERVAL_MS });
  while (!signal?.aborted) {
    // ...same logic...
  }
  logger.info("Worker stopped");
}

// In shutdown handler:
const controller = new AbortController();
const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}, shutting down gracefully`);
  controller.abort();
  await prisma.$disconnect();
  process.exit(0);
};
// Start with: pollLoop(controller.signal)
```

Tests can pass a pre-aborted signal: `pollLoop(AbortSignal.abort())` — the loop runs 0 iterations.

**Option B: Export a stop() function**
```typescript
let running = true;
export function stopLoop() { running = false; }
```
Simpler but less idiomatic for async loops.

## Acceptance Criteria

- [ ] `pollLoop()` accepts an `AbortSignal` (or equivalent) to stop the loop
- [ ] Production behavior unchanged (shutdown handler triggers abort)
- [ ] At minimum, a test can call `pollLoop(AbortSignal.abort())` and it resolves immediately
