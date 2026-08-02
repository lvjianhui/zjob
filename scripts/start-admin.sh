#!/usr/bin/env bash
# 本地启动后台管理前端开发服务
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${PROJECT_ROOT}/packages/admin-web"

if [ ! -d node_modules ]; then
  echo "安装后台管理依赖..."
  npm install
fi

echo "启动 admin-web 开发服务 (port 3001)..."
npm run dev -- -p 3001
