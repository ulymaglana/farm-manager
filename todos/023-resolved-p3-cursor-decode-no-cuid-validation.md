---
status: pending
priority: p3
issue_id: "023"
tags: [code-review, security, quality]
dependencies: []
---

# Cursor Decoding Doesn't Validate the Decoded CUID Format

## Problem Statement

The `GET /animals` handler decodes the base64url cursor and passes it directly to Prisma as `cursor: { id: cursorId }`. There is no validation that the decoded value matches the CUID format (`^c[a-z0-9]{24}$`). A malformed or malicious cursor string could cause Prisma errors that surface as unhandled 500s.

## Findings

- `apps/api/src/routes/animals.ts:54-56` — base64url decoded `cursorId` passed to Prisma without format check
- Prisma will throw a `PrismaClientValidationError` (not a `KnownRequestError`) if the ID format is invalid — this is unhandled and will result in a 500
- The `cursor` query param is validated as `{ type: "string" }` only — no base64url format check at schema level

## Proposed Solutions

### Option 1: Validate decoded cursor against CUID regex

**Approach:** After decoding, check `/^c[a-z0-9]{24}$/.test(cursorId)`. Return 400 if invalid.

```typescript
const CUID_REGEX = /^c[a-z0-9]{24}$/;
if (cursorId && !CUID_REGEX.test(cursorId)) {
  return reply.status(400).send({ statusCode: 400, error: "Bad Request", message: "Invalid cursor" });
}
```

**Pros:**
- Prevents 500 on invalid cursor
- Consistent with `idParamsSchema` validation

**Cons:**
- Small extra code

**Effort:** 20 minutes

**Risk:** Low

---

### Option 2: Wrap Prisma cursor query in try/catch for ValidationError

**Approach:** Catch `PrismaClientValidationError` and return 400.

**Effort:** 20 minutes

**Risk:** Low

## Recommended Action

**To be filled during triage.**

## Technical Details

**Affected files:**
- `apps/api/src/routes/animals.ts:54-62`

## Resources

- **PR:** https://github.com/ulymaglana/farm-manager/pull/2

## Acceptance Criteria

- [ ] Invalid cursor returns 400, not 500
- [ ] Test added for invalid cursor input

## Work Log

### 2026-08-14 - Code Review Discovery

**By:** Claude Code (review agent synthesis)

---
