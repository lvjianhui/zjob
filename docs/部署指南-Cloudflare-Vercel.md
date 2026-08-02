# 真职（Zjob）免费部署指南 — Cloudflare + Vercel

> 将 Next.js 前端 + FastAPI 后端 + PostgreSQL 数据库部署到免费云平台，零成本上线。

---

## 目录

- [1. 架构总览](#1-架构总览)
- [2. 免费平台选型](#2-免费平台选型)
- [3. 已包含的配置文件](#3-已包含的配置文件)
- [4. 方案 A（推荐）：Vercel + Render + Neon](#4-方案-a推荐vercel--render--neon)
- [5. 方案 B：全 Vercel 部署 + Neon](#5-方案-b全-vercel-部署--neon)
- [6. Cloudflare 集成](#6-cloudflare-集成)
- [7. 环境变量速查表](#7-环境变量速查表)
- [8. 常见问题](#8-常见问题)

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

## 3. 已包含的配置文件

项目已内置以下部署相关文件，无需手动创建：

### 配置文件

| 文件 | 用途 | 适用方案 |
|------|------|---------|
| `render.yaml` | Render Blueprint 一键部署后端 | 方案 A |
| `web/vercel.json` | Vercel 前端部署配置 | 方案 A |
| `vercel.json` | Vercel 全栈配置（前端 + Python Serverless） | 方案 B |
| `api/index.py` | Vercel Serverless Functions 入口 | 方案 B |
| `requirements.txt` | 根目录 Python 依赖（供 Vercel 读取） | 方案 B |
| `server/.env.production.example` | 后端生产环境变量模板 | 通用 |
| `web/.env.production.example` | 前端生产环境变量模板 | 通用 |
| `.gitignore` | 排除 .env、node_modules 等敏感文件 | 通用 |

### 辅助脚本

| 脚本 | 功能 | 用法 |
|------|------|------|
| `scripts/generate-secret.sh` | 生成 256 位 JWT 密钥 | `./scripts/generate-secret.sh` |
| `scripts/deploy-check.sh` | 部署前检查（文件、环境变量、Git、安全） | `./scripts/deploy-check.sh A` 或 `./scripts/deploy-check.sh B` |
| `scripts/seed-remote.sh` | 连接云端 PostgreSQL 导入种子数据 | `./scripts/seed-remote.sh` |

### 已适配的代码

| 文件 | 改动说明 |
|------|---------|
| `server/app/db/session.py` | 自动检测 Vercel Serverless 环境，切换连接池策略（Serverless 时 `pool_size=0`） |
| `server/app/core/config.py` | CORS `origins` 支持逗号分隔字符串和 JSON 数组两种格式，方便部署平台配置 |

---

## 4. 方案 A（推荐）：Vercel + Render + Neon

### 4.1 第一步：创建 Neon PostgreSQL 数据库

1. 访问 [neon.tech](https://neon.tech)，使用 GitHub 账号登录
2. 点击 **New Project**，选择区域（推荐 `AWS Singapore` — 离国内最近）
3. 创建完成后，复制 **Connection String**，格式如下：

```
postgresql+asyncpg://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
```

> **注意**：Zjob 使用 `asyncpg` 驱动，连接串需要加 `+asyncpg` 前缀和 `?sslmode=require` 参数。

4. 在 Neon 控制台点击 **SQL Editor**，可以执行初始化 SQL（可选，应用启动时会自动建表）

### 4.2 第二步：部署后端到 Render

#### 4.2.1 生成密钥并准备环境变量

```bash
# 生成 SECRET_KEY
./scripts/generate-secret.sh
# 输出示例: SECRET_KEY=28c436ea50a0118173d1be7741c5a809a294d2ebbbe207723e1137d65bf969f1
```

复制 `server/.env.production.example` 为 `server/.env.production`，填入实际值：

```bash
cp server/.env.production.example server/.env.production
```

填写关键字段：

```bash
# server/.env.production
DEBUG=false
SECRET_KEY=生成的密钥
DATABASE_URL=postgresql+asyncpg://user:password@ep-xxx.neon.tech/dbname?sslmode=require
ADMIN_USERNAME=admin
ADMIN_PASSWORD=你的安全密码
# CORS（逗号分隔多个域名）
# ORIGINS=https://zjob-web-xxx.vercel.app,https://你的域名.com
```

#### 4.2.2 在 Render 上部署

项目已包含 `render.yaml`（Render Blueprint），支持两种部署方式：

**方式一：Blueprint 一键部署（推荐）**

1. 访问 [render.com](https://render.com)，使用 GitHub 登录
2. 点击 **New** → **Blueprint**
3. 连接你的 GitHub 仓库，Render 会自动读取 `render.yaml` 配置
4. 在弹出的表单中填写标记为需要手动输入的环境变量：
   - `DATABASE_URL`：Neon 连接串
   - `SECRET_KEY`：上一步生成的密钥
   - `ADMIN_PASSWORD`：管理员密码
5. 点击 **Apply**，等待构建完成

**方式二：手动配置**

1. 点击 **New** → **Web Service**
2. 连接你的 GitHub 仓库
3. 配置如下：

| 配置项 | 值 |
|-------|-----|
| Name | `zjob-api` |
| Region | `Singapore` |
| Runtime | **Docker** |
| Dockerfile Path | `server/Dockerfile` |
| Docker Build Context | `server` |
| Instance Type | **Free** |

4. 在 **Environment** 标签页添加环境变量（参照 `server/.env.production.example`）：

```
DATABASE_URL=postgresql+asyncpg://user:password@ep-xxx.neon.tech/dbname?sslmode=require
SECRET_KEY=生成的密钥
ADMIN_USERNAME=admin
ADMIN_PASSWORD=你的安全密码
DEBUG=false
ACCESS_TOKEN_EXPIRE_MINUTES=60
ALGORITHM=HS256
```

5. 点击 **Create Web Service**，等待构建完成

#### 4.2.3 验证后端

部署成功后，Render 会分配一个域名，如：
```
https://zjob-api.onrender.com
```

访问 `https://zjob-api.onrender.com/health`，应返回：
```json
{"code": 0, "msg": "success", "data": {"status": "ok", "version": "0.1.0"}}
```

> **Render 免费版限制**：
> - 15 分钟无请求会自动休眠，首次请求需要等待 30-60 秒冷启动
> - 每月 750 小时免费时长（够 1 个服务 7×24 运行）
> - 512MB 内存

### 4.3 第三步：部署前端到 Vercel

#### 4.3.1 配置前端环境变量

复制 `web/.env.production.example` 为 `web/.env.production`，填入后端地址：

```bash
cp web/.env.production.example web/.env.production
```

```bash
# web/.env.production
NEXT_PUBLIC_API_BASE_URL=https://zjob-api.onrender.com
```

> 也可以在 Vercel 控制台设置环境变量，效果相同。如果两者都设，控制台优先。

#### 4.3.2 在 Vercel 上部署

项目已包含 `web/vercel.json`（指定了香港区域 `hkg1` 和构建配置）。

1. 访问 [vercel.com](https://vercel.com)，使用 GitHub 登录
2. 点击 **Add New** → **Project**
3. 导入你的 GitHub 仓库
4. 配置如下：

| 配置项 | 值 |
|-------|-----|
| Framework Preset | **Next.js**（自动检测） |
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

#### 4.3.3 验证

- 访问 Vercel 分配的域名，前端页面正常加载
- 搜索公司、查看详情等功能正常调用后端 API
- 在浏览器开发者工具的 Network 面板确认 API 请求指向 Render 域名

### 4.4 第四步：导入种子数据

后端首次启动时会自动建表并创建管理员账号。如需导入 Demo 公司数据：

```bash
# 使用内置脚本（自动读取 server/.env.production 中的 DATABASE_URL）
./scripts/seed-remote.sh

# 或通过环境变量直接指定
DATABASE_URL="postgresql+asyncpg://user:password@ep-xxx.neon.tech/dbname?sslmode=require" \
  ./scripts/seed-remote.sh

# 强制覆盖已有数据
./scripts/seed-remote.sh --force
```

也可以直接在 Neon 的 SQL Editor 中执行 SQL。

### 4.5 部署前检查

部署前运行检查脚本，确认所有配置就绪：

```bash
./scripts/deploy-check.sh A
```

输出示例：

```
========================================
  真职（Zjob）部署检查 — 方案 A
========================================
--- 基础配置文件 ---
[PASS] server/Dockerfile 存在
[PASS] render.yaml 存在（Render Blueprint）
[PASS] web/vercel.json 存在
...
========================================
  检查结果汇总
========================================
  通过: 14
  失败: 0
  警告: 2
```

---

## 5. 方案 B：全 Vercel 部署 + Neon

> 如果不想使用 Render，可以将后端也部署到 Vercel Serverless Functions。

### 5.1 项目结构（已配置好）

方案 B 所需的文件已全部包含在项目中：

- `api/index.py` — Vercel Serverless 入口，将请求转发给 FastAPI 应用
- `vercel.json`（根目录） — 配置前端构建和 Serverless Functions 路由
- `requirements.txt`（根目录） — Vercel 自动读取的 Python 依赖
- `server/app/db/session.py` — 已自动适配 Serverless 连接池（检测 `VERCEL` 环境变量，自动设置 `pool_size=0`）

无需额外创建或修改任何文件。

### 5.2 环境变量

在 Vercel 项目设置中添加以下变量（参照 `server/.env.production.example`）：

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql+asyncpg://...neon.tech/...?sslmode=require` |
| `SECRET_KEY` | 用 `./scripts/generate-secret.sh` 生成 |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | 安全密码 |
| `DEBUG` | `false` |
| `NEXT_PUBLIC_API_BASE_URL` | `/api`（同域，通过 rewrite 转发） |

> 前端环境变量也需在 Vercel 中设置：将 `NEXT_PUBLIC_API_BASE_URL` 设为 `/api`。

### 5.3 部署

1. 推送代码到 GitHub
2. 在 Vercel 中导入仓库（**不要**设置 Root Directory，保持项目根目录）
3. 配置环境变量（见上表）
4. Vercel 自动部署

部署后：

- 前端：`https://your-project.vercel.app`
- API：`https://your-project.vercel.app/api/health`

### 5.4 部署前检查

```bash
./scripts/deploy-check.sh B
```

> **方案 B 限制**：
> - 10 秒超时，不适合耗时操作
> - 冷启动延迟 1-3 秒
> - 无持久进程，数据库连接每次请求新建（已在 `db/session.py` 中自动适配）
> - 免费版每月 100,000 次函数调用

---

## 6. Cloudflare 集成

Cloudflare 在本架构中有三种用法，按需选择：

### 6.1 用法一：自定义域名 + DNS 解析（推荐）

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

### 6.2 用法二：Cloudflare Pages（替代 Vercel 部署前端）

如果你想用 Cloudflare Pages 代替 Vercel 部署前端：

1. 安装 Cloudflare Pages 适配器：

```bash
cd web
npm install @cloudflare/next-on-pages
```

2. 构建命令：

```bash
npx @cloudflare/next-on-pages
```

3. 在 Cloudflare Dashboard → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
4. 配置：

| 配置项 | 值 |
|-------|-----|
| Framework preset | None |
| Build command | `npx @cloudflare/next-on-pages` |
| Build output directory | `.vercel/output/static` |
| Root directory | `web` |

5. 添加环境变量：`NEXT_PUBLIC_API_BASE_URL` 指向后端地址

> **注意**：Cloudflare Pages 对 Next.js 的兼容性不如 Vercel 原生，部分功能（如 ISR、Server Actions）可能不完全支持。建议优先使用 Vercel。

### 6.3 用法三：Cloudflare D1（替代 PostgreSQL — 需改代码）

> **不推荐**：需要大量代码改动，将 `asyncpg` 替换为 SQLite 驱动。

如果一定要使用 Cloudflare D1（免费 SQLite）：

1. 代码中需要将 `asyncpg` 替换为 `aiosqlite`
2. `DATABASE_URL` 格式变为 `sqlite+aiosqlite:///path/to/db`
3. 需要处理 PostgreSQL 特有语法（如 `JSONB`、`ARRAY` 等）
4. 在 Cloudflare Dashboard → **Workers & Pages** → **D1** → 创建数据库

**结论**：除非有特殊需求，建议使用 Neon/Supabase 的免费 PostgreSQL，无需改动后端代码。

---

## 7. 环境变量速查表

### 后端（Render / Vercel Serverless）

完整模板见 `server/.env.production.example`。

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `DATABASE_URL` | PostgreSQL 连接串（asyncpg 驱动） | `postgresql+asyncpg://user:pwd@ep-xxx.neon.tech/db?sslmode=require` |
| `SECRET_KEY` | JWT 签名密钥 | `./scripts/generate-secret.sh` 生成 |
| `ADMIN_USERNAME` | 管理员用户名 | `admin` |
| `ADMIN_PASSWORD` | 管理员密码 | 你的安全密码 |
| `DEBUG` | 调试模式 | `false` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token 有效期（分钟） | `60` |
| `ALGORITHM` | JWT 签名算法 | `HS256` |
| `ORIGINS` | CORS 允许来源（逗号分隔或 JSON 数组） | `https://a.com,https://b.com` |

> `ORIGINS` 支持两种格式：逗号分隔（`https://a.com,https://b.com`）或 JSON 数组（`["https://a.com","https://b.com"]`）。留空或不设则默认允许所有来源。

### 前端（Vercel）

完整模板见 `web/.env.production.example`。

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `NEXT_PUBLIC_API_BASE_URL` | 后端 API 地址 | `https://zjob-api.onrender.com`（方案 A）或 `/api`（方案 B） |

---

## 8. 常见问题

### Q: Render 免费版会休眠，怎么解决？

Render 免费版 15 分钟无请求会休眠，首次请求需等待 30-60 秒冷启动。解决方案：

1. **使用 [UptimeRobot](https://uptimerobot.com)（免费）定时唤醒**：
   - 添加 HTTP 监控，URL 设为 `https://zjob-api.onrender.com/health`
   - 间隔设为 10 分钟
   - 这样可以保持服务不进入休眠

2. **升级到付费版**（$7/月），无需休眠

3. **方案 B（Vercel Serverless）没有休眠问题**，但有 10s 超时限制

### Q: CORS 报错怎么办？

后端 `config.py` 的 `origins` 已支持多种格式。在部署平台设置 `ORIGINS` 环境变量即可：

```
# 逗号分隔（推荐，部署平台友好）
ORIGINS=https://zjob-web-xxx.vercel.app,https://你的域名.com

# 或 JSON 数组
ORIGINS=["https://zjob-web-xxx.vercel.app","https://你的域名.com"]
```

留空或不设则默认 `["*"]`（允许所有来源，生产环境不推荐）。

### Q: 数据库连接数超限？

Neon 免费版限制 100 个连接。解决方案：

1. 使用 Neon 的 **Connection Pooling** 连接串（带 `-pooler` 后缀）
2. Serverless 环境（方案 B）已在 `db/session.py` 中自动设置 `pool_size=0`，每次请求新建连接并立即释放
3. 传统部署（方案 A）使用 `pool_size=5`，适合长连接

### Q: 部署检查脚本报 FAIL 怎么办？

运行 `./scripts/deploy-check.sh A`（或 `B`），根据输出修复：

| 常见 FAIL | 解决方案 |
|----------|---------|
| SECRET_KEY 未设置 | 运行 `./scripts/generate-secret.sh` |
| DATABASE_URL 格式错误 | 确保以 `postgresql+asyncpg://` 开头，包含 `?sslmode=require` |
| ADMIN_PASSWORD 未修改 | 在 `.env.production` 中设置安全密码 |
| 未初始化 Git 仓库 | `git init && git remote add origin <url>` |
| .gitignore 缺失 | 项目已包含，确认文件未被删除 |

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
□  1. 运行 ./scripts/generate-secret.sh 生成密钥
□  2. 复制 .env.production.example 为 .env.production 并填写
□  3. 运行 ./scripts/deploy-check.sh A（或 B）确认通过
□  4. GitHub 仓库已创建并推送代码
□  5. Neon 数据库已创建，连接串已配置
□  6. 后端已部署到 Render / Vercel
□  7. /health 接口返回正常
□  8. 运行 ./scripts/seed-remote.sh 导入种子数据（如需要）
□  9. 前端已部署到 Vercel
□ 10. NEXT_PUBLIC_API_BASE_URL 已正确配置
□ 11. 前端页面可正常访问
□ 12. API 调用成功（搜索公司、查看详情）
□ 13. Cloudflare DNS 已配置（如使用自定义域名）
□ 14. UptimeRobot 已配置定时唤醒（如使用 Render 免费版）
□ 15. ORIGINS 已设置为具体域名（生产环境安全要求）
```

---

> 文档版本：1.1 | 更新日期：2026-08-02 | 适用项目：真职（Zjob）Phase 1
