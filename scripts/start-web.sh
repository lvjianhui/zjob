#!/usr/bin/env bash
# 启动后端 + Web 公开站
# 等价于: ./scripts/start-all.sh backend+web
exec "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/start-all.sh" backend+web
