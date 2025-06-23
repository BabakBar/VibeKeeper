# 🚀 VibeKeeper Mini-MVP: Complete Implementation Plan

This comprehensive guide provides step-by-step instructions for building the VibeKeeper MVP with Python (FastAPI) backend and Vue 3/Nuxt 3 frontend.

**Core Principles:**

1. **Python Management:** All Python packages MUST use `uv` (no pip/conda)
2. **Architecture:** Separate frontend/backend with API communication
3. **Simplicity First:** Focus on core features, avoid over-engineering
4. **Test-Driven:** Write tests first, then implement

---

## 📁 Complete Project Structure

```
/mini-mvp/
├── backend/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app entry point
│   ├── database.py             # Async SQLAlchemy setup
│   ├── models.py               # Database models
│   ├── schemas.py              # Pydantic validation models
│   ├── ai_extractor.py         # LiteLLM integration
│   ├── auth.py                 # JWT authentication
│   ├── config.py               # Settings management
│   ├── api/
│   │   ├── __init__.py
│   │   ├── auth.py             # Auth endpoints
│   │   └── occasions.py        # Occasions CRUD
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py         # Pytest fixtures
│   │   ├── test_ai_extractor.py
│   │   ├── test_auth.py
│   │   ├── test_api.py
│   │   └── test_models.py
│   ├── .env.example
│   ├── pyproject.toml
│   └── uv.lock
├── frontend/
│   ├── nuxt.config.ts
│   ├── app.vue
│   ├── package.json
│   ├── tailwind.config.js
│   ├── pages/
│   │   ├── index.vue           # Landing page
│   │   ├── login.vue           # OAuth login
│   │   └── app.vue             # Main app (protected)
│   ├── components/
│   │   ├── AppLayout.vue       # Main layout wrapper
│   │   ├── OccasionInput.vue   # Text input form
│   │   ├── OccasionCard.vue    # Occasion display
│   │   ├── SearchFilter.vue    # Search/filter UI
│   │   └── ConfidenceScore.vue # AI confidence display
│   ├── composables/
│   │   ├── useAuth.ts          # Authentication logic
│   │   ├── useOccasions.ts     # Occasions API client
│   │   └── useApi.ts           # Base API helper
│   ├── middleware/
│   │   └── auth.ts             # Route protection
│   ├── stores/
│   │   ├── auth.ts             # Auth state (Pinia)
│   │   └── occasions.ts        # Occasions state
│   └── types/
│       └── index.ts            # TypeScript types
├── occasions.db                # SQLite database
├── .gitignore
└── README.md
```

---

## 🛠️ Step-by-Step Implementation Guide

### Phase 0: Environment Setup (30 minutes)

#### 0.1 Initialize Project Structure
```bash
# Create directories
mkdir -p mini-mvp/{backend,frontend}
cd mini-mvp

# Initialize git (if needed)
git init
```

#### 0.2 Create .gitignore
```gitignore
# Python
__pycache__/
*.py[cod]
.venv/
.env
*.db
*.db-journal

# Node
node_modules/
.nuxt/
.output/
dist/

# IDE
.vscode/
.idea/
*.swp
.DS_Store
```

#### 0.3 Setup Python Backend Environment
```bash
cd backend

# Initialize UV project
uv init --no-readme --no-pin-python

# Create virtual environment
uv venv
source .venv/bin/activate  # macOS/Linux
# .venv\Scripts\activate    # Windows

# Create .env from example
cp .env.example .env
# Edit .env with your API keys
```

#### 0.4 Setup Frontend Environment
```bash
cd ../frontend

# Initialize Nuxt 3
npx nuxi@latest init . --force

# Install additional dependencies
npm install -D @nuxtjs/tailwindcss @pinia/nuxt
npm install dayjs axios @vueuse/nuxt
```

---

### Phase 1: Backend Core (Day 1)

