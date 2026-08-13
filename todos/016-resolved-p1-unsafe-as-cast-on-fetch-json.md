---
status: pending
priority: p1
issue_id: "016"
tags: [code-review, security, quality]
dependencies: []
---

# Unsafe `as` Cast on `res.json()` Responses in Web api.ts

## Problem Statement

`apps/web/src/lib/api.ts` uses TypeScript `as` casts (`as Promise<HealthResponse>`, `as { data: Animal[] }`) on `res.json()` responses. These casts provide zero runtime protection — if the API returns a malformed or unexpected response, the TypeScript types are lies and downstream code will throw cryptic runtime errors. The comment in the file even acknowledges this: "the cast to HealthResponse is not validated at runtime. Malformed API responses will silently render null."

## Findings

- `apps/web/src/lib/api.ts:15` — `return res.json() as Promise<HealthResponse>` — zero runtime validation
- `apps/web/src/lib/api.ts:26` — `(await res.json()) as { data: Animal[] }` — zero runtime validation
- If API returns `{ data: null }` instead of `{ data: [] }`, `body.data.map()` in `page.tsx` will throw
- If health response lacks `db` field, component renders garbage silently

## Proposed Solutions

### Option 1: Add runtime validation with Zod

**Approach:** Add Zod schemas for `HealthResponse` and `{ data: Animal[] }`. Parse `res.json()` with `.safeParse()`. Return `null` on parse failure.

```typescript
import { z } from "zod";
const HealthSchema = z.object({ status: z.enum(["ok", "error"]), db: z.enum(["connected", "disconnected"]) });
const data = HealthSchema.safeParse(await res.json());
if (!data.success) return null;
return data.data;
```

**Pros:**
- Runtime safety
- Explicit error on bad response
- Already validated structure for callers

**Cons:**
- Adds Zod dependency to web app (or reuse if already there)

**Effort:** 1 hour

**Risk:** Low

---

### Option 2: Manual runtime checks

**Approach:** Add explicit checks (`if (!body || !Array.isArray(body.data)) return null`) before using response fields.

**Pros:**
- No new dependencies
- Targeted protection

**Cons:**
- More boilerplate, easy to miss fields
- Less exhaustive than Zod

**Effort:** 30 minutes

**Risk:** Low

---

### Option 3: Accept risk with a type guard

**Approach:** Write a `isHealthResponse(x): x is HealthResponse` type guard with explicit field checks. Use in place of `as` cast.

**Effort:** 45 minutes

**Risk:** Low

## Recommended Action

**To be filled during triage.**

## Technical Details

**Affected files:**
- `apps/web/src/lib/api.ts:15,26`

## Resources

- **PR:** https://github.com/ulymaglana/farm-manager/pull/2

## Acceptance Criteria

- [ ] No bare `as` casts on `res.json()` results
- [ ] Malformed API responses return `null` gracefully
- [ ] TypeScript compiles without errors
- [ ] Tests (or manual verification) confirm graceful degradation

## Work Log

### 2026-08-14 - Code Review Discovery

**By:** Claude Code (review agent synthesis)

**Actions:**
- Identified unsafe `as` casts on all fetch responses
- Noted inline comment in code acknowledging the issue

---
