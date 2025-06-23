"""Authentication endpoints.

For Phase-1 we expose a *dev login* that accepts an email + name and returns a
JWT. A production-ready OAuth flow will replace this later.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..auth import create_access_token, get_current_user, get_or_create_user
from ..database import get_db
from ..models import User
from ..schemas import Token, UserCreate, UserResponse


router = APIRouter()


# ---------------------------------------------------------------------------
# Dev login – accepts arbitrary email & name and issues a token
# ---------------------------------------------------------------------------


@router.post("/login/test", response_model=Token)
async def dev_login(user_in: UserCreate, db: AsyncSession = Depends(get_db)) -> Token:
    user = await get_or_create_user(user_in, db)
    token = create_access_token({"sub": user.id, "email": user.email})
    return Token(access_token=token, user=UserResponse.model_validate(user))


# ---------------------------------------------------------------------------
# Current user endpoint
# ---------------------------------------------------------------------------


@router.get("/me", response_model=UserResponse)
async def read_me(current_user: User = Depends(get_current_user)) -> UserResponse:  # type: ignore[arg-type]
    return UserResponse.model_validate(current_user)
