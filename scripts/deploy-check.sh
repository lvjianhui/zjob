#!/usr/bin/env bash
# 部署前检查 — 验证配置、环境变量、构建是否就绪
# 用法: ./scripts/deploy-check.sh [方案A|方案B]
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROJECT_ROOT}"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS=0
FAIL=0
WARN=0

ok()   { echo -e "${GREEN}[PASS]${NC} $1"; PASS=$((PASS + 1)); }
fail() { echo -e "${RED}[FAIL]${NC} $1"; FAIL=$((FAIL + 1)); }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; WARN=$((WARN + 1)); }

PLAN="${1:-A}"
echo "========================================"
echo "  真职（Zjob）部署检查 — 方案 ${PLAN}"
echo "========================================"
echo ""

# ---- 1. 基础文件检查 ----
echo "--- 基础配置文件 ---"

[ -f "server/Dockerfile" ] && ok "server/Dockerfile 存在" || fail "server/Dockerfile 缺失"
[ -f "server/requirements.txt" ] && ok "server/requirements.txt 存在" || fail "server/requirements.txt 缺失"
[ -f "packages/web/package.json" ] && ok "packages/web/package.json 存在" || fail "packages/web/package.json 缺失"
[ -f "packages/web/next.config.js" ] && ok "packages/web/next.config.js 存在" || fail "packages/web/next.config.js 缺失"

if [ "$PLAN" = "A" ]; then
  [ -f "render.yaml" ] && ok "render.yaml 存在（Render Blueprint）" || fail "render.yaml 缺失"
  [ -f "packages/web/vercel.json" ] && ok "packages/web/vercel.json 存在" || warn "packages/web/vercel.json 缺失（可在 Vercel 控制台手动配置）"
elif [ "$PLAN" = "B" ]; then
  [ -f "vercel.json" ] && ok "vercel.json 存在（根目录，方案 B）" || fail "vercel.json 缺失"
  [ -f "api/index.py" ] && ok "api/index.py 存在（Serverless 入口）" || fail "api/index.py 缺失"
  [ -f "requirements.txt" ] && ok "requirements.txt 存在（根目录 Python 依赖）" || fail "requirements.txt 缺失"
fi

echo ""

# ---- 2. 后端环境变量检查 ----
echo "--- 后端环境变量 ---"

# 检查 server/.env.production 或 server/.env
BACKEND_ENV=""
if [ -f "server/.env.production" ]; then
  BACKEND_ENV="server/.env.production"
elif [ -f "server/.env" ]; then
  BACKEND_ENV="server/.env"
  warn "使用 server/.env（建议创建 .env.production 用于生产）"
fi

if [ -n "$BACKEND_ENV" ]; then
  ok "后端环境文件: ${BACKEND_ENV}"

  # 检查关键变量
  if grep -q "^SECRET_KEY=." "$BACKEND_ENV" && ! grep -q "^SECRET_KEY=change-me" "$BACKEND_ENV" && ! grep -q "^SECRET_KEY=$" "$BACKEND_ENV"; then
    ok "SECRET_KEY 已设置"
  else
    fail "SECRET_KEY 未设置或仍为默认值（运行 ./scripts/generate-secret.sh 生成）"
  fi

  if grep -q "^DATABASE_URL=postgresql+asyncpg://." "$BACKEND_ENV"; then
    ok "DATABASE_URL 格式正确（postgresql+asyncpg://）"
  else
    fail "DATABASE_URL 缺失或格式错误（需 postgresql+asyncpg:// 开头）"
  fi

  if grep -q "^DATABASE_URL=.*sslmode=require" "$BACKEND_ENV"; then
    ok "DATABASE_URL 包含 sslmode=require"
  else
    warn "DATABASE_URL 缺少 ?sslmode=require 参数（Neon 等云端 PG 需要此参数）"
  fi

  if grep -q "^ADMIN_PASSWORD=." "$BACKEND_ENV" && ! grep -q "^ADMIN_PASSWORD=zjob_admin" "$BACKEND_ENV"; then
    ok "ADMIN_PASSWORD 已修改"
  else
    fail "ADMIN_PASSWORD 未修改（仍为默认值 zjob_admin）"
  fi

  if grep -q "^DEBUG=false" "$BACKEND_ENV"; then
    ok "DEBUG=false（生产模式）"
  else
    warn "DEBUG 未设为 false（生产环境应关闭调试模式）"
  fi
