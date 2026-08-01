# 真职（Zjob）— 可执行版产品 PRD

| 项目 | 内容 |
| --- | --- |
| 文档版本 | V1.1（可执行版） |
| 产品名称 | 真职（Zjob） |
| 覆盖阶段 | Phase 1：Web MVP |
| 关联文档 | 《真职（Zjob）— 产品需求文档（PRD）》《真职（Zjob）— 多端开发计划》 |
| 目标 | 输出一份可直接指导 Phase 1 前后端开发的 PRD，包含数据模型、API 规范、页面清单与验收标准。 |

---

## 一、Phase 1 范围

### 1.1 本次交付边界

- **端**：Web 端（兼容桌面与移动端浏览器）。
- **公司数**：2-3 家 Demo 公司（立讯精密、特斯拉、达能）。
- **核心功能**：
  1. 公司搜索（名称关键词 + 热门公司推荐）。
  2. 公司详情页六维度展示。
  3. 六维红绿灯总览。
  4. 交叉验证：真实时薪计算。
  5. 公司横向比较（2-5 家）。
  6. 后台数据管理：公司/维度/口碑的录入、编辑、审核。
- **不进入 Phase 1**：小程序、APP、微信登录、推送、个性化推荐、正式爬虫全量采集、C 端注册开放。

### 1.2 技术栈

| 层级 | 选型 |
| --- | --- |
| Web 前端 | Next.js 14（App Router）+ React 18 + TypeScript + Tailwind CSS + Zustand |
| 后端 | Python 3.12 + FastAPI + SQLAlchemy 2.x + Pydantic v2 |
| 数据库 | MySQL 8.0（主库）+ Redis 7（缓存/会话） |
| 搜索 | MySQL 全文索引（Phase 1），Elasticsearch 预留接口 |
| 采集 | Playwright + Scrapy 占位脚本（Phase 1 以手动/JSON 种子数据为主） |
| 部署 | Docker + Docker Compose |

---

## 二、用户故事与验收标准

### 2.1 内部销售员（核心用户）

| 用户故事 | 验收标准 |
| --- | --- |
| 作为销售员，我能在首页搜索公司名称，快速找到目标公司。 | 搜索响应 < 2s；支持关键词；返回 Logo、行业、规模；点击可进入详情。 |
| 作为销售员，我能查看公司六维度详情，向客户/家长清晰讲解。 | 详情页包含六个维度卡片；每个维度有关键指标、红绿灯、决策意义说明。 |
| 作为销售员，我能一眼看到六维红绿灯总览，判断公司优劣。 | 详情页顶部有六宫格红绿灯；绿色=良好、黄色=关注、红色=预警。 |
| 作为销售员，我能看到真实时薪，帮助客户理解“高薪但加班”的陷阱。 | 交叉验证模块显示：真实时薪 = 月到手薪资 / 月工作小时数；与行业 P50 对比。 |
| 作为销售员，我能选择多家公司进行横向对比。 | 对比页支持 2-5 家公司；按六维度逐项对比；支持移除/添加公司。 |

### 2.2 数据运营（后台用户）

| 用户故事 | 验收标准 |
| --- | --- |
| 作为运营，我能登录后台管理公司数据。 | 提供登录页；JWT Token；区分 admin/operator 角色。 |
| 作为运营，我能新增/编辑公司主信息和六维度数据。 | 公司表单可录入名称、行业、规模、上市状态等；维度表单以结构化 JSON 方式录入。 |
| 作为运营，我能录入和审核口碑信息。 | 口碑表单包含来源、情感、摘要、原链接、发布时间；可标记审核状态。 |
| 作为运营，我能查看最近的数据变更记录。 | 后台首页展示最近 10 条操作日志（操作人、时间、对象）。 |

---

## 三、数据模型

### 3.1 实体关系

```
Company 1--1 DimensionData（按 dimension_key 区分 6 条记录）
Company 1--* Review
Company 1--* AuditLog
User 1--* AuditLog
```

### 3.2 表结构

#### `users`（用户/运营账号）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | INT PK AI | 用户 ID |
| username | VARCHAR(64) UNIQUE | 登录名 |
| hashed_password | VARCHAR(255) | bcrypt 哈希 |
| role | ENUM('admin','operator') | 角色 |
| is_active | BOOLEAN | 是否启用 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

#### `companies`（公司主表）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | INT PK AI | 公司 ID |
| name | VARCHAR(128) | 公司全称 |
| short_name | VARCHAR(64) | 简称 |
| en_name | VARCHAR(128) | 英文名 |
| industry | VARCHAR(64) | 行业 |
| scale | VARCHAR(32) | 规模，如“10万人以上” |
| location | VARCHAR(128) | 总部城市 |
| logo_url | VARCHAR(512) | Logo URL |
| is_listed | BOOLEAN | 是否上市 |
| stock_code | VARCHAR(32) | 股票代码 |
| fortune500_trend | JSON | 近 5 年世界/中国 500 强排名 |
| industry_ranking | VARCHAR(255) | 行业地位描述 |
| tags | JSON | 标签数组 |
| status | ENUM('active','pending','archived') | 状态 |
| source_urls | JSON | 来源链接集合 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

