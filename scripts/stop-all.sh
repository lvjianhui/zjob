#!/usr/bin/env bash
# 停止本地运行的服务
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${PROJECT_ROOT}"

echo "停止后端 (uvicorn) 与前端 (node) 进程..."
pkill -f "uvicorn app.main:app" >/dev/null 2>&1 || true
pkill -f "next-server" >/dev/null 2>&1 || true
pkill -f "node.*web.*dev" >/dev/null 2>&1 || true

echo "停止本地数据库..."
"${SCRIPT_DIR}/stop-db.sh" || true

echo "完成"
