
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