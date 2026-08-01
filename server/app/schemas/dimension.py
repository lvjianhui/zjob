from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


class DimensionDataBase(BaseModel):
    dimension_key: str = Field(..., pattern=r"^(basic|compensation|welfare|worklife|growth|reputation)$")
    score: int = Field(..., ge=0, le=100)
    level: str = Field(..., pattern=r"^(green|yellow|red)$")
    summary: Optional[str] = None
    metrics: Optional[Dict[str, Any]] = None
    source_note: Optional[str] = None


class DimensionDataCreate(DimensionDataBase):
    pass


class DimensionDataUpdate(BaseModel):
    score: Optional[int] = Field(None, ge=0, le=100)
    level: Optional[str] = Field(None, pattern=r"^(green|yellow|red)$")
    summary: Optional[str] = None
    metrics: Optional[Dict[str, Any]] = None
    source_note: Optional[str] = None


class DimensionDataResponse(DimensionDataBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    updated_at: datetime


class DimensionSummaryItem(BaseModel):
    key: str
    label: str
    level: str
    score: int


class CompanyDimensionsResponse(BaseModel):
    company_id: int
    name: str
    dimensions: List[DimensionDataResponse]


class CompanySummaryResponse(BaseModel):
    company_id: int
    name: str
    overall_score: int
    dimensions: List[DimensionSummaryItem]
