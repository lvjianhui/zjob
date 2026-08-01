from typing import List

import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.company import Company


async def search_companies(
    session: AsyncSession,
    q: str = "",
    limit: int = 20,
    offset: int = 0,
) -> List[Company]:
    query = (
        sa.select(Company)
        .options(selectinload(Company.dimensions))
        .where(Company.status == "active")
        .order_by(Company.created_at.desc())
        .limit(limit)
        .offset(offset)
    )

    if q:
        keyword = f"%{q}%"
        query = query.where(
            sa.or_(
                Company.name.ilike(keyword),
                Company.short_name.ilike(keyword),
                Company.en_name.ilike(keyword),
            )
        )

    result = await session.execute(query)
    return list(result.scalars().all())
