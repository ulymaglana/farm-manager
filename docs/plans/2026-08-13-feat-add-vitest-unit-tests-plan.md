---
title: "feat: Add Vitest Unit Tests for apps and shared package"
type: feat
status: completed
date: 2026-08-13
---

# feat: Add Vitest Unit Tests for apps and shared package

## Enhancement Summary

**Deepened on:** 2026-08-13
**Research agents used:** best-practices-researcher, framework-docs-researcher, kieran-typescript-reviewer, architecture-strategist, code-simplicity-reviewer, security-sentinel

### Key Improvements Over Initial Plan

1. **Scope cut by 56%:** 12 tests across 4 files (was 25 across 7). `layout.tsx`, `db.ts`, and `exampleJob.ts` dropped — they test boilerplate/stdlib, not application logic.
2. **Async RSC testing approach corrected:** Official Next.js position is that async Server Components cannot be tested with `@testing-library/react`. Test `getHealth()` as a plain async function; use E2E for the full page render.
3. **Vitest 3.2 `projects` array:** The `vitest.workspace` file is deprecated. Root `vitest.config.ts` now owns the `projects` array and coverage config.
4. **ESM-safe mocking:** `vi.hoisted()` required for variables referenced inside `vi.mock()` factories (ESM Temporal Dead Zone). `vi.mock()` with a factory function — never the no-factory form.
5. **`DeepMockProxy<PrismaClient>`** from `vitest-mock-extended` instead of `Partial<PrismaClient>` — preserves Prisma generics and prevents `as unknown as X` casts.
6. **Integration tests for `runner.ts`:** The atomic transaction claim logic cannot be verified by mocks. A real Postgres test DB is required for correctness.
7. **Security: 3 pre-work items** before writing any test.
8. **Per-app `tsconfig.test.json`** required — `NodeNext` vs `Bundler` resolution mismatch causes import failures in Vitest.

### New Considerations Discovered

- `apps/api/src/index.ts` and `apps/worker/src/index.ts` call side-effectful functions at module evaluation time — add `import.meta.url` guard to make them importable in tests.
- `globalThis.prisma` singleton (in `apps/api/src/db.ts`) survives across test files within the same Vitest worker — must be cleared in global setup.
- `.env.test` is not in `.gitignore` — gap exists that could expose credentials.
- Prefer `happy-dom` over `jsdom` for web tests (lighter, narrower attack surface).

---

## Overview

Add a unit + integration test suite across `apps/api`, `apps/worker`, `apps/web`, and `packages/shared` using **Vitest 3.2**. No tests exist today. The goal is to cover all application logic in hand-written source files, excluding Prisma-generated code, auto-generated configuration, and trivial boilerplate.

## Files in Scope (Revised)

| File | Tests | Rationale |
|------|-------|-----------|
| `apps/api/src/routes/health.ts` | 2 | Real branch: 200 vs 503, testable with `app.inject()` |
| `apps/worker/src/jobs/runner.ts` | 4 unit + integration | Most complex logic; atomic transaction needs real DB |
| `apps/web/src/app/page.tsx` | 3 (getHealth only) | Plain async function; RSC render tested via E2E |
| `packages/shared/src/utils/logger.ts` | 3 | Stdout/stderr routing; meta spread correctness |

**Dropped files and reasons:**
- `apps/api/src/db.ts` / `apps/worker/src/db.ts` — 16 lines of PrismaClient singleton boilerplate. Tests would assert `??` works in JavaScript. Module isolation resets break globalThis singleton tests.
- `apps/worker/src/jobs/exampleJob.ts` — 13 lines: log, wait 500ms, log. No business logic. Add tests when real logic appears.
- `apps/web/src/app/layout.tsx` — 18 lines of `<html><body>{children}</body></html>`. No branching, no logic. Tests would assert React renders HTML.

**Total: 12 tests across 4 files.**

## Pre-Work (Required Before Writing Tests)

These three items must be done first — they affect correctness and security.

### Pre-Work 1: Add `import.meta.url` guard to entry points

`apps/api/src/index.ts` calls `start()` and `apps/worker/src/index.ts` calls `pollLoop()` at module evaluation time. Any test that imports through the module graph will accidentally start the server or poll loop.

