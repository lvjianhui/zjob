#!/usr/bin/env python3
"""
真职（Zjob）Phase 1 种子数据导入脚本。

用法：
    cd zjob-monorepo/server
    python seed/seed.py
"""

import asyncio
import json
import os
import sys
from datetime import date
from pathlib import Path

# 确保能导入 app 包
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import Base
from app.db.session import AsyncSessionLocal, engine
from app.models import Company, DimensionData, Review


SEED_FILE = Path(__file__).resolve().parent / "seed_companies.json"


def parse_date(value: str | None) -> date | None:
    if not value:
        return None
    return date.fromisoformat(value)


async def seed_companies(session: AsyncSession, force: bool = False) -> int:
    with open(SEED_FILE, "r", encoding="utf-8") as f:
        companies = json.load(f)

    count = 0
    for item in companies:
        name = item["name"]
        existing = await session.execute(
            sa.select(Company).where(Company.name == name)
        )
        if existing.scalar_one_or_none() is not None and not force:
            print(f"[skip] 公司已存在: {name}")
            continue

        dimensions = item.pop("dimensions", [])
        reviews = item.pop("reviews", [])

        company = Company(**item)
        session.add(company)
        await session.flush()  # 获取 company.id

        for dim in dimensions:
            session.add(
                DimensionData(
                    company_id=company.id,
                    dimension_key=dim["dimension_key"],
                    score=dim["score"],
                    level=dim["level"],
                    summary=dim.get("summary"),
                    metrics=dim.get("metrics"),
                    source_note=dim.get("source_note"),
                )
            )

        for rev in reviews:
            session.add(
                Review(
                    company_id=company.id,
                    source=rev["source"],
                    sentiment=rev["sentiment"],
                    content_summary=rev.get("content_summary"),
                    original_url=rev.get("original_url"),
                    published_at=parse_date(rev.get("published_at")),
                    audit_status=rev.get("audit_status", "approved"),
                )
            )

        count += 1
        print(f"[insert] {name}: {len(dimensions)} 维度, {len(reviews)} 口碑")

    await session.commit()
    return count


async def main() -> None:
    force = "--force" in sys.argv

    # 创建表（如果不存在）
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        inserted = await seed_companies(session, force=force)
        print(f"\n共导入 {inserted} 家公司")


if __name__ == "__main__":
    asyncio.run(main())
