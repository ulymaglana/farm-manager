---
status: pending
priority: p1
issue_id: "015"
tags: [code-review, architecture, api-design]
dependencies: []
---

# PUT Used for Partial Update — Should Be PATCH per RFC 9110

## Problem Statement

The `PUT /animals/:id` endpoint in `animals.ts` performs a partial update (only updating provided fields via `updateBodySchema` with no required fields). Per RFC 9110, PUT must replace the entire resource. Partial updates must use PATCH. Using PUT here violates HTTP semantics and misleads API consumers who may assume PUT replaces the entire resource and omit fields they don't want to clear.

## Findings

- `apps/api/src/routes/animals.ts:103-123` — `app.put` used with `updateBodySchema` that has no required fields (`minProperties: 1`)
- This is partial update semantics — exactly what PATCH is for
- REST clients and API gateways may cache or handle PUT differently from PATCH
- Tests in `animals.test.ts:137-172` test the `PUT` endpoint; they'd need updating to `PATCH`

## Proposed Solutions

### Option 1: Change PUT to PATCH

**Approach:** Replace `app.put` with `app.patch` in `animals.ts`. Update test file to use `method: "PATCH"`. Update web `api.ts` if it calls PUT (currently it doesn't call update endpoint, so only API + tests need changing).

**Pros:**
- Correct HTTP semantics
- No functional behavior change
- Aligns with REST standards

**Cons:**
- Breaking change for any existing API consumers

**Effort:** 20 minutes

**Risk:** Low

---

### Option 2: Keep PUT but enforce full replacement semantics

**Approach:** Make all fields required in `updateBodySchema`. Clients must send the full animal object. Add `PATCH` as a separate endpoint for partial updates.

**Pros:**
- Correct PUT semantics
- Both operations available

**Cons:**
- More endpoints to maintain
- More complex for clients

**Effort:** 1 hour

**Risk:** Low

## Recommended Action

**To be filled during triage.**

## Technical Details

**Affected files:**
- `apps/api/src/routes/animals.ts:103` — `app.put` → `app.patch`
- `apps/api/src/routes/animals.test.ts:141` — `method: "PUT"` → `method: "PATCH"`

## Resources

- **PR:** https://github.com/ulymaglana/farm-manager/pull/2
- **RFC 9110 §9.3.6 (PUT):** https://www.rfc-editor.org/rfc/rfc9110#section-9.3.6

## Acceptance Criteria

- [ ] Partial update endpoint uses PATCH not PUT
- [ ] Tests updated to use PATCH method
- [ ] All tests pass

## Work Log

### 2026-08-14 - Code Review Discovery

**By:** Claude Code (review agent synthesis)

**Actions:**
- Identified PUT with partial-update semantics
- Verified no existing web client calls the update endpoint

---
