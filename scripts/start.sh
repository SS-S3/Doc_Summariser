#!/usr/bin/env bash
# Start the Doc Summariser development environment (backend + frontend).
# Usage: ./scripts/start.sh   (or)   bash scripts/start.sh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV_PY="$ROOT_DIR/venv/bin/python"

if [ ! -x "$VENV_PY" ]; then
  echo "ERROR: Virtual environment not found at $ROOT_DIR/venv."
  echo "Run the setup first:"
  echo "  python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
  exit 1
fi

echo "==> Starting backend API on http://127.0.0.1:8000 ..."
(cd "$ROOT_DIR/backend" && exec "$VENV_PY" manage.py runserver 8000) &
BACKEND_PID=$!

echo "==> Starting frontend on http://localhost:3000 ..."
(cd "$ROOT_DIR/frontend" && exec npm run dev) &
FRONTEND_PID=$!

trap 'echo ""; echo "==> Stopping servers..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true' INT TERM

wait