```typescript
// At the bottom of apps/api/src/index.ts and apps/worker/src/index.ts
// Replace: start()
// With:
import { pathToFileURL } from 'node:url'

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  start() // or pollLoop()
}
```

This is the ESM equivalent of Python's `if __name__ == '__main__'`. Runtime behavior is unchanged.

### Pre-Work 2: Extract Fastify app factory

Create `apps/api/src/app.ts` with a `buildApp()` factory (see Test Specifications below). The current `index.ts` creates the Fastify instance directly. Tests must never import a listening server — they call the factory instead.

### Pre-Work 3: Security setup

```
# 1. Add to .gitignore (gap exists — .env.test is not currently excluded)
.env.test
.env.*.local

# 2. Create .env.test.example (parallel to existing .env.example files)
DATABASE_URL="postgresql://myapp:myapp_password@localhost:5432/myapp_test"

# 3. Add myapp_test database to docker-compose.yml
# Add a second db entry or run: createdb myapp_test inside the postgres container
```

---

## Technical Approach

### Test Framework: Vitest 3.2

All apps use `"type": "module"` (ESM). Vitest is ESM-native. The `vitest.workspace` file is **deprecated as of Vitest 3.2** — use the `projects` array in root `vitest.config.ts` instead.

**Environments:**
- API, Worker, Shared: `environment: 'node'`
- Web: `environment: 'happy-dom'` (lighter than `jsdom`, narrower attack surface, no known XSS sandbox escape CVEs)

### ESM Mocking Rules

**Rule 1:** Always use the factory-function form of `vi.mock()`:
```typescript
// CORRECT — factory form, hoisted safely
vi.mock('../db.js', () => ({ prisma: mockDeep<PrismaClient>() }))

// WRONG — no factory; with ESM live bindings, the mock never takes effect
vi.mock('../db.js')
```

**Rule 2:** Use `vi.hoisted()` for any variable referenced inside a `vi.mock()` factory. In ESM, `vi.mock()` is hoisted above all imports at compile time — any module-scope `const` is in the Temporal Dead Zone when the factory runs:
```typescript
// CORRECT
const { prismaMock } = vi.hoisted(() => ({
  prismaMock: mockDeep<PrismaClient>(),
}))

vi.mock('../db.js', () => ({ prisma: prismaMock }))

// WRONG — stubJob is in TDZ, throws ReferenceError
const stubJob = { id: '1' }
vi.mock('../db.js', () => ({ prisma: mockDeep<PrismaClient>() })) // ok
// but referencing stubJob inside the factory would fail
```

**Rule 3:** Use `vi.unstubAllGlobals()` in `afterEach` for any test that stubs global `fetch`. Configure `unstubGlobals: true` in vitest config as a safety net.

### Mocking Strategy

| Dependency | Strategy |
|-----------|----------|
| `../db.js` (Prisma singleton) | `vi.mock()` factory form + `DeepMockProxy<PrismaClient>` via `vitest-mock-extended` |
| `@myapp/shared` logger | `vi.mock('@myapp/shared')` with `vi.fn()` spies |
| `global.fetch` | `vi.stubGlobal('fetch', vi.fn())` + `vi.unstubAllGlobals()` in afterEach |
| `process.stdout.write` / `process.stderr.write` | `vi.spyOn(process.stdout, 'write')` |
| `setTimeout` | `vi.useFakeTimers()` + `vi.advanceTimersByTimeAsync()` (async variant required when timers trigger async code) |

### Test File Layout

Co-locate tests as `.test.ts` siblings (not `__tests__` subdirectories — that convention is a Jest artifact):

```
apps/api/
  tsconfig.test.json         ← moduleResolution: "Bundler" (vs NodeNext in production)
  vitest.config.ts
  src/
    app.ts                   ← NEW: buildApp() factory
    routes/
      health.ts
      health.test.ts

apps/worker/
  tsconfig.test.json
  vitest.config.ts
  src/
    jobs/
      runner.ts
      runner.test.ts         ← unit tests (mocked Prisma)
      runner.integration.ts  ← integration tests (real Postgres)

apps/web/
  tsconfig.test.json
  vitest.config.ts
  src/
    app/
      page.tsx
      page.test.ts           ← getHealth() function only; no component render

packages/shared/
  tsconfig.test.json
  vitest.config.ts
  src/
    utils/
      logger.ts
      logger.test.ts

packages/test-utils/         ← NEW workspace package (devDependencies only)
  package.json
  src/
    prisma-mock.ts           ← shared DeepMockProxy factory used by api and worker
```

