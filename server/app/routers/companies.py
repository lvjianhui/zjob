import sqlalchemy as sa
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.response import BizException, success
from app.db.session import get_db
from app.models.company import Company
from app.models.dimension_data import DIMENSION_KEYS
from app.models.review import Review
from app.schemas.company import CompanyListItem, CompanyResponse
from app.schemas.compare import CompareRequest
from app.schemas.dimension import CompanyDimensionsResponse, CompanySummaryResponse
from app.schemas.review import ReviewResponse
from app.services.analysis import (
    build_company_analysis,
    build_company_summary,
    build_compare_result,
)
from app.services.search import search_companies

router = APIRouter(prefix="/api/companies", tags=["公司"])


async def _get_company_or_404(
    db: AsyncSession,
    company_id: int,
) -> Company:
    result = await db.execute(
        sa.select(Company)
        .options(selectinload(Company.dimensions), selectinload(Company.reviews))
        .where(sa.and_(Company.id == company_id, Company.status == "active"))
    )
    company = result.scalar_one_or_none()
    if company is None:
        raise BizException(code=404, msg="公司不存在")
    return company


@router.get("/search")
async def company_search(
    q: str = Query(default="", description="搜索关键词"),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
) -> dict:
    items = await search_companies(db, q=q, limit=limit, offset=offset)
    return success([CompanyListItem.model_validate(c).model_dump() for c in items])


@router.get("/{id}")
async def get_company(
    id: int,
    db: AsyncSession = Depends(get_db),
) -> dict:
    company = await _get_company_or_404(db, id)
    return success(CompanyResponse.model_validate(company).model_dump())


@router.get("/{id}/dimensions")
async def get_company_dimensions(
    id: int,
    db: AsyncSession = Depends(get_db),
) -> dict:
    company = await _get_company_or_404(db, id)
    resp = CompanyDimensionsResponse(
        company_id=company.id,
        name=company.name,
        dimensions=[
            dim
            for dim in company.dimensions
            if dim.dimension_key in DIMENSION_KEYS
        ],
    )
    return success(resp.model_dump())


@router.get("/{id}/summary")
async def get_company_summary(
    id: int,
    db: AsyncSession = Depends(get_db),
) -> dict:
    company = await _get_company_or_404(db, id)
    return success(build_company_summary(company).model_dump())


@router.get("/{id}/analysis")
async def get_company_analysis(
    id: int,
    db: AsyncSession = Depends(get_db),
) -> dict:
    company = await _get_company_or_404(db, id)
    return success(build_company_analysis(company).model_dump())


@router.get("/{id}/reviews")
async def get_company_reviews(
    id: int,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
) -> dict:
    await _get_company_or_404(db, id)
    result = await db.execute(
        sa.select(Review)
        .where(
            sa.and_(
                Review.company_id == id,
                Review.audit_status == "approved",
            )
        )
        .order_by(Review.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    reviews = list(result.scalars().all())
    return success([ReviewResponse.model_validate(r).model_dump() for r in reviews])


@router.post("/compare")
async def compare_companies(
    payload: CompareRequest,
    db: AsyncSession = Depends(get_db),
) -> dict:
    if len(payload.company_ids) != len(set(payload.company_ids)):
        raise BizException(code=400, msg="公司ID不能重复")

    result = await db.execute(
        sa.select(Company)
        .options(selectinload(Company.dimensions))
        .where(
            sa.and_(
                Company.id.in_(payload.company_ids),
                Company.status == "active",
            )
        )
    )
    companies = list(result.scalars().all())

    if len(companies) != len(payload.company_ids):
        raise BizException(code=404, msg="部分公司不存在")

    # 按请求顺序排序
    company_map = {c.id: c for c in companies}
    ordered = [company_map[cid] for cid in payload.company_ids]

    return success(build_compare_result(ordered).model_dump())
