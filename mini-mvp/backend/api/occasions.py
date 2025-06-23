"""Occasion-related API endpoints (Phase-1: extraction + create & list)."""

from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..ai_extractor import extractor
from ..database import get_db
from ..models import Occasion, User
from ..schemas import (
    OccasionCreate,
    OccasionExtracted,
    OccasionFilter,
    OccasionResponse,
)
from ..auth import get_current_user


router = APIRouter()


# ---------------------------------------------------------------------------
# AI extraction helper route – does *not* persist to DB
# ---------------------------------------------------------------------------


@router.post("/extract", response_model=OccasionExtracted)
async def extract_occasion(payload: OccasionCreate) -> OccasionExtracted:
    result = await extractor.extract_occasion_data(payload.raw_input)
    if result is None:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Could not extract occasion data")

    data, confidence = result

    return OccasionExtracted(
        person=data["person"],
        occasion_type=data["occasion_type"],
        occasion_date=data["date"],
        person_relationship=data.get("relationship"),
        notes=data.get("notes"),
        confidence_score=confidence,
        raw_input=payload.raw_input,
    )


# ---------------------------------------------------------------------------
# Minimal CRUD to unblock frontend testing
# ---------------------------------------------------------------------------


@router.post("/", response_model=OccasionResponse, status_code=status.HTTP_201_CREATED)
async def create_occasion(
    occasion_in: OccasionExtracted,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),  # type: ignore[arg-type]
):
    occ = Occasion(
        owner_id=current_user.id,
        person=occasion_in.person,
        occasion_type=occasion_in.occasion_type,
        occasion_date=occasion_in.occasion_date,
        person_relationship=occasion_in.person_relationship,
        notes=occasion_in.notes,
        confidence_score=occasion_in.confidence_score,
        raw_input=occasion_in.raw_input,
    )
    db.add(occ)
    await db.commit()
    await db.refresh(occ)

    return OccasionResponse.model_validate(occ)


@router.get("/", response_model=List[OccasionResponse])
async def list_occasions(
    filters: OccasionFilter = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),  # type: ignore[arg-type]
):
    stmt = select(Occasion).where(Occasion.owner_id == current_user.id)

    if filters.person:
        stmt = stmt.where(Occasion.person.ilike(f"%{filters.person}%"))
    if filters.occasion_type:
        stmt = stmt.where(Occasion.occasion_type == filters.occasion_type)
    if filters.status:
        stmt = stmt.where(Occasion.status == filters.status)

    result = await db.execute(stmt)
    occasions = result.scalars().all()

    if filters.upcoming_only:
        occasions = [o for o in occasions if o.is_upcoming()]

    return [OccasionResponse.model_validate(o) for o in occasions]
