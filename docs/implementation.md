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

### Phase 2: Backend API & Tests (Day 2)

#### 2.1 Create test fixtures (tests/conftest.py)
```python
"""
Pytest fixtures for testing
"""
import pytest
import asyncio
from typing import AsyncGenerator
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from database import Base, get_db
from main import app
from models import User
from auth import create_access_token

# Test database
TEST_DATABASE_URL = "sqlite+aiosqlite:///./test.db"

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session")
async def engine():
    """Create a test database engine"""
    engine = create_async_engine(TEST_DATABASE_URL, echo=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture(scope="function")
async def db_session(engine) -> AsyncGenerator[AsyncSession, None]:
    """Create a test database session"""
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session() as session:
        yield session

@pytest.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Create a test client"""
    async def override_get_db():
        yield db_session
    
    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.fixture
async def test_user(db_session: AsyncSession) -> User:
    """Create a test user"""
    user = User(
        email="test@example.com",
        full_name="Test User",
        provider="test"
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest.fixture
def auth_headers(test_user: User) -> dict:
    """Create auth headers with test user token"""
    token = create_access_token({
        "sub": test_user.id,
        "email": test_user.email
    })
    return {"Authorization": f"Bearer {token}"}
```

#### 2.2 Create AI extractor tests (tests/test_ai_extractor.py)
```python
"""
Test AI extraction functionality
"""
import pytest
from datetime import datetime
from ai_extractor import extractor

class TestAIExtractor:
    """Test the OccasionExtractor class"""
    
    @pytest.mark.asyncio
    async def test_extract_simple_birthday(self):
        """Test extraction of simple birthday"""
        text = "Bahar birthday is on 04/04"
        result = await extractor.extract_occasion_data(text)
        
        assert result is not None
        data, confidence = result
        
        assert data["person"] == "Bahar"
        assert data["occasion_type"] == "birthday"
        assert data["date"].endswith("-04-04")
        assert confidence >= 0.8
    
    @pytest.mark.asyncio
    async def test_extract_with_relationship(self):
        """Test extraction with relationship info"""
        text = "Mom's anniversary on December 15th"
        result = await extractor.extract_occasion_data(text)
        
        assert result is not None
        data, confidence = result
        
        assert data["person"] == "Mom"
        assert data["occasion_type"] == "anniversary"
        assert data["relationship"] == "family"
        assert data["date"].endswith("-12-15")
    
    @pytest.mark.asyncio
    async def test_extract_with_full_date(self):
        """Test extraction with complete date"""
        text = "John graduation ceremony June 20, 2024"
        result = await extractor.extract_occasion_data(text)
        
        assert result is not None
        data, confidence = result
        
        assert data["person"] == "John"
        assert data["occasion_type"] == "graduation"
        assert data["date"] == "2024-06-20"
        assert confidence >= 0.9
    
    @pytest.mark.asyncio
    async def test_extract_with_notes(self):
        """Test extraction with additional notes"""
        text = "Sarah from work birthday May 1st, loves chocolate cake"
        result = await extractor.extract_occasion_data(text)
        
        assert result is not None
        data, confidence = result
        
        assert data["person"] == "Sarah"
        assert data["relationship"] == "colleague"
        assert "chocolate" in data.get("notes", "").lower()
    
    @pytest.mark.asyncio
    async def test_extract_invalid_text(self):
        """Test extraction with non-occasion text"""
        text = "The weather is nice today"
        result = await extractor.extract_occasion_data(text)
        
        assert result is None
    
    @pytest.mark.asyncio
    async def test_extract_ambiguous_text(self):
        """Test extraction with ambiguous text"""
        text = "Remember the party next week"
        result = await extractor.extract_occasion_data(text)
        
        # Should return None or low confidence
        if result:
            _, confidence = result
            assert confidence < 0.6
    
    def test_validate_extraction_valid(self):
        """Test validation of correct extraction"""
        data = {
            "person": "John",
            "occasion_type": "birthday",
            "date": "2024-04-04"
        }
        assert extractor.validate_extraction(data) is True
    
    def test_validate_extraction_missing_field(self):
        """Test validation with missing field"""
        data = {
            "person": "John",
            "date": "2024-04-04"
        }
        assert extractor.validate_extraction(data) is False
    
    def test_validate_extraction_invalid_date(self):
        """Test validation with invalid date"""
        data = {
            "person": "John",
            "occasion_type": "birthday",
            "date": "invalid-date"
        }
        assert extractor.validate_extraction(data) is False
```