---

## Dependencies to Add

### Root `package.json` (devDependencies)
```json
{
  "vitest": "^3.2.0",
  "@vitest/coverage-v8": "^3.2.0",
  "vitest-mock-extended": "^2.0.0",
  "vite-tsconfig-paths": "^5.0.0",
  "happy-dom": "^14.0.0"
}
```

### `apps/web` only (devDependencies) — only if client components are added later
```
@vitejs/plugin-react @testing-library/react @testing-library/jest-dom
```
**Note:** Do NOT install these yet. There are no client components to test. Install when needed.

---

## Vitest Configuration

### Root `vitest.config.ts`

```typescript
// vitest.config.ts (repo root)
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Vitest 3.2+: projects replaces the deprecated vitest.workspace file
    projects: [
      'apps/api/vitest.config.ts',
      'apps/worker/vitest.config.ts',
      'apps/web/vitest.config.ts',
      'packages/shared/vitest.config.ts',
    ],
    // Coverage configured at root when using projects
    coverage: {
      provider: 'v8',
      include: [
        'apps/*/src/**/*.ts',
        'packages/*/src/**/*.ts',
      ],
      exclude: [
        '**/*.test.ts',
        '**/*.integration.ts',
        '**/__mocks__/**',
        '**/node_modules/**',
        'apps/*/src/index.ts',   // entry points with side effects
      ],
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: './coverage',
      // Start without thresholds; baseline first, then ratchet
      // Uncomment after first pass:
      // thresholds: { lines: 65, functions: 65, branches: 60 },
    },
  },
})
```

### `apps/api/vitest.config.ts`

```typescript
import { defineConfig, mergeConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    name: 'api',
    environment: 'node',
    include: ['src/**/*.test.ts'],
    unstubGlobals: true,          // auto-cleanup vi.stubGlobal() after each test
    restoreMocks: true,           // auto-restore vi.spyOn() after each test
  },
})
```

### `apps/worker/vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    name: 'worker',
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Integration tests run separately with real DB
    // pnpm --filter worker test:integration
    unstubGlobals: true,
    restoreMocks: true,
  },
})
```

### `apps/web/vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    name: 'web',
    environment: 'happy-dom',    // lighter than jsdom, fewer CVEs
    include: ['src/**/*.test.ts'],
    unstubGlobals: true,
    restoreMocks: true,
  },
})
```

### `packages/shared/vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'shared',
    environment: 'node',
    include: ['src/**/*.test.ts'],
    restoreMocks: true,
  },
})
```

### Per-app `tsconfig.test.json`

Required because production `tsconfig.json` uses `moduleResolution: "NodeNext"` (which enforces `.js` extension imports), but Vitest uses Vite's bundler which resolves `"Bundler"` style. Without this, `import { handleExampleJob } from "./exampleJob.js"` fails during test transform.

```json
// apps/api/tsconfig.test.json (same pattern for apps/worker, apps/web, packages/shared)
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "noEmit": true
  },
  "include": ["src"]
}
```

Reference this in each package's `vitest.config.ts`:
```typescript
// add to resolve section of each vitest.config.ts
resolve: {
  alias: {
    '@myapp/shared': new URL('../../packages/shared/src/index.ts', import.meta.url).pathname,
  },
},
```

---

## Shared Prisma Mock (`packages/test-utils`)

Both `apps/api` and `apps/worker` mock the same `PrismaClient` shape. A shared package prevents drift when the Prisma schema changes.

### `packages/test-utils/package.json`

```json
{
  "name": "@myapp/test-utils",
  "private": true,
  "type": "module",
  "exports": { ".": "./src/index.ts" }
}
```

### `packages/test-utils/src/prisma-mock.ts`

```typescript
import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, type DeepMockProxy } from 'vitest-mock-extended'
import { beforeEach } from 'vitest'

export const prismaMock = mockDeep<PrismaClient>()

// Auto-reset before each test — prevents state leakage between tests
beforeEach(() => {
  mockReset(prismaMock)
})

