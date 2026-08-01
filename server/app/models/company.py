from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.dimension_data import DimensionData
    from app.models.review import Review


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[int] = mapped_column(sa.Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(sa.String(128), nullable=False)
    short_name: Mapped[str] = mapped_column(sa.String(64), nullable=False)
    en_name: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    industry: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)
    scale: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)
    location: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    logo_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)
    is_listed: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=False)
    stock_code: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)
    fortune500_trend: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    industry_ranking: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    tags: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True)
    status: Mapped[str] = mapped_column(
        sa.Enum("active", "pending", "archived", name="company_status_enum"),
        nullable=False,
        default="active",
    )
    source_urls: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    dimensions: Mapped[List["DimensionData"]] = relationship(
        "DimensionData",
        back_populates="company",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    reviews: Mapped[List["Review"]] = relationship(
        "Review",
        back_populates="company",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
