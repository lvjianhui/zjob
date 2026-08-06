# packages/admin-web 架构说明

> 后端管理系统（Admin Dashboard），基于 shadcn-admin 模板改造，是 Zjob pnpm monorepo 中的一个前端包。

## 1. 定位

- 面向运营/管理人员的后台界面，与 `packages/web`（用户端 Next.js）、`packages/mobile`（uni-app 移动端）并列。
- 依赖仓库根目录的 `server/`（FastAPI + PostgreSQL 16 + asyncpg）作为后端 API。
- 共享类型/常量可引用 `packages/shared`。

## 2. 技术栈

| 维度 | 选型 |
|---|---|
| 框架 | React 19 + Vite 8 + TypeScript |
| 路由 | TanStack Router（文件式路由，`routeTree.gen.ts` 自动生成） |
| 服务端状态 | TanStack Query（缓存 / 重试 / 全局错误处理） |
| 客户端状态 | Zustand（仅登录态 auth-store） |
| UI | Tailwind CSS v4 + shadcn/ui（Radix UI 原子组件） |
| 表格 | TanStack Table（配合 `components/data-table` 复用层） |
| 表单 | React Hook Form + Zod |
| 请求 | Axios |
| 图表 | Recharts |
| 通知 | Sonner（toast） |
| 测试 | Vitest + Playwright（浏览器模式） |

## 3. 目录结构

```
packages/admin-web/
├── public/                  # 静态资源
├── src/
│   ├── main.tsx             # 入口：QueryClient + Router 挂载
│   ├── routeTree.gen.ts     # TanStack Router 自动生成的路由树
│   ├── routes/              # 文件式路由（页面挂载点）
│   ├── features/            # 业务功能模块（自包含页面+组件+数据）
│   ├── components/          # 共享组件
│   │   ├── ui/              # shadcn/ui 原子组件（button/dialog/table...）
│   │   ├── layout/          # 布局：sidebar/header/authenticated-layout
│   │   └── data-table/      # 表格复用层（工具栏/筛选/分页/视图选项）
│   ├── lib/                 # 工具：utils/cookies/handle-server-error
│   ├── hooks/               # 通用 hooks
│   ├── stores/              # Zustand store（auth-store）
│   ├── context/             # 全局 Provider（theme/font/direction/layout/search）
│   ├── config/              # 配置（fonts）
│   ├── styles/              # 全局样式（index.css / theme.css）
│   └── test-utils/          # 测试工具
├── vite.config.ts           # Vite + TanStack Router 插件 + Vitest 配置
└── package.json
```

## 4. 分层架构

```
main.tsx 入口（QueryClient + RouterProvider）
   │
routes/ 文件式路由
   ├── (auth)          认证页（sign-in / sign-up / otp / forgot-password）
   ├── _authenticated  业务路由组 → AuthenticatedLayout（侧边栏+顶栏）
   └── (errors)        错误页（401/403/404/500/503）
   │
features/ 业务功能模块
   ├── users / tasks / dashboard / settings / auth / errors / chats / apps
   │
数据与状态
   ├── TanStack Query    服务端状态缓存
   ├── Zustand auth-store 登录态（JWT 存 Cookie）
   └── lib/ + Axios      HTTP 请求与工具
   │
server/ 后端 API（FastAPI + PostgreSQL 16 · asyncpg）
```

## 5. 核心机制

### 5.1 入口与全局配置（`src/main.tsx`）

- 创建 `QueryClient`：
  - `retry`：开发环境不重试；生产环境重试 3 次，401/403 不重试。
  - `refetchOnWindowFocus`：仅生产环境。
  - `staleTime`：10s。
- `QueryCache.onError` 统一处理：
  - 401 → 提示"会话过期"，`auth.reset()` 清空登录态并跳转 `/sign-in`。
  - 500 → 生产环境跳转 `/500`。
  - 403 → 预留（注释中）。
- `mutations.onError` 统一走 `handleServerError`。
- Provider 嵌套：`QueryClientProvider > ThemeProvider > FontProvider > DirectionProvider > RouterProvider`。

### 5.2 路由（TanStack Router）

- 文件式路由：目录名即路由，`routeTree.gen.ts` 由 Vite 插件自动生成。
- 路由分组约定：
  - `(auth)` / `(errors)` 为无布局分组。
  - `_authenticated` 为带布局分组（`_` 前缀表示 layout route），`route.tsx` 挂载 `AuthenticatedLayout`。
- `clerk/` 为模板自带的 Clerk 认证变体路由，当前主认证走本地 JWT，无需启用。

### 5.3 认证（`src/stores/auth-store.ts`）

- Zustand 管理，`accessToken` 持久化到 Cookie（key 为 `thisisjustarandomstring`，值为 JSON 字符串）。
- 用户信息结构：`accountNo / email / role[] / exp`，与后端 JWT payload 对齐。
- `reset()` 清除 Cookie 并重置状态，会话过期时由全局 QueryCache 触发。

### 5.4 业务功能模块（`src/features/`）

每个功能自包含，示例 `users/`：

```
users/
├── index.tsx                 # 页面：Header + 表格 + 弹窗
├── components/
│   ├── users-provider.tsx    # 功能内状态/上下文
│   ├── users-table.tsx       # 表格（TanStack Table）
│   ├── users-dialogs.tsx     # 新建/编辑/删除弹窗
│   ├── users-primary-buttons.tsx
│   └── users-columns.tsx     # 列定义
└── data/
    ├── data.ts               # 数据类型
    ├── schema.ts             # Zod 校验
    └── users.ts              # 数据源（当前为 faker mock）
```

### 5.5 数据获取

- **当前状态**：业务数据为 faker mock（`users` 500 条、`tasks` 等），尚未接后端。
- **接入方式**：通过 Axios 请求 `server/` 提供的 API，配合 TanStack Query 做缓存与状态管理。
- **错误处理**：`src/lib/handle-server-error.ts` 统一解析服务端错误。

### 5.6 表格复用层（`src/components/data-table/`）

提供通用能力：列头排序（`column-header`）、多选批量操作（`bulk-actions`）、多维度筛选（`faceted-filter`）、工具栏（`toolbar`）、视图选项（`view-options`）、分页（`pagination`）。业务表格基于该层组装。

## 6. 开发命令

```bash
pnpm --filter admin-web dev          # 启动开发服务器
pnpm --filter admin-web build        # 类型检查 + 构建
pnpm --filter admin-web lint         # ESLint
pnpm --filter admin-web test         # Vitest 浏览器模式测试
pnpm --filter admin-web test:coverage # 覆盖率
```

## 7. 已知现状与后续规划

- 业务数据仍为 mock，需替换为 `server/` 真实 API。
- 认证走本地 JWT + Cookie；`clerk/` 变体未启用。
- 环境变量：`VITE_CLERK_PUBLISHABLE_KEY`（仅 Clerk 变体需要）。
- 新增页面流程：在 `routes/_authenticated/<name>/` 建路由 → 在 `features/<name>/` 实现页面与组件。
