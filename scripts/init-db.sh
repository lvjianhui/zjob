#!/usr/bin/env bash
# 初始化 PostgreSQL 数据库与用户（本地开发）
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

PSQL_CMD="psql"
if [ -x /opt/homebrew/bin/psql ]; then
  PSQL_CMD="/opt/homebrew/bin/psql"
elif [ -x /usr/local/bin/psql ]; then
  PSQL_CMD="/usr/local/bin/psql"
fi

DB_NAME="zjob_db"
DB_USER="zjob"
DB_PASS="zjob_password"
# Homebrew 安装的 PG 默认超级用户是当前 macOS 用户；优先用 PGUSER，否则回退到当前用户
ROOT_USER="${PGUSER:-$(whoami)}"

if ! command -v "$PSQL_CMD" >/dev/null 2>&1; then
  echo "未找到 psql 命令，请确认 PostgreSQL 已安装"
  exit 1
fi

echo "初始化数据库 ${DB_NAME}（使用超级用户: ${ROOT_USER}）..."

# 创建用户（如已存在则跳过）
$PSQL_CMD -U "$ROOT_USER" -d postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1 || \
  $PSQL_CMD -U "$ROOT_USER" -d postgres -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';" || {
    echo "创建用户失败。如需指定超级用户，请设置 PGUSER 环境变量后重试"
    exit 1
  }

# 创建数据库（如已存在则跳过）
$PSQL_CMD -U "$ROOT_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1 || \
  $PSQL_CMD -U "$ROOT_USER" -d postgres -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER} ENCODING 'UTF8';"

# 授权
$PSQL_CMD -U "$ROOT_USER" -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};" || true
$PSQL_CMD -U "$ROOT_USER" -d "$DB_NAME" -c "GRANT ALL ON SCHEMA public TO ${DB_USER};" || true

echo "完成。数据库: ${DB_NAME}, 用户: ${DB_USER}"
