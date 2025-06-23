"""JWT helper utilities and FastAPI dependencies for VibeKeeper."""

from datetime import datetime, timedelta, timezone
from typing import Annotated, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .config import settings
from .database import get_db
from .models import User
from .schemas import TokenData, UserCreate

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

ALGORITHM = settings.jwt_algorithm
ACCESS_TOKEN_EXPIRE_HOURS = settings.jwt_expiration_hours

http_bearer = HTTPBearer(auto_error=False)


# ---------------------------------------------------------------------------
# Token helpers
# ---------------------------------------------------------------------------


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Return a signed JWT containing *data*."""

    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta
        if expires_delta is not None
        else timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=ALGORITHM)


def verify_token(token: str) -> TokenData:
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[ALGORITHM])
        return TokenData(user_id=payload.get("sub"), email=payload.get("email"))
    except JWTError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token") from exc


# ---------------------------------------------------------------------------
# DB helpers
# ---------------------------------------------------------------------------


async def get_or_create_user(user_in: UserCreate, db: AsyncSession) -> User:
    stmt = select(User).where(User.email == user_in.email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if user is None:
        user = User(
            email=user_in.email,
            full_name=user_in.full_name,
            provider=user_in.provider,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return user


# ---------------------------------------------------------------------------
# FastAPI dependencies
# ---------------------------------------------------------------------------


async def get_current_user(
    creds: Annotated[HTTPAuthorizationCredentials | None, Depends(http_bearer)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """Return the authenticated user or raise 401."""

    if creds is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")

    token_data = verify_token(creds.credentials)

    stmt = select(User).where(User.id == token_data.user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")

    return user
