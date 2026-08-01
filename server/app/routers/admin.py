from datetime import datetime, timezone
from typing import List, Optional

import sqlalchemy as sa
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.response import BizException, success
from app.core.security import get_password_hash
from app.db.session import get_db
from app.dependencies import create_audit_log, get_current_user, require_role
from app.models.audit_log import AuditLog
from app.models.company import Company
from app.models.dimension_data import DIMENSION_KEYS, DimensionData
from app.models.review import Review
from app.models.user import User
from app.schemas.audit_log import AuditLogResponse
from app.schemas.company import CompanyCreate, CompanyResponse, CompanyUpdate
from app.schemas.dimension import (
    CompanyDimensionsResponse,
    DimensionDataCreate,
    DimensionDataResponse,
    DimensionDataUpdate,
)
from app.schemas.review import ReviewCreate, ReviewResponse, ReviewUpdate
from app.schemas.user import UserCreate, UserResponse

router = APIRouter(
    prefix="/api/admin",
    tags=["后台管理"],
    dependencies=[Depends(require_role("admin", "operator"))],
)


async def _get_company_or_404(
    db: AsyncSession,
    company_id: int,
) -> Company:
    result = await db.execute(
        sa.select(Company)
        .options(selectinload(Company.dimensions))
        .where(Company.id == company_id)
    )
    company = result.scalar_one_or_none()
    if company is None:
        raise BizException(code=404, msg="公司不存在")
    return company


async def _get_review_or_404(
    db: AsyncSession,
    review_id: int,
) -> Review:
    result = await db.execute(
        sa.select(Review).where(Review.id == review_id)
    )
    review = result.scalar_one_or_none()
    if review is None:
        raise BizException(code=404, msg="口碑记录不存在")
    return review


# ---------------------------------------------------------------------------
# 公司管理
# ---------------------------------------------------------------------------


@router.get("/companies")
async def list_companies(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
) -> dict:
    result = await db.execute(
        sa.select(Company).order_by(Company.created_at.desc()).limit(limit).offset(offset)
    )
    items = list(result.scalars().all())
    return success([CompanyResponse.model_validate(c).model_dump() for c in items])


