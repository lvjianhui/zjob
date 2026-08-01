import os
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import get_settings

settings = get_settings()

# 检测是否运行在 Serverless 环境（Vercel 自动设置 VERCEL 环境变量）
# Serverless 环境下每次请求可能在不同实例执行，不适合保持连接池
_IS_SERVERLESS = bool(os.environ.get("VERCEL"))

engine = create_async_engine(
    settings.database_url,
    # 连接池配置
    # - 传统部署（Render / Docker）: pool_size=5, 适合长连接
    # - Serverless 部署（Vercel）: pool_size=0, 每次请求新建连接，用完即释放
    pool_size=0 if _IS_SERVERLESS else 5,
    max_overflow=0 if _IS_SERVERLESS else 10,
    pool_pre_ping=True,
    pool_recycle=300,  # 5 分钟回收连接，防止云端 PG 主动断开
    future=True,
    echo=settings.debug,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
