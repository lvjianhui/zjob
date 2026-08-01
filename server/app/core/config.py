import json
import os
from functools import lru_cache
from typing import List

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

    admin_username: str = "admin"
    admin_password: str = "zjob_admin"

    # CORS 允许来源
    # 支持两种格式:
    #   1. JSON 数组: ORIGINS=["https://a.com","https://b.com"]
    #   2. 逗号分隔: ORIGINS=https://a.com,https://b.com
    #   3. 留空或不设: 默认允许所有来源 ["*"]
    origins: List[str] = ["*"]

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
