import json
import os
from functools import lru_cache
from typing import Any
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    project_name: str = "真职 Zjob API"
    version: str = "0.1.0"
    description: str = "真职（Zjob）Phase 1 后端服务"
    debug: bool = False

    secret_key: str = "change-me"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    database_url: str = "postgresql+asyncpg://zjob:zjob_password@postgres:5432/zjob_db"

    @field_validator("database_url", mode="before")
    @classmethod
    def fix_database_url(cls, v):
        """自动修正连接串为 asyncpg 兼容格式（处理 Neon 等平台默认的 postgresql:// + sslmode 参数）"""
        if not isinstance(v, str):
            return v
        v = v.strip()

        # 1. 添加 asyncpg 方言前缀
        if v.startswith("postgresql://"):
            v = "postgresql+asyncpg://" + v[len("postgresql://"):]
        elif v.startswith("postgres://"):
            v = "postgresql+asyncpg://" + v[len("postgres://"):]

        # 2. 移除 sslmode 参数（asyncpg 使用 ssl 参数，且默认自动协商 SSL）
        parsed = urlparse(v)
        if parsed.query:
            qs = parse_qs(parsed.query, keep_blank_values=True)
            qs.pop("sslmode", None)
            # 重建查询字符串，每个参数只取第一个值
            flat = {k: v[0] for k, v in qs.items()}
            new_query = urlencode(flat) if flat else ""
            v = urlunparse(parsed._replace(query=new_query))

        return v

    admin_username: str = "admin"
    admin_password: str = "zjob_admin"

    # CORS 允许来源
    # 支持两种格式:
    #   1. JSON 数组: ORIGINS=["https://a.com","https://b.com"]
    #   2. 逗号分隔: ORIGINS=https://a.com,https://b.com
    #   3. 留空或不设: 默认允许所有来源 ["*"]
    # 类型声明为 Any，避免 pydantic_settings 在 validator 前自动 JSON 解析空字符串
    origins: Any = ["*"]

    @field_validator("origins", mode="before")
    @classmethod
    def parse_origins(cls, v):
        if isinstance(v, str):
            v = v.strip()
            if not v:
                return ["*"]
            # 尝试 JSON 解析
            if v.startswith("["):
                try:
                    return json.loads(v)
                except json.JSONDecodeError:
                    pass
            # 逗号分隔解析
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v


@lru_cache
def get_settings() -> Settings:
    return Settings()
