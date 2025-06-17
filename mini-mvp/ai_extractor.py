import os
import json
from datetime import datetime, date
from typing import Dict, Optional
from litellm import completion

class OccasionExtractor:
    def __init__(self):
        self.model = os.getenv("LITELLM_MODEL", "gpt-4o-mini")
        
    def extract_occasion_data(self, text: str) -> Optional[Dict]:
        """Extract person, occasion type, and date from natural language text."""
        
        prompt = f"""
Extract the person name, occasion type, and date from the following text. 
Return the result as a JSON object with keys: "person", "occasion_type", "date".

The date should be in YYYY-MM-DD format. If no year is provided, use the current year ({datetime.now().year}).
If the text doesn't contain clear occasion information, return null.

Examples:
- "Bahar birthday is on 04/04" -> {{"person": "Bahar", "occasion_type": "birthday", "date": "{datetime.now().year}-04-04"}}
- "Mom's anniversary on Dec 15th" -> {{"person": "Mom", "occasion_type": "anniversary", "date": "{datetime.now().year}-12-15"}}
- "John graduation ceremony June 20, 2024" -> {{"person": "John", "occasion_type": "graduation", "date": "2024-06-20"}}

Text to analyze: "{text}"

Return only the JSON object, no additional text.
"""

        try:
            response = completion(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=150
            )
            
            result_text = response.choices[0].message.content.strip()
            
            if result_text.lower() == "null":
                return None
                
            result = json.loads(result_text)
            
            if not all(key in result for key in ["person", "occasion_type", "date"]):
                return None
                
            try:
                datetime.strptime(result["date"], "%Y-%m-%d")
            except ValueError:
                return None
                
            return result
            
        except Exception as e:
            print(f"Error processing text: {e}")
            return None
            
    def validate_extraction(self, data: Dict) -> bool:
        """Validate extracted data has required fields and proper formats."""
        required_fields = ["person", "occasion_type", "date"]
        
        if not all(field in data for field in required_fields):
            return False
            
        if not all(isinstance(data[field], str) for field in required_fields):
            return False
            
        try:
            datetime.strptime(data["date"], "%Y-%m-%d")
        except ValueError:
            return False
            
        return True