#!/usr/bin/env bash
# Production-style deployment: migrate -> collectstatic -> build frontend -> serve.
# Backend served with uvicorn (ASGI), frontend with `next start`.
#
# Usage:
#   ./scripts/deploy.sh
#   PORT=8000 NEXT_PORT=3000 ./scripts/deploy.sh   # custom ports
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_PORT="${PORT:-8000}"
FRONTEND_PORT="${NEXT_PORT:-3000}"
VENV="$ROOT_DIR/venv/bin"

if [ ! -x "$VENV/python" ]; then
  echo "ERROR: Virtual environment not found at $ROOT_DIR/venv."
  exit 1
fi

echo "==> [1/4] Applying database migrations..."
(cd "$ROOT_DIR/backend" && "$VENV/python" manage.py migrate)

echo "==> [2/4] Collecting static files..."
(cd "$ROOT_DIR/backend" && "$VENV/python" manage.py collectstatic --noinput)

echo "==> [3/4] Building frontend (npm run build)..."
(cd "$ROOT_DIR/frontend" && npm run build)

echo "==> [4/4] Starting production servers..."
echo "    Backend : uvicorn backend.asgi:application on 0.0.0.0:$BACKEND_PORT"
(cd "$ROOT_DIR/backend" && exec "$VENV/uvicorn" backend.asgi:application --host 0.0.0.0 --port "$BACKEND_PORT") &
BACKEND_PID=$!

echo "    Frontend: next start on 0.0.0.0:$FRONTEND_PORT"
(cd "$ROOT_DIR/frontend" && exec npm run start -- -H 0.0.0.0 -p "$FRONTEND_PORT") &
FRONTEND_PID=$!

trap 'echo ""; echo "==> Stopping servers..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true' INT TERM

wait

