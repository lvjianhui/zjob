#!/usr/bin/env bash
# 导入 Demo 公司种子数据
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

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

if [ ! -d .venv ]; then
  echo "创建 Python 虚拟环境（$PYTHON_BIN）..."
  "$PYTHON_BIN" -m venv .venv
fi

source .venv/bin/activate

echo "安装依赖..."
pip install -q -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt

echo "导入种子数据..."
python seed/seed.py

echo "完成"
