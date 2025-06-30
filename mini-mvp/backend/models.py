"""SQLAlchemy ORM models for VibeKeeper."""

from __future__ import annotations

from datetime import date, datetime
from enum import Enum

from sqlalchemy import Column, Date, DateTime, Enum as PgEnum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class OccasionStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    DISMISSED = "dismissed"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    full_name: Mapped[str] = mapped_column(String, nullable=False)
    provider: Mapped[str] = mapped_column(String, nullable=False)  # e.g. google, apple, dev

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    occasions: Mapped[list["Occasion"]] = relationship(
        back_populates="owner", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<User {self.email} ({self.provider})>"


class Occasion(Base):
    __tablename__ = "occasions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)

    # Core data
    person: Mapped[str] = mapped_column(String, nullable=False, index=True)
    occasion_type: Mapped[str] = mapped_column(String, nullable=False, index=True)
    occasion_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)

    # Optional
    person_relationship: Mapped[str | None] = mapped_column(String, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    confidence_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[OccasionStatus] = mapped_column(
        PgEnum(OccasionStatus), default=OccasionStatus.ACTIVE, nullable=False
    )

    raw_input: Mapped[str] = mapped_column(Text, nullable=False)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    owner: Mapped[User] = relationship(back_populates="occasions")

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def days_until(self) -> int:
        """Return number of days until the occasion (negative if already passed)."""

        today = date.today()
        return (self.occasion_date - today).days

    def is_upcoming(self) -> bool:
        """True when the occasion date is today or in the future."""

        return self.days_until() >= 0

    def __repr__(self) -> str:  # pragma: no cover
        return (
            f"<Occasion {self.person} – {self.occasion_type} on {self.occasion_date} "
            f"({self.status})>"
        )
