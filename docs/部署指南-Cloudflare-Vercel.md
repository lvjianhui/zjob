# 真职（Zjob）免费部署指南 — Cloudflare + Vercel

> 将 Next.js 前端 + FastAPI 后端 + PostgreSQL 数据库部署到免费云平台，零成本上线。

---

## 目录

- [1. 架构总览](#1-架构总览)
- [2. 免费平台选型](#2-免费平台选型)
- [3. 方案 A（推荐）：Vercel + Render + Neon](#3-方案-a推荐vercel--render--neon)
- [4. 方案 B：全 Vercel 部署 + Neon](#4-方案-b全-vercel-部署--neon)
- [5. Cloudflare 集成](#5-cloudflare-集成)
- [6. 环境变量速查表](#6-环境变量速查表)
- [7. 常见问题](#7-常见问题)

---

## 1. 架构总览

```
┌─────────────────────────────────────────────────────────┐
│                    用户浏览器                              │
└──────────────┬──────────────────────────┬───────────────┘
               │                          │
               ▼                          ▼
     ┌─────────────────┐        ┌─────────────────┐
     │   Cloudflare     │        │   Cloudflare     │
     │   DNS / CDN      │───────▶│   DNS / CDN      │
     │   (免费)          │        │   (免费)          │
     └────────┬────────┘        └────────┬────────┘
              │                          │
              ▼                          ▼
     ┌─────────────────┐        ┌─────────────────┐
     │   Vercel         │        │   Render /       │
     │   Next.js 前端    │        │   Vercel Server  │
     │   (免费)          │        │   FastAPI 后端   │
     │                  │        │   (免费)          │
     └────────┬────────┘        └────────┬────────┘
              │                          │
              │           HTTPS API       │
              └──────────────────────────▶│
                                         │
                                         ▼
                                ┌─────────────────┐
                                │   Neon /         │
                                │   Supabase       │
                                │   PostgreSQL     │
                                │   (免费)          │
                                └─────────────────┘
```

**核心思路**：前端部署到 Vercel（Next.js 原生支持），后端部署到 Render 或 Vercel Serverless，数据库使用 Neon 免费 PostgreSQL，Cloudflare 负责域名解析和 CDN 加速。

---

## 2. 免费平台选型

| 组件 | 推荐平台 | 免费额度 | 说明 |
|------|---------|---------|------|
| **前端** | Vercel | 100GB 带宽/月, 无限部署 | Next.js 官方平台，零配置 |
| **后端** | Render | 750 小时/月, 512MB RAM | 免费 Web Service，15 分钟无请求会休眠 |
| **后端（备选）** | Vercel Serverless | 每月 100,000 次调用 | Python 支持，10s 超时限制 |
| **数据库** | Neon | 0.5GB 存储, 无限项目 | Serverless PostgreSQL，支持分支 |
| **数据库（备选）** | Supabase | 500MB 存储, 2 个项目 | PostgreSQL + 仪表盘 + Auth |
| **DNS/CDN** | Cloudflare | 无限流量 | 全球 CDN，免费 SSL |

> **为什么不用 Cloudflare 直接部署后端？**
> Cloudflare Workers 对 Python 的支持仍处于实验阶段，且不支持 `asyncpg` 等 C 扩展库。FastAPI 应用需要改造才能运行在 Workers 上，改造成本高。因此后端推荐使用 Render 或 Vercel Serverless。

---

## 3. 方案 A（推荐）：Vercel + Render + Neon

### 3.1 第一步：创建 Neon PostgreSQL 数据库

1. 访问 [neon.tech](https://neon.tech)，使用 GitHub 账号登录
2. 点击 **New Project**，选择区域（推荐 `AWS Singapore` — 离国内最近）
3. 创建完成后，复制 **Connection String**，格式如下：

```
postgresql+asyncpg://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
```

> **注意**：Zjob 使用 `asyncpg` 驱动，连接串需要加 `+asyncpg` 前缀和 `?sslmode=require` 参数。

4. 在 Neon 控制台点击 **SQL Editor**，可以执行初始化 SQL（可选，应用启动时会自动建表）

### 3.2 第二步：部署后端到 Render

#### 3.2.1 准备部署配置

在项目根目录创建 `render.yaml`（可选，用于 Blueprint 部署）：

```yaml
# render.yaml
services:
  - type: web
    name: zjob-api
    env: docker
    region: singapore
    plan: free
    dockerfilePath: ./server/Dockerfile
    dockerContext: ./server
    healthCheckPath: /health
    envVars:
      - key: DATABASE_URL
        sync: false  # 在 Render 控制台手动填写
      - key: SECRET_KEY
        generateValue: true
      - key: ADMIN_USERNAME
        value: admin
      - key: ADMIN_PASSWORD
        sync: false
      - key: DEBUG
        value: "false"
      - key: ACCESS_TOKEN_EXPIRE_MINUTES
        value: "60"
      - key: ALGORITHM
        value: HS256
```

#### 3.2.2 在 Render 上部署

1. 访问 [render.com](https://render.com)，使用 GitHub 登录
2. 点击 **New** → **Web Service**
3. 连接你的 GitHub 仓库
4. 配置如下：

| 配置项 | 值 |
|-------|-----|
| Name | `zjob-api` |
| Region | `Singapore` |
| Runtime | **Docker** |
| Dockerfile Path | `server/Dockerfile` |
| Docker Build Context | `server` |
| Instance Type | **Free** |

5. 在 **Environment** 标签页添加环境变量：

```
DATABASE_URL=postgresql+asyncpg://user:password@ep-xxx.neon.tech/dbname?sslmode=require
SECRET_KEY=你的随机密钥（用 openssl rand -hex 32 生成）
ADMIN_USERNAME=admin
ADMIN_PASSWORD=你的安全密码
DEBUG=false
ACCESS_TOKEN_EXPIRE_MINUTES=60
ALGORITHM=HS256
```

6. 点击 **Create Web Service**，等待构建完成

7. 部署成功后，Render 会分配一个域名，如：
   ```
   https://zjob-api.onrender.com
   ```

8. 验证：访问 `https://zjob-api.onrender.com/health`，应返回：
   ```json
   {"code": 0, "msg": "success", "data": {"status": "ok", "version": "0.1.0"}}
   ```

> **Render 免费版限制**：
> - 15 分钟无请求会自动休眠，首次请求需要等待 30-60 秒冷启动
> - 每月 750 小时免费时长（够 1 个服务 7×24 运行）
> - 512MB 内存

### 3.3 第三步：部署前端到 Vercel

#### 3.3.1 修改前端 API 地址

在 `web/` 目录下创建 `.env.production`：

```bash
# web/.env.production
NEXT_PUBLIC_API_BASE_URL=https://zjob-api.onrender.com
```

> 也可以在 Vercel 控制台设置环境变量，效果相同。

#### 3.3.2 配置 Vercel 项目

在项目根目录创建 `vercel.json`：

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "cd web && npm install && npm run build",
  "outputDirectory": "web/.next",
  "framework": "nextjs",
  "regions": ["hkg1"],
  "env": {
    "NEXT_PUBLIC_API_BASE_URL": "@zjob-api-url"
  }
}
```

> `hkg1` 是 Vercel 香港区域，离国内最近。`@zjob-api-url` 是 Vercel 的加密环境变量引用。

#### 3.3.3 在 Vercel 上部署

1. 访问 [vercel.com](https://vercel.com)，使用 GitHub 登录
2. 点击 **Add New** → **Project**
3. 导入你的 GitHub 仓库
4. 配置如下：

| 配置项 | 值 |
|-------|-----|
| Framework Preset | **Next.js** |
| Root Directory | `web/` |
| Build Command | `npm run build`（自动检测） |
| Output Directory | `.next`（自动检测） |

5. 在 **Environment Variables** 中添加：

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://zjob-api.onrender.com` |

6. 点击 **Deploy**，等待构建完成

7. 部署成功后，Vercel 会分配域名：
   ```
   https://zjob-web-xxx.vercel.app
   ```

#### 3.3.4 验证

- 访问 Vercel 分配的域名，前端页面正常加载
- 搜索公司、查看详情等功能正常调用后端 API
- 在浏览器开发者工具的 Network 面板确认 API 请求指向 Render 域名

### 3.4 第四步：导入种子数据

后端首次启动时会自动建表并创建管理员账号。如需导入 Demo 公司数据：

```bash
# 设置环境变量后运行种子脚本
export DATABASE_URL="postgresql+asyncpg://user:password@ep-xxx.neon.tech/dbname?sslmode=require"
cd server
python seed/seed.py
```

或者直接在 Neon 的 SQL Editor 中执行 `server/seed/` 目录下的 SQL 文件。

---

## 4. 方案 B：全 Vercel 部署 + Neon

> 如果不想使用 Render，可以将后端也部署到 Vercel Serverless Functions。

### 4.1 项目结构调整

Vercel 要求 Python Serverless Functions 放在 `api/` 目录下。需要在项目根目录创建入口文件：

```bash
mkdir -p api
```

创建 `api/index.py`：

```python
# api/index.py
# Vercel Serverless 入口 — 将所有请求转发给 FastAPI app
import sys
import os

# 将 server 目录加入 Python 路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'server'))

from app.main import app  # noqa: E402

# Vercel 会自动识别 ASGI 应用
handler = app
```

### 4.2 修改后端配置

Vercel Serverless 是无状态的，每次请求可能是不同的实例。需要调整数据库连接池配置：

```python
# server/app/db/session.py  — 修改连接池参数
engine = create_async_engine(
    settings.database_url,
    pool_size=0,       # Serverless 不需要连接池
    max_overflow=0,
    pool_pre_ping=True,
    pool_recycle=300,
)
```

> **重要**：Vercel Serverless Functions 免费版有 **10 秒超时限制**，复杂查询可能超时。

### 4.3 配置 vercel.json

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "cd web && npm install && npm run build",
  "outputDirectory": "web/.next",
  "functions": {
    "api/index.py": {
      "maxDuration": 10
    }
  },
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.py" }
  ],
  "regions": ["hkg1"]
}
```

### 4.4 环境变量

在 Vercel 项目设置中添加：

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql+asyncpg://...neon.tech/...?sslmode=require` |
| `SECRET_KEY` | 随机密钥 |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | 安全密码 |
| `NEXT_PUBLIC_API_BASE_URL` | `/api`（同域，通过 rewrite 转发） |

### 4.5 部署

推送代码到 GitHub，Vercel 自动部署。部署后：

- 前端：`https://your-project.vercel.app`
- API：`https://your-project.vercel.app/api/health`

> **方案 B 限制**：
> - 10 秒超时，不适合耗时操作
> - 冷启动延迟 1-3 秒
> - 无持久进程，数据库连接每次请求新建
> - 免费版每月 100,000 次函数调用

---

## 5. Cloudflare 集成

Cloudflare 在本架构中有三种用法，按需选择：

### 5.1 用法一：自定义域名 + DNS 解析（推荐）

如果你有自己的域名，可以用 Cloudflare 管理 DNS：

1. 在 [Cloudflare Dashboard](https://dash.cloudflare.com) 添加你的域名
2. 在域名注册商处将 NS 记录改为 Cloudflare 提供的 NS
3. 添加 DNS 记录：

| 类型 | 名称 | 内容 | 代理 |
|------|------|------|------|
| CNAME | `@` 或 `www` | `zjob-web-xxx.vercel.app` | 已代理（橙色云） |
| CNAME | `api` | `zjob-api.onrender.com` | 已代理（橙色云） |

4. SSL/TLS 模式设为 **Full (Strict)**

5. 在 Vercel 中添加自定义域名：
   - Settings → Domains → 添加你的域名
   - Vercel 会提示验证 DNS 记录

6. 在 Render 中添加自定义域名：
   - Settings → Custom Domains → 添加 `api.你的域名.com`

### 5.2 用法二：Cloudflare Pages（替代 Vercel 部署前端）

如果你想用 Cloudflare Pages 代替 Vercel 部署前端：

1. 安装 Cloudflare Pages 适配器：

```bash
cd web
npm install @cloudflare/next-on-pages
```

2. 修改 `next.config.js`：

```javascript
const nextConfig = {
  // ... 现有配置
  output: "standalone",  // 保留或改为 undefined
  experimental: {
    // Cloudflare Pages 需要的配置
  },
};
```

3. 构建命令：

```bash
npx @cloudflare/next-on-pages
```

4. 在 Cloudflare Dashboard → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
5. 配置：

| 配置项 | 值 |
|-------|-----|
| Framework preset | None |
| Build command | `npx @cloudflare/next-on-pages` |
| Build output directory | `.vercel/output/static` |
| Root directory | `web` |

6. 添加环境变量：`NEXT_PUBLIC_API_BASE_URL` 指向后端地址

> **注意**：Cloudflare Pages 对 Next.js 的兼容性不如 Vercel 原生，部分功能（如 ISR、Server Actions）可能不完全支持。建议优先使用 Vercel。

### 5.3 用法三：Cloudflare D1（替代 PostgreSQL — 需改代码）

> **不推荐**：需要大量代码改动，将 `asyncpg` 替换为 SQLite 驱动。

如果一定要使用 Cloudflare D1（免费 SQLite）：

1. 代码中需要将 `asyncpg` 替换为 `aiosqlite`
2. `DATABASE_URL` 格式变为 `sqlite+aiosqlite:///path/to/db`
3. 需要处理 PostgreSQL 特有语法（如 `JSONB`、`ARRAY` 等）
4. 在 Cloudflare Dashboard → **Workers & Pages** → **D1** → 创建数据库

**结论**：除非有特殊需求，建议使用 Neon/Supabase 的免费 PostgreSQL，无需改动后端代码。

---

## 6. 环境变量速查表

### 后端（Render / Vercel Serverless）

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `DATABASE_URL` | PostgreSQL 连接串（asyncpg 驱动） | `postgresql+asyncpg://user:pwd@ep-xxx.neon.tech/db?sslmode=require` |
| `SECRET_KEY` | JWT 签名密钥 | `openssl rand -hex 32` 生成 |
| `ADMIN_USERNAME` | 管理员用户名 | `admin` |
| `ADMIN_PASSWORD` | 管理员密码 | 你的安全密码 |
| `DEBUG` | 调试模式 | `false` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token 有效期（分钟） | `60` |
| `ALGORITHM` | JWT 签名算法 | `HS256` |

### 前端（Vercel）

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `NEXT_PUBLIC_API_BASE_URL` | 后端 API 地址 | `https://zjob-api.onrender.com`（方案 A）或 `/api`（方案 B） |

---

## 7. 常见问题

### Q: Render 免费版会休眠，怎么解决？

Render 免费版 15 分钟无请求会休眠，首次请求需等待 30-60 秒冷启动。解决方案：

1. **使用 [UptimeRobot](https://uptimerobot.com)（免费）定时唤醒**：
   - 添加 HTTP 监控，URL 设为 `https://zjob-api.onrender.com/health`
   - 间隔设为 10 分钟
   - 这样可以保持服务不进入休眠

2. **升级到付费版**（$7/月），无需休眠

3. **方案 B（Vercel Serverless）没有休眠问题**，但有 10s 超时限制

### Q: CORS 报错怎么办？

在 Render/Vercel 的环境变量中设置允许的前端域名：

当前后端 `config.py` 中 `origins` 默认为 `["*"]`，生产环境建议改为具体域名：

```python
# 在环境变量中设置（推荐）
# ORIGINS=["https://你的域名.com","https://zjob-web-xxx.vercel.app"]
```

### Q: 数据库连接数超限？

Neon 免费版限制 100 个连接。如果使用 Vercel Serverless（方案 B），每次请求可能新建连接。建议：

1. 使用 Neon 的 **Connection Pooling** 连接串（带 `-pooler` 后缀）
2. 在代码中设置 `pool_size=0`（Serverless 场景）

### Q: 如何更新部署？

- **Vercel**：推送代码到 GitHub main 分支，自动触发部署
- **Render**：推送代码到 GitHub main 分支，自动触发部署（可在设置中关闭自动部署）
- **Neon**：数据库无需部署，数据持久化存储

### Q: 如何查看日志？

- **Vercel**：项目 Dashboard → **Deployments** → 点击具体部署 → **Logs**
- **Render**：服务 Dashboard → **Logs** 标签页
- **Neon**：Dashboard → **Metrics** 查看连接数和查询数

### Q: 免费额度用完了怎么办？

| 平台 | 超额后果 | 建议 |
|------|---------|------|
| Vercel | 超出带宽会暂停部署 | 监控用量，必要时升级 Pro（$20/月） |
| Render | 超出时长会停止服务 | 监控用量，或升级 Starter（$7/月） |
| Neon | 超出存储会限制写入 | 定期清理数据，或升级（$19/月） |

---

## 附录：一键部署检查清单

```
□ 1. GitHub 仓库已创建并推送代码
□ 2. Neon 数据库已创建，连接串已保存
□ 3. 后端已部署到 Render / Vercel
□ 4. /health 接口返回正常
□ 5. 种子数据已导入（如需要）
□ 6. 前端已部署到 Vercel
□ 7. NEXT_PUBLIC_API_BASE_URL 已正确配置
□ 8. 前端页面可正常访问
□ 9. API 调用成功（搜索公司、查看详情）
□ 10. Cloudflare DNS 已配置（如使用自定义域名）
□ 11. UptimeRobot 已配置定时唤醒（如使用 Render 免费版）
□ 12. SECRET_KEY、ADMIN_PASSWORD 已改为安全值
```

---

> 文档版本：1.0 | 更新日期：2026-08-02 | 适用项目：真职（Zjob）Phase 1
