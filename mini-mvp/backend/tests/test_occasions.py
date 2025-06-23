"""Tests for the Occasions API endpoints."""

from datetime import date

import pytest
from httpx import AsyncClient

from ..models import User

pytestmark = pytest.mark.asyncio


@pytest.fixture
def occasion_payload() -> dict:
    """Return a valid occasion payload for creation."""
    return {
        "person": "John Doe",
        "occasion_type": "Anniversary",
        "occasion_date": "2024-12-25",
        "person_relationship": "family",
        "notes": "Buy a gift",
        "confidence_score": 0.9,
        "raw_input": "John Doe's anniversary is on Dec 25, 2024. Buy a gift. Family.",
    }


async def test_create_occasion(
    authenticated_client_factory, test_user: User, occasion_payload: dict
):
    """Test successful creation of a new occasion."""
    authed_client = await authenticated_client_factory(test_user)
    response = await authed_client.post("/api/occasions/", json=occasion_payload)

    assert response.status_code == 201
    data = response.json()
    assert data["person"] == "John Doe"
    assert data["occasion_type"] == "Anniversary"
    assert data["owner_id"] == test_user.id
    assert data["days_until"] > 0


async def test_create_occasion_unauthenticated(client: AsyncClient, occasion_payload: dict):
    """Test that creating an occasion fails with 401 for unauthenticated users."""
    response = await client.post("/api/occasions/", json=occasion_payload)
    assert response.status_code == 401


async def test_list_occasions(
    authenticated_client_factory, test_user: User, occasion_payload: dict
):
    """Test listing occasions for the authenticated user."""
    authed_client = await authenticated_client_factory(test_user)

    # Create an occasion first
    await authed_client.post("/api/occasions/", json=occasion_payload)

    response = await authed_client.get("/api/occasions/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["person"] == "John Doe"


async def test_list_occasions_filter_by_person(
    authenticated_client_factory, test_user: User, occasion_payload: dict
):
    """Test filtering occasions by person."""
    authed_client = await authenticated_client_factory(test_user)
    await authed_client.post("/api/occasions/", json=occasion_payload)

    # This should match
    response = await authed_client.get("/api/occasions/?person=John")
    assert response.status_code == 200
    assert len(response.json()) == 1

    # This should not match
    response = await authed_client.get("/api/occasions/?person=Jane")
    assert response.status_code == 200
    assert len(response.json()) == 0