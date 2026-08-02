import logging
from contextlib import asynccontextmanager

import sqlalchemy as sa
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.core.response import BizException, error, success
from app.core.security import get_password_hash
from app.db.base import Base
from app.db.session import engine
from app.models import User
from app.routers import admin_router, auth_router, companies_router, favorites_router

settings = get_settings()
logger = logging.getLogger(__name__)


async def init_db() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def seed_default_companies() -> None:
    """服务启动时若公司表为空，自动导入种子数据。"""
    import json
    from datetime import date as date_type
    from pathlib import Path

    from app.db.session import AsyncSessionLocal
    from app.models import Company, DimensionData, Review

    seed_file = Path(__file__).resolve().parent.parent / "seed" / "seed_companies.json"
    if not seed_file.exists():
        logger.info("种子数据文件不存在，跳过自动导入: %s", seed_file)
        return

    async with AsyncSessionLocal() as session:
        result = await session.execute(sa.select(sa.func.count()).select_from(Company))
        count = result.scalar()
        if count > 0:
            logger.info("公司表已有 %d 条数据，跳过种子导入", count)
            return

        with open(seed_file, "r", encoding="utf-8") as f:
            companies = json.load(f)

        inserted = 0
        for item in companies:
            dimensions = item.pop("dimensions", [])
            reviews_data = item.pop("reviews", [])

            company = Company(**item)
            session.add(company)
            await session.flush()

            for dim in dimensions:
                session.add(DimensionData(company_id=company.id, **dim))

            for rev in reviews_data:
                published_at = rev.pop("published_at", None)
                if published_at and isinstance(published_at, str):
                    rev["published_at"] = date_type.fromisoformat(published_at)
                session.add(Review(company_id=company.id, **rev))

            inserted += 1

        await session.commit()
        logger.info("种子数据导入完成，共 %d 家公司", inserted)


async def seed_admin_user() -> None:
    from app.db.session import AsyncSessionLocal

    async with AsyncSessionLocal() as session:
        result = await session.execute(
            sa.select(User).where(User.username == settings.admin_username)
        )
        if result.scalar_one_or_none() is None:
            admin = User(
                username=settings.admin_username,
                hashed_password=get_password_hash(settings.admin_password),
                role="admin",
                is_active=True,
            )
            session.add(admin)
            await session.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await seed_admin_user()
    await seed_default_companies()
    yield


app = FastAPI(
    title=settings.project_name,
    version=settings.version,
    description=settings.description,
    debug=settings.debug,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# 全局异常处理器 —— 统一输出 {code, msg, data}
# ---------------------------------------------------------------------------


@app.exception_handler(BizException)
async def biz_exception_handler(request: Request, exc: BizException) -> JSONResponse:
    """业务异常：使用自定义 code 和 msg。"""
    return JSONResponse(status_code=200, content=error(exc.code, exc.msg, exc.data))


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """兜底处理仍用 HTTPException 的地方，映射为统一格式。"""
    return JSONResponse(
        status_code=200,
        content=error(exc.status_code, str(exc.detail)),
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """请求参数校验失败。"""
    errors = exc.errors()
    # 取第一条错误信息作为 msg，方便前端弹窗展示
    if errors:
        first = errors[0]
        loc = ".".join(str(p) for p in first.get("loc", []))
        msg = f"{loc}: {first.get('msg', '参数校验失败')}"
    else:
        msg = "参数校验失败"
    return JSONResponse(status_code=200, content=error(422, msg))


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """未捕获异常，防止向前端泄露堆栈。"""
    logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=200,
        content=error(500, "服务器内部错误"),
    )


# ---------------------------------------------------------------------------
# 路由
# ---------------------------------------------------------------------------

app.include_router(auth_router)
app.include_router(companies_router)
app.include_router(admin_router)
app.include_router(favorites_router)


@app.get("/health", tags=["健康检查"])
async def health_check() -> dict:
    return success({"status": "ok", "version": settings.version})
