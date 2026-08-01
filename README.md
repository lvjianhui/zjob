# 真职（Zjob）— Phase 1 Web MVP

真职（Zjob）是一款面向求职者及其家属的公司信息查询与评估工具。本项目为 Phase 1 可执行版：Web 端 MVP，覆盖 2-3 家 Demo 公司，验证六维度整合查询与交叉验证的产品形态。

---

## 项目结构

```
.
├── docker-compose.yml          # 一键启动 PostgreSQL + 后端 + 前端
├── .env.example                # 环境变量示例
├── README.md                   # 本文件
├── docs/                       # 产品文档
├── packages/shared/            # 跨端共享类型与常量（预留）
├── server/                     # FastAPI 后端
├── web/                        # Next.js 14 前端
└── crawler/                    # 爬虫引擎占位
```

---

## 快速开始

### 1. 环境准备

- Python 3.12、Node.js 20
- PostgreSQL 16（macOS 推荐 `brew install postgresql@16`）

### 2. 启动全栈（本地终端）

```bash
./scripts/setup.sh     # 首次：初始化 .env 并安装依赖
./scripts/start-all.sh # 启动 PostgreSQL + 后端 + 前端
```

macOS 下会自动打开两个新的 Terminal 标签页分别运行后端与前端；数据库在后台启动。

首次启动后，建议导入 Demo 数据：

```bash
./scripts/seed.sh
```

访问：
- Web 前端：http://localhost:3000
- 后端 API：http://localhost:8000
- API 文档：http://localhost:8000/docs

默认后台账号：`admin` / `zjob_admin`

### 3. 手动本地开发

**后端**

```bash
cd server
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
# 修改 .env 中的 DATABASE_URL 指向本地服务
uvicorn app.main:app --reload
```

导入种子数据：

```bash
cd server
python seed/seed.py
```

**前端**

```bash
cd web
npm install
# 修改 .env.local 中的 NEXT_PUBLIC_API_BASE_URL
npm run dev
```

---

## 核心功能

- **公司搜索**：按名称关键词搜索，支持热门公司推荐。
- **六维度详情**：企业基本面、薪酬竞争力、福利保障、工作节奏、成长与制度、真实口碑。
- **六维红绿灯**：一眼识别各维度风险等级。
- **真实时薪**：交叉验证薪资与加班强度，计算真实时薪。
- **公司对比**：2-5 家公司六维度横向对比。
- **后台管理**：公司/维度/口碑的录入、编辑、审核与操作日志。

---

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 前端 | Next.js 14 + React 18 + TypeScript + Tailwind CSS + Zustand |
| 后端 | Python 3.12 + FastAPI + SQLAlchemy 2.x + Pydantic v2 |
| 数据库 | PostgreSQL 16 |
| 采集 | Playwright + Scrapy（Phase 1 占位） |
| 部署 | Docker + Docker Compose |

---

## 文档

- [可执行版产品 PRD](./docs/Zjob-产品需求文档-可执行版.md)
- [产品需求文档](./docs/真职(Zjob)-产品需求文档.md)
- [多端开发计划](./docs/真职(Zjob)-开发计划.md)

---

## 注意事项

- Phase 1 以 Demo 验证为主，公司数据为手造种子数据，未接入正式爬虫。
- 小程序与 APP 端在 Phase 2/3 实现，当前 Web 端为唯一前端。
- 生产部署前务必修改 `SECRET_KEY`、数据库密码等敏感配置。
