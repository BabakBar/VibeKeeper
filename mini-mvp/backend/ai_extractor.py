"""LiteLLM powered natural-language occasion extractor."""

from __future__ import annotations

import json
import re
from datetime import datetime
from typing import Dict, Optional, Tuple

from litellm import completion  # type: ignore

from config import settings


class OccasionExtractor:
    """Wraps a GPT-4o-mini call that converts free-text into structured data."""

    def __init__(self) -> None:
        self.model_name: str = settings.litellm_model

    async def extract_occasion_data(self, text: str) -> Optional[Tuple[Dict, float]]:
        """Return *(data_dict, confidence_score)* or *None* when extraction fails."""

        current_year = datetime.now().year

        prompt = f"""
You are an AI assistant that extracts occasion information from natural language
text. Extract and return **ONLY** a valid JSON object with these keys:

    person           – required, the person's name
    occasion_type    – required (birthday, anniversary, etc.)
    date             – required, ISO `YYYY-MM-DD`. If the text lacks a year,
                       use {current_year}.
    relationship     – optional relationship to the person (friend, family …)
    notes            – optional remainder of the sentence
    confidence       – float 0.0-1.0 indicating extraction confidence

Examples (year adjusted to {current_year}):

Input: "Bahar birthday is on 04/04"
Output: {{"person": "Bahar", "occasion_type": "birthday", "date": "{current_year}-04-04", "relationship": null, "notes": null, "confidence": 0.9}}

Input: "Mom's anniversary on December 15th, need to get flowers"
Output: {{"person": "Mom", "occasion_type": "anniversary", "date": "{current_year}-12-15", "relationship": "family", "notes": "get flowers", "confidence": 0.95}}

Input: "John from work is graduating on June 20, 2024"
Output: {{"person": "John", "occasion_type": "graduation", "date": "2024-06-20", "relationship": "colleague", "notes": "from work", "confidence": 1.0}}

If the input does **not** contain sufficient occasion info, respond with the
string `null` (without quotes).

Now analyse: "{text}"
"""

        try:
            response = await completion(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=200,
            )

            result_text = response.choices[0].message.content.strip()

            if result_text.lower() == "null":  # model signals no extraction
                return None

            # Parse JSON safely
            data = json.loads(result_text)

            # Basic validation
            required = {"person", "occasion_type", "date", "confidence"}
            if not required.issubset(data.keys()):
                return None

            # Confidence comes out as string sometimes – coerce to float
            confidence = float(data.pop("confidence"))

            # Ensure ISO date
            data["date"] = self._normalise_date(data["date"])
            if data["date"] is None:
                return None

            # Clean null-like strings
            for key in ("relationship", "notes"):
                if key in data and str(data[key]).lower() in {"", "null", "none"}:
                    data[key] = None

            return data, confidence

        except json.JSONDecodeError as exc:
            print(f"[OccasionExtractor] Invalid JSON returned: {exc}\nContent: {result_text}")
            return None
        except Exception as exc:  # pylint: disable=broad-except
            # For unexpected issues we still avoid crashing the request, but we
            # surface the error so it can be logged by the caller.
            print(f"[OccasionExtractor] Unexpected error: {exc}")
            return None

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _normalise_date(self, date_str: str) -> Optional[str]:
        """Convert a variety of date formats to ISO *YYYY-MM-DD*."""

        try:
            # Already ISO?
            datetime.strptime(date_str, "%Y-%m-%d")
            return date_str  # Valid ISO
        except ValueError:
            pass

        current_year = str(datetime.now().year)

        # Replace common delimiters with dashes for easier parsing
        candidate = re.sub(r"[/.]", "-", date_str.strip())

        # If the year is missing, append it (e.g. 04-04 -> 04-04-2025)
        if re.fullmatch(r"\d{1,2}-\d{1,2}", candidate):
            candidate = f"{current_year}-{candidate}"

        # Try multiple formats
        known_formats = [
            "%Y-%m-%d",
            "%d-%m-%Y",
            "%m-%d-%Y",
            "%B %d %Y",  # April 4 2025
            "%b %d %Y",  # Apr 4 2025
        ]

        for fmt in known_formats:
            try:
                parsed = datetime.strptime(candidate, fmt)
                return parsed.strftime("%Y-%m-%d")
            except ValueError:
                continue

        return None


# Singleton instance that routers / services can reuse
extractor = OccasionExtractor()