#### `dimension_data`（六维度数据）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | INT PK AI | 维度记录 ID |
| company_id | INT FK | 所属公司 |
| dimension_key | ENUM('basic','compensation','welfare','worklife','growth','reputation') | 维度键 |
| score | TINYINT | 0-100 分 |
| level | ENUM('green','yellow','red') | 红绿灯级别 |
| summary | VARCHAR(500) | 维度一句话总结 |
| metrics | JSON | 关键指标（见下） |
| source_note | VARCHAR(500) | 数据来源与说明 |
| updated_at | DATETIME | 更新时间 |

各维度 `metrics` 示例：

- `basic`：`{scale_level, listed_info, fortune500_5y, industry_status}`
- `compensation`：`{real_salary_range, salary_structure, percentile, severance_rule}`
- `welfare`：`{social_insurance_base, commercial_insurance, annual_leave_days, subsidies}`
- `worklife`：`{avg_overtime_hours, overtime_culture, overtime_pay, after_work_disturbance}`
- `growth`：`{promotion_cycle, training_system, internal_mobility, track_potential}`
- `reputation`：`{active_review_summary, former_review_summary, turnover_rate, negative_events}`

#### `reviews`（真实口碑）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | INT PK AI | 口碑 ID |
| company_id | INT FK | 所属公司 |
| source | ENUM('maimai','kanzhun','zhihu','xiaohongshu','linkedin','other') | 来源 |
| sentiment | ENUM('positive','neutral','negative') | 情感 |
| content_summary | TEXT | 内容摘要 |
| original_url | VARCHAR(512) | 原链接 |
| published_at | DATE | 原帖发布时间 |
| audit_status | ENUM('pending','approved','rejected') | 审核状态 |
| created_at | DATETIME | 创建时间 |

#### `audit_logs`（操作日志）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | INT PK AI | 日志 ID |
| user_id | INT FK | 操作人 |
| action | VARCHAR(64) | 动作：create/update/delete/approve |
| target_type | VARCHAR(64) | 对象类型：company/dimension/review |
| target_id | INT | 对象 ID |
| detail | JSON | 变更详情 |
| created_at | DATETIME | 操作时间 |

---

## 四、API 规范

### 4.1 认证

| 端点 | 方法 | 说明 |
| --- | --- | --- |
| `/api/auth/login` | POST | username + password → access_token + token_type |
| `/api/auth/refresh` | POST | 刷新 access_token |

JWT 放入请求头：`Authorization: Bearer <token>`。

### 4.2 公司相关

| 端点 | 方法 | 说明 |
| --- | --- | --- |
| `/api/companies/search` | GET | `q`, `limit`, `offset` → 公司列表 |
| `/api/companies/{id}` | GET | 公司主信息 |
| `/api/companies/{id}/dimensions` | GET | 六维度完整数据 |
| `/api/companies/{id}/summary` | GET | 六维红绿灯总览 |
| `/api/companies/{id}/analysis` | GET | 交叉验证分析（真实时薪等） |
| `/api/companies/{id}/reviews` | GET | 口碑列表（仅 approved） |
| `/api/compare` | POST | body `{company_ids:[]}` → 多公司对比数据 |

### 4.3 后台管理（需 admin/operator）

| 端点 | 方法 | 说明 |
| --- | --- | --- |
| `/api/admin/companies` | GET/POST | 列表 / 新增公司 |
| `/api/admin/companies/{id}` | GET/PUT/DELETE | 详情 / 更新 / 删除 |
| `/api/admin/companies/{id}/dimensions` | GET/PUT | 维度数据批量更新 |
| `/api/admin/companies/{id}/dimensions/{key}` | GET/PUT | 单维度更新 |
| `/api/admin/reviews` | GET/POST | 口碑列表 / 新增 |
| `/api/admin/reviews/{id}` | GET/PUT/DELETE | 审核更新 / 删除 |
| `/api/admin/audit-logs` | GET | 操作日志 |

### 4.4 关键响应示例

#### GET `/api/companies/{id}/summary`

```json
{
  "company_id": 1,
  "name": "特斯拉（上海）有限公司",
  "overall_score": 82,
  "dimensions": [
    {"key": "basic", "label": "企业基本面", "level": "green", "score": 88},
    {"key": "compensation", "label": "薪酬竞争力", "level": "green", "score": 85},
    {"key": "welfare", "label": "福利保障", "level": "yellow", "score": 72},
    {"key": "worklife", "label": "工作节奏", "level": "yellow", "score": 68},
    {"key": "growth", "label": "成长与制度", "level": "green", "score": 80},
    {"key": "reputation", "label": "真实口碑", "level": "yellow", "score": 75}
  ]
}
```

