from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ReviewBase(BaseModel):
    source: str = Field(..., pattern=r"^(maimai|kanzhun|zhihu|xiaohongshu|linkedin|other)$")
    sentiment: str = Field(..., pattern=r"^(positive|neutral|negative)$")
    content_summary: Optional[str] = None
    original_url: Optional[str] = None
    published_at: Optional[date] = None
    audit_status: str = Field(default="pending", pattern=r"^(pending|approved|rejected)$")


class ReviewCreate(ReviewBase):
    company_id: int


class ReviewUpdate(BaseModel):
    source: Optional[str] = Field(None, pattern=r"^(maimai|kanzhun|zhihu|xiaohongshu|linkedin|other)$")
    sentiment: Optional[str] = Field(None, pattern=r"^(positive|neutral|negative)$")
    content_summary: Optional[str] = None
    original_url: Optional[str] = None
    published_at: Optional[date] = None
    audit_status: Optional[str] = Field(None, pattern=r"^(pending|approved|rejected)$")


class ReviewResponse(ReviewBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    created_at: datetime
