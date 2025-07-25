"""Pytest fixtures for VibeKeeper backend tests.

This module defines fixtures that are shared across the test suite, such as:
- An isolated in-memory SQLite database for each test function.
- An async test client for making requests to the FastAPI app.
- A factory for creating authenticated test clients.
"""

from __future__ import annotations

import asyncio
from typing import AsyncGenerator, Generator

import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import StaticPool

from ..auth import create_access_token
from ..database import Base, get_db
from ..main import app
from ..models import User

# ---------------------------------------------------------------------------
# Core fixtures
# ---------------------------------------------------------------------------


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Provide a session-scoped event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Provide an async session with an in-memory SQLite database.

    This fixture creates a new, isolated database for each test function,
    ensuring that tests do not interfere with each other. The database tables
    are created and dropped automatically.
    """
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    async_session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_maker() as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Provide an async HTTP client for testing the FastAPI app."""

    def override_get_db() -> Generator[AsyncSession, None, None]:
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
    del app.dependency_overrides[get_db]


# ---------------------------------------------------------------------------
# Test utilities & factories
# ---------------------------------------------------------------------------


@pytest_asyncio.fixture
async def authenticated_client_factory(client: AsyncClient, db_session: AsyncSession):
    """Factory fixture to create an authenticated test client for a given user."""

    async def _factory(user: User) -> AsyncClient:
        token = create_access_token({"sub": user.id, "email": user.email})
        client.headers["Authorization"] = f"Bearer {token}"
        return client

    return _factory


@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession) -> User:
    """Create and return a test user in the database."""
    user = User(email="test@example.com", full_name="Test User", provider="test")
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user