from typing import Any, Dict, List

from pydantic import BaseModel, Field

from app.schemas.dimension import DimensionSummaryItem


class CompareCompanyItem(BaseModel):
    company_id: int
    name: str
    short_name: str
    industry: str
    overall_score: int
    dimensions: List[DimensionSummaryItem]


class CompareRequest(BaseModel):
    company_ids: List[int] = Field(..., min_length=2, max_length=5)


class CompareResponse(BaseModel):
    companies: List[CompareCompanyItem]
    dimension_keys: List[str]