#### 1.1 Install Dependencies
```bash
cd backend

# Add all dependencies at once
uv add fastapi uvicorn[standard] sqlalchemy aiosqlite litellm pydantic python-multipart python-jose[cryptography] passlib[bcrypt] pydantic-settings python-dotenv

# Add dev dependencies
uv add --dev pytest pytest-asyncio httpx faker
```

#### 1.2 Create config.py
```python
"""
Application configuration using pydantic-settings
Reads from environment variables and .env file
"""
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # App
    app_name: str = "VibeKeeper"
    debug: bool = False
    
    # Database
    database_url: str = "sqlite+aiosqlite:///./occasions.db"
    
    # AI
    litellm_api_key: str
    litellm_model: str = "gpt-4o-mini"
    
    # Auth
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    
    # OAuth (for future)
    google_client_id: Optional[str] = None
    google_client_secret: Optional[str] = None
    
    class Config:
        env_file = ".env"

settings = Settings()
```

#### 1.3 Create database.py
```python
"""
Async SQLAlchemy database configuration
Provides session management and table creation
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings

# Create async engine
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    future=True
)

# Create async session factory
async_session = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Base class for models
Base = declarative_base()

# Dependency for FastAPI
async def get_db():
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()

# Create tables
async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
```

#### 1.4 Create Enhanced models.py
```python
"""
SQLAlchemy models with relationships and helper methods
"""
from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text, Float, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, date
import enum
from database import Base

class OccasionStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    DISMISSED = "dismissed"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    full_name = Column(String, nullable=False)
    provider = Column(String, nullable=False)  # google, apple, email
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    occasions = relationship("Occasion", back_populates="owner", cascade="all, delete-orphan")

class Occasion(Base):
    __tablename__ = "occasions"
    
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Core fields
    person = Column(String, nullable=False, index=True)
    occasion_type = Column(String, nullable=False, index=True)
    occasion_date = Column(Date, nullable=False, index=True)
    
    # Additional fields
    relationship = Column(String, nullable=True)  # friend, family, colleague
    notes = Column(Text, nullable=True)
    status = Column(Enum(OccasionStatus), default=OccasionStatus.ACTIVE)
    confidence_score = Column(Float, nullable=True)  # 0.0 to 1.0
    
    # Tracking
    raw_input = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="occasions")
    
    def days_until(self) -> int:
        """Calculate days until occasion (negative if past)"""
        today = date.today()
        delta = self.occasion_date - today
        return delta.days
    
    def is_upcoming(self) -> bool:
        """Check if occasion is in the future"""
        return self.days_until() >= 0
    
    def __repr__(self):
        return f"<Occasion({self.person}, {self.occasion_type}, {self.occasion_date})>"
```

#### 1.5 Create schemas.py
```python
"""
Pydantic models for request/response validation
"""
from pydantic import BaseModel, Field, EmailStr, validator
from datetime import date, datetime
from typing import Optional, List
from enum import Enum

class OccasionStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    DISMISSED = "dismissed"

# Auth schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    provider: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    user_id: int
    email: str

# Occasion schemas
class OccasionBase(BaseModel):
    person: str = Field(..., min_length=1, max_length=100)
    occasion_type: str = Field(..., min_length=1, max_length=50)
    occasion_date: date
    relationship: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = Field(None, max_length=500)

class OccasionCreate(BaseModel):
    raw_input: str = Field(..., min_length=1, max_length=500)

class OccasionExtracted(OccasionBase):
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    raw_input: str

class OccasionUpdate(BaseModel):
    person: Optional[str] = Field(None, min_length=1, max_length=100)
    occasion_type: Optional[str] = Field(None, min_length=1, max_length=50)
    occasion_date: Optional[date] = None
    relationship: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = Field(None, max_length=500)
    status: Optional[OccasionStatus] = None

class OccasionResponse(OccasionBase):
    id: int
    owner_id: int
    status: OccasionStatus
    confidence_score: Optional[float]
    days_until: int
    is_upcoming: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
    
    @validator('days_until', pre=False, always=True)
    def calculate_days_until(cls, v, values):
        if 'occasion_date' in values:
            delta = values['occasion_date'] - date.today()
            return delta.days
        return v
    
    @validator('is_upcoming', pre=False, always=True)
    def calculate_is_upcoming(cls, v, values):
        if 'days_until' in values:
            return values['days_until'] >= 0
        return v

# Filter schemas
class OccasionFilter(BaseModel):
    person: Optional[str] = None
    occasion_type: Optional[str] = None
    status: Optional[OccasionStatus] = None
    upcoming_only: bool = False
```

