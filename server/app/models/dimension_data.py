from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.company import Company

DIMENSION_KEYS = ["basic", "compensation", "welfare", "worklife", "growth", "reputation"]
DIMENSION_LABELS = {
    "basic": "企业基本面",
    "compensation": "薪酬竞争力",
    "welfare": "福利保障",
    "worklife": "工作节奏",
    "growth": "成长与制度",
    "reputation": "真实口碑",
}


class DimensionData(Base):
    __tablename__ = "dimension_data"

    id: Mapped[int] = mapped_column(sa.Integer, primary_key=True, autoincrement=True)
    company_id: Mapped[int] = mapped_column(
        sa.Integer, sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False
    )
    dimension_key: Mapped[str] = mapped_column(
        sa.Enum(
            "basic",
            "compensation",
            "welfare",
            "worklife",
            "growth",
            "reputation",
            name="dimension_key_enum",
        ),
        nullable=False,
    )
    score: Mapped[int] = mapped_column(sa.SmallInteger, nullable=False, default=0)
    level: Mapped[str] = mapped_column(
        sa.Enum("green", "yellow", "red", name="dimension_level_enum"),
        nullable=False,
        default="yellow",
    )
    summary: Mapped[Optional[str]] = mapped_column(sa.String(500), nullable=True)
    metrics: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    source_note: Mapped[Optional[str]] = mapped_column(sa.String(500), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    company: Mapped["Company"] = relationship("Company", back_populates="dimensions")

    __table_args__ = (
        sa.UniqueConstraint("company_id", "dimension_key", name="uq_company_dimension"),
    )
