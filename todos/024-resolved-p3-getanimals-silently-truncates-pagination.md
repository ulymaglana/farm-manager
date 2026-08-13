---
status: pending
priority: p3
issue_id: "024"
tags: [code-review, quality]
dependencies: []
---

# getAnimals() Silently Drops Pagination, Truncates at 20 Items

## Problem Statement

`apps/web/src/lib/api.ts:getAnimals()` fetches `/animals` which returns at most 20 animals by default. If there are more than 20 animals in the database, the web page silently displays only the first page with no indication that more exist and no way to load them. The `pagination` field in the response is completely ignored.

## Findings

- `apps/web/src/lib/api.ts:26` — `const body = (await res.json()) as { data: Animal[] }; return body.data;` — pagination ignored
- `apps/web/src/app/page.tsx:24-31` — renders animals without any "load more" or pagination UI
- With `limit: 20` default, users with 21+ animals will never see all their data

## Proposed Solutions

### Option 1: Fetch all pages server-side (simple, for small datasets)

**Approach:** Loop in `getAnimals()` following `nextCursor` until `hasNextPage` is false. Returns all animals.

**Pros:**
- Complete data, no UI change needed
- Simple for small datasets

**Cons:**
- N API calls — bad for large datasets
- Blocks page render until all pages fetched

**Effort:** 1 hour

**Risk:** Low

---

### Option 2: Add server-side pagination to the page

**Approach:** Accept `searchParams` in the page component. Pass `?cursor=...` to API. Render "Next page" link.

**Pros:**
- Proper pagination UX
- Scales to large datasets

**Cons:**
- More UI work

**Effort:** 2 hours

**Risk:** Low

---

### Option 3: Document the truncation (demo only)

**Approach:** Add comment in `page.tsx` noting only first 20 animals are shown. Acceptable for demo.

**Effort:** 5 minutes

**Risk:** None (for demo)

## Recommended Action

**To be filled during triage.**

## Technical Details

**Affected files:**
- `apps/web/src/lib/api.ts:21-31`
- `apps/web/src/app/page.tsx`

## Resources

- **PR:** https://github.com/ulymaglana/farm-manager/pull/2

## Acceptance Criteria

- [ ] All animals visible OR truncation clearly documented
- [ ] If pagination added: "next page" functionality works

## Work Log

### 2026-08-14 - Code Review Discovery

**By:** Claude Code (review agent synthesis)

---
