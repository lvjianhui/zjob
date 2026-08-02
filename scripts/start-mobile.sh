#!/usr/bin/env bash
# 本地启动移动端 H5 预览服务
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${PROJECT_ROOT}/packages/mobile"

if [ ! -d node_modules ]; then
  echo "安装移动端依赖..."
  npm install
fi

echo "启动移动端 H5 预览 (port 5173)..."
node build.js dev -p h5
