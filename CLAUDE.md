# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

pnpm monorepo with:
- `apps/web` — Next.js 14 App Router (port 3000)
- `apps/api` — Fastify REST API (port 3001)
- `apps/worker` — Background job worker (DB polling, 5s interval)
- `packages/shared` — Shared TypeScript types and logger
- PostgreSQL via Docker Compose (port 5432)
- Prisma ORM — schema at `apps/api/prisma/schema.prisma` (single source of truth)

## Key commands

```bash
./scripts/setup.sh          # First-time setup
pnpm dev                    # Start all services in parallel
docker compose up -d postgres
pnpm --filter api run db:push     # Apply schema changes
pnpm --filter api run db:studio   # Prisma Studio
```

## Architecture

- API creates `Job` rows with `status: 'pending'`
- Worker atomically claims jobs via Prisma `$transaction`, marks `done`/`failed`
- Web fetches from API via `NEXT_PUBLIC_API_URL`
- All services import from `@myapp/shared` for types and logger