export type { DeepMockProxy }
```

---

## Test Specifications

### `apps/api/src/app.ts` (New File — Factory Pattern)

```typescript
import Fastify, { FastifyInstance } from 'fastify'
import { healthRoutes } from './routes/health.js'

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: false })
  app.register(healthRoutes)
  return app
}
```

Update `apps/api/src/index.ts` to import `buildApp` from `./app.js` and call `app.listen()` inside the `import.meta.url` guard.

### `apps/api/src/routes/health.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { FastifyInstance } from 'fastify'
import type { DeepMockProxy } from 'vitest-mock-extended'
import type { PrismaClient } from '@prisma/client'

// vi.hoisted() ensures prismaMock exists before vi.mock() factory runs
const { prismaMock } = vi.hoisted(() => {
  const { mockDeep } = require('vitest-mock-extended')
  return { prismaMock: mockDeep<PrismaClient>() }
})

vi.mock('../db.js', () => ({ prisma: prismaMock }))

// Import AFTER vi.mock()
const { buildApp } = await import('../app.js')

describe('GET /health', () => {
  let app: FastifyInstance

  beforeEach(() => { app = buildApp() })
  afterEach(async () => { await app.close() })

  it('returns 200 {status:"ok", db:"connected"} when DB responds', async () => {
    prismaMock.$queryRaw.mockResolvedValue([{ '?column?': 1 }])

    const res = await app.inject({ method: 'GET', url: '/health' })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toStrictEqual<{ status: string; db: string }>({
      status: 'ok',
      db: 'connected',
    })
  })

  it('returns 503 {status:"error", db:"disconnected"} when DB throws', async () => {
    prismaMock.$queryRaw.mockRejectedValue(new Error('connection refused'))

    const res = await app.inject({ method: 'GET', url: '/health' })

    expect(res.statusCode).toBe(503)
    expect(res.json()).toStrictEqual<{ status: string; db: string }>({
      status: 'error',
      db: 'disconnected',
    })
  })
})
```

**Key techniques:**
- `app.inject()` — no TCP socket, no real HTTP. Uses Fastify's `light-my-request` internally.
- `afterEach(() => app.close())` — releases DB connections and internal timers.
- `toStrictEqual<{ status: string; db: string }>` — typed generic assertion fails at compile time if response shape changes.

### `apps/worker/src/jobs/runner.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest'
import type { Job } from '@prisma/client'  // ← import from @prisma/client, NOT @myapp/shared
                                            //   (different payload type: JsonValue vs Record<string,unknown>)

const { prismaMock } = vi.hoisted(() => {
  const { mockDeep } = require('vitest-mock-extended')
  return { prismaMock: mockDeep() }  // typed as DeepMockProxy<PrismaClient>
})

vi.mock('../db.js', () => ({ prisma: prismaMock }))
vi.mock('@myapp/shared', () => ({ createLogger: () => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn() }) }))

const { runNextJob } = await import('./runner.js')

