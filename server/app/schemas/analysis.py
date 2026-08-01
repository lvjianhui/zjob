from typing import Optional

from pydantic import BaseModel


class RealHourlyWage(BaseModel):
    monthly_take_home: float
    monthly_work_hours: float
    hourly_wage: float
    industry_p50_hourly: float
    percentile: int
    verdict: str


class SurfaceVsKitchen(BaseModel):
    surface: str
    kitchen: str
    insight: str


class GrowthForecast3Y(BaseModel):
    track_potential: str
    promotion_path: str
    forecast: str


class CompanyAnalysisResponse(BaseModel):
    company_id: int
    real_hourly_wage: RealHourlyWage
    surface_vs_kitchen: SurfaceVsKitchen
    growth_forecast_3y: GrowthForecast3Y