else
  warn "未找到后端 .env 文件（部署时在平台控制台配置环境变量即可）"
fi

echo ""

# ---- 3. 前端环境变量检查 ----
echo "--- 前端环境变量 ---"

FRONTEND_ENV=""
if [ -f "packages/web/.env.production" ]; then
  FRONTEND_ENV="packages/web/.env.production"
elif [ -f "packages/web/.env.local" ]; then
  FRONTEND_ENV="packages/web/.env.local"
  warn "使用 packages/web/.env.local（建议创建 .env.production 用于生产）"
fi

if [ -n "$FRONTEND_ENV" ]; then
  ok "前端环境文件: ${FRONTEND_ENV}"

  if grep -q "^NEXT_PUBLIC_API_BASE_URL=https\?://" "$FRONTEND_ENV"; then
    ok "NEXT_PUBLIC_API_BASE_URL 已设置"
  elif grep -q "^NEXT_PUBLIC_API_BASE_URL=/api" "$FRONTEND_ENV"; then
    ok "NEXT_PUBLIC_API_BASE_URL=/api（方案 B 同域转发）"
  else
    fail "NEXT_PUBLIC_API_BASE_URL 未设置或格式错误"
  fi
else
  warn "未找到前端 .env 文件（部署时在 Vercel 控制台配置环境变量即可）"
fi

echo ""

# ---- 4. 前端构建检查 ----
echo "--- 前端构建 ---"

if [ -d "packages/web/node_modules" ]; then
  ok "packages/web/node_modules 存在（依赖已安装）"
else
  warn "packages/web/node_modules 不存在（Vercel 会自动安装，本地检查需要先 npm install）"
fi

echo ""

# ---- 5. Git 检查 ----
echo "--- Git 状态 ---"

if [ -d ".git" ]; then
  ok "Git 仓库已初始化"

  UNCOMMITTED=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
  if [ "$UNCOMMITTED" -eq 0 ]; then
    ok "工作区干净（无未提交更改）"
  else
    warn "有 ${UNCOMMITTED} 个未提交的更改（部署前请 commit 并 push）"
  fi

  # 检查是否有 remote
  if git remote -v | grep -q origin; then
    ok "Git remote 已配置"
  else
    fail "未配置 Git remote（Vercel/Render 需要从 GitHub 拉取代码）"
  fi
else
  fail "未初始化 Git 仓库（部署需要 GitHub 仓库）"
fi

echo ""

# ---- 6. 敏感信息泄露检查 ----
echo "--- 安全检查 ---"

if [ -f ".gitignore" ]; then
  ok ".gitignore 存在"
  if grep -q "\.env" ".gitignore"; then
    ok ".gitignore 已排除 .env 文件"
  else
    fail ".gitignore 未排除 .env 文件（存在密钥泄露风险！）"
  fi
else
  fail ".gitignore 缺失（存在密钥泄露风险！）"
fi

echo ""

# ---- 汇总 ----
echo "========================================"
echo "  检查结果汇总"
echo "========================================"
echo -e "  ${GREEN}通过: ${PASS}${NC}"
echo -e "  ${RED}失败: ${FAIL}${NC}"
echo -e "  ${YELLOW}警告: ${WARN}${NC}"
echo ""

if [ "$FAIL" -gt 0 ]; then
  echo -e "${RED}部署检查未通过，请修复上述 FAIL 项后重试。${NC}"
  exit 1
elif [ "$WARN" -gt 0 ]; then
  echo -e "${YELLOW}部署检查通过，但存在警告项，建议确认后再部署。${NC}"
  exit 0
else
  echo -e "${GREEN}所有检查通过，可以部署！${NC}"
  exit 0
fi
