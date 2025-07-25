"""Pydantic request/response schemas for VibeKeeper API."""

from __future__ import annotations

from datetime import date, datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, computed_field


class OccasionStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    DISMISSED = "dismissed"


# ---------------------------------------------------------------------------
# Auth / user schemas
# ---------------------------------------------------------------------------


class UserBase(BaseModel):
    email: EmailStr
    full_name: str


class UserCreate(UserBase):
    provider: str = "dev"  # default provider for dev login


class UserResponse(UserBase):
    id: int
    created_at: datetime

    model_config = {
        "from_attributes": True,
    }


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    user_id: int
    email: EmailStr


# ---------------------------------------------------------------------------
# Occasion schemas
# ---------------------------------------------------------------------------


class OccasionBase(BaseModel):
    person: str = Field(..., min_length=1, max_length=100)
    occasion_type: str = Field(..., min_length=1, max_length=50)
    occasion_date: date
    person_relationship: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = Field(None, max_length=500)


class OccasionCreate(BaseModel):
    raw_input: str = Field(..., min_length=1, max_length=500)


class OccasionExtracted(OccasionBase):
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    raw_input: str


class OccasionUpdate(BaseModel):
    person: Optional[str] = Field(None, min_length=1, max_length=100)
    occasion_type: Optional[str] = Field(None, min_length=1, max_length=50)
    occasion_date: Optional[date] = None
    person_relationship: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = Field(None, max_length=500)
    status: Optional[OccasionStatus] = None


class OccasionResponse(OccasionBase):
    id: int
    owner_id: int
    status: OccasionStatus
    confidence_score: Optional[float]
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }

    # Newer pydantic way: computed_field retains clarity and happens *after*
    # validation.
    @computed_field
    @property
    def days_until(self) -> int:  # type: ignore[override]
        return (self.occasion_date - date.today()).days

    @computed_field
    @property
    def is_upcoming(self) -> bool:  # type: ignore[override]
        return self.days_until >= 0


# ---------------------------------------------------------------------------
# Filters – used in query parameters
# ---------------------------------------------------------------------------


class OccasionFilter(BaseModel):
    person: Optional[str] = None
    occasion_type: Optional[str] = None
    status: Optional[OccasionStatus] = None
    upcoming_only: bool = False
