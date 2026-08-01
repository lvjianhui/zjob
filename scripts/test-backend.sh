#!/usr/bin/env bash
# 运行后端单元测试
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${PROJECT_ROOT}/server"

if [ ! -d .venv ]; then
  echo "创建 Python 虚拟环境..."
  python3 -m venv .venv
fi

source .venv/bin/activate

echo "安装依赖..."
pip install -q -r requirements.txt

echo "运行测试..."
pytest tests/
