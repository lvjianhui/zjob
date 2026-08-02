#!/usr/bin/env bash
# 初始化开发环境：创建 .env、安装依赖
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${PROJECT_ROOT}"

if [ ! -f .env ]; then
  echo "复制 .env.example 为 .env"
  cp .env.example .env
else
  echo ".env 已存在，跳过"
fi

echo ""
echo "初始化后端..."
cd "${PROJECT_ROOT}/server"

# 优先使用 Python 3.12（与 Dockerfile/README 一致），找不到则报错
PYTHON_BIN=""
for cand in python3.12 python3.11; do
  if command -v "$cand" >/dev/null 2>&1; then
    PYTHON_BIN="$cand"
    break
  fi
done
if [ -z "$PYTHON_BIN" ]; then
  echo "未找到 python3.12 / python3.11，请先安装：brew install python@3.12"
  exit 1
fi
echo "使用解释器: $PYTHON_BIN ($($PYTHON_BIN --version 2>&1))"

if [ ! -d .venv ]; then
  "$PYTHON_BIN" -m venv .venv
fi
source .venv/bin/activate
# 使用清华 PyPI 镜像加速
pip install -q -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt

echo ""
echo "初始化前端..."
cd "${PROJECT_ROOT}/packages/web"
npm install

echo ""
echo "环境初始化完成。建议下一步："
echo "  启动数据库: ./scripts/start-db.sh"
echo "  启动后端:   ./scripts/start-backend.sh"
echo "  启动前端:   ./scripts/start-frontend.sh"
echo "  或直接全栈: ./scripts/start-all.sh"
