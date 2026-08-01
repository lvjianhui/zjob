from typing import Any, Dict, List, Optional

from app.models.company import Company
from app.models.dimension_data import DIMENSION_KEYS, DIMENSION_LABELS
from app.schemas.analysis import (
    CompanyAnalysisResponse,
    GrowthForecast3Y,
    RealHourlyWage,
    SurfaceVsKitchen,
)
from app.schemas.compare import CompareCompanyItem, CompareResponse
from app.schemas.dimension import CompanySummaryResponse, DimensionSummaryItem


def determine_traffic_light(score: int) -> str:
    if score >= 80:
        return "green"
    if score >= 60:
        return "yellow"
    return "red"


def _get_dimension_metric(company: Company, key: str, metric_name: str) -> Any:
    for dim in company.dimensions:
        if dim.dimension_key == key and dim.metrics:
            return dim.metrics.get(metric_name)
    return None


def _get_dimension_summary(company: Company, key: str) -> str:
    for dim in company.dimensions:
        if dim.dimension_key == key and dim.summary:
            return dim.summary
    return ""


def calculate_real_hourly_wage(
    company: Company,
    industry_p50_hourly: Optional[float] = None,
) -> RealHourlyWage:
    compensation_metrics = (
        _get_dimension_metric(company, "compensation", "real_salary_range") or {}
    )
    worklife_metrics = _get_dimension_metric(company, "worklife", "avg_overtime_hours")

    monthly_take_home = float(compensation_metrics.get("median_monthly_take_home", 12000))
    avg_overtime_hours = worklife_metrics if isinstance(worklife_metrics, (int, float)) else 40.0

    # 标准月工时：21.75 天 * 8 小时 + 月均加班小时
    monthly_work_hours = 21.75 * 8 + float(avg_overtime_hours)
    hourly_wage = monthly_take_home / monthly_work_hours if monthly_work_hours > 0 else 0.0

    if industry_p50_hourly is None:
        # 根据行业给一个简化基准
        industry_p50_hourly = 50.0 if "制造" in (company.industry or "") else 70.0

    if hourly_wage >= industry_p50_hourly * 1.2:
        percentile = 75
        verdict = "高薪伴随高强度加班，真实时薪仍显著高于行业 P50"
    elif hourly_wage >= industry_p50_hourly:
        percentile = 60
        verdict = "真实时薪高于行业 P50，但加班强度不可忽视"
    elif hourly_wage >= industry_p50_hourly * 0.8:
        percentile = 40
        verdict = "真实时薪接近行业 P50，性价比一般"
    else:
        percentile = 25
        verdict = "表面薪资可观，但折算真实时薪后低于行业 P50"

    return RealHourlyWage(
        monthly_take_home=monthly_take_home,
        monthly_work_hours=round(monthly_work_hours, 1),
        hourly_wage=round(hourly_wage, 1),
        industry_p50_hourly=industry_p50_hourly,
        percentile=percentile,
        verdict=verdict,
    )


def build_surface_vs_kitchen(company: Company) -> SurfaceVsKitchen:
    basic_summary = _get_dimension_summary(company, "basic")
    reputation_summary = _get_dimension_summary(company, "reputation")

    surface = basic_summary or f"{company.name} 为行业知名公司"
    kitchen = reputation_summary or "内部反馈褒贬不一，需关注岗位差异"

    insight = "品牌光环与实际工作强度并存，建议结合真实时薪与岗位具体情况判断"
    if company.industry:
        insight = f"{company.industry} 赛道竞争激烈，{insight}"

    return SurfaceVsKitchen(surface=surface, kitchen=kitchen, insight=insight)


def build_growth_forecast(company: Company) -> GrowthForecast3Y:
    growth_metrics = _get_dimension_metric(company, "growth", "track_potential") or "中"
    promotion_path = _get_dimension_metric(company, "growth", "promotion_path") or "晋升路径待核实"

    track_potential = str(growth_metrics)
    forecast = "3 年后具备行业平均水平竞争力"
    if track_potential == "高":
        forecast = "3 年后具备行业溢价能力，跳槽空间较大"
    elif track_potential == "低":
        forecast = "3 年后成长空间有限，需警惕技能停滞"

    return GrowthForecast3Y(
        track_potential=track_potential,
        promotion_path=promotion_path,
        forecast=forecast,
    )


def build_company_analysis(
    company: Company,
    industry_p50_hourly: Optional[float] = None,
) -> CompanyAnalysisResponse:
    return CompanyAnalysisResponse(
        company_id=company.id,
        real_hourly_wage=calculate_real_hourly_wage(company, industry_p50_hourly),
        surface_vs_kitchen=build_surface_vs_kitchen(company),
        growth_forecast_3y=build_growth_forecast(company),
    )


def build_company_summary(company: Company) -> CompanySummaryResponse:
    dimensions: List[DimensionSummaryItem] = []
    total_score = 0
    count = 0

    existing = {dim.dimension_key: dim for dim in company.dimensions}

    for key in DIMENSION_KEYS:
        dim = existing.get(key)
        if dim:
            level = dim.level or determine_traffic_light(dim.score)
            score = dim.score
        else:
            level = "red"
            score = 0

        dimensions.append(
            DimensionSummaryItem(
                key=key,
                label=DIMENSION_LABELS[key],
                level=level,
                score=score,
            )
        )
        total_score += score
        count += 1

    overall_score = round(total_score / count) if count > 0 else 0

    return CompanySummaryResponse(
        company_id=company.id,
        name=company.name,
        overall_score=overall_score,
        dimensions=dimensions,
    )


def build_compare_result(companies: List[Company]) -> CompareResponse:
    items: List[CompareCompanyItem] = []

    for company in companies:
        summary = build_company_summary(company)
        items.append(
            CompareCompanyItem(
                company_id=company.id,
                name=company.name,
                short_name=company.short_name,
                industry=company.industry or "",
                overall_score=summary.overall_score,
                dimensions=summary.dimensions,
            )
        )

    return CompareResponse(
        companies=items,
        dimension_keys=DIMENSION_KEYS,
    )
