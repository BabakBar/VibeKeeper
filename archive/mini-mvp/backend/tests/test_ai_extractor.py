"""Tests for the AI occasion extractor."""

import json
from datetime import datetime

import pytest
from ..ai_extractor import OccasionExtractor

pytestmark = pytest.mark.asyncio


@pytest.fixture
def extractor() -> OccasionExtractor:
    """Return an instance of the OccasionExtractor."""
    return OccasionExtractor()


async def test_extract_occasion_data_success(extractor: OccasionExtractor, mocker):
    """Test successful extraction from a clear text input."""
    mock_response = {
        "person": "Jane Doe",
        "occasion_type": "Birthday",
        "date": f"{datetime.now().year}-10-26",
        "person_relationship": "friend",
        "notes": "Get a gift",
        "confidence": 0.95,
    }
    mock_completion = mocker.AsyncMock()
    mock_completion.choices = [mocker.Mock(message=mocker.Mock(content=json.dumps(mock_response)))]
    mocker.patch("ai_extractor.completion", return_value=mock_completion)

    text = "Jane Doe's birthday is on October 26th, don't forget to get a gift. She's a friend."
    result = await extractor.extract_occasion_data(text)

    assert result is not None
    data, confidence = result
    assert confidence == 0.95
    assert data["person"] == "Jane Doe"
    assert data["occasion_type"] == "Birthday"
    assert data["date"] == f"{datetime.now().year}-10-26"


async def test_extract_occasion_data_insufficient_info(extractor: OccasionExtractor, mocker):
    """Test that the extractor returns None when the LLM signals insufficient info."""
    mock_completion = mocker.AsyncMock()
    mock_completion.choices = [mocker.Mock(message=mocker.Mock(content="null"))]
    mocker.patch("ai_extractor.completion", return_value=mock_completion)

    text = "See you tomorrow"
    result = await extractor.extract_occasion_data(text)

    assert result is None


async def test_extract_occasion_data_invalid_json(extractor: OccasionExtractor, mocker):
    """Test that the extractor returns None when the LLM returns invalid JSON."""
    mock_completion = mocker.AsyncMock()
    mock_completion.choices = [mocker.Mock(message=mocker.Mock(content="This is not json"))]
    mocker.patch("ai_extractor.completion", return_value=mock_completion)

    text = "Some valid input"
    result = await extractor.extract_occasion_data(text)

    assert result is None