#### GET `/api/companies/{id}/analysis`

```json
{
  "company_id": 1,
  "real_hourly_wage": {
    "monthly_take_home": 18500,
    "monthly_work_hours": 220,
    "hourly_wage": 84.1,
    "industry_p50_hourly": 75.0,
    "percentile": 65,
    "verdict": "高薪伴随高强度加班，真实时薪仍高于行业 P50"
  },
  "surface_vs_kitchen": {
    "surface": "500 强新能源头部，技术领先",
    "kitchen": "产线节奏快，部分岗位加班较多",
    "insight": "品牌光环与实际工作强度并存，需关注岗位差异"
  },
  "growth_forecast_3y": {
    "track_potential": "高",
    "promotion_path": "技术/管理双通道较清晰",
    "forecast": "3 年后具备新能源车行业溢价能力"
  }
}
```

---

## 五、前端页面清单

| 页面 | 路由 | 说明 |
| --- | --- | --- |
| 搜索首页 | `/` | 搜索框 + 热门公司卡片 |
| 公司详情 | `/company/[id]` | 六维度 Tab/卡片、红绿灯、真实时薪 |
| 公司对比 | `/compare` | 选择 2-5 家公司横向对比 |
| 后台登录 | `/admin/login` | 运营账号登录 |
| 后台首页 | `/admin` | 概览与最近日志 |
| 公司管理 | `/admin/companies` | 公司列表、新增、编辑 |
| 公司编辑 | `/admin/companies/[id]/edit` | 主信息 + 六维度表单 |
| 口碑管理 | `/admin/reviews` | 口碑审核列表 |

### 5.1 UI 组件要求

- `SearchBox`：带历史记录、热门推荐、搜索建议。
- `DimensionCard`：展示单一维度标题、分数、红绿灯、关键指标、决策意义。
- `TrafficLightGrid`：六宫格红绿灯总览。
- `RealWageCard`：真实时薪计算器与结论。
- `CompareTable`：六维度横向对比表。
- `RadarChart`：可选六维雷达图（使用 Recharts）。
- `AdminForm`：公司/维度/口碑表单。

---

## 六、非功能需求

| 需求项 | 说明 |
| --- | --- |
| 性能 | 搜索 < 2s；详情页 < 3s；首屏 SSR。 |
| 兼容性 | Chrome/Firefox/Safari/Edge 最新两版；移动端浏览器适配。 |
| 安全 | 后台接口 JWT 鉴权；密码 bcrypt；SQL 注入由 ORM 防护。 |
| 可扩展性 | 六维度配置化，新增维度无需改表结构；API 版本控制。 |
| 可维护性 | Monorepo 结构；共享 types/constants；统一 ESLint/Prettier。 |

---

## 七、验收清单（Phase 1）

- [ ] 可执行 PRD 已输出并通过评审。
- [ ] Docker Compose 可一键启动 MySQL + Redis + 后端 + 前端开发服务。
- [ ] 2-3 家 Demo 公司种子数据已写入数据库。
- [ ] 公司搜索、详情、红绿灯、真实时薪、对比流程在 Web 端可交互。
- [ ] 后台管理可完成公司/维度/口碑的增删改查与审核。
- [ ] 所有 API 可通过 OpenAPI（/docs）调试。
- [ ] 单元测试覆盖核心计算逻辑（真实时薪、红绿灯判定）。

---

## 八、项目目录约定

```
zjob-monorepo/
├── docker-compose.yml
├── README.md
├── packages/shared/              # 跨端共享类型与常量（Phase 1 供 web/server 引用）
│   ├── types/
│   │   ├── company.ts
│   │   ├── dimension.ts
│   │   └── api.ts
│   └── constants/
│       └── dimensions.ts
├── server/                       # FastAPI 后端
│   ├── app/
│   │   ├── main.py
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routers/
│   │   ├── services/
│   │   └── dependencies.py
│   ├── alembic/
│   ├── seed/
│   │   └── seed_companies.json
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
├── web/                          # Next.js 前端
│   ├── app/
│   │   ├── page.tsx              # 搜索首页
│   │   ├── company/[id]/page.tsx
│   │   ├── compare/page.tsx
│   │   ├── admin/
│   │   └── layout.tsx
│   ├── components/
│   ├── stores/
│   ├── lib/
│   ├── Dockerfile
│   └── package.json
└── crawler/                      # 爬虫占位
    ├── scrapers/
    ├── tasks.py
    └── requirements.txt
```
