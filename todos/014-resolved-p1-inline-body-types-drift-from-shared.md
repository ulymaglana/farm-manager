---
status: pending
priority: p1
issue_id: "014"
tags: [code-review, architecture, quality]
dependencies: []
---

# Inline Route Body Types Duplicate and Can Drift from Shared Types

## Problem Statement

`apps/api/src/routes/animals.ts` declares inline TypeScript body types (`{ name: string; species: string; age?: number; description?: string }`) directly in the generic parameters for POST and PUT handlers. The shared package already exports `CreateAnimalInput` for exactly this purpose. These inline types will silently drift from the shared types when fields are added or changed, causing subtle type mismatches between web and API.

## Findings

- `apps/api/src/routes/animals.ts:93` — `Body: { name: string; species: string; age?: number; description?: string }` duplicates `CreateAnimalInput`
- `apps/api/src/routes/animals.ts:104-105` — PUT body type also inlined, not imported from shared
- `packages/shared/src/types/animal.ts` — exports `CreateAnimalInput` with identical fields
- No import of `CreateAnimalInput` in `animals.ts`

## Proposed Solutions

### Option 1: Import and use shared types in route generics

**Approach:** Add `import type { CreateAnimalInput } from "@myapp/shared"` to `animals.ts`. Replace inline types with `Body: CreateAnimalInput` for POST and `Body: Partial<CreateAnimalInput>` for PUT.

**Pros:**
- Single source of truth
- Changes to shared type automatically reflected in routes
- Cleaner code

**Cons:**
- None significant

**Effort:** 15 minutes

**Risk:** Low

---

### Option 2: Define types in shared, generate JSON schemas from Zod

**Approach:** Define Animal schemas in shared using Zod, export both the TypeScript type and the JSON schema. Import JSON schema directly into Fastify route definitions.

**Pros:**
- JSON schema and TypeScript type always in sync
- Runtime validation using shared schema

**Cons:**
- Adds Zod dependency
- More complex setup

**Effort:** 4 hours

**Risk:** Medium

## Recommended Action

**To be filled during triage.**

## Technical Details

**Affected files:**
- `apps/api/src/routes/animals.ts:93,104-105` — inline types
- `packages/shared/src/types/animal.ts` — existing shared types

## Resources

- **PR:** https://github.com/ulymaglana/farm-manager/pull/2

## Acceptance Criteria

- [ ] No inline body type duplicating `CreateAnimalInput` in `animals.ts`
- [ ] `CreateAnimalInput` (or equivalent) imported from shared package
- [ ] TypeScript compiles without errors
- [ ] Tests still pass

## Work Log

### 2026-08-14 - Code Review Discovery

**By:** Claude Code (review agent synthesis)

**Actions:**
- Identified inline type duplication in route handlers
- Confirmed shared package has equivalent types unused

---
