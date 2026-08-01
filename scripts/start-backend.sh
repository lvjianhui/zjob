#!/usr/bin/env bash
# 本地启动后端服务（不依赖 Docker）
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${PROJECT_ROOT}/server"

if [ ! -d .venv ]; then
  echo "创建 Python 虚拟环境..."
  python3 -m venv .venv
fi

source .venv/bin/activate

echo "安装/更新后端依赖..."
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -q -r requirements.txt

if [ ! -f ../.env ]; then
  echo "复制 .env.example 为 .env"
  cp ../.env.example ../.env
fi

echo "启动 FastAPI 服务..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
