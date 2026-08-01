#!/usr/bin/env bash
# 启动后端 + 后台管理
# 等价于: ./scripts/start-all.sh backend+admin
exec "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/start-all.sh" backend+admin
