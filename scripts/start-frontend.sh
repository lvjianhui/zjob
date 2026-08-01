#!/usr/bin/env bash
# 本地启动前端开发服务（不依赖 Docker）
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${PROJECT_ROOT}/web"

if [ ! -d node_modules ]; then
  echo "安装前端依赖..."
  npm install
fi

if [ ! -f .env.local ]; then
  echo "复制 .env.example 为 .env.local"
  cp .env.example .env.local
fi

echo "启动 Next.js 开发服务..."
npm run dev
