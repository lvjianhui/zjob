from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


class CompanyBase(BaseModel):
    name: str
    short_name: str
    en_name: Optional[str] = None
    industry: Optional[str] = None
    scale: Optional[str] = None
    location: Optional[str] = None
    logo_url: Optional[str] = None
    is_listed: bool = False
    stock_code: Optional[str] = None
    fortune500_trend: Optional[Dict[str, Any]] = None
    industry_ranking: Optional[str] = None
    tags: Optional[List[str]] = None
    status: str = "active"
    source_urls: Optional[Dict[str, Any]] = None


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    short_name: Optional[str] = None
    en_name: Optional[str] = None
    industry: Optional[str] = None
    scale: Optional[str] = None
    location: Optional[str] = None
    logo_url: Optional[str] = None
    is_listed: Optional[bool] = None
    stock_code: Optional[str] = None
    fortune500_trend: Optional[Dict[str, Any]] = None
    industry_ranking: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = None
    source_urls: Optional[Dict[str, Any]] = None


class CompanyResponse(CompanyBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class CompanyListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    short_name: str
    industry: Optional[str] = None
    scale: Optional[str] = None
    location: Optional[str] = None
    logo_url: Optional[str] = None
    tags: Optional[List[str]] = None
    status: str
