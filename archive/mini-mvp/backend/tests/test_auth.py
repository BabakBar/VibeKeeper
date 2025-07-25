"""Tests for authentication endpoints and logic."""

import pytest
from httpx import AsyncClient

from ..models import User

pytestmark = pytest.mark.asyncio


async def test_dev_login(client: AsyncClient):
    """Test the dev login endpoint creates a user and returns a valid token."""
    response = await client.post(
        "/api/auth/login/test",
        json={"email": "newuser@example.com", "full_name": "New User"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "newuser@example.com"
    assert data["user"]["full_name"] == "New User"


async def test_get_me(
    client: AsyncClient, authenticated_client_factory, test_user: User
):
    """Test the /me endpoint successfully returns the authenticated user."""
    authed_client = await authenticated_client_factory(test_user)
    response = await authed_client.get("/api/auth/me")
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user.email
    assert data["full_name"] == test_user.full_name
    assert data["id"] == test_user.id


async def test_get_me_unauthenticated(client: AsyncClient):
    """Test the /me endpoint fails with 401 for an unauthenticated request."""
    response = await client.get("/api/auth/me")
    assert response.status_code == 401
    assert response.json() == {"detail": "Not authenticated"}