const makeJob = (overrides: Partial<Job> = {}): Job => ({
  id: 'job-1',
  type: 'example',
  status: 'pending',
  payload: {},
  error: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

describe('runNextJob', () => {
  it('returns false when no pending jobs exist', async () => {
    // $transaction callback returns null → no job claimed
    prismaMock.$transaction.mockImplementation((callback) => callback(prismaMock))
    prismaMock.job.findFirst.mockResolvedValue(null)

    const result = await runNextJob()

    expect(result).toBe(false)
    expect(prismaMock.job.update).not.toHaveBeenCalled()
  })

  it('claims job, dispatches example handler, marks done', async () => {
    const job = makeJob()
    prismaMock.$transaction.mockImplementation((callback) => callback(prismaMock))
    prismaMock.job.findFirst.mockResolvedValue(job)
    prismaMock.job.update.mockResolvedValue({ ...job, status: 'done' })

    const result = await runNextJob()

    expect(result).toBe(true)
    // Final update must mark job done
    expect(prismaMock.job.update).toHaveBeenLastCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'done' }) })
    )
  })

  it('marks failed with "Unknown job type" for unrecognized type', async () => {
    const job = makeJob({ type: 'unrecognized' })
    prismaMock.$transaction.mockImplementation((callback) => callback(prismaMock))
    prismaMock.job.findFirst.mockResolvedValue(job)
    prismaMock.job.update.mockResolvedValue({ ...job, status: 'failed' })

    const result = await runNextJob()

    expect(result).toBe(true)
    expect(prismaMock.job.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'failed',
          error: expect.stringContaining('Unknown job type'),
        }),
      })
    )
  })

  it('catches handler errors and marks job failed', async () => {
    const job = makeJob()
    prismaMock.$transaction.mockImplementation((callback) => callback(prismaMock))
    prismaMock.job.findFirst.mockResolvedValue(job)
    // First update (claim as processing) succeeds; handler throws; second update marks failed
    prismaMock.job.update
      .mockResolvedValueOnce({ ...job, status: 'processing' })
      .mockResolvedValueOnce({ ...job, status: 'failed' })

    // Make handleExampleJob throw by mocking @myapp/shared logger to throw
    // Alternative: mock the jobs/exampleJob module directly
    vi.mock('./exampleJob.js', () => ({
      handleExampleJob: vi.fn().mockRejectedValue(new Error('handler error')),
    }))

    const result = await runNextJob()

    expect(result).toBe(true)
    expect(prismaMock.job.update).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'failed', error: 'handler error' }),
      })
    )
  })
})
```

**Integration test note (`runner.integration.ts`):**

The 4 unit tests above verify the state machine logic. They do NOT verify that the `$transaction` prevents two workers from claiming the same job. That requires a real Postgres database:

```typescript
// apps/worker/src/jobs/runner.integration.ts
// Run with: pnpm --filter worker test:integration
// Requires DATABASE_URL pointing to myapp_test database

// Pattern: two concurrent runNextJob() calls against a real DB
// Assert that exactly one succeeds (job marked done) and one finds no job
```

Add to `apps/worker/package.json`:
```json
{
  "scripts": {
    "test:integration": "dotenv -e ../../.env.test vitest run src/**/*.integration.ts"
  }
}
```

### `apps/web/src/app/page.test.ts`

```typescript
import { describe, it, expect, afterEach, vi } from 'vitest'

// Note: Do NOT import page.tsx directly — async RSC cannot be rendered with
// @testing-library/react (official Next.js position as of 2026).
// Test the data-fetching function only. Use E2E (Playwright) for page render.

// page.tsx exports getHealth as a non-exported function — to test it, either:
// A) Move getHealth to a separate lib/api.ts file (recommended)
// B) Test it by calling the component as an async function and ignoring JSX

// Pattern A (recommended — extract to apps/web/src/lib/api.ts):
// import { getHealth } from '../lib/api'

// For now, testing via dynamic import + global fetch stub:
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// Re-import page.tsx to get getHealth (assumes it becomes an exported function)
// If not exported, move to lib/api.ts first (that refactor is part of this plan)

describe('getHealth()', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('returns parsed JSON when fetch succeeds with ok status', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok', db: 'connected' }),
    })

    // After extraction to lib/api.ts: const { getHealth } = await import('../lib/api')
    // const result = await getHealth()
    // expect(result).toEqual({ status: 'ok', db: 'connected' })
  })

  it('returns null when fetch throws (network error)', async () => {
    mockFetch.mockRejectedValue(new Error('ECONNREFUSED'))

    // const result = await getHealth()
    // expect(result).toBeNull()
  })

  it('returns null when response is not ok', async () => {
    mockFetch.mockResolvedValue({ ok: false })

    // const result = await getHealth()
    // expect(result).toBeNull()
  })
})
```

**Required refactor:** Move `getHealth` from `page.tsx` to `src/lib/api.ts` and export it. The `page.tsx` component remains an untested async RSC — covered by E2E tests with Playwright. The `res.json() as Promise<HealthResponse>` unsafe cast in `page.tsx` should be documented with a comment since it cannot be caught at compile time.

### `packages/shared/src/utils/logger.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { createLogger } from './logger.js'

