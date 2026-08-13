# Graph Report - animal-api  (2026-08-13)

## Corpus Check
- 44 files · ~11,531 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 291 nodes · 317 edges · 40 communities (35 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `db98f483`
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

## God Nodes (most connected - your core abstractions)
1. `feat: Add Vitest Unit Tests for apps and shared package` - 15 edges
2. `feat: Add Animal API endpoint and database model` - 13 edges
3. `prisma` - 13 edges
4. `buildApp()` - 7 edges
5. `Vitest Configuration` - 7 edges
6. `getHealth()` - 6 edges
7. `runNextJob()` - 6 edges
8. `Test Specifications` - 6 edges
9. `Request / Response shapes` - 5 edges
10. `MVP Code Sketches` - 5 edges

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

## Communities (40 total, 5 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (29): Acceptance Criteria, `apps/web` only (devDependencies) — only if client components are added later, code:json ({), code:typescript (import { PrismaClient } from '@prisma/client'), code:typescript (// Easy to miss — no TypeScript error without the ESLint rul), code:typescript (// CORRECT — factory form, hoisted safely), code:typescript (// CORRECT), code:block5 (apps/api/) (+21 more)

### Community 1 - "Community 1"
Cohesion: 0.12
Nodes (17): animalRoutes(), createBodySchema, idParamsSchema, listQuerySchema, notFound, body, mockAnimal, p2025 (+9 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (21): Acceptance Criteria, code:prisma (// apps/api/prisma/schema.prisma (addition)), code:mermaid (erDiagram), Database Schema Change, Dependencies & Risks, Enhancement Summary, ERD, feat: Add Animal API endpoint and database model (+13 more)

### Community 3 - "Community 3"
Cohesion: 0.19
Nodes (11): handleExampleJob(), logger, logger, runNextJob(), job, prismaMock, prisma, controller (+3 more)

### Community 4 - "Community 4"
Cohesion: 0.14
Nodes (14): `apps/api/vitest.config.ts`, `apps/web/vitest.config.ts`, `apps/worker/vitest.config.ts`, code:typescript (import { defineConfig } from 'vitest/config'), code:typescript (import { defineConfig } from 'vitest/config'), code:typescript (import { defineConfig } from 'vitest/config'), code:json (// apps/api/tsconfig.test.json (same pattern for apps/worker), code:typescript (// add to resolve section of each vitest.config.ts) (+6 more)

### Community 5 - "Community 5"
Cohesion: 0.15
Nodes (13): `apps/api/src/app.ts` (New File — Factory Pattern), `apps/api/src/routes/health.test.ts`, `apps/web/src/app/page.test.ts`, `apps/worker/src/jobs/runner.test.ts`, code:typescript (import Fastify, { FastifyInstance } from 'fastify'), code:typescript (import { describe, it, expect, beforeEach, afterEach, vi } f), code:typescript (import { describe, it, expect, vi } from 'vitest'), code:typescript (// apps/worker/src/jobs/runner.integration.ts) (+5 more)

### Community 6 - "Community 6"
Cohesion: 0.29
Nodes (8): createLogger(), log(), LogEntry, LogLevel, logger, parsed, stderrSpy, stdoutSpy

### Community 7 - "Community 7"
Cohesion: 0.2
Nodes (5): Status, Architecture, code:bash (./scripts/setup.sh          # First-time setup), Key commands, Stack

### Community 8 - "Community 8"
Cohesion: 0.39
Nodes (4): HomePage(), getAnimals(), getHealth(), HealthResponse

### Community 9 - "Community 9"
Cohesion: 0.22
Nodes (8): Acceptance Criteria, code:json ({), code:typescript (plugins: [tsconfigPaths({ projects: ["./tsconfig.test.json"]), code:typescript (test: {), Findings, P2: `tsconfig.test.json` files are orphaned — not referenced by Vitest configs, Problem Statement, Proposed Solution

### Community 10 - "Community 10"
Cohesion: 0.22
Nodes (8): Acceptance Criteria, code:typescript (// Current — both __mocks__/db.ts files:), code:typescript (// apps/api/src/__mocks__/db.ts), code:typescript (import { prisma } from "../db.js";), Findings, P1: `__mocks__/db.ts` missing explicit return type causes `as unknown as` casts in tests, Problem Statement, Proposed Solution

### Community 11 - "Community 11"
Cohesion: 0.22
Nodes (8): Acceptance Criteria, code:typescript (// apps/worker/src/index.ts), code:typescript (export async function pollLoop(signal?: AbortSignal): Promis), code:typescript (let running = true;), Findings, P1: `pollLoop()` is exported but untestable — `running` flag not stoppable from tests, Problem Statement, Proposed Solution

### Community 12 - "Community 12"
Cohesion: 0.25
Nodes (8): API Endpoints, code:json ({ "name": "Leo", "species": "Lion", "age": 5, "description":), code:json ({), code:json ({ "statusCode": 404, "error": "Not Found", "message": "Anima), code:json ({ "statusCode": 400, "error": "Bad Request", "message": "bod), code:json ({ "type": "string", "pattern": "^c[a-z0-9]{24}$" }), Request / Response shapes, Research Insights: Request Validation

### Community 13 - "Community 13"
Cohesion: 0.25
Nodes (8): apps/api/src/routes/animals.test.ts, apps/api/src/routes/animals.ts, code:typescript (import { describe, it, expect, beforeEach, afterEach, vi } f), code:typescript (// Nullable Prisma fields use `Type | null`, NOT `Type?`), code:typescript (import type { FastifyInstance } from "fastify";), MVP Code Sketches, packages/shared/src/types/animal.ts, Pattern consistency rules (from pattern-recognition-specialist)

### Community 14 - "Community 14"
Cohesion: 0.25
Nodes (7): Acceptance Criteria, code:typescript (// Repeated 4 times in runner.test.ts:), code:typescript (describe("runNextJob", () => {), Findings, P2: `$transaction` mock setup repeated 4× in runner.test.ts — hoist to `beforeEach`, Problem Statement, Proposed Solution

### Community 15 - "Community 15"
Cohesion: 0.25
Nodes (7): Acceptance Criteria, code:typescript (// Current:), code:typescript (export interface HealthResponse {), Findings, P2: `HealthResponse` uses `string` where literal union types are known, Problem Statement, Proposed Solution

### Community 16 - "Community 16"
Cohesion: 0.25
Nodes (7): Acceptance Criteria, code:typescript (// Current — wrong:), code:typescript (import type { Prisma } from "@prisma/client";), Findings, P1: `(tx: any)` in transaction mock callbacks defeats type safety, Problem Statement, Proposed Solution

### Community 17 - "Community 17"
Cohesion: 0.29
Nodes (6): Acceptance Criteria, code:json ({), Findings, P2: No `test` script in per-package `package.json` — can't run targeted tests, Problem Statement, Proposed Solution

### Community 18 - "Community 18"
Cohesion: 0.33
Nodes (6): code:typescript (// At the bottom of apps/api/src/index.ts and apps/worker/sr), code:block2 (# 1. Add to .gitignore (gap exists — .env.test is not curren), Pre-Work 1: Add `import.meta.url` guard to entry points, Pre-Work 2: Extract Fastify app factory, Pre-Work 3: Security setup, Pre-Work (Required Before Writing Tests)

### Community 19 - "Community 19"
Cohesion: 0.33
Nodes (5): Acceptance Criteria, code:json ({), P2: `vitest-mock-extended` imported in packages that don't declare it as a dep, Problem Statement, Proposed Solution

### Community 20 - "Community 20"
Cohesion: 0.33
Nodes (5): Acceptance Criteria, code:typescript ("apps/*/src/db.ts",), P3: `db.ts` files not excluded from coverage — creates 0% noise, Problem Statement, Proposed Solution

### Community 21 - "Community 21"
Cohesion: 0.33
Nodes (5): Acceptance Criteria, code:typescript (import { PrismaClient } from "@prisma/client";), P3: `beforeEach` in `__mocks__/db.ts` is non-obvious — add explanatory comment, Problem Statement, Proposed Solution

### Community 22 - "Community 22"
Cohesion: 0.6
Nodes (3): CreateJobInput, Job, JobStatus

## Knowledge Gaps
- **117 isolated node(s):** `mockAnimal`, `p2025`, `body`, `createBodySchema`, `updateBodySchema` (+112 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `feat: Add Vitest Unit Tests for apps and shared package` connect `Community 0` to `Community 18`, `Community 4`, `Community 5`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `Vitest Configuration` connect `Community 4` to `Community 0`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `Test Specifications` connect `Community 5` to `Community 0`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `mockAnimal`, `p2025`, `body` to the rest of the system?**
  _117 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._