#### 1.6 Create Enhanced ai_extractor.py
```python
"""
Enhanced AI extraction with confidence scoring and better parsing
"""
import os
import json
from datetime import datetime, date
from typing import Dict, Optional, Tuple
from litellm import completion
from config import settings
import re

class OccasionExtractor:
    def __init__(self):
        self.model = settings.litellm_model
        
    async def extract_occasion_data(self, text: str) -> Optional[Tuple[Dict, float]]:
        """
        Extract occasion data from natural language text.
        Returns tuple of (data_dict, confidence_score)
        """
        current_year = datetime.now().year
        
        prompt = f"""
You are an AI assistant that extracts occasion information from natural language text.
Extract the following information:
- person: The name of the person (required)
- occasion_type: Type of occasion like birthday, anniversary, graduation, etc (required)
- date: The date in YYYY-MM-DD format (required, use {current_year} if no year given)
- relationship: The relationship to the person (friend, family, colleague, etc) if mentioned
- notes: Any additional details mentioned

Also provide a confidence score from 0.0 to 1.0 based on:
- 1.0: All information clearly stated
- 0.8-0.9: Most information clear, minor inference needed
- 0.6-0.7: Some inference required
- Below 0.6: Significant guessing required

Examples:
Input: "Bahar birthday is on 04/04"
Output: {{"person": "Bahar", "occasion_type": "birthday", "date": "{current_year}-04-04", "relationship": null, "notes": null, "confidence": 0.9}}

Input: "Mom's anniversary on December 15th, need to get flowers"
Output: {{"person": "Mom", "occasion_type": "anniversary", "date": "{current_year}-12-15", "relationship": "family", "notes": "get flowers", "confidence": 0.95}}

Input: "John from work is graduating on June 20, 2024"
Output: {{"person": "John", "occasion_type": "graduation", "date": "2024-06-20", "relationship": "colleague", "notes": "from work", "confidence": 1.0}}

Now extract from: "{text}"

Return ONLY a valid JSON object. If the text doesn't contain clear occasion information, return null.
"""

        try:
            response = await completion(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=200
            )
            
            result_text = response.choices[0].message.content.strip()
            
            # Handle null response
            if result_text.lower() == "null":
                return None
            
            # Parse JSON
            result = json.loads(result_text)
            
            # Validate required fields
            required = ["person", "occasion_type", "date", "confidence"]
            if not all(field in result for field in required):
                return None
            
            # Extract confidence and remove from data dict
            confidence = float(result.pop("confidence", 0.5))
            
            # Validate date format
            try:
                datetime.strptime(result["date"], "%Y-%m-%d")
            except ValueError:
                # Try to fix common date formats
                result["date"] = self._normalize_date(result["date"])
                if not result["date"]:
                    return None
            
            # Clean up the data
            for key in ["relationship", "notes"]:
                if key in result and result[key] in [None, "null", ""]:
                    result[key] = None
            
            return result, confidence
            
        except Exception as e:
            print(f"Error processing text: {e}")
            return None
    
    def _normalize_date(self, date_str: str) -> Optional[str]:
        """Try to normalize various date formats to YYYY-MM-DD"""
        current_year = datetime.now().year
        
        # Try different date patterns
        patterns = [
            (r"(\d{1,2})/(\d{1,2})/(\d{4})", "%m/%d/%Y"),
            (r"(\d{1,2})-(\d{1,2})-(\d{4})", "%m-%d-%Y"),
            (r"(\d{4})/(\d{1,2})/(\d{1,2})", "%Y/%m/%d"),
            (r"(\d{4})-(\d{1,2})-(\d{1,2})", "%Y-%m-%d"),
        ]
        
        for pattern, fmt in patterns:
            match = re.match(pattern, date_str)
            if match:
                try:
                    parsed = datetime.strptime(date_str, fmt)
                    return parsed.strftime("%Y-%m-%d")
                except:
                    continue
        
        # Try parsing month names
        try:
            # Add current year if not present
            if not re.search(r'\d{4}', date_str):
                date_str += f" {current_year}"
            
            parsed = datetime.strptime(date_str, "%B %d %Y")
            return parsed.strftime("%Y-%m-%d")
        except:
            pass
        
        return None
    
    def validate_extraction(self, data: Dict) -> bool:
        """Validate extracted data has required fields and proper formats"""
        required_fields = ["person", "occasion_type", "date"]
        
        if not all(field in data for field in required_fields):
            return False
        
        # Validate person and occasion_type are non-empty strings
        if not data["person"] or not isinstance(data["person"], str):
            return False
        if not data["occasion_type"] or not isinstance(data["occasion_type"], str):
            return False
        
        # Validate date format
        try:
            datetime.strptime(data["date"], "%Y-%m-%d")
        except ValueError:
            return False
        
        return True

# Singleton instance
extractor = OccasionExtractor()
```