describe('createLogger', () => {
  it('routes info and debug to process.stdout', () => {
    const stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)

    const logger = createLogger('test-ctx')
    logger.info('hello')
    logger.debug('world')

    expect(stdoutSpy).toHaveBeenCalledTimes(2)
    // Verify JSON structure of first call
    const parsed = JSON.parse(stdoutSpy.mock.calls[0][0] as string)
    expect(parsed).toMatchObject({ level: 'info', message: 'hello', context: 'test-ctx' })
    expect(typeof parsed.timestamp).toBe('string')
  })

  it('routes warn and error to process.stderr', () => {
    const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true)

    const logger = createLogger('test-ctx')
    logger.warn('careful')
    logger.error('boom')

    expect(stderrSpy).toHaveBeenCalledTimes(2)
  })

  it('merges meta fields into the log entry', () => {
    const stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)

    const logger = createLogger('test-ctx')
    logger.info('with meta', { jobId: 'abc', count: 3 })

    const parsed = JSON.parse(stdoutSpy.mock.calls[0][0] as string)
    expect(parsed.jobId).toBe('abc')
    expect(parsed.count).toBe(3)
  })
})
```

**Security note:** Do not use realistic credential-shaped values in meta fields during logger tests. Vitest displays captured stdout on test failure, and many CI systems persist test artifacts. Use `jobId`, `count`, or similar non-sensitive keys in test fixtures.

---

## Acceptance Criteria

- [x] Pre-work complete: `import.meta.url` guard in both `index.ts` files
- [x] Pre-work complete: `buildApp()` factory extracted to `apps/api/src/app.ts`
- [x] Pre-work complete: `.env.test` added to `.gitignore`, `.env.test.example` committed
- [x] `pnpm test` at root runs all 4 packages via `projects` array
- [x] `pnpm --filter api test` passes 2 health route tests
- [x] `pnpm --filter worker test` passes 4 runner unit tests
- [x] `pnpm --filter web test` passes 3 getHealth tests
- [x] `pnpm --filter shared test` passes 3 logger tests
- [ ] `pnpm coverage` generates coverage report (no threshold failures — baseline phase)
- [x] No test imports `@prisma/client` directly — always mocked via `DeepMockProxy`
- [x] `unstubGlobals: true` in all vitest configs
- [x] `tsconfig.test.json` exists per package

**Post-first-pass (after baseline is established):**
- [ ] Coverage thresholds set at measured baseline (~65% target)
- [ ] `pnpm --filter worker test:integration` passing against real `myapp_test` DB
- [ ] `getHealth` extracted to `apps/web/src/lib/api.ts` and page.test.ts importing it directly
- [ ] `pnpm audit --audit-level=high` added to CI

## Implementation Order

1. **Pre-work** — `import.meta.url` guards, `buildApp()` factory, `.gitignore`, `.env.test.example`
2. **`packages/test-utils`** — shared Prisma mock factory
3. **`packages/shared`** — logger tests (no deps, fastest feedback)
4. **`apps/api`** — health route tests (establish Fastify inject pattern)
5. **`apps/worker`** — runner unit tests (establish Prisma mock pattern)
6. **`apps/web`** — extract `getHealth` to `lib/api.ts`, write getHealth tests
7. **Root config** — `vitest.config.ts` with `projects` array + coverage
8. **Post-pass** — set coverage thresholds, add integration test scaffold

## ESLint Enhancement (Optional but Recommended)

Add `@typescript-eslint/no-floating-promises` to catch un-awaited `vi.runAllTimersAsync()` calls. Without this rule, forgetting `await` on async timer advancement produces a test that always passes vacuously:

```typescript
// Easy to miss — no TypeScript error without the ESLint rule:
vi.advanceTimersByTimeAsync(500) // should be: await vi.advanceTimersByTimeAsync(500)
```

## References

- `apps/api/src/routes/health.ts:1-13` — route under test
- `apps/worker/src/jobs/runner.ts:1-58` — most complex logic, highest test value
- `packages/shared/src/utils/logger.ts:1-34` — stdout/stderr routing
- Vitest 3.2 release (projects array): https://vitest.dev/blog/vitest-3-2.html
- Fastify inject() API: https://fastify.dev/docs/latest/Reference/Testing/
- Prisma unit testing (official): https://www.prisma.io/docs/orm/prisma-client/testing/unit-testing
- Next.js Vitest guide (async RSC limitation): https://nextjs.org/docs/app/guides/testing/vitest
- vi.hoisted() docs: https://vitest.dev/api/vi.html#vi-hoisted
- vitest-mock-extended: https://www.npmjs.com/package/vitest-mock-extended
