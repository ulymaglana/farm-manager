# Graph Report - animal-api  (2026-08-14)

## Corpus Check
- 58 files · ~16,350 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 489 nodes · 501 edges · 50 communities (46 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `52213006`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]

## God Nodes (most connected - your core abstractions)
1. `feat: Add Vitest Unit Tests for apps and shared package` - 15 edges
2. `feat: Add Animal API endpoint and database model` - 13 edges
3. `prisma` - 13 edges
4. `Cursor Pagination Uses Wrong Sort Key` - 9 edges
5. `NEXT_PUBLIC_API_URL Leaks Internal API URL to Browser Bundle` - 9 edges
6. `db:push and prisma migrate Coexist — Mutually Exclusive Strategies` - 9 edges
7. `Inline Route Body Types Duplicate and Can Drift from Shared Types` - 9 edges
8. `PUT Used for Partial Update — Should Be PATCH per RFC 9110` - 9 edges
9. `Unsafe `as` Cast on `res.json()` Responses in Web api.ts` - 9 edges
10. `No Authentication on Any Animal Endpoint` - 9 edges

## Surprising Connections (you probably didn't know these)
- `start()` --calls--> `buildApp()`  [EXTRACTED]
  /Users/ulysses/.devswarm/repos/1/70229104/infra/apps/api/src/index.ts → apps/api/src/app.ts
- `pollLoop()` --calls--> `runNextJob()`  [EXTRACTED]
  apps/worker/src/index.ts → /Users/ulysses/.devswarm/repos/1/70229104/infra/apps/worker/src/jobs/runner.ts
- `HomePage()` --calls--> `getHealth()`  [EXTRACTED]
  apps/web/src/app/page.tsx → apps/web/src/lib/api.ts
- `HomePage()` --calls--> `getAnimals()`  [EXTRACTED]
  apps/web/src/app/page.tsx → apps/web/src/lib/api.ts
- `runNextJob()` --calls--> `handleExampleJob()`  [EXTRACTED]
  /Users/ulysses/.devswarm/repos/1/70229104/infra/apps/worker/src/jobs/runner.ts → /Users/ulysses/.devswarm/repos/1/70229104/infra/apps/worker/src/jobs/exampleJob.ts

## Communities (50 total, 4 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (28): handleExampleJob(), logger, logger, runNextJob(), job, prismaMock, animalRoutes(), createBodySchema (+20 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (37): Acceptance Criteria, API Endpoints, apps/api/src/routes/animals.test.ts, apps/api/src/routes/animals.ts, code:prisma (// apps/api/prisma/schema.prisma (addition)), code:typescript (import { describe, it, expect, beforeEach, afterEach, vi } f), code:mermaid (erDiagram), code:json ({ "name": "Leo", "species": "Lion", "age": 5, "description":) (+29 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (35): Acceptance Criteria, `apps/web` only (devDependencies) — only if client components are added later, code:typescript (// At the bottom of apps/api/src/index.ts and apps/worker/sr), code:json ({), code:typescript (import { PrismaClient } from '@prisma/client'), code:block2 (# 1. Add to .gitignore (gap exists — .env.test is not curren), code:typescript (// Easy to miss — no TypeScript error without the ESLint rul), code:typescript (// CORRECT — factory form, hoisted safely) (+27 more)

### Community 3 - "Community 3"
Cohesion: 0.13
Nodes (14): 2026-08-14 - Code Review Discovery, Acceptance Criteria, code:typescript (import { z } from "zod";), Findings, Option 1: Add runtime validation with Zod, Option 2: Manual runtime checks, Option 3: Accept risk with a type guard, Problem Statement (+6 more)

