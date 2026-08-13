# Graph Report - infra  (2026-08-13)

## Corpus Check
- 29 files · ~5,329 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 138 nodes · 143 edges · 22 communities (18 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3031d0cd`
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

## God Nodes (most connected - your core abstractions)
1. `feat: Add Vitest Unit Tests for apps and shared package` - 14 edges
2. `Vitest Configuration` - 7 edges
3. `prisma` - 7 edges
4. `Test Specifications` - 6 edges
5. `Technical Approach` - 5 edges
6. `runNextJob()` - 5 edges
7. `buildApp()` - 4 edges
8. `getHealth()` - 4 edges
9. `Pre-Work (Required Before Writing Tests)` - 4 edges
10. ``apps/worker/src/jobs/runner.test.ts`` - 4 edges

## Surprising Connections (you probably didn't know these)
- `start()` --calls--> `buildApp()`  [EXTRACTED]
  apps/api/src/index.ts → apps/api/src/app.ts
- `HomePage()` --calls--> `getHealth()`  [EXTRACTED]
  apps/web/src/app/page.tsx → apps/web/src/lib/api.ts
- `pollLoop()` --calls--> `runNextJob()`  [EXTRACTED]
  apps/worker/src/index.ts → apps/worker/src/jobs/runner.ts
- `runNextJob()` --calls--> `handleExampleJob()`  [EXTRACTED]
  apps/worker/src/jobs/runner.ts → apps/worker/src/jobs/exampleJob.ts

## Communities (22 total, 4 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.12
Nodes (16): Acceptance Criteria, code:json ({), code:typescript (import { PrismaClient } from '@prisma/client'), code:typescript (// Easy to miss — no TypeScript error without the ESLint rul), Enhancement Summary, ESLint Enhancement (Optional but Recommended), feat: Add Vitest Unit Tests for apps and shared package, Files in Scope (Revised) (+8 more)

### Community 1 - "Community 1"
Cohesion: 0.2
Nodes (10): handleExampleJob(), logger, logger, runNextJob(), job, prismaMock, prisma, POLL_INTERVAL_MS (+2 more)

### Community 2 - "Community 2"
Cohesion: 0.14
Nodes (14): `apps/api/vitest.config.ts`, `apps/web/vitest.config.ts`, `apps/worker/vitest.config.ts`, code:typescript (import { defineConfig } from 'vitest/config'), code:typescript (import { defineConfig } from 'vitest/config'), code:typescript (import { defineConfig } from 'vitest/config'), code:json (// apps/api/tsconfig.test.json (same pattern for apps/worker), code:typescript (// add to resolve section of each vitest.config.ts) (+6 more)

### Community 3 - "Community 3"
Cohesion: 0.15
Nodes (13): `apps/api/src/app.ts` (New File — Factory Pattern), `apps/api/src/routes/health.test.ts`, `apps/web/src/app/page.test.ts`, `apps/worker/src/jobs/runner.test.ts`, code:typescript (import Fastify, { FastifyInstance } from 'fastify'), code:typescript (import { describe, it, expect, beforeEach, afterEach, vi } f), code:typescript (import { describe, it, expect, vi } from 'vitest'), code:typescript (// apps/worker/src/jobs/runner.integration.ts) (+5 more)

### Community 4 - "Community 4"
Cohesion: 0.22
Nodes (8): healthRoutes(), prismaMock, buildApp(), globalForPrisma, logger, port, shutdown(), start()

### Community 5 - "Community 5"
Cohesion: 0.2
Nodes (7): createLogger(), LogEntry, LogLevel, logger, parsed, stderrSpy, stdoutSpy

### Community 6 - "Community 6"
Cohesion: 0.22
Nodes (5): Status, Architecture, code:bash (./scripts/setup.sh          # First-time setup), Key commands, Stack

### Community 7 - "Community 7"
Cohesion: 0.25
Nodes (8): code:typescript (// CORRECT — factory form, hoisted safely), code:typescript (// CORRECT), code:block5 (apps/api/), ESM Mocking Rules, Mocking Strategy, Technical Approach, Test File Layout, Test Framework: Vitest 3.2

### Community 8 - "Community 8"
Cohesion: 0.53
Nodes (3): HomePage(), getHealth(), HealthResponse

### Community 9 - "Community 9"
Cohesion: 0.33
Nodes (6): code:typescript (// At the bottom of apps/api/src/index.ts and apps/worker/sr), code:block2 (# 1. Add to .gitignore (gap exists — .env.test is not curren), Pre-Work 1: Add `import.meta.url` guard to entry points, Pre-Work 2: Extract Fastify app factory, Pre-Work 3: Security setup, Pre-Work (Required Before Writing Tests)

### Community 10 - "Community 10"
Cohesion: 0.4
Nodes (5): `apps/web` only (devDependencies) — only if client components are added later, code:json ({), code:block7 (@vitejs/plugin-react @testing-library/react @testing-library), Dependencies to Add, Root `package.json` (devDependencies)

### Community 11 - "Community 11"
Cohesion: 0.5
Nodes (3): CreateJobInput, Job, JobStatus

## Knowledge Gaps
- **60 isolated node(s):** `port`, `prismaMock`, `HealthResponse`, `POLL_INTERVAL_MS`, `prismaMock` (+55 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `feat: Add Vitest Unit Tests for apps and shared package` connect `Community 0` to `Community 2`, `Community 3`, `Community 7`, `Community 9`, `Community 10`?**
  _High betweenness centrality (0.178) - this node is a cross-community bridge._
- **Why does `Vitest Configuration` connect `Community 2` to `Community 0`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `Test Specifications` connect `Community 3` to `Community 0`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **What connects `port`, `prismaMock`, `HealthResponse` to the rest of the system?**
  _60 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._