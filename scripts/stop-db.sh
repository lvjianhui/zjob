#!/usr/bin/env bash
# 停止本地 PostgreSQL
set -e

# 自动检测已安装的 postgresql@XX 版本
PG_SERVICE_CMD=""
PG_VERSION=""
for v in 18 17 16 15 14; do
  if [ -x "/opt/homebrew/opt/postgresql@${v}/bin/pg_ctl" ]; then
    PG_SERVICE_CMD="/opt/homebrew/opt/postgresql@${v}/bin/pg_ctl"
    PG_VERSION="$v"
    break
  elif [ -x "/usr/local/opt/postgresql@${v}/bin/pg_ctl" ]; then
    PG_SERVICE_CMD="/usr/local/opt/postgresql@${v}/bin/pg_ctl"
    PG_VERSION="$v"
    break
  fi
done
if [ -z "$PG_SERVICE_CMD" ] && command -v pg_ctl >/dev/null 2>&1; then
  PG_SERVICE_CMD="pg_ctl"
fi

if command -v brew >/dev/null 2>&1 && brew services list >/dev/null 2>&1; then
  PG_SERVICE_NAME=""
  if brew services list | grep -q "^postgresql@${PG_VERSION}"; then
    PG_SERVICE_NAME="postgresql@${PG_VERSION}"
  elif brew services list | grep -q "^postgresql"; then
    PG_SERVICE_NAME="postgresql"
  fi
  if [ -n "$PG_SERVICE_NAME" ]; then
    echo "停止 PostgreSQL（brew services: ${PG_SERVICE_NAME}）..."
    brew services stop "$PG_SERVICE_NAME" || echo "PostgreSQL 未运行或停止失败"
    echo "完成"
    exit 0
  fi
fi

if [ -n "$PG_SERVICE_CMD" ]; then
  echo "停止 PostgreSQL..."
  PGDATA="${PGDATA:-/opt/homebrew/var/postgresql@${PG_VERSION}}"
  $PG_SERVICE_CMD -D "$PGDATA" stop || echo "PostgreSQL 未运行或停止失败"
else
  echo "未找到 pg_ctl / brew，无法停止 PostgreSQL"
fi

echo "完成"
