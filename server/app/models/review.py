from datetime import date, datetime, timezone
from typing import TYPE_CHECKING, Optional

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.company import Company


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(sa.Integer, primary_key=True, autoincrement=True)
    company_id: Mapped[int] = mapped_column(
        sa.Integer, sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False
    )
    source: Mapped[str] = mapped_column(
        sa.Enum(
            "maimai",
            "kanzhun",
            "zhihu",
            "xiaohongshu",
            "linkedin",
            "other",
            name="review_source_enum",
        ),
        nullable=False,
        default="other",
    )
    sentiment: Mapped[str] = mapped_column(
        sa.Enum("positive", "neutral", "negative", name="review_sentiment_enum"),
        nullable=False,
        default="neutral",
    )
    content_summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    original_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)
    published_at: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    audit_status: Mapped[str] = mapped_column(
        sa.Enum("pending", "approved", "rejected", name="review_audit_status_enum"),
        nullable=False,
        default="pending",
    )
    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    company: Mapped["Company"] = relationship("Company", back_populates="reviews")
