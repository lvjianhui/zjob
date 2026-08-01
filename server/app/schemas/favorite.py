from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class FavoriteItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    company_id: int
    created_at: datetime
    # Nested company fields joined in service
    company_name: Optional[str] = None
    company_short_name: Optional[str] = None
    company_industry: Optional[str] = None


class FavoriteCreateRequest(BaseModel):
    company_id: int


class FavoriteToggleRequest(BaseModel):
    company_id: int


class FavoriteToggleResponse(BaseModel):
    favorited: bool
    company_id: int