@router.post("/companies")
async def create_company(
    payload: CompanyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    company = Company(**payload.model_dump())
    db.add(company)
    await db.commit()
    await db.refresh(company)

    await create_audit_log(
        db,
        user_id=current_user.id,
        action="create",
        target_type="company",
        target_id=company.id,
        detail={"name": company.name},
    )
    return success(CompanyResponse.model_validate(company).model_dump())


@router.get("/companies/{id}")
async def get_company_admin(
    id: int,
    db: AsyncSession = Depends(get_db),
) -> dict:
    company = await _get_company_or_404(db, id)
    return success(CompanyResponse.model_validate(company).model_dump())


@router.put("/companies/{id}")
async def update_company(
    id: int,
    payload: CompanyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    company = await _get_company_or_404(db, id)
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(company, field, value)
    company.updated_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(company)

    await create_audit_log(
        db,
        user_id=current_user.id,
        action="update",
        target_type="company",
        target_id=company.id,
        detail=update_data,
    )
    return success(CompanyResponse.model_validate(company).model_dump())


@router.delete("/companies/{id}")
async def delete_company(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    company = await _get_company_or_404(db, id)
    await db.delete(company)
    await db.commit()

    await create_audit_log(
        db,
        user_id=current_user.id,
        action="delete",
        target_type="company",
        target_id=id,
        detail={"name": company.name},
    )
    return success(None)


# ---------------------------------------------------------------------------
# 维度数据管理
# ---------------------------------------------------------------------------


@router.get("/companies/{id}/dimensions")
async def get_company_dimensions_admin(
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


@router.put("/companies/{id}/dimensions")
async def batch_update_dimensions(
    id: int,
    payload: List[DimensionDataCreate],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    company = await _get_company_or_404(db, id)
    existing = {dim.dimension_key: dim for dim in company.dimensions}

    for item in payload:
        if item.dimension_key in existing:
            dim = existing[item.dimension_key]
            for field, value in item.model_dump().items():
                setattr(dim, field, value)
        else:
            dim = DimensionData(company_id=id, **item.model_dump())
            db.add(dim)

    await db.commit()
    await db.refresh(company)

    await create_audit_log(
        db,
        user_id=current_user.id,
        action="update",
        target_type="dimension",
        target_id=id,
        detail={"dimension_keys": [item.dimension_key for item in payload]},
    )

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


@router.get("/companies/{id}/dimensions/{key}")
async def get_single_dimension(
    id: int,
    key: str,
    db: AsyncSession = Depends(get_db),
) -> dict:
    if key not in DIMENSION_KEYS:
        raise BizException(code=400, msg="无效的维度标识")

    result = await db.execute(
        sa.select(DimensionData).where(
            sa.and_(DimensionData.company_id == id, DimensionData.dimension_key == key)
        )
    )
    dim = result.scalar_one_or_none()
    if dim is None:
        raise BizException(code=404, msg="维度数据不存在")
    return success(DimensionDataResponse.model_validate(dim).model_dump())


@router.put("/companies/{id}/dimensions/{key}")
async def update_single_dimension(
    id: int,
    key: str,
    payload: DimensionDataUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    if key not in DIMENSION_KEYS:
        raise BizException(code=400, msg="无效的维度标识")

    result = await db.execute(
        sa.select(DimensionData).where(
            sa.and_(DimensionData.company_id == id, DimensionData.dimension_key == key)
        )
    )
    dim = result.scalar_one_or_none()

    update_data = payload.model_dump(exclude_unset=True)

    if dim is None:
        if "score" not in update_data or "level" not in update_data:
            raise BizException(code=400, msg="新建维度时 score 和 level 为必填项")
        dim = DimensionData(company_id=id, dimension_key=key, **update_data)
        db.add(dim)
    else:
        for field, value in update_data.items():
            setattr(dim, field, value)
        dim.updated_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(dim)

    await create_audit_log(
        db,
        user_id=current_user.id,
        action="update",
        target_type="dimension",
        target_id=dim.id,
        detail={"company_id": id, "dimension_key": key, **update_data},
    )
    return success(DimensionDataResponse.model_validate(dim).model_dump())


# ---------------------------------------------------------------------------
# 口碑管理
# ---------------------------------------------------------------------------


@router.get("/reviews")
async def list_reviews(
    company_id: Optional[int] = Query(default=None),
    audit_status: Optional[str] = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
) -> dict:
    filters = []
    if company_id is not None:
        filters.append(Review.company_id == company_id)
    if audit_status is not None:
        filters.append(Review.audit_status == audit_status)

    query = sa.select(Review).order_by(Review.created_at.desc())
    if filters:
        query = query.where(sa.and_(*filters))

    result = await db.execute(query.limit(limit).offset(offset))
    reviews = list(result.scalars().all())
    return success([ReviewResponse.model_validate(r).model_dump() for r in reviews])


@router.post("/reviews")
async def create_review(
    payload: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    company = await _get_company_or_404(db, payload.company_id)
    review = Review(**payload.model_dump())
    db.add(review)
    await db.commit()
    await db.refresh(review)

    await create_audit_log(
        db,
        user_id=current_user.id,
        action="create",
        target_type="review",
        target_id=review.id,
        detail={"company_id": company.id, "source": review.source},
    )
    return success(ReviewResponse.model_validate(review).model_dump())


@router.get("/reviews/{id}")
async def get_review_admin(
    id: int,
    db: AsyncSession = Depends(get_db),
) -> dict:
    review = await _get_review_or_404(db, id)
    return success(ReviewResponse.model_validate(review).model_dump())


@router.put("/reviews/{id}")
async def update_review(
    id: int,
    payload: ReviewUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    review = await _get_review_or_404(db, id)
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(review, field, value)

    await db.commit()
    await db.refresh(review)

    await create_audit_log(
        db,
        user_id=current_user.id,
        action="approve" if "audit_status" in update_data else "update",
        target_type="review",
        target_id=review.id,
        detail=update_data,
    )
    return success(ReviewResponse.model_validate(review).model_dump())


@router.delete("/reviews/{id}")
async def delete_review(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    review = await _get_review_or_404(db, id)
    await db.delete(review)
    await db.commit()

    await create_audit_log(
        db,
        user_id=current_user.id,
        action="delete",
        target_type="review",
        target_id=id,
        detail={"company_id": review.company_id},
    )
    return success(None)


# ---------------------------------------------------------------------------
# 操作日志
# ---------------------------------------------------------------------------


@router.get("/audit-logs")
async def list_audit_logs(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
) -> dict:
    result = await db.execute(
        sa.select(AuditLog, User.username)
        .outerjoin(User, AuditLog.user_id == User.id)
        .order_by(AuditLog.created_at.desc())
        .limit(limit)
        .offset(offset)
    )

    response: List[dict] = []
    for log, username in result.all():
        response.append(
            AuditLogResponse(
                id=log.id,
                user_id=log.user_id,
                username=username,
                action=log.action,
                target_type=log.target_type,
                target_id=log.target_id,
                detail=log.detail,
                created_at=log.created_at,
            ).model_dump()
        )
    return success(response)


# ---------------------------------------------------------------------------
# 运营账号管理（仅 admin）
# ---------------------------------------------------------------------------


@router.post(
    "/users",
    dependencies=[Depends(require_role("admin"))],
)
async def create_user(
    payload: UserCreate,
    db: AsyncSession = Depends(get_db),
) -> dict:
    existing = await db.execute(
        sa.select(User).where(User.username == payload.username)
    )
    if existing.scalar_one_or_none() is not None:
        raise BizException(code=409, msg="用户名已存在")

    user = User(
        username=payload.username,
        hashed_password=get_password_hash(payload.password),
        role=payload.role,
        is_active=payload.is_active,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return success(UserResponse.model_validate(user).model_dump())
