#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"

echo "==> Setting up myapp monorepo..."

# Copy .env files if they don't exist
for env_example in "$ROOT"/.env.example "$ROOT"/apps/*/.env.example; do
  dir="$(dirname "$env_example")"
  if [ ! -f "$dir/.env" ]; then
    cp "$env_example" "$dir/.env"
    echo "  Created $dir/.env from .env.example"
  fi
done

# Install dependencies
echo "==> Installing dependencies with pnpm..."
cd "$ROOT"
pnpm install

# Build shared package
echo "==> Building @myapp/shared..."
pnpm --filter @myapp/shared run build

# Start postgres
echo "==> Starting PostgreSQL..."
docker compose up -d postgres

# Wait for postgres to be healthy
echo "==> Waiting for PostgreSQL to be ready..."
until docker compose exec postgres pg_isready -U myapp -d myapp_db > /dev/null 2>&1; do
  echo "  Waiting..."
  sleep 2
done
echo "  PostgreSQL is ready."

# Push Prisma schema
echo "==> Applying Prisma schema..."
pnpm --filter @myapp/api run db:push

echo ""
echo "Setup complete! Run 'pnpm dev' to start all services."
echo "  - Web:    http://localhost:3000"
echo "  - API:    http://localhost:3001"
echo "  - Health: http://localhost:3001/health"
