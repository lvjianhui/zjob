from typing import List

import sqlalchemy as sa
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.response import BizException, success
from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.company import Company
from app.models.favorite import Favorite
from app.models.user import User
from app.schemas.favorite import (
    FavoriteCreateRequest,
    FavoriteItemResponse,
    FavoriteToggleRequest,
    FavoriteToggleResponse,
)

router = APIRouter(prefix="/api/favorites", tags=["收藏"])


@router.get("")
async def list_favorites(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """获取当前用户的收藏列表，按收藏时间倒序"""
    result = await db.execute(
        sa.select(Favorite, Company)
        .join(Company, Favorite.company_id == Company.id)
        .where(Favorite.user_id == current_user.id)
        .order_by(Favorite.created_at.desc())
    )
    rows = result.all()
    items: List[dict] = []
    for fav, company in rows:
        items.append(
            FavoriteItemResponse(
                id=fav.id,
                user_id=fav.user_id,
                company_id=fav.company_id,
                created_at=fav.created_at,
                company_name=company.name,
                company_short_name=company.short_name,
                company_industry=company.industry,
            ).model_dump()
        )
    return success(items)


@router.get("/check/{company_id}")
async def check_favorite(
    company_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """检查某公司是否已被当前用户收藏"""
    result = await db.execute(
        sa.select(Favorite).where(
            sa.and_(
                Favorite.user_id == current_user.id,
                Favorite.company_id == company_id,
            )
        )
    )
    fav = result.scalar_one_or_none()
    resp = FavoriteToggleResponse(
        favorited=fav is not None,
        company_id=company_id,
    )
    return success(resp.model_dump())


@router.post("")
async def add_favorite(
    payload: FavoriteCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """新增收藏（若已存在则直接返回现有记录）"""
    # 检查公司是否存在
    company = (
        await db.execute(
            sa.select(Company).where(Company.id == payload.company_id)
        )
    ).scalar_one_or_none()
    if company is None:
        raise BizException(code=404, msg="公司不存在")

    # 检查是否已收藏
    existing = (
        await db.execute(
            sa.select(Favorite).where(
                sa.and_(
                    Favorite.user_id == current_user.id,
                    Favorite.company_id == payload.company_id,
                )
            )
        )
    ).scalar_one_or_none()
    if existing is not None:
        resp = FavoriteItemResponse(
            id=existing.id,
            user_id=existing.user_id,
            company_id=existing.company_id,
            created_at=existing.created_at,
            company_name=company.name,
            company_short_name=company.short_name,
            company_industry=company.industry,
        )
        return success(resp.model_dump())

    fav = Favorite(user_id=current_user.id, company_id=payload.company_id)
    db.add(fav)
    await db.commit()
    await db.refresh(fav)

    resp = FavoriteItemResponse(
        id=fav.id,
        user_id=fav.user_id,
        company_id=fav.company_id,
        created_at=fav.created_at,
        company_name=company.name,
        company_short_name=company.short_name,
        company_industry=company.industry,
    )
    return success(resp.model_dump())


@router.post("/toggle")
async def toggle_favorite(
    payload: FavoriteToggleRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """切换收藏状态：已收藏则取消，未收藏则新增"""
    company = (
        await db.execute(
            sa.select(Company).where(Company.id == payload.company_id)
        )
    ).scalar_one_or_none()
    if company is None:
        raise BizException(code=404, msg="公司不存在")

    existing = (
        await db.execute(
            sa.select(Favorite).where(
                sa.and_(
                    Favorite.user_id == current_user.id,
                    Favorite.company_id == payload.company_id,
                )
            )
        )
    ).scalar_one_or_none()

    if existing is not None:
        await db.delete(existing)
        await db.commit()
        return success(FavoriteToggleResponse(
            favorited=False,
            company_id=payload.company_id,
        ).model_dump())

    fav = Favorite(user_id=current_user.id, company_id=payload.company_id)
    db.add(fav)
    await db.commit()
    return success(FavoriteToggleResponse(
        favorited=True,
        company_id=payload.company_id,
    ).model_dump())


@router.delete("/{company_id}")
async def remove_favorite(
    company_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """取消对某公司的收藏"""
    fav = (
        await db.execute(
            sa.select(Favorite).where(
                sa.and_(
                    Favorite.user_id == current_user.id,
                    Favorite.company_id == company_id,
                )
            )
        )
    ).scalar_one_or_none()
    if fav is None:
        raise BizException(code=404, msg="收藏记录不存在")
    await db.delete(fav)
    await db.commit()
    return success(None)