#### 2.3 Create API routes (api/auth.py)
```python
"""
Authentication API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from schemas import Token, UserCreate, UserResponse
from auth import get_or_create_user, create_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/login/test", response_model=Token)
async def test_login(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Test login endpoint for development
    In production, this would verify OAuth tokens
    """
    # Get or create user
    user = await get_or_create_user(
        db,
        email=user_data.email,
        full_name=user_data.full_name,
        provider=user_data.provider
    )
    
    # Create access token
    access_token = create_access_token({
        "sub": user.id,
        "email": user.email
    })
    
    return Token(
        access_token=access_token,
        user=UserResponse.from_orm(user)
    )

@router.post("/login/google", response_model=Token)
async def google_login(
    id_token: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Google OAuth login
    TODO: Implement actual Google token verification
    """
    # In production, verify the ID token with Google
    # For now, this is a placeholder
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Google login not yet implemented"
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user = Depends(get_current_user)
):
    """Get current user information"""
    return UserResponse.from_orm(current_user)
```

#### 2.4 Create API routes (api/occasions.py)
```python
"""
Occasions CRUD API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Optional
from datetime import date
from database import get_db
from models import Occasion, User
from schemas import (
    OccasionCreate, OccasionExtracted, OccasionResponse,
    OccasionUpdate, OccasionFilter
)
from auth import get_current_user
from ai_extractor import extractor

router = APIRouter(prefix="/api/occasions", tags=["occasions"])

@router.post("/extract", response_model=OccasionExtracted)
async def extract_occasion(
    data: OccasionCreate,
    current_user: User = Depends(get_current_user)
):
    """Extract occasion information from natural language text"""
    result = await extractor.extract_occasion_data(data.raw_input)
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not extract occasion information from the provided text"
        )
    
    extracted_data, confidence = result
    
    return OccasionExtracted(
        **extracted_data,
        confidence_score=confidence,
        raw_input=data.raw_input
    )

@router.post("/", response_model=OccasionResponse)
async def create_occasion(
    occasion_data: OccasionExtracted,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new occasion from extracted data"""
    # Create occasion object
    occasion = Occasion(
        owner_id=current_user.id,
        person=occasion_data.person,
        occasion_type=occasion_data.occasion_type,
        occasion_date=occasion_data.occasion_date,
        relationship=occasion_data.relationship,
        notes=occasion_data.notes,
        confidence_score=occasion_data.confidence_score,
        raw_input=occasion_data.raw_input
    )
    
    db.add(occasion)
    await db.commit()
    await db.refresh(occasion)
    
    return OccasionResponse.from_orm(occasion)

@router.get("/", response_model=List[OccasionResponse])
async def list_occasions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    person: Optional[str] = None,
    occasion_type: Optional[str] = None,
    upcoming_only: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List occasions with optional filters"""
    # Build query
    query = select(Occasion).where(Occasion.owner_id == current_user.id)
    
    # Apply filters
    if person:
        query = query.where(Occasion.person.ilike(f"%{person}%"))
    
    if occasion_type:
        query = query.where(Occasion.occasion_type.ilike(f"%{occasion_type}%"))
    
    if upcoming_only:
        query = query.where(Occasion.occasion_date >= date.today())
    
    # Order by date (upcoming first)
    query = query.order_by(Occasion.occasion_date).offset(skip).limit(limit)
    
    # Execute query
    result = await db.execute(query)
    occasions = result.scalars().all()
    
    return [OccasionResponse.from_orm(o) for o in occasions]

@router.get("/{occasion_id}", response_model=OccasionResponse)
async def get_occasion(
    occasion_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific occasion"""
    result = await db.execute(
        select(Occasion).where(
            and_(
                Occasion.id == occasion_id,
                Occasion.owner_id == current_user.id
            )
        )
    )
    occasion = result.scalar_one_or_none()
    
    if not occasion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Occasion not found"
        )
    
    return OccasionResponse.from_orm(occasion)

@router.put("/{occasion_id}", response_model=OccasionResponse)
async def update_occasion(
    occasion_id: int,
    update_data: OccasionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an occasion"""
    # Get occasion
    result = await db.execute(
        select(Occasion).where(
            and_(
                Occasion.id == occasion_id,
                Occasion.owner_id == current_user.id
            )
        )
    )
    occasion = result.scalar_one_or_none()
    
    if not occasion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Occasion not found"
        )
    
    # Update fields
    update_dict = update_data.dict(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(occasion, field, value)
    
    await db.commit()
    await db.refresh(occasion)
    
    return OccasionResponse.from_orm(occasion)

@router.delete("/{occasion_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_occasion(
    occasion_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an occasion"""
    # Get occasion
    result = await db.execute(
        select(Occasion).where(
            and_(
                Occasion.id == occasion_id,
                Occasion.owner_id == current_user.id
            )
        )
    )
    occasion = result.scalar_one_or_none()
    
    if not occasion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Occasion not found"
        )
    
    await db.delete(occasion)
    await db.commit()

@router.get("/search/", response_model=List[OccasionResponse])
async def search_occasions(
    q: str = Query(..., min_length=1),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Search occasions by text"""
    query = select(Occasion).where(
        and_(
            Occasion.owner_id == current_user.id,
            or_(
                Occasion.person.ilike(f"%{q}%"),
                Occasion.occasion_type.ilike(f"%{q}%"),
                Occasion.notes.ilike(f"%{q}%"),
                Occasion.raw_input.ilike(f"%{q}%")
            )
        )
    ).order_by(Occasion.occasion_date)
    
    result = await db.execute(query)
    occasions = result.scalars().all()
    
    return [OccasionResponse.from_orm(o) for o in occasions]
```

