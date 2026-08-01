#!/usr/bin/env bash
# 本地终端启动服务组合
# 用法：
#   ./scripts/start-all.sh                  # 默认 = backend+web
#   ./scripts/start-all.sh backend+web      # 后端 + Web 公开站
#   ./scripts/start-all.sh backend+admin    # 后端 + 后台管理
#   ./scripts/start-all.sh backend+mobile   # 后端 + 移动端
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# 解析参数：默认 backend+web
MODE="${1:-backend+web}"

# 校验模式
case "$MODE" in
  backend+web|backend+admin|backend+mobile) ;;
  *)
    echo "用法: $0 [backend+web|backend+admin|backend+mobile]"
    echo "  backend+web    启动后端 + Web 公开站 (默认)"
    echo "  backend+admin  启动后端 + 直接打开后台管理"
    echo "  backend+mobile 启动后端 + 直接打开移动端"
    exit 1
    ;;
esac

cd "${PROJECT_ROOT}"

if [ ! -f .env ]; then
  echo "复制 .env.example 为 .env"
  cp .env.example .env
fi

echo "启动本地数据库服务..."
"${SCRIPT_DIR}/start-db.sh"

sleep 1

# 根据模式选择前端初始路由
case "$MODE" in
  backend+web)
    FRONTEND_URL="http://localhost:3000"
    FRONTEND_DESC="Web 公开站"
    ;;
  backend+admin)
    FRONTEND_URL="http://localhost:3000/admin"
    FRONTEND_DESC="后台管理"
    ;;
  backend+mobile)
    FRONTEND_URL="http://localhost:3000/m"
    FRONTEND_DESC="移动端"
    ;;
esac

if [[ "$OSTYPE" == "darwin"* ]]; then
  echo "在 Terminal 新标签页中启动后端与前端（${FRONTEND_DESC}）..."
  osascript <<EOF
    tell application "Terminal"
      activate
      do script "cd '${PROJECT_ROOT}'; ./scripts/start-backend.sh"
      do script "cd '${PROJECT_ROOT}'; ./scripts/start-frontend.sh"
    end tell
EOF
  echo ""
  echo "已打开新终端标签页运行后端和前端。"
  echo "服务地址："
  echo "  ${FRONTEND_DESC}: ${FRONTEND_URL}"
  echo "  Web 前端根目录: http://localhost:3000"
  echo "  后端 API: http://localhost:8000"
  echo "  API 文档: http://localhost:8000/docs"
  echo ""
  echo "提示：浏览器打开 ${FRONTEND_URL} 即可访问 ${FRONTEND_DESC}"
else
  echo "当前非 macOS 系统，请手动运行以下命令："
  echo "  终端 1: ./scripts/start-backend.sh"
  echo "  终端 2: ./scripts/start-frontend.sh"
  echo ""
  echo "启动后访问：${FRONTEND_URL}"
fi
