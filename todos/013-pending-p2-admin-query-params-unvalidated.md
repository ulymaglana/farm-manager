---
status: resolved
priority: p2
issue_id: "013"
tags: [code-review, security, validation, api, admin]
---

# P2: Admin query params cast without runtime validation

## Problem Statement

`GET /admin/users` in `apps/api/src/routes/admin.ts` casts `request.query` to `{ cursor?: string; limit?: string }` using a TypeScript type assertion. This is not runtime validation — any query shape is accepted silently. While the `limit` calculation caps at 100, a non-numeric `limit` value becomes `NaN`, causing `Math.min(NaN, 100)` to return `NaN` and `findMany({ take: NaN + 1 })` to behave unexpectedly (likely takes 0 or all rows depending on Prisma/DB behavior).

## Findings

`apps/api/src/routes/admin.ts:14-15`:
```typescript
const query = request.query as { cursor?: string; limit?: string };
const limit = Math.min(Number(query.limit ?? 20), 100);
// ^ Number("abc") = NaN; Math.min(NaN, 100) = NaN; take: NaN + 1 = NaN
```

## Proposed Solution

Add Zod validation matching the existing pattern in `auth.ts`:

```typescript
const AdminUsersQuery = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// In route handler:
const parsed = AdminUsersQuery.safeParse(request.query);
if (!parsed.success) {
  return reply.status(400).send({ error: "Invalid query parameters" });
}
const { cursor, limit } = parsed.data;
```

Also add `z` import: `import { z } from "zod";`

## Acceptance Criteria

- [ ] Non-numeric `limit` values return 400
- [ ] `limit` is capped at 100 and defaults to 20
- [ ] Invalid `cursor` format returns 400 or is safely handled
- [ ] Tests added for invalid query parameter cases in `admin.test.ts`

## Work Log

- 2026-08-13: Identified during `/workflows:review` code review pass
