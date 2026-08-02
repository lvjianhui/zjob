#!/bin/sh
set -e

echo "=== [DEBUG] Working directory: $(pwd) ==="
echo "=== [DEBUG] /app contents ==="
ls -la /app/ 2>/dev/null || echo "NO /app DIRECTORY"

echo "=== [DEBUG] /app/app contents ==="
ls -la /app/app/ 2>/dev/null || echo "NO /app/app DIRECTORY"

echo "=== [DEBUG] PYTHONPATH = $PYTHONPATH ==="
echo "=== [DEBUG] Python sys.path ==="
python -c "import sys; print(sys.path)"

echo "=== [DEBUG] Try import app ==="
cd /app && PYTHONPATH=/app python -c "import app; print('OK: app imported from', app.__file__)"

echo "=== [DEBUG] Starting uvicorn ==="
cd /app
export PYTHONPATH=/app
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
