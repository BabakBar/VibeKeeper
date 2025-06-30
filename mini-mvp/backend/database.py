"""Async SQLAlchemy database configuration for VibeKeeper.

Creates an async engine + session factory and exposes common helpers used
throughout the backend (``async_session`` and ``get_db`` dependency).
"""

from typing import AsyncIterator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import declarative_base

from config import settings

# ---------------------------------------------------------------------------
# SQLAlchemy core objects
# ---------------------------------------------------------------------------

# Async engine. ``future=True`` enables SQLAlchemy 2.0 style behaviour.
engine = create_async_engine(settings.database_url, echo=settings.debug, future=True)

# Session factory used by the app – each request gets its own session instance.
async_session: async_sessionmaker[AsyncSession] = async_sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)

# Declarative base class used by models.
Base = declarative_base()


# ---------------------------------------------------------------------------
# FastAPI dependency that yields a session and closes it afterwards
# ---------------------------------------------------------------------------

async def get_db() -> AsyncIterator[AsyncSession]:
    """FastAPI dependency that provides an *async* DB session per request."""

    async with async_session() as session:  # type: AsyncSession
        try:
            yield session
        finally:
            await session.close()


# ---------------------------------------------------------------------------
# Utility called on application startup to create all tables (dev only)
# ---------------------------------------------------------------------------

async def create_tables() -> None:
    """Create all database tables declared on ``Base``.

    During local development we simply create missing tables on startup. In a
    real deployment we would run migrations instead.
    """

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
