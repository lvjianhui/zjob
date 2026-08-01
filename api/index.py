"""
Vercel Serverless Functions 入口 — 真职（Zjob）FastAPI 后端
=============================================================
方案 B：全 Vercel 部署时使用此文件作为 Serverless 入口。

工作原理:
  Vercel 会将 api/ 目录下的 .py 文件作为 Serverless Function 部署。
  此文件将所有请求转发给 FastAPI 应用实例。

限制:
  - 免费版单次请求最长 10 秒
  - 无持久进程，每次冷启动需要 1-3 秒
  - 数据库连接每次请求新建（已在 db/session.py 中适配）

使用方式:
  1. 确保项目根目录有 vercel.json（已包含 routes 配置）
  2. 在 Vercel 中设置环境变量（DATABASE_URL, SECRET_KEY 等）
  3. 部署后访问 https://your-project.vercel.app/api/health 验证
"""

import os
import sys
from pathlib import Path

# 将 server/ 目录加入 Python 模块搜索路径
SERVER_DIR = str(Path(__file__).resolve().parent.parent / "server")
if SERVER_DIR not in sys.path:
    sys.path.insert(0, SERVER_DIR)

# 导入 FastAPI 应用
# Vercel Python Runtime 会自动识别 ASGI 应用对象 `app`
from app.main import app  # noqa: E402

# 导出为模块级变量，供 Vercel 调用
handler = app
