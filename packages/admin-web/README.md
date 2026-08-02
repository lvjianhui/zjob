# 真职后台 (Zjob Admin Web)

独立的运营后台管理系统，从 `web/`（官网）中拆分而来。

## 技术栈

- Next.js 14 (App Router) + React 18 + TypeScript
- Tailwind CSS（与官网共享 Emote 设计体系）
- lucide-react（图标）

## 快速开始

```bash
cd admin-web
npm install
npm run dev    # → http://localhost:3001
```

## 页面路由

| 路由 | 说明 |
|------|------|
| `/login` | 运营登录 |
| `/` | 概览仪表盘（公司数/待审口碑/操作日志） |
| `/companies` | 公司管理（搜索/筛选/新增/编辑/删除） |
| `/companies/[id]/edit` | 编辑公司信息与六维度评分 |
| `/companies/new/edit` | 新增公司 |
| `/reviews` | 口碑审核（通过/拒绝） |

## 环境变量

```bash
# .env.development
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# .env.production
NEXT_PUBLIC_API_BASE_URL=https://api.zjob.asia
```

## 构建

```bash
npm run build   # 产物在 .next/，output: standalone
npm run start   # 生产模式启动
```

## 部署

可部署到 Vercel 或任何支持 Node.js 的平台。建议使用独立域名（如 `admin.zjob.asia`）。
