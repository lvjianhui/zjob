#!/usr/bin/env bash
# 生成安全的 SECRET_KEY（用于 JWT 签名）
# 用法: ./scripts/generate-secret.sh
set -e

echo "正在生成安全密钥..."
echo ""

# 方法 1: Python (优先)
if command -v python3 >/dev/null 2>&1; then
  SECRET=$(python3 -c "import secrets; print(secrets.token_hex(32))")
  echo "SECRET_KEY=$SECRET"
  echo ""
  echo "已生成 64 字符十六进制密钥（256 位）。"
  exit 0
fi

# 方法 2: openssl
if command -v openssl >/dev/null 2>&1; then
  SECRET=$(openssl rand -hex 32)
  echo "SECRET_KEY=$SECRET"
  echo ""
  echo "已生成 64 字符十六进制密钥（256 位）。"
  exit 0
fi

# 方法 3: /dev/urandom
if [ -r /dev/urandom ]; then
  SECRET=$(head -c 32 /dev/urandom | xxd -p | tr -d '\n')
  echo "SECRET_KEY=$SECRET"
  echo ""
  echo "已生成 64 字符十六进制密钥（256 位）。"
  exit 0
fi

echo "错误: 无法生成密钥，请手动安装 python3 或 openssl"
exit 1