### Community 4 - "Community 4"
Cohesion: 0.13
Nodes (9): Architecture, code:bash (./scripts/setup.sh          # First-time setup), Key commands, Stack, Status, Architecture, code:bash (./scripts/setup.sh          # First-time setup), Key commands (+1 more)

### Community 5 - "Community 5"
Cohesion: 0.14
Nodes (13): 2026-08-14 - Code Review Discovery, Acceptance Criteria, Cursor Pagination Uses Wrong Sort Key, Findings, Option 1: Sort by `id` (CUID monotonic order), Option 2: Composite cursor `(createdAt, id)`, Option 3: Keep cursor on `id`, add `@@index([id])` note, Problem Statement (+5 more)

### Community 6 - "Community 6"
Cohesion: 0.14
Nodes (13): 2026-08-14 - Code Review Discovery, Acceptance Criteria, Findings, No Authentication on Any Animal Endpoint, Option 1: API key authentication for write operations, Option 2: JWT authentication, Option 3: Document as intentionally public (for demo/prototype), Problem Statement (+5 more)

### Community 7 - "Community 7"
Cohesion: 0.14
Nodes (13): 2026-08-14 - Code Review Discovery, Acceptance Criteria, code:typescript (export function buildApp(opts: FastifyServerOptions = {}): F), Fastify Logger Disabled — Shared createLogger Not Wired, Findings, Option 1: Wire createLogger from shared + disable only in tests, Option 2: Use Fastify's built-in pino logger, Problem Statement (+5 more)

### Community 8 - "Community 8"
Cohesion: 0.14
Nodes (13): 2026-08-14 - Code Review Discovery, Acceptance Criteria, code:typescript (export interface Pagination {), Findings, Option 1: Add shared PaginatedResponse type, Option 2: Keep inline types, add comment, Pagination Envelope Has No Shared Type Contract, Problem Statement (+5 more)

### Community 9 - "Community 9"
Cohesion: 0.14
Nodes (13): 2026-08-14 - Code Review Discovery, Acceptance Criteria, code:typescript (function handlePrismaError(err: unknown, reply: FastifyReply), Duplicate P2025 Catch Blocks in PUT and DELETE Handlers, Findings, Option 1: Extract reusable error handler helper, Option 2: Leave as-is (acceptable for 2 occurrences), Problem Statement (+5 more)

### Community 10 - "Community 10"
Cohesion: 0.14
Nodes (13): 2026-08-14 - Code Review Discovery, Acceptance Criteria, code:typescript (const CUID_REGEX = /^c[a-z0-9]{24}$/;), Cursor Decoding Doesn't Validate the Decoded CUID Format, Findings, Option 1: Validate decoded cursor against CUID regex, Option 2: Wrap Prisma cursor query in try/catch for ValidationError, Problem Statement (+5 more)

### Community 11 - "Community 11"
Cohesion: 0.14
Nodes (13): 2026-08-14 - Code Review Discovery, Acceptance Criteria, Findings, getAnimals() Silently Drops Pagination, Truncates at 20 Items, Option 1: Fetch all pages server-side (simple, for small datasets), Option 2: Add server-side pagination to the page, Option 3: Document the truncation (demo only), Problem Statement (+5 more)

### Community 12 - "Community 12"
Cohesion: 0.14
Nodes (14): `apps/api/vitest.config.ts`, `apps/web/vitest.config.ts`, `apps/worker/vitest.config.ts`, code:typescript (import { defineConfig } from 'vitest/config'), code:typescript (import { defineConfig } from 'vitest/config'), code:typescript (import { defineConfig } from 'vitest/config'), code:json (// apps/api/tsconfig.test.json (same pattern for apps/worker), code:typescript (// add to resolve section of each vitest.config.ts) (+6 more)

### Community 13 - "Community 13"
Cohesion: 0.15
Nodes (12): 2026-08-14 - Code Review Discovery, Acceptance Criteria, Findings, NEXT_PUBLIC_API_URL Leaks Internal API URL to Browser Bundle, Option 1: Rename to `API_URL`, Option 2: Use Next.js Route Handlers as API proxy, Problem Statement, Proposed Solutions (+4 more)

### Community 14 - "Community 14"
Cohesion: 0.15
Nodes (12): 2026-08-14 - Code Review Discovery, Acceptance Criteria, db:push and prisma migrate Coexist — Mutually Exclusive Strategies, Findings, Option 1: Commit to migrate workflow (recommended for production), Option 2: Commit to db push workflow (prototyping only), Problem Statement, Proposed Solutions (+4 more)

### Community 15 - "Community 15"
Cohesion: 0.15
Nodes (12): 2026-08-14 - Code Review Discovery, Acceptance Criteria, Findings, Inline Route Body Types Duplicate and Can Drift from Shared Types, Option 1: Import and use shared types in route generics, Option 2: Define types in shared, generate JSON schemas from Zod, Problem Statement, Proposed Solutions (+4 more)

### Community 16 - "Community 16"
Cohesion: 0.15
Nodes (12): 2026-08-14 - Code Review Discovery, Acceptance Criteria, Findings, Option 1: Change PUT to PATCH, Option 2: Keep PUT but enforce full replacement semantics, Problem Statement, Proposed Solutions, PUT Used for Partial Update — Should Be PATCH per RFC 9110 (+4 more)

### Community 17 - "Community 17"
Cohesion: 0.15
Nodes (12): 2026-08-14 - Code Review Discovery, Acceptance Criteria, Findings, No CORS Configured on Fastify API, Option 1: Register @fastify/cors with allowlist, Option 2: Document that CORS is intentionally absent (RSC-only), Problem Statement, Proposed Solutions (+4 more)

### Community 18 - "Community 18"
Cohesion: 0.15
Nodes (13): `apps/api/src/app.ts` (New File — Factory Pattern), `apps/api/src/routes/health.test.ts`, `apps/web/src/app/page.test.ts`, `apps/worker/src/jobs/runner.test.ts`, code:typescript (import Fastify, { FastifyInstance } from 'fastify'), code:typescript (import { describe, it, expect, beforeEach, afterEach, vi } f), code:typescript (import { describe, it, expect, vi } from 'vitest'), code:typescript (// apps/worker/src/jobs/runner.integration.ts) (+5 more)

### Community 19 - "Community 19"
Cohesion: 0.17
Nodes (11): 2026-08-14 - Code Review Discovery, Acceptance Criteria, Dead `?? 20` Limit Fallback — Schema Default Already Applies, Findings, Option 1: Remove the `?? 20` fallback, Problem Statement, Proposed Solutions, Recommended Action (+3 more)

### Community 20 - "Community 20"
Cohesion: 0.29
Nodes (8): createLogger(), log(), LogEntry, LogLevel, logger, parsed, stderrSpy, stdoutSpy

### Community 21 - "Community 21"
Cohesion: 0.39
Nodes (4): HomePage(), getAnimals(), getHealth(), HealthResponse

### Community 22 - "Community 22"
Cohesion: 0.22
Nodes (8): Acceptance Criteria, code:json ({), code:typescript (plugins: [tsconfigPaths({ projects: ["./tsconfig.test.json"]), code:typescript (test: {), Findings, P2: `tsconfig.test.json` files are orphaned — not referenced by Vitest configs, Problem Statement, Proposed Solution

### Community 23 - "Community 23"
Cohesion: 0.22
Nodes (8): Acceptance Criteria, code:typescript (// Current — both __mocks__/db.ts files:), code:typescript (// apps/api/src/__mocks__/db.ts), code:typescript (import { prisma } from "../db.js";), Findings, P1: `__mocks__/db.ts` missing explicit return type causes `as unknown as` casts in tests, Problem Statement, Proposed Solution

### Community 24 - "Community 24"
Cohesion: 0.22
Nodes (8): Acceptance Criteria, code:typescript (// apps/worker/src/index.ts), code:typescript (export async function pollLoop(signal?: AbortSignal): Promis), code:typescript (let running = true;), Findings, P1: `pollLoop()` is exported but untestable — `running` flag not stoppable from tests, Problem Statement, Proposed Solution

### Community 25 - "Community 25"
Cohesion: 0.25
Nodes (7): Acceptance Criteria, code:typescript (// Repeated 4 times in runner.test.ts:), code:typescript (describe("runNextJob", () => {), Findings, P2: `$transaction` mock setup repeated 4× in runner.test.ts — hoist to `beforeEach`, Problem Statement, Proposed Solution

### Community 26 - "Community 26"
Cohesion: 0.25
Nodes (7): Acceptance Criteria, code:typescript (// Current:), code:typescript (export interface HealthResponse {), Findings, P2: `HealthResponse` uses `string` where literal union types are known, Problem Statement, Proposed Solution

### Community 27 - "Community 27"
Cohesion: 0.25
Nodes (7): Acceptance Criteria, code:typescript (// Current — wrong:), code:typescript (import type { Prisma } from "@prisma/client";), Findings, P1: `(tx: any)` in transaction mock callbacks defeats type safety, Problem Statement, Proposed Solution

### Community 28 - "Community 28"
Cohesion: 0.29
Nodes (6): Acceptance Criteria, code:json ({), Findings, P2: No `test` script in per-package `package.json` — can't run targeted tests, Problem Statement, Proposed Solution

### Community 29 - "Community 29"
Cohesion: 0.33
Nodes (5): Acceptance Criteria, code:json ({), P2: `vitest-mock-extended` imported in packages that don't declare it as a dep, Problem Statement, Proposed Solution

### Community 30 - "Community 30"
Cohesion: 0.33
Nodes (5): Acceptance Criteria, code:typescript ("apps/*/src/db.ts",), P3: `db.ts` files not excluded from coverage — creates 0% noise, Problem Statement, Proposed Solution

### Community 31 - "Community 31"
Cohesion: 0.33
Nodes (5): Acceptance Criteria, code:typescript (import { PrismaClient } from "@prisma/client";), P3: `beforeEach` in `__mocks__/db.ts` is non-obvious — add explanatory comment, Problem Statement, Proposed Solution

### Community 32 - "Community 32"
Cohesion: 0.4
Nodes (4): Animal, CreateAnimalInput, PaginatedResponse, Pagination

### Community 33 - "Community 33"
Cohesion: 0.6
Nodes (3): CreateJobInput, Job, JobStatus

## Knowledge Gaps
- **251 isolated node(s):** `Stack`, `code:bash (./scripts/setup.sh          # First-time setup)`, `Architecture`, `mockAnimal`, `p2025` (+246 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `feat: Add Vitest Unit Tests for apps and shared package` connect `Community 2` to `Community 18`, `Community 12`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `Vitest Configuration` connect `Community 12` to `Community 2`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Why does `Test Specifications` connect `Community 18` to `Community 2`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **What connects `Stack`, `code:bash (./scripts/setup.sh          # First-time setup)`, `Architecture` to the rest of the system?**
  _251 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._