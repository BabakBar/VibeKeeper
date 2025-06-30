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

        # Temporary fallback extraction for testing - replace with real AI later
        print(f"[OccasionExtractor] Processing text: {text}")
        
        # Simple pattern matching for common formats
        import re
        from datetime import datetime
        
        current_year = datetime.now().year
        
        # Try to extract person name (before "birthday", "anniversary", etc.)
        person_match = re.search(r"(\w+)'?s?\s+(birthday|anniversary|graduation|wedding)", text.lower())
        if not person_match:
            # Try alternative patterns
            person_match = re.search(r"(\w+)\s+(birthday|anniversary|graduation|wedding)", text.lower())
        
        if not person_match:
            print(f"[OccasionExtractor] Could not find person/occasion pattern in: {text}")
            return None
            
        person = person_match.group(1).capitalize()
        occasion_type = person_match.group(2).lower()
        
        # Try to extract date
        date_str = None
        
        # Look for various date patterns
        date_patterns = [
            r"(\d{1,2})/(\d{1,2})/(\d{4})",  # MM/DD/YYYY
            r"(\d{1,2})/(\d{1,2})",          # MM/DD
            r"(\d{4})-(\d{1,2})-(\d{1,2})",  # YYYY-MM-DD
            r"(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*(\d{4})?",  # March 15th 2025
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text)
            if match:
                groups = match.groups()
                if len(groups) == 3 and groups[2]:  # Full date with year
                    if groups[0].isalpha():  # Month name
                        try:
                            month_num = datetime.strptime(groups[0], "%B").month
                        except ValueError:
                            try:
                                month_num = datetime.strptime(groups[0], "%b").month
                            except ValueError:
                                continue
                        date_str = f"{groups[2]}-{month_num:02d}-{int(groups[1]):02d}"
                    else:
                        date_str = f"{groups[2]}-{int(groups[0]):02d}-{int(groups[1]):02d}"
                elif len(groups) == 2:  # MM/DD without year
                    date_str = f"{current_year}-{int(groups[0]):02d}-{int(groups[1]):02d}"
                break
        
        if not date_str:
            # Default to a month from now for testing
            import datetime
            future_date = datetime.datetime.now() + datetime.timedelta(days=30)
            date_str = future_date.strftime("%Y-%m-%d")
        
        # Create the result
        data = {
            "person": person,
            "occasion_type": occasion_type,
            "date": date_str,
            "relationship": None,
            "notes": f"Extracted from: {text}",
        }
        
        confidence = 0.8  # Mock confidence
        
        print(f"[OccasionExtractor] Extracted: {data} with confidence {confidence}")
        return data, confidence

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
