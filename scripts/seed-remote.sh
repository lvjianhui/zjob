#!/usr/bin/env bash
# 远程数据库种子数据导入 — 连接云端 PostgreSQL 导入 Demo 公司数据
# 用法: ./scripts/seed-remote.sh
#
# 环境变量:
#   DATABASE_URL  云端 PostgreSQL 连接串（必须包含 +asyncpg 前缀）
#                 示例: postgresql+asyncpg://user:pwd@ep-xxx.neon.tech/db?sslmode=require
#
#   也可以在 server/.env.production 中配置，脚本会自动读取。
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROJECT_ROOT}/server"

# ---- 解析 DATABASE_URL ----

# 优先使用环境变量，其次读取 .env.production，最后读取 .env
if [ -z "$DATABASE_URL" ]; then
  for ENV_FILE in .env.production .env; do
    if [ -f "$ENV_FILE" ]; then
      PARSED_URL=$(grep "^DATABASE_URL=" "$ENV_FILE" 2>/dev/null | cut -d'=' -f2- | tr -d '"' | tr -d "'")
      if [ -n "$PARSED_URL" ]; then
        DATABASE_URL="$PARSED_URL"
        echo "从 ${ENV_FILE} 读取 DATABASE_URL"
        break
      fi
    fi
  done
fi

if [ -z "$DATABASE_URL" ]; then
  echo "错误: 未找到 DATABASE_URL"
  echo ""
  echo "请通过以下方式之一提供:"
  echo "  1. 环境变量: export DATABASE_URL=\"postgresql+asyncpg://...\""
  echo "  2. 配置文件: 在 server/.env.production 中设置 DATABASE_URL"
  echo ""
  echo "连接串格式: postgresql+asyncpg://user:pwd@host:port/db?sslmode=require"
  exit 1
fi

# 验证格式
if [[ ! "$DATABASE_URL" == postgresql+asyncpg://* ]]; then
  echo "错误: DATABASE_URL 必须以 postgresql+asyncpg:// 开头"
  exit 1
fi

if [[ "$DATABASE_URL" != *"sslmode=require"* ]]; then
  echo "警告: 连接串中未包含 sslmode=require，Neon/Supabase 等云端 PG 可能需要此参数"
  echo "      当前 URL: ${DATABASE_URL%%@*}@***"
  echo ""
  read -p "是否继续？(y/N) " -r
  [[ $REPLY =~ ^[Yy]$ ]] || exit 0
fi

echo ""
echo "========================================"
echo "  远程数据库种子数据导入"
echo "========================================"
echo "目标数据库: ${DATABASE_URL%%@*}@***"
echo ""

# ---- 查找 Python ----
PYTHON_BIN=""
for cand in python3.12 python3.11 python3; do
  if command -v "$cand" >/dev/null 2>&1; then
    PYTHON_BIN="$cand"
    break
  fi
done

if [ -z "$PYTHON_BIN" ]; then
  echo "错误: 未找到 Python 3，请先安装: brew install python@3.12"
  exit 1
fi

# ---- 使用 venv 或直接运行 ----
if [ -d ".venv" ]; then
  echo "使用虚拟环境: .venv"
  source .venv/bin/activate
  PYTHON_BIN="python"
fi

echo "Python: $($PYTHON_BIN --version 2>&1)"
echo ""

# 确认操作
echo "即将向远程数据库导入种子数据。"
echo "如果表已存在且有数据，会跳过已存在的公司（使用 --force 可强制覆盖）。"
echo ""
read -p "确认导入？(y/N) " -r
[[ $REPLY =~ ^[Yy]$ ]] || { echo "已取消"; exit 0; }

echo ""

# 设置环境变量并运行种子脚本
export DATABASE_URL
$PYTHON_BIN seed/seed.py "$@"

echo ""
echo "导入完成！"
echo ""
echo "验证方式:"
echo "  - 访问后端 /docs 查看 API 文档"
echo "  - 调用 GET /api/companies 确认数据已导入"