#### 1.7 Create auth.py
```python
"""
JWT authentication and user management
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models import User
from schemas import TokenData, UserCreate
from config import settings

# Password hashing (for future email/password auth)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Bearer token scheme
security = HTTPBearer()

def create_access_token(data: dict) -> str:
    """Create a new JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=settings.jwt_expiration_hours)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm
    )
    return encoded_jwt

def verify_token(token: str) -> Optional[TokenData]:
    """Verify and decode a JWT token"""
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm]
        )
        user_id: int = payload.get("sub")
        email: str = payload.get("email")
        if user_id is None or email is None:
            return None
        return TokenData(user_id=user_id, email=email)
    except JWTError:
        return None

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Get current authenticated user from JWT token"""
    token = credentials.credentials
    token_data = verify_token(token)
    
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user from database
    result = await db.execute(
        select(User).where(User.id == token_data.user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

async def get_or_create_user(
    db: AsyncSession,
    email: str,
    full_name: str,
    provider: str
) -> User:
    """Get existing user or create new one"""
    # Check if user exists
    result = await db.execute(
        select(User).where(User.email == email)
    )
    user = result.scalar_one_or_none()
    
    if user:
        # Update user info if changed
        if user.full_name != full_name:
            user.full_name = full_name
            user.updated_at = datetime.utcnow()
            await db.commit()
        return user
    
    # Create new user
    user = User(
        email=email,
        full_name=full_name,
        provider=provider
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return user

# For development/testing - simple email/password auth
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
```

---

## 🚦 Success Criteria Checklist

- [ ] User can login with test credentials
- [ ] Natural language input extracts correctly 9/10 times
- [ ] Occasions display with all fields
- [ ] Search and filter work properly
- [ ] Edit and delete functions work
- [ ] Mobile responsive design
- [ ] Error states handled gracefully
- [ ] Loading states appear during async operations
- [ ] Data persists across sessions
- [ ] API documentation accessible

---

## 🔧 Troubleshooting Guide

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill process on port 8001
   lsof -ti:8001 | xargs kill -9
   ```

2. **Database Migration Issues**
   ```bash
   # Delete database and recreate
   rm occasions.db
   # Restart backend to recreate tables
   ```

3. **CORS Errors**
   - Ensure backend CORS allows http://localhost:3000
   - Check API proxy in nuxt.config.ts

4. **Authentication Errors**
   - Check JWT_SECRET_KEY in .env
   - Verify token is being sent in headers

5. **AI Extraction Fails**
   - Verify LITELLM_API_KEY is valid
   - Check API rate limits
   - Test with simpler input

---

This implementation plan provides everything needed to build a functional VibeKeeper MVP with proper separation of concerns, test coverage, and a clean user experience.