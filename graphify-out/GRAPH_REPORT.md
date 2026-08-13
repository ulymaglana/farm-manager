# Graph Report - add-authentication  (2026-08-13)

## Corpus Check
- 56 files · ~15,446 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 368 nodes · 410 edges · 43 communities (38 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3b9115c6`
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

## God Nodes (most connected - your core abstractions)
1. `prisma` - 16 edges
2. `feat: Add Vitest Unit Tests for apps and shared package` - 15 edges
3. `feat: Add Authentication and Authorization` - 12 edges
4. `Technical Approach` - 11 edges
5. `New API Files` - 9 edges
6. `buildApp()` - 8 edges
7. `Vitest Configuration` - 7 edges
8. `New Web Files` - 6 edges
9. `Implementation Phases` - 6 edges
10. `getHealth()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `HomePage()` --calls--> `getHealth()`  [EXTRACTED]
  /Users/ulysses/.devswarm/repos/1/70229104/infra/apps/web/src/app/page.tsx → apps/web/src/lib/api.ts
- `pollLoop()` --calls--> `runNextJob()`  [EXTRACTED]
  apps/worker/src/index.ts → /Users/ulysses/.devswarm/repos/1/70229104/infra/apps/worker/src/jobs/runner.ts
- `start()` --calls--> `buildApp()`  [EXTRACTED]
  apps/api/src/index.ts → apps/api/src/app.ts
- `DashboardPage()` --calls--> `getCurrentUser()`  [EXTRACTED]
  apps/web/src/app/dashboard/page.tsx → apps/web/src/lib/auth.ts
- `runNextJob()` --calls--> `handleExampleJob()`  [EXTRACTED]
  /Users/ulysses/.devswarm/repos/1/70229104/infra/apps/worker/src/jobs/runner.ts → /Users/ulysses/.devswarm/repos/1/70229104/infra/apps/worker/src/jobs/exampleJob.ts

## Communities (43 total, 5 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (35): Acceptance Criteria, `apps/web` only (devDependencies) — only if client components are added later, code:typescript (// At the bottom of apps/api/src/index.ts and apps/worker/sr), code:json ({), code:typescript (import { PrismaClient } from '@prisma/client'), code:block2 (# 1. Add to .gitignore (gap exists — .env.test is not curren), code:typescript (// Easy to miss — no TypeScript error without the ESLint rul), code:typescript (// CORRECT — factory form, hoisted safely) (+27 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (21): corsPlugin, helmetPlugin, authPlugin, body, MOCK_ADMIN, MOCK_USER, token, body (+13 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (23): Architecture, code:block1 (Browser ──POST /auth/login──▶ API (Fastify)), code:bash (DATABASE_URL="postgresql://myapp:myapp_password@localhost:54), code:bash (# Public URL (used by browser for client-side fetch)), code:prisma (enum Role {), code:bash (NEXT_PUBLIC_API_URL=http://localhost:3001), code:typescript (// Mock jwtVerify to simulate authenticated requests), code:bash (pnpm --filter api run db:push   # dev only) (+15 more)

### Community 3 - "Community 3"
Cohesion: 0.19
Nodes (11): handleExampleJob(), logger, logger, runNextJob(), job, prismaMock, prisma, controller (+3 more)

### Community 4 - "Community 4"
Cohesion: 0.1
Nodes (19): Acceptance Criteria, Alternative Approaches Considered, code:mermaid (erDiagram), Dependencies & Prerequisites, Enhancement Summary, ERD, External References, feat: Add Authentication and Authorization (+11 more)

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (17): `apps/api/src/app.ts` (updated), `apps/api/src/hooks/requireAuth.ts`, `apps/api/src/hooks/requireRole.ts`, `apps/api/src/plugins/cors.ts`, `apps/api/src/plugins/jwt.ts`, `apps/api/src/routes/admin.ts`, `apps/api/src/routes/auth.ts`, `apps/api/src/types/fastify-jwt.d.ts` (+9 more)

### Community 6 - "Community 6"
Cohesion: 0.19
Nodes (8): DashboardPage(), apiPost(), getCurrentUser(), loginAction(), logoutAction(), registerAction(), initialState, initialState

### Community 7 - "Community 7"
Cohesion: 0.18
Nodes (7): requireAuth(), requireRole(), adminRoutes(), ARGON2_OPTIONS, authRoutes(), LoginBody, RegisterBody

### Community 8 - "Community 8"
Cohesion: 0.14
Nodes (14): `apps/api/vitest.config.ts`, `apps/web/vitest.config.ts`, `apps/worker/vitest.config.ts`, code:typescript (import { defineConfig } from 'vitest/config'), code:typescript (import { defineConfig } from 'vitest/config'), code:typescript (import { defineConfig } from 'vitest/config'), code:json (// apps/api/tsconfig.test.json (same pattern for apps/worker), code:typescript (// add to resolve section of each vitest.config.ts) (+6 more)

### Community 9 - "Community 9"
Cohesion: 0.15
Nodes (13): `apps/api/src/app.ts` (New File — Factory Pattern), `apps/api/src/routes/health.test.ts`, `apps/web/src/app/page.test.ts`, `apps/worker/src/jobs/runner.test.ts`, code:typescript (import Fastify, { FastifyInstance } from 'fastify'), code:typescript (import { describe, it, expect, beforeEach, afterEach, vi } f), code:typescript (import { describe, it, expect, vi } from 'vitest'), code:typescript (// apps/worker/src/jobs/runner.integration.ts) (+5 more)

### Community 10 - "Community 10"
Cohesion: 0.29
Nodes (8): createLogger(), log(), LogEntry, LogLevel, logger, parsed, stderrSpy, stdoutSpy

### Community 11 - "Community 11"
Cohesion: 0.2
Nodes (10): `apps/web/src/app/dashboard/page.tsx`, `apps/web/src/app/login/page.tsx`, `apps/web/src/app/register/page.tsx`, `apps/web/src/lib/auth.ts`, `apps/web/src/middleware.ts`, code:typescript (// apps/web/src/middleware.ts), code:typescript (// apps/web/src/lib/auth.ts — Server Actions and auth API he), code:typescript (// apps/web/src/app/login/page.tsx) (+2 more)

### Community 12 - "Community 12"
Cohesion: 0.22
Nodes (8): ActionResult, AuthResponse, CreateUserInput, JwtPayload, LoginInput, User, UserPublic, UserRole

### Community 13 - "Community 13"
Cohesion: 0.2
Nodes (5): Status, Architecture, code:bash (./scripts/setup.sh          # First-time setup), Key commands, Stack

### Community 14 - "Community 14"
Cohesion: 0.22
Nodes (8): Acceptance Criteria, code:json ({), code:typescript (plugins: [tsconfigPaths({ projects: ["./tsconfig.test.json"]), code:typescript (test: {), Findings, P2: `tsconfig.test.json` files are orphaned — not referenced by Vitest configs, Problem Statement, Proposed Solution

### Community 15 - "Community 15"
Cohesion: 0.22
Nodes (8): Acceptance Criteria, code:typescript (// Current — both __mocks__/db.ts files:), code:typescript (// apps/api/src/__mocks__/db.ts), code:typescript (import { prisma } from "../db.js";), Findings, P1: `__mocks__/db.ts` missing explicit return type causes `as unknown as` casts in tests, Problem Statement, Proposed Solution

### Community 16 - "Community 16"
Cohesion: 0.22
Nodes (8): Acceptance Criteria, code:typescript (// apps/worker/src/index.ts), code:typescript (export async function pollLoop(signal?: AbortSignal): Promis), code:typescript (let running = true;), Findings, P1: `pollLoop()` is exported but untestable — `running` flag not stoppable from tests, Problem Statement, Proposed Solution

### Community 17 - "Community 17"
Cohesion: 0.39
Nodes (3): HomePage(), getHealth(), HealthResponse

### Community 18 - "Community 18"
Cohesion: 0.25
Nodes (7): Acceptance Criteria, code:typescript (// Repeated 4 times in runner.test.ts:), code:typescript (describe("runNextJob", () => {), Findings, P2: `$transaction` mock setup repeated 4× in runner.test.ts — hoist to `beforeEach`, Problem Statement, Proposed Solution

### Community 19 - "Community 19"
Cohesion: 0.25
Nodes (7): Acceptance Criteria, code:typescript (// Current:), code:typescript (export interface HealthResponse {), Findings, P2: `HealthResponse` uses `string` where literal union types are known, Problem Statement, Proposed Solution

### Community 20 - "Community 20"
Cohesion: 0.25
Nodes (7): Acceptance Criteria, code:typescript (// Current — wrong:), code:typescript (import type { Prisma } from "@prisma/client";), Findings, P1: `(tx: any)` in transaction mock callbacks defeats type safety, Problem Statement, Proposed Solution

### Community 21 - "Community 21"
Cohesion: 0.29
Nodes (6): Acceptance Criteria, code:json ({), Findings, P2: No `test` script in per-package `package.json` — can't run targeted tests, Problem Statement, Proposed Solution

### Community 22 - "Community 22"
Cohesion: 0.33
Nodes (5): Acceptance Criteria, code:json ({), P2: `vitest-mock-extended` imported in packages that don't declare it as a dep, Problem Statement, Proposed Solution

### Community 23 - "Community 23"
Cohesion: 0.33
Nodes (5): Acceptance Criteria, code:typescript ("apps/*/src/db.ts",), P3: `db.ts` files not excluded from coverage — creates 0% noise, Problem Statement, Proposed Solution

### Community 24 - "Community 24"
Cohesion: 0.33
Nodes (5): Acceptance Criteria, code:typescript (import { PrismaClient } from "@prisma/client";), P3: `beforeEach` in `__mocks__/db.ts` is non-obvious — add explanatory comment, Problem Statement, Proposed Solution

### Community 25 - "Community 25"
Cohesion: 0.6
Nodes (3): CreateJobInput, Job, JobStatus

## Knowledge Gaps
- **149 isolated node(s):** `MOCK_ADMIN`, `MOCK_USER`, `token`, `body`, `mockArgon2` (+144 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Technical Approach` connect `Community 2` to `Community 11`, `Community 4`, `Community 5`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `feat: Add Vitest Unit Tests for apps and shared package` connect `Community 0` to `Community 8`, `Community 9`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `prisma` connect `Community 3` to `Community 1`, `Community 7`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `MOCK_ADMIN`, `MOCK_USER`, `token` to the rest of the system?**
  _149 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._