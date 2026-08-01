from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

import pytest

from app.services.analysis import (
    build_company_analysis,
    build_company_summary,
    build_compare_result,
    calculate_real_hourly_wage,
    determine_traffic_light,
)


@dataclass
class FakeDimension:
    dimension_key: str
    score: int
    level: Optional[str] = None
    summary: Optional[str] = None
    metrics: Optional[Dict[str, Any]] = None


@dataclass
class FakeCompany:
    id: int
    name: str
    short_name: str = ""
    industry: Optional[str] = None
    dimensions: List[FakeDimension] = field(default_factory=list)


def make_company(
    company_id: int = 1,
    name: str = "测试公司",
    industry: str = "测试行业",
    take_home: float = 12000.0,
    overtime_hours: float = 40.0,
) -> FakeCompany:
    return FakeCompany(
        id=company_id,
        name=name,
        short_name=name,
        industry=industry,
        dimensions=[
            FakeDimension(
                dimension_key="compensation",
                score=70,
                level="yellow",
                metrics={
                    "real_salary_range": {
                        "median_monthly_take_home": take_home,
                        "range": "8000-16000",
                    }
                },
            ),
            FakeDimension(
                dimension_key="worklife",
                score=65,
                level="yellow",
                metrics={"avg_overtime_hours": overtime_hours},
            ),
            FakeDimension(
                dimension_key="basic",
                score=85,
                level="green",
                summary="基本面稳健",
                metrics={"scale_level": "中厂", "listed_info": "已上市"},
            ),
            FakeDimension(
                dimension_key="reputation",
                score=75,
                level="yellow",
                summary="口碑分化",
            ),
            FakeDimension(
                dimension_key="growth",
                score=80,
                level="green",
                metrics={"track_potential": "高", "promotion_path": "双通道"},
            ),
            FakeDimension(
                dimension_key="welfare",
                score=72,
                level="yellow",
            ),
        ],
    )


class TestTrafficLight:
    def test_green(self):
        assert determine_traffic_light(80) == "green"
        assert determine_traffic_light(95) == "green"

    def test_yellow(self):
        assert determine_traffic_light(60) == "yellow"
        assert determine_traffic_light(79) == "yellow"

    def test_red(self):
        assert determine_traffic_light(59) == "red"
        assert determine_traffic_light(0) == "red"


class TestRealHourlyWage:
    def test_formula(self):
        company = make_company(take_home=18500, overtime_hours=40)
        result = calculate_real_hourly_wage(company, industry_p50_hourly=75.0)

        # 真实时薪 = 18500 / (21.75 * 8 + 40) ≈ 84.1
        expected_hours = 21.75 * 8 + 40
        expected_hourly = round(18500 / expected_hours, 1)

        assert result.monthly_take_home == 18500.0
        assert result.monthly_work_hours == round(expected_hours, 1)
        assert result.hourly_wage == expected_hourly
        assert result.industry_p50_hourly == 75.0
        assert result.percentile == 65
        assert "高于行业 P50" in result.verdict

    def test_below_p50(self):
        company = make_company(take_home=8000, overtime_hours=60)
        result = calculate_real_hourly_wage(company, industry_p50_hourly=70.0)

        assert result.hourly_wage < 70.0
        assert result.percentile == 25
        assert "低于行业 P50" in result.verdict

    def test_default_industry_p50_for_manufacturing(self):
        company = make_company(industry="电子制造", take_home=12000, overtime_hours=30)
        result = calculate_real_hourly_wage(company)

        assert result.industry_p50_hourly == 50.0


class TestCompanySummary:
    def test_overall_score_and_dimensions(self):
        company = make_company()
        summary = build_company_summary(company)

        assert summary.company_id == company.id
        assert summary.name == company.name
        # 平均分 = (70+65+85+75+80+72) / 6 = 447 / 6 = 74.5 -> 75
        assert summary.overall_score == 75
        assert len(summary.dimensions) == 6

        keys = {d.key for d in summary.dimensions}
        assert keys == {"basic", "compensation", "welfare", "worklife", "growth", "reputation"}

        compensation_dim = next(d for d in summary.dimensions if d.key == "compensation")
        assert compensation_dim.score == 70
        assert compensation_dim.level == "yellow"

    def test_missing_dimension_defaults_to_red(self):
        company = FakeCompany(id=2, name="不完整公司", dimensions=[])
        summary = build_company_summary(company)

        assert summary.overall_score == 0
        assert all(d.level == "red" and d.score == 0 for d in summary.dimensions)


class TestCompanyAnalysis:
    def test_analysis_structure(self):
        company = make_company()
        analysis = build_company_analysis(company, industry_p50_hourly=70.0)

        assert analysis.company_id == company.id
        assert analysis.real_hourly_wage.hourly_wage > 0
        assert analysis.surface_vs_kitchen.surface != ""
        assert analysis.surface_vs_kitchen.kitchen != ""
        assert analysis.growth_forecast_3y.track_potential == "高"


class TestCompare:
    def test_compare_result(self):
        c1 = make_company(company_id=1, name="公司A")
        c2 = make_company(company_id=2, name="公司B")
        result = build_compare_result([c1, c2])

        assert len(result.companies) == 2
        assert result.dimension_keys == [
            "basic",
            "compensation",
            "welfare",
            "worklife",
            "growth",
            "reputation",
        ]
        assert result.companies[0].name == "公司A"
        assert result.companies[1].name == "公司B"
