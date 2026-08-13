---
status: resolved
priority: p2
issue_id: "004"
tags: [code-review, typescript, type-safety, web]
---

# P2: `HealthResponse` uses `string` where literal union types are known

## Problem Statement

`apps/web/src/lib/api.ts` defines `HealthResponse.status` and `db` as `string`. The API contract is well-defined: `status` is `"ok" | "error"` and `db` is `"connected" | "disconnected"`. Using `string` loses narrowing and autocomplete.

## Findings

```typescript
// Current:
export interface HealthResponse {
  status: string;
  db: string;
}

// The health route in apps/api/src/routes/health.ts already sends exactly:
// { status: "ok", db: "connected" } or { status: "error", db: "disconnected" }
```

## Proposed Solution

```typescript
export interface HealthResponse {
  status: "ok" | "error";
  db: "connected" | "disconnected";
}
```

This also tightens test assertions — `toStrictEqual({ status: "ok", db: "connected" })` gets compile-time verification.

## Acceptance Criteria

- [ ] `HealthResponse` uses literal union types for both fields
- [ ] `pnpm test:run` still passes