#### 2.5 Create main.py
```python
"""
FastAPI application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import create_tables
from api import auth, occasions
from config import settings

# Lifespan context manager for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await create_tables()
    print("Database tables created")
    yield
    # Shutdown
    print("Shutting down")

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Nuxt dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(occasions.router)

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "app": settings.app_name}

# Root endpoint
@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.app_name} API"}
```

#### 2.6 Create .env.example
```env
# API Keys
LITELLM_API_KEY=your-openai-api-key-here
LITELLM_MODEL=gpt-4o-mini

# Database
DATABASE_URL=sqlite+aiosqlite:///./occasions.db

# JWT Auth
JWT_SECRET_KEY=your-super-secret-key-here-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# OAuth (future implementation)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

#### 2.7 Run backend tests
```bash
cd backend

# Run all tests
uv run pytest -v

# Run with coverage
uv run pytest --cov=. --cov-report=html

# Run specific test file
uv run pytest tests/test_ai_extractor.py -v
```

---

### Phase 3: Frontend Setup (Day 3)

#### 3.1 Configure Nuxt (frontend/nuxt.config.ts)
```typescript
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt'
  ],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:8001'
    }
  },

  nitro: {
    devProxy: {
      '/api': {
        target: 'http://localhost:8001/api',
        changeOrigin: true
      }
    }
  },

  ssr: false, // SPA mode for simplicity
  
  typescript: {
    strict: true
  }
})
```

#### 3.2 Create Tailwind CSS config
```css
/* frontend/assets/css/main.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-colors duration-200;
  }
  
  .btn-primary {
    @apply bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800;
  }
  
  .btn-secondary {
    @apply bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400;
  }
  
  .btn-danger {
    @apply bg-red-600 text-white hover:bg-red-700 active:bg-red-800;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow;
  }
  
  .input {
    @apply w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent;
  }
  
  .label {
    @apply block text-sm font-medium text-gray-700 mb-1;
  }
}
```

#### 3.3 Create TypeScript types (types/index.ts)
```typescript
// User types
export interface User {
  id: number
  email: string
  full_name: string
  created_at: string
}

export interface AuthToken {
  access_token: string
  token_type: string
  user: User
}

// Occasion types
export type OccasionStatus = 'active' | 'completed' | 'dismissed'

export interface Occasion {
  id: number
  owner_id: number
  person: string
  occasion_type: string
  occasion_date: string
  relationship?: string
  notes?: string
  status: OccasionStatus
  confidence_score?: number
  days_until: number
  is_upcoming: boolean
  created_at: string
  updated_at: string
}

export interface OccasionCreate {
  raw_input: string
}

export interface OccasionExtracted {
  person: string
  occasion_type: string
  occasion_date: string
  relationship?: string
  notes?: string
  confidence_score: number
  raw_input: string
}

export interface OccasionUpdate {
  person?: string
  occasion_type?: string
  occasion_date?: string
  relationship?: string
  notes?: string
  status?: OccasionStatus
}

// API types
export interface ApiError {
  detail: string
}

export interface PaginationParams {
  skip?: number
  limit?: number
}

export interface OccasionFilters extends PaginationParams {
  person?: string
  occasion_type?: string
  upcoming_only?: boolean
}
```

#### 3.4 Create API composable (composables/useApi.ts)
```typescript
import type { $Fetch } from 'ofetch'

export const useApi = () => {
  const config = useRuntimeConfig()
  
  // Create a custom $fetch instance with auth headers
  const api: $Fetch = $fetch.create({
    baseURL: config.public.apiBase,
    onRequest({ request, options }) {
      // Add auth header if token exists
      const token = useCookie('auth-token').value
      if (token) {
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${token}`
        }
      }
    },
    onResponseError({ response }) {
      // Handle 401 errors
      if (response.status === 401) {
        // Clear auth and redirect to login
        const authStore = useAuthStore()
        authStore.logout()
        navigateTo('/login')
      }
    }
  })

  return { api }
}
```

#### 3.5 Create Auth store (stores/auth.ts)
```typescript
import { defineStore } from 'pinia'
import type { User, AuthToken } from '~/types'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    isAuthenticated: false
  }),

  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated
  },

  actions: {
    async login(email: string, fullName: string) {
      const { api } = useApi()
      
      try {
        // For development, use test login
        const response = await api<AuthToken>('/api/auth/login/test', {
          method: 'POST',
          body: {
            email,
            full_name: fullName,
            provider: 'test'
          }
        })

        // Store token and user
        this.token = response.access_token
        this.user = response.user
        this.isAuthenticated = true

        // Save token to cookie
        const tokenCookie = useCookie('auth-token', {
          httpOnly: false,
          secure: false, // Set to true in production
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 // 24 hours
        })
        tokenCookie.value = response.access_token

        return response
      } catch (error) {
        throw error
      }
    },

    async fetchCurrentUser() {
      const { api } = useApi()
      
      try {
        const user = await api<User>('/api/auth/me')
        this.user = user
        this.isAuthenticated = true
        return user
      } catch (error) {
        this.logout()
        throw error
      }
    },

    logout() {
      // Clear state
      this.user = null
      this.token = null
      this.isAuthenticated = false

      // Clear cookie
      const tokenCookie = useCookie('auth-token')
      tokenCookie.value = null

      // Redirect to login
      navigateTo('/login')
    },

    async initAuth() {
      // Check for existing token
      const tokenCookie = useCookie('auth-token')
      if (tokenCookie.value) {
        this.token = tokenCookie.value
        try {
          await this.fetchCurrentUser()
        } catch {
          // Token invalid, clear it
          this.logout()
        }
      }
    }
  }
})
```

#### 3.6 Create Auth middleware (middleware/auth.ts)
```typescript
export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  // Protected routes that require authentication
  const protectedRoutes = ['/app']
  
  if (protectedRoutes.includes(to.path) && !authStore.isLoggedIn) {
    return navigateTo('/login')
  }
})
```

#### 3.7 Create app.vue
```vue
<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
// Initialize auth on app mount
const authStore = useAuthStore()

onMounted(async () => {
  await authStore.initAuth()
})
</script>
```

---

### Phase 4: Frontend Components (Day 4)

#### 4.1 Create Login page (pages/login.vue)
```vue
<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Sign in to VibeKeeper
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Track and remember special occasions effortlessly
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <!-- Test login form for development -->
        <form @submit.prevent="handleTestLogin" class="space-y-6">
          <div>
            <label for="email" class="label">
              Email address
            </label>
            <input
              id="email"
              v-model="testEmail"
              type="email"
              required
              class="input"
              placeholder="test@example.com"
            />
          </div>

          <div>
            <label for="name" class="label">
              Full name
            </label>
            <input
              id="name"
              v-model="testName"
              type="text"
              required
              class="input"
              placeholder="Test User"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full btn btn-primary"
          >
            {{ loading ? 'Signing in...' : 'Sign in (Test)' }}
          </button>
        </form>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-3">
            <button
              @click="handleGoogleLogin"
              disabled
              class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span class="ml-2">Google</span>
            </button>

            <button
              @click="handleAppleLogin"
              disabled
              class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span class="ml-2">Apple</span>
            </button>
          </div>
        </div>

        <p class="mt-6 text-center text-xs text-gray-500">
          OAuth login coming soon. Use test login for now.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const loading = ref(false)
const testEmail = ref('test@example.com')
const testName = ref('Test User')

const handleTestLogin = async () => {
  loading.value = true
  try {
    await authStore.login(testEmail.value, testName.value)
    await navigateTo('/app')
  } catch (error) {
    console.error('Login failed:', error)
    // TODO: Show error message
  } finally {
    loading.value = false
  }
}

const handleGoogleLogin = () => {
  // TODO: Implement Google OAuth
  console.log('Google login not yet implemented')
}

const handleAppleLogin = () => {
  // TODO: Implement Apple OAuth
  console.log('Apple login not yet implemented')
}
</script>
```

#### 4.2 Create Landing page (pages/index.vue)
```vue
<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-gray-900">VibeKeeper</h1>
          </div>
          <div class="flex items-center">
            <NuxtLink
              to="/login"
              class="btn btn-primary"
            >
              Get Started
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <main>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="text-center">
          <h2 class="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Never Forget a
            <span class="text-blue-600"> Special Occasion</span>
          </h2>
          <p class="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Simply type naturally like "Mom's birthday is on April 15th" and let AI do the rest. 
            Track birthdays, anniversaries, and special moments effortlessly.
          </p>
          <div class="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div class="rounded-md shadow">
              <NuxtLink
                to="/login"
                class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                Start Using VibeKeeper
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Features -->
        <div class="mt-24">
          <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div class="pt-6">
              <div class="flow-root bg-white rounded-lg px-6 pb-8">
                <div class="-mt-6">
                  <div class="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                    <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                  <h3 class="mt-8 text-lg font-medium text-gray-900 tracking-tight">Natural Language Input</h3>
                  <p class="mt-5 text-base text-gray-500">
                    Just type as you would speak. Our AI understands phrases like "John's graduation on June 20th" instantly.
                  </p>
                </div>
              </div>
            </div>

            <div class="pt-6">
              <div class="flow-root bg-white rounded-lg px-6 pb-8">
                <div class="-mt-6">
                  <div class="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                    <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h3 class="mt-8 text-lg font-medium text-gray-900 tracking-tight">Smart Organization</h3>
                  <p class="mt-5 text-base text-gray-500">
                    Automatically categorizes occasions, tracks relationships, and shows you what's coming up next.
                  </p>
                </div>
              </div>
            </div>

            <div class="pt-6">
              <div class="flow-root bg-white rounded-lg px-6 pb-8">
                <div class="-mt-6">
                  <div class="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                    <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 class="mt-8 text-lg font-medium text-gray-900 tracking-tight">Easy Search & Filter</h3>
                  <p class="mt-5 text-base text-gray-500">
                    Find any occasion instantly. Filter by person, type, or browse upcoming events at a glance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// Redirect to app if already logged in
const authStore = useAuthStore()

onMounted(() => {
  if (authStore.isLoggedIn) {
    navigateTo('/app')
  }
})
</script>
```

#### 4.3 Create App Layout component (components/AppLayout.vue)
```vue
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900">VibeKeeper</h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">
              {{ authStore.currentUser?.full_name }}
            </span>
            <button
              @click="handleLogout"
              class="text-sm text-gray-500 hover:text-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
}
</script>
```

#### 4.4 Create Occasions composable (composables/useOccasions.ts)
```typescript
import type { 
  Occasion, 
  OccasionCreate, 
  OccasionExtracted, 
  OccasionUpdate,
  OccasionFilters 
} from '~/types'

export const useOccasions = () => {
  const { api } = useApi()
  
  // Extract occasion data from text
  const extractOccasion = async (rawInput: string) => {
    return await api<OccasionExtracted>('/api/occasions/extract', {
      method: 'POST',
      body: { raw_input: rawInput }
    })
  }
  
  // Create a new occasion
  const createOccasion = async (data: OccasionExtracted) => {
    return await api<Occasion>('/api/occasions/', {
      method: 'POST',
      body: data
    })
  }
  
  // List occasions with filters
  const listOccasions = async (filters?: OccasionFilters) => {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value))
        }
      })
    }
    
    return await api<Occasion[]>(`/api/occasions/?${params}`)
  }
  
  // Get single occasion
  const getOccasion = async (id: number) => {
    return await api<Occasion>(`/api/occasions/${id}`)
  }
  
  // Update occasion
  const updateOccasion = async (id: number, data: OccasionUpdate) => {
    return await api<Occasion>(`/api/occasions/${id}`, {
      method: 'PUT',
      body: data
    })
  }
  
  // Delete occasion
  const deleteOccasion = async (id: number) => {
    await api(`/api/occasions/${id}`, {
      method: 'DELETE'
    })
  }
  
  // Search occasions
  const searchOccasions = async (query: string) => {
    return await api<Occasion[]>(`/api/occasions/search/?q=${encodeURIComponent(query)}`)
  }
  
  return {
    extractOccasion,
    createOccasion,
    listOccasions,
    getOccasion,
    updateOccasion,
    deleteOccasion,
    searchOccasions
  }
}
```

#### 4.5 Create Occasion Input component (components/OccasionInput.vue)
```vue
<template>
  <div class="bg-white rounded-lg shadow p-6">
    <h2 class="text-lg font-medium text-gray-900 mb-4">Add New Occasion</h2>
    
    <!-- Input Form -->
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="occasion-input" class="label">
          Tell me about an occasion
        </label>
        <textarea
          id="occasion-input"
          v-model="inputText"
          rows="3"
          class="input"
          placeholder="E.g., Bahar's birthday is on April 4th, Mom's anniversary December 15th..."
          :disabled="loading"
        />
      </div>
      
      <button
        type="submit"
        :disabled="loading || !inputText.trim()"
        class="btn btn-primary"
      >
        {{ loading ? 'Processing...' : 'Extract & Save' }}
      </button>
    </form>

    <!-- Extraction Result -->
    <div v-if="extractedData && !saved" class="mt-6 p-4 bg-blue-50 rounded-lg">
      <h3 class="text-sm font-medium text-gray-900 mb-2">Extracted Information</h3>
      
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-600">Person:</span>
          <span class="font-medium">{{ extractedData.person }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Occasion:</span>
          <span class="font-medium">{{ extractedData.occasion_type }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Date:</span>
          <span class="font-medium">{{ formatDate(extractedData.occasion_date) }}</span>
        </div>
        <div v-if="extractedData.relationship" class="flex justify-between">
          <span class="text-gray-600">Relationship:</span>
          <span class="font-medium">{{ extractedData.relationship }}</span>
        </div>
        <div v-if="extractedData.notes" class="flex justify-between">
          <span class="text-gray-600">Notes:</span>
          <span class="font-medium">{{ extractedData.notes }}</span>
        </div>
      </div>

      <!-- Confidence Score -->
      <div class="mt-3">
        <ConfidenceScore :score="extractedData.confidence_score" />
      </div>

      <!-- Actions -->
      <div class="mt-4 flex space-x-2">
        <button
          @click="handleSave"
          :disabled="saving"
          class="btn btn-primary"
        >
          {{ saving ? 'Saving...' : 'Save' }}
        </button>
        <button
          @click="handleCancel"
          class="btn btn-secondary"
        >
          Cancel
        </button>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="saved" class="mt-4 p-4 bg-green-50 rounded-lg">
      <p class="text-sm text-green-800">
        ✓ Occasion saved successfully!
      </p>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mt-4 p-4 bg-red-50 rounded-lg">
      <p class="text-sm text-red-800">
        {{ error }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OccasionExtracted } from '~/types'
import dayjs from 'dayjs'

const emit = defineEmits<{
  created: [occasion: Occasion]
}>()

const { extractOccasion, createOccasion } = useOccasions()

const inputText = ref('')
const loading = ref(false)
const saving = ref(false)
const saved = ref(false)
const extractedData = ref<OccasionExtracted | null>(null)
const error = ref('')

const formatDate = (date: string) => {
  return dayjs(date).format('MMMM D, YYYY')
}

const handleSubmit = async () => {
  if (!inputText.value.trim()) return
  
  loading.value = true
  error.value = ''
  saved.value = false
  extractedData.value = null
  
  try {
    const result = await extractOccasion(inputText.value)
    extractedData.value = result
  } catch (err: any) {
    error.value = err.data?.detail || 'Failed to extract occasion information'
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  if (!extractedData.value) return
  
  saving.value = true
  error.value = ''
  
  try {
    const occasion = await createOccasion(extractedData.value)
    saved.value = true
    emit('created', occasion)
    
    // Reset form after delay
    setTimeout(() => {
      inputText.value = ''
      extractedData.value = null
      saved.value = false
    }, 2000)
  } catch (err: any) {
    error.value = err.data?.detail || 'Failed to save occasion'
  } finally {
    saving.value = false
  }
}

const handleCancel = () => {
  extractedData.value = null
  error.value = ''
}
</script>
```

#### 4.6 Create Confidence Score component (components/ConfidenceScore.vue)
```vue
<template>
  <div class="flex items-center space-x-2">
    <span class="text-sm text-gray-600">Confidence:</span>
    <div class="flex-1 bg-gray-200 rounded-full h-2">
      <div
        class="h-2 rounded-full transition-all duration-300"
        :class="barColorClass"
        :style="{ width: `${score * 100}%` }"
      />
    </div>
    <span class="text-sm font-medium" :class="textColorClass">
      {{ Math.round(score * 100) }}%
    </span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  score: number
}

const props = defineProps<Props>()

const barColorClass = computed(() => {
  if (props.score >= 0.9) return 'bg-green-500'
  if (props.score >= 0.7) return 'bg-yellow-500'
  return 'bg-red-500'
})

const textColorClass = computed(() => {
  if (props.score >= 0.9) return 'text-green-700'
  if (props.score >= 0.7) return 'text-yellow-700'
  return 'text-red-700'
})
</script>
```

#### 4.7 Create Occasion Card component (components/OccasionCard.vue)
```vue
<template>
  <div class="card hover:shadow-xl transition-all duration-200">
    <!-- Header -->
    <div class="flex justify-between items-start mb-4">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">
          {{ occasion.person }}
        </h3>
        <p class="text-sm text-gray-600">
          {{ occasion.occasion_type }}
          <span v-if="occasion.relationship" class="text-gray-500">
            • {{ occasion.relationship }}
          </span>
        </p>
      </div>
      
      <!-- Status Badge -->
      <span
        v-if="occasion.is_upcoming"
        class="px-2 py-1 text-xs font-medium rounded-full"
        :class="statusClass"
      >
        {{ daysText }}
      </span>
    </div>

    <!-- Date -->
    <div class="mb-3">
      <p class="text-sm font-medium text-gray-900">
        {{ formatDate(occasion.occasion_date) }}
      </p>
    </div>

    <!-- Notes -->
    <p v-if="occasion.notes" class="text-sm text-gray-600 mb-4">
      {{ occasion.notes }}
    </p>

    <!-- Actions -->
    <div class="flex justify-between items-center pt-4 border-t border-gray-100">
      <div class="flex space-x-2">
        <button
          @click="emit('edit', occasion)"
          class="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Edit
        </button>
        <button
          @click="handleDelete"
          class="text-sm text-red-600 hover:text-red-800 font-medium"
        >
          Delete
        </button>
      </div>
      
      <!-- Confidence indicator -->
      <div v-if="occasion.confidence_score" class="text-xs text-gray-500">
        AI: {{ Math.round(occasion.confidence_score * 100) }}%
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Occasion } from '~/types'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

interface Props {
  occasion: Occasion
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: [occasion: Occasion]
  delete: [id: number]
}>()

const formatDate = (date: string) => {
  return dayjs(date).format('MMMM D, YYYY')
}

const daysText = computed(() => {
  const days = props.occasion.days_until
  
  if (days === 0) return 'Today!'
  if (days === 1) return 'Tomorrow'
  if (days === -1) return 'Yesterday'
  if (days > 0) return `In ${days} days`
  return `${Math.abs(days)} days ago`
})

const statusClass = computed(() => {
  const days = props.occasion.days_until
  
  if (days === 0) return 'bg-red-100 text-red-800'
  if (days > 0 && days <= 7) return 'bg-yellow-100 text-yellow-800'
  if (days > 7 && days <= 30) return 'bg-blue-100 text-blue-800'
  if (days > 30) return 'bg-gray-100 text-gray-800'
  return 'bg-gray-100 text-gray-600'
})

const handleDelete = () => {
  if (confirm('Are you sure you want to delete this occasion?')) {
    emit('delete', props.occasion.id)
  }
}
</script>
```

#### 4.8 Create Search Filter component (components/SearchFilter.vue)
```vue
<template>
  <div class="bg-white rounded-lg shadow p-4">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- Search Input -->
      <div class="md:col-span-2">
        <input
          v-model="filters.search"
          type="text"
          placeholder="Search by name or type..."
          class="input"
          @input="debouncedEmit"
        />
      </div>
      
      <!-- Occasion Type Filter -->
      <div>
        <select
          v-model="filters.occasion_type"
          class="input"
          @change="handleChange"
        >
          <option value="">All Types</option>
          <option value="birthday">Birthday</option>
          <option value="anniversary">Anniversary</option>
          <option value="graduation">Graduation</option>
          <option value="wedding">Wedding</option>
          <option value="other">Other</option>
        </select>
      </div>
      
      <!-- Upcoming Only Toggle -->
      <div class="flex items-center">
        <label class="flex items-center cursor-pointer">
          <input
            v-model="filters.upcoming_only"
            type="checkbox"
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            @change="handleChange"
          />
          <span class="ml-2 text-sm text-gray-700">Upcoming only</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { debounce } from 'lodash-es'

interface Filters {
  search: string
  occasion_type: string
  upcoming_only: boolean
}

const emit = defineEmits<{
  change: [filters: Filters]
}>()

const filters = reactive<Filters>({
  search: '',
  occasion_type: '',
  upcoming_only: false
})

const handleChange = () => {
  emit('change', { ...filters })
}

const debouncedEmit = debounce(handleChange, 300)
</script>
```

#### 4.9 Create Main App page (pages/app.vue)
```vue
<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Page Title -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Your Occasions</h1>
        <p class="mt-1 text-sm text-gray-600">
          Track and remember all your special moments
        </p>
      </div>

      <!-- Add Occasion Form -->
      <OccasionInput @created="handleOccasionCreated" />

      <!-- Search and Filters -->
      <SearchFilter @change="handleFilterChange" />

      <!-- Occasions List -->
      <div v-if="loading" class="text-center py-8">
        <div class="inline-flex items-center">
          <svg class="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="ml-2 text-gray-600">Loading occasions...</span>
        </div>
      </div>

      <div v-else-if="occasions.length === 0" class="text-center py-8">
        <p class="text-gray-500">No occasions found. Add your first one above!</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <OccasionCard
          v-for="occasion in occasions"
          :key="occasion.id"
          :occasion="occasion"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>
    </div>

    <!-- Edit Modal (placeholder for now) -->
    <div v-if="editingOccasion" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-medium mb-4">Edit Occasion</h3>
        <p class="text-sm text-gray-600 mb-4">
          Edit functionality coming soon...
        </p>
        <button
          @click="editingOccasion = null"
          class="btn btn-secondary"
        >
          Close
        </button>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import type { Occasion } from '~/types'

// Protect this route
definePageMeta({
  middleware: 'auth'
})

const { listOccasions, deleteOccasion, searchOccasions } = useOccasions()

const occasions = ref<Occasion[]>([])
const loading = ref(true)
const editingOccasion = ref<Occasion | null>(null)
const currentFilters = ref({
  search: '',
  occasion_type: '',
  upcoming_only: false
})

// Load occasions on mount
const loadOccasions = async () => {
  loading.value = true
  try {
    if (currentFilters.value.search) {
      // Use search endpoint
      occasions.value = await searchOccasions(currentFilters.value.search)
    } else {
      // Use list with filters
      occasions.value = await listOccasions({
        person: currentFilters.value.search,
        occasion_type: currentFilters.value.occasion_type || undefined,
        upcoming_only: currentFilters.value.upcoming_only
      })
    }
  } catch (error) {
    console.error('Failed to load occasions:', error)
  } finally {
    loading.value = false
  }
}

// Handle filter changes
const handleFilterChange = async (filters: any) => {
  currentFilters.value = filters
  await loadOccasions()
}

// Handle occasion created
const handleOccasionCreated = async (occasion: Occasion) => {
  await loadOccasions()
}

// Handle edit
const handleEdit = (occasion: Occasion) => {
  editingOccasion.value = occasion
  // TODO: Implement edit modal
}

// Handle delete
const handleDelete = async (id: number) => {
  try {
    await deleteOccasion(id)
    await loadOccasions()
  } catch (error) {
    console.error('Failed to delete occasion:', error)
  }
}

// Load on mount
onMounted(() => {
  loadOccasions()
})
</script>
```

---

### Phase 5: Testing & Launch (Day 5)

#### 5.1 Backend Testing Checklist
```bash
cd backend

# 1. Run all tests
uv run pytest -v

# 2. Test API manually
uv run uvicorn main:app --reload --port 8001

# 3. Check API docs
# Visit http://localhost:8001/docs

# 4. Test each endpoint:
# - POST /api/auth/login/test
# - POST /api/occasions/extract
# - POST /api/occasions/
# - GET /api/occasions/
# - PUT /api/occasions/{id}
# - DELETE /api/occasions/{id}
```

#### 5.2 Frontend Testing Checklist
```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Manual testing flow:
# - Visit http://localhost:3000
# - Click "Get Started"
# - Login with test credentials
# - Add an occasion: "Mom's birthday is on April 15th"
# - Verify extraction works
# - Save the occasion
# - Test search/filter
# - Test delete
```

#### 5.3 Integration Testing

1. **Full Flow Test**:
   - Start backend: `cd backend && uv run uvicorn main:app --reload`
   - Start frontend: `cd frontend && npm run dev`
   - Complete user journey from login to occasion management

2. **Error Handling**:
   - Test with invalid API key
   - Test with malformed input
   - Test network errors

3. **Performance**:
   - Add 50+ occasions
   - Test search/filter performance
   - Check loading states

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