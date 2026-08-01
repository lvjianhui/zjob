#!/usr/bin/env bash
# 本地启动 PostgreSQL（不依赖 Docker）
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${PROJECT_ROOT}"

# 自动检测已安装的 postgresql@XX 版本
PG_SERVICE_CMD=""
PG_VERSION="18"
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

# 优先使用 brew services（macOS 上更常用）
if command -v brew >/dev/null 2>&1 && brew services list >/dev/null 2>&1; then
  PG_SERVICE_NAME=""
  if brew services list | grep -q "^postgresql@${PG_VERSION}"; then
    PG_SERVICE_NAME="postgresql@${PG_VERSION}"
  elif brew services list | grep -q "^postgresql"; then
    PG_SERVICE_NAME="postgresql"
  fi
  if [ -n "$PG_SERVICE_NAME" ]; then
    if brew services list | grep "^${PG_SERVICE_NAME}" | grep -q "started"; then
      echo "PostgreSQL 已在运行（brew services: ${PG_SERVICE_NAME}）"
    else
      echo "通过 brew services 启动 ${PG_SERVICE_NAME}..."
      brew services start "$PG_SERVICE_NAME" || {
        echo "brew services 启动失败，尝试 pg_ctl"
        if [ -n "$PG_SERVICE_CMD" ]; then
          PGDATA="${PGDATA:-/opt/homebrew/var/postgresql@${PG_VERSION}}"
          $PG_SERVICE_CMD -D "$PGDATA" start || echo "pg_ctl 启动可能失败，请检查日志"
        else
          echo "未找到 pg_ctl，请确认 PostgreSQL 已安装"
          exit 1
        fi
      }
    fi
  else
    echo "brew services 中未发现 postgresql，尝试 pg_ctl"
    if [ -n "$PG_SERVICE_CMD" ]; then
      PGDATA="${PGDATA:-/opt/homebrew/var/postgresql@${PG_VERSION}}"
      $PG_SERVICE_CMD -D "$PGDATA" start
    else
      echo "未找到 pg_ctl，请确认 PostgreSQL 已安装"
      exit 1
    fi
  fi
elif [ -n "$PG_SERVICE_CMD" ]; then
  if $PG_SERVICE_CMD status >/dev/null 2>&1; then
    echo "PostgreSQL 已在运行"
  else
    echo "启动 PostgreSQL..."
    PGDATA="${PGDATA:-/opt/homebrew/var/postgresql@${PG_VERSION}}"
    $PG_SERVICE_CMD -D "$PGDATA" start
  fi
else
  echo "未找到 pg_ctl / brew，请确认 PostgreSQL 已安装"
  exit 1
fi

echo "初始化数据库..."
"${SCRIPT_DIR}/init-db.sh" || true

echo ""
echo "PostgreSQL: localhost:5432"
