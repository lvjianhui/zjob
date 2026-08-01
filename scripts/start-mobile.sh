#!/usr/bin/env bash
# 启动后端 + 移动端
# 等价于: ./scripts/start-all.sh backend+mobile
exec "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/start-all.sh" backend+mobile
