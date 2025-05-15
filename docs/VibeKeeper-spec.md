
# VibeKeeper Implementation Specification

## 1. Project Overview & Architecture

VibeKeeper is an iOS-first app for capturing and managing gift ideas and important occasions, with AI-powered entity extraction.

### System Architecture Overview

```
+-------------------+          +--------------------+          +------------------+
|                   |          |                    |          |                  |
| iOS Client        |<-------->| FastAPI Backend    |<-------->| PostgreSQL DB     |
| (SwiftUI)         |  REST    |                    |  SQL     |                  |
|                   |  API     |                    |          |                  |
+-------------------+          +--------------------+          +------------------+
                                      ^      ^
                                      |      |
                               +------+      +-------+
                               |                     |
                    +----------v----------+ +---------v--------+
                    |                     | |                  |
                    | LLM Service         | | Storage Service  |
                    |                     | | (S3/equivalent   |
                    |                     | | for media files) |
                    +---------------------+ +------------------+
```

## 2. Reusable Components but with Modifications

### Core Backend Components

1. **FastAPI Application Structure**
   - Reuse main.py pattern for app setup
   - Adapt middleware configuration for mobile client needs

2. **Database Layer**
   - Reuse SQLAlchemy setup from database.py
   - Adapt migration management with Alembic

3. **AI Integration**
   - Reuse LLM client framework from client.py
   - Adapt prompting and entity extraction logic

4. **Search Functionality**
   - Adapt search implementation from `src/fabriktakt/api/routers/search.py`

5. **Core Configuration**
   - Reuse configuration pattern from config.py

### Components Requiring Significant Modification

1. **Authentication System**
   - Replace Telegram auth with JWT/OAuth for mobile clients

2. **Data Models**
   - Create new models for VibeKeeper entities

3. **API Endpoints**
   - Design new endpoints specific to gift ideas, contacts, etc.

4. **Notification System**
   - Build new system for reminders and push notifications

## 3. Backend Implementation Plan

### 3.1 Project Structure

```
src/
  vibekeeper/
    __init__.py
    main.py                  # FastAPI application entry point
    config.py                # Configuration management
    api/                     # API endpoints
      routers/
        auth.py              # Authentication endpoints
        capture.py           # Multi-modal capture endpoint
        gift_ideas.py        # Gift idea CRUD
        contacts.py          # Contact/recipient CRUD
        reminders.py         # Reminder management
        search.py            # Search functionality
      schemas/               # Pydantic models
        auth.py              # Authentication schemas
        gift_idea.py         # Gift idea schemas
        contact.py           # Contact schemas
        reminder.py          # Reminder schemas
    core/                    # Business logic
      services/
        auth_service.py      # Authentication service
        capture_service.py   # Multi-modal capture processing
        gift_service.py      # Gift idea management
        contact_service.py   # Contact management
        reminder_service.py  # Reminder scheduling & notifications
        search_service.py    # Search implementation
      models.py              # Domain models
    persistence/             # Database access
      database.py            # Database connection
      sqlalchemy_models.py   # SQLAlchemy models
      repositories/          # Repository pattern implementations
    ai/                      # AI integration
      client.py              # LLM client
      prompts/               # Prompt templates
        entity_extraction.py # Gift idea entity extraction
      processors/            # Input processors
        text_processor.py    # Text processing
        voice_processor.py   # Voice transcription
        image_processor.py   # Image analysis
    utils/                   # Utility functions
      notifications.py       # Push notification helpers
      date_utils.py          # Date handling utilities
    background/              # Background tasks
      reminder_scheduler.py  # Reminder scheduling
```

### 3.2 Database Schema Implementation

#### SQLAlchemy Models (persistence/sqlalchemy_models.py)

```python
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Boolean, JSON, Text, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True)
    name = Column(String)
    hashed_password = Column(String)
    preferences = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    contacts = relationship("Contact", back_populates="user")
    gift_ideas = relationship("GiftIdea", back_populates="user")
    reminders = relationship("Reminder", back_populates="user")

class Contact(Base):
    __tablename__ = "contacts"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    name = Column(String, index=True)
    relationship = Column(String)
    preferences = Column(JSON, default=dict)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="contacts")
    gift_ideas = relationship("GiftIdea", back_populates="recipient")
    occasions = relationship("Occasion", back_populates="contact")

class GiftIdea(Base):
    __tablename__ = "gift_ideas"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    recipient_id = Column(String, ForeignKey("contacts.id"))
    idea = Column(String)
    occasion = Column(String)
    date = Column(DateTime)
    tags = Column(JSON, default=list)
    budget_amount = Column(Float)
    budget_currency = Column(String, default="USD")
    budget_range_min = Column(Float)
    budget_range_max = Column(Float)
    status = Column(String, default="idea")  # idea, purchased, given
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="gift_ideas")
    recipient = relationship("Contact", back_populates="gift_ideas")
    media_assets = relationship("MediaAsset", back_populates="gift_idea")
    reminders = relationship("Reminder", back_populates="gift_idea")

class MediaAsset(Base):
    __tablename__ = "media_assets"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    gift_idea_id = Column(String, ForeignKey("gift_ideas.id"))
    url = Column(String)
    type = Column(String)  # image, audio, etc.
    created_at = Column(DateTime, default=datetime.utcnow)
    
    gift_idea = relationship("GiftIdea", back_populates="media_assets")

class Reminder(Base):
    __tablename__ = "reminders"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    gift_idea_id = Column(String, ForeignKey("gift_ideas.id"))
    scheduled_for = Column(DateTime)
    message = Column(String)
    channel = Column(String, default="push")  # push, email, etc.
    status = Column(String, default="pending")  # pending, sent, cancelled
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="reminders")
    gift_idea = relationship("GiftIdea", back_populates="reminders")

class Occasion(Base):
    __tablename__ = "occasions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    contact_id = Column(String, ForeignKey("contacts.id"))
    name = Column(String)
    date = Column(DateTime)
    recurring = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    contact = relationship("Contact", back_populates="occasions")
```

### 3.3 Core API Implementation

#### Authentication API (api/routers/auth.py)

```python
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from ...core.services.auth_service import AuthService
from ...persistence.database import get_db
from ..schemas.auth import Token, TokenData, UserCreate, UserResponse

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])
auth_service = AuthService()

# User registration
@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    return auth_service.register_user(db, user_data)

# User login
@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    return auth_service.authenticate_user(db, form_data.username, form_data.password)

# Token refresh
@router.post("/refresh", response_model=Token)
async def refresh_token(token: TokenData, db: Session = Depends(get_db)):
    return auth_service.refresh_token(db, token)
```

#### Gift Ideas API (api/routers/gift_ideas.py)

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from ...core.services.gift_service import GiftService
from ...persistence.database import get_db
from ..schemas.gift_idea import GiftIdeaCreate, GiftIdeaUpdate, GiftIdeaResponse
from ..dependencies import get_current_user
from ...persistence.sqlalchemy_models import User

router = APIRouter(prefix="/api/v1/gift-ideas", tags=["gift_ideas"])
gift_service = GiftService()

# Get all gift ideas for current user
@router.get("/", response_model=List[GiftIdeaResponse])
async def get_gift_ideas(
    recipient_id: Optional[str] = None,
    occasion: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return gift_service.get_gift_ideas(
        db, 
        user_id=current_user.id,
        recipient_id=recipient_id,
        occasion=occasion,
        status=status
    )

# Create new gift idea
@router.post("/", response_model=GiftIdeaResponse, status_code=status.HTTP_201_CREATED)
async def create_gift_idea(
    gift_idea: GiftIdeaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return gift_service.create_gift_idea(db, gift_idea, current_user.id)

# Get gift idea by ID
@router.get("/{gift_idea_id}", response_model=GiftIdeaResponse)
async def get_gift_idea(
    gift_idea_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return gift_service.get_gift_idea(db, gift_idea_id, current_user.id)

# Update gift idea
@router.put("/{gift_idea_id}", response_model=GiftIdeaResponse)
async def update_gift_idea(
    gift_idea_id: str,
    gift_idea_data: GiftIdeaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return gift_service.update_gift_idea(db, gift_idea_id, gift_idea_data, current_user.id)

# Delete gift idea
@router.delete("/{gift_idea_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_gift_idea(
    gift_idea_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    gift_service.delete_gift_idea(db, gift_idea_id, current_user.id)
    return {"status": "success"}
```

#### Multi-modal Capture API (api/routers/capture.py)

```python
from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from ...core.services.capture_service import CaptureService
from ...persistence.database import get_db
from ..schemas.gift_idea import GiftIdeaCreate, GiftIdeaResponse
from ..dependencies import get_current_user
from ...persistence.sqlalchemy_models import User

router = APIRouter(prefix="/api/v1/capture", tags=["capture"])
capture_service = CaptureService()

# Text capture endpoint
@router.post("/text", response_model=GiftIdeaResponse)
async def capture_text(
    text_content: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Process text input and extract gift idea entities"""
    return await capture_service.process_text(db, text_content, current_user.id)

# Voice capture endpoint
@router.post("/voice", response_model=GiftIdeaResponse)
async def capture_voice(
    voice_file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Process voice recording and extract gift idea entities"""
    return await capture_service.process_voice(db, voice_file, current_user.id)

# Image capture endpoint
@router.post("/image", response_model=GiftIdeaResponse)
async def capture_image(
    image_file: UploadFile = File(...),
    caption: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Process image and extract gift idea entities"""
    return await capture_service.process_image(db, image_file, caption, current_user.id)

# Unified capture endpoint
@router.post("/", response_model=GiftIdeaResponse)
async def unified_capture(
    content_type: str = Form(...),  # "text", "voice", "image"
    text_content: Optional[str] = Form(None),
    media_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Unified endpoint for all capture types"""
    return await capture_service.process_capture(
        db, 
        content_type, 
        text_content, 
        media_file, 
        current_user.id
    )
```

### 3.4 AI Integration for Entity Extraction

#### Entity Extraction Prompt (ai/prompts/entity_extraction.py)

```python
GIFT_IDEA_EXTRACTION_PROMPT = """
You are an AI assistant helping to extract structured information about gift ideas from user input.
Extract the following entities if present:

- recipient: Who is this gift for?
- idea: What is the gift idea?
- occasion: What's the occasion? (birthday, anniversary, Christmas, etc.)
- date: When is the occasion? (YYYY-MM-DD format)
- tags: Keywords that describe the gift (comma-separated list)
- budget: How much is the user planning to spend? (numeric value)
- notes: Any additional information

User input: {user_input}

Respond with a JSON object containing the extracted entities.
"""

TRANSCRIPTION_PROMPT = """
You are an AI assistant helping to transcribe audio about gift ideas.
The audio may contain the following information:
- Who the gift is for
- What the gift idea is
- When and what the occasion is
- Budget information
- Any other relevant details

Transcribe the audio content accurately, preserving all gift-related information.
"""

IMAGE_ANALYSIS_PROMPT = """
You are an AI assistant analyzing an image of a potential gift.
Describe what you see in the image, focusing on:
- What the item appears to be
- Visual characteristics (color, shape, size if apparent)
- Any text visible in the image
- Brand names or identifiable features
- What kind of gift this might be and who it might be suitable for

If there's a caption provided: "{caption}", use this to provide context.

Respond with a detailed description that could help identify this as a gift idea.
"""

def create_gift_extraction_prompt(user_input: str) -> str:
    """Create a prompt for gift idea entity extraction"""
    return GIFT_IDEA_EXTRACTION_PROMPT.format(user_input=user_input)

def create_transcription_prompt() -> str:
    """Create a prompt for audio transcription"""
    return TRANSCRIPTION_PROMPT

def create_image_analysis_prompt(caption: str = None) -> str:
    """Create a prompt for image analysis"""
    return IMAGE_ANALYSIS_PROMPT.format(caption=caption or "No caption provided")
```

#### Capture Service Implementation (core/services/capture_service.py)

```python
import io
import json
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any

from ...ai.client import LLMClient
from ...ai.prompts.entity_extraction import (
    create_gift_extraction_prompt, 
    create_transcription_prompt,
    create_image_analysis_prompt
)
from ..services.gift_service import GiftService
from ...persistence.sqlalchemy_models import MediaAsset
from ...utils.storage import upload_file_to_storage

class CaptureService:
    def __init__(self):
        self.llm_client = LLMClient()
        self.gift_service = GiftService()
    
    async def process_text(self, db: Session, text_content: str, user_id: str):
        """Process text input and extract gift entities"""
        # Create prompt for entity extraction
        prompt = create_gift_extraction_prompt(text_content)
        
        # Call LLM for entity extraction
        extraction_result = await self.llm_client.generate_completion(prompt)
        
        # Parse the extracted entities
        try:
            entities = json.loads(extraction_result)
        except json.JSONDecodeError:
            # If JSON parsing fails, try to extract with a more robust method
            entities = self._extract_fallback(extraction_result)
            
        # Create gift idea from extracted entities
        gift_idea = self._create_gift_idea_from_entities(entities, user_id)
        
        # Save to database
        return self.gift_service.create_gift_idea(db, gift_idea, user_id)
    
    async def process_voice(self, db: Session, voice_file: UploadFile, user_id: str):
        """Process voice recording and extract gift entities"""
        # Read audio file
        audio_bytes = await voice_file.read()
        
        # Transcribe audio using Whisper or similar
        transcription = await self.llm_client.transcribe_audio(
            audio_bytes,
            create_transcription_prompt()
        )
        
        # Process the transcribed text
        return await self.process_text(db, transcription, user_id)
    
    async def process_image(self, db: Session, image_file: UploadFile, caption: Optional[str], user_id: str):
        """Process image and extract gift entities"""
        # Read image file
        image_bytes = await image_file.read()
        
        # Analyze image using Vision model
        image_description = await self.llm_client.analyze_image(
            image_bytes,
            create_image_analysis_prompt(caption)
        )
        
        # Process the image description
        gift_idea = await self.process_text(db, image_description, user_id)
        
        # Upload image to storage
        image_url = await upload_file_to_storage(
            file_bytes=io.BytesIO(image_bytes),
            file_name=f"{gift_idea.id}_{image_file.filename}",
            content_type=image_file.content_type
        )
        
        # Add media asset
        media_asset = MediaAsset(
            gift_idea_id=gift_idea.id,
            url=image_url,
            type="image"
        )
        db.add(media_asset)
        db.commit()
        
        return gift_idea
    
    async def process_capture(
        self, 
        db: Session, 
        content_type: str,
        text_content: Optional[str],
        media_file: Optional[UploadFile],
        user_id: str
    ):
        """Unified method for all capture types"""
        if content_type == "text" and text_content:
            return await self.process_text(db, text_content, user_id)
        elif content_type == "voice" and media_file:
            return await self.process_voice(db, media_file, user_id)
        elif content_type == "image" and media_file:
            return await self.process_image(db, media_file, text_content, user_id)
        else:
            raise HTTPException(
                status_code=400,
                detail="Invalid content type or missing required data"
            )
    
    def _extract_fallback(self, text: str) -> Dict[str, Any]:
        """Fallback extraction method for non-JSON LLM responses"""
        entities = {}
        
        # Simple extraction with regex or string parsing
        # (Implementation details omitted for brevity)
        
        return entities
    
    def _create_gift_idea_from_entities(self, entities: Dict[str, Any], user_id: str):
        """Convert extracted entities to GiftIdeaCreate schema"""
        # Convert entity format to match the GiftIdeaCreate model
        # (Implementation details omitted for brevity)
        
        return gift_idea_create
```

### 3.5 Notification System

#### Reminder Service (core/services/reminder_service.py)

```python
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException
from typing import List, Optional

from ...persistence.sqlalchemy_models import Reminder, GiftIdea, User
from ...utils.notifications import send_push_notification
from ..models import ReminderCreate, ReminderUpdate

class ReminderService:
    async def create_reminder(self, db: Session, reminder_data: ReminderCreate, user_id: str):
        """Create a new reminder"""
        # Check if gift idea exists and belongs to user
        gift_idea = db.query(GiftIdea).filter(
            GiftIdea.id == reminder_data.gift_idea_id,
            GiftIdea.user_id == user_id
        ).first()
        
        if not gift_idea:
            raise HTTPException(status_code=404, detail="Gift idea not found")
        
        # Create reminder
        reminder = Reminder(
            user_id=user_id,
            gift_idea_id=reminder_data.gift_idea_id,
            scheduled_for=reminder_data.scheduled_for,
            message=reminder_data.message,
            channel=reminder_data.channel,
            status="pending"
        )
        
        db.add(reminder)
        db.commit()
        db.refresh(reminder)
        
        # Schedule the reminder in background task system
        await self._schedule_reminder(reminder.id)
        
        return reminder
    
    async def get_reminders(
        self, 
        db: Session, 
        user_id: str,
        status: Optional[str] = None,
        from_date: Optional[datetime] = None,
        to_date: Optional[datetime] = None
    ) -> List[Reminder]:
        """Get reminders for a user with optional filters"""
        query = db.query(Reminder).filter(Reminder.user_id == user_id)
        
        if status:
            query = query.filter(Reminder.status == status)
        
        if from_date:
            query = query.filter(Reminder.scheduled_for >= from_date)
        
        if to_date:
            query = query.filter(Reminder.scheduled_for <= to_date)
        
        return query.order_by(Reminder.scheduled_for).all()
    
    async def get_reminder(self, db: Session, reminder_id: str, user_id: str) -> Reminder:
        """Get a specific reminder"""
        reminder = db.query(Reminder).filter(
            Reminder.id == reminder_id,
            Reminder.user_id == user_id
        ).first()
        
        if not reminder:
            raise HTTPException(status_code=404, detail="Reminder not found")
            
        return reminder
    
    async def update_reminder(
        self, 
        db: Session, 
        reminder_id: str, 
        reminder_data: ReminderUpdate, 
        user_id: str
    ) -> Reminder:
        """Update a reminder"""
        reminder = await self.get_reminder(db, reminder_id, user_id)
        
        # Update fields
        for field, value in reminder_data.dict(exclude_unset=True).items():
            setattr(reminder, field, value)
        
        db.commit()
        db.refresh(reminder)
        
        # Re-schedule reminder if date changed
        if "scheduled_for" in reminder_data.dict(exclude_unset=True):
            await self._cancel_reminder(reminder_id)
            await self._schedule_reminder(reminder_id)
        
        return reminder
    
    async def delete_reminder(self, db: Session, reminder_id: str, user_id: str):
        """Delete a reminder"""
        reminder = await self.get_reminder(db, reminder_id, user_id)
        
        # Cancel scheduled reminder
        await self._cancel_reminder(reminder_id)
        
        # Delete from database
        db.delete(reminder)
        db.commit()
    
    async def process_due_reminders(self, db: Session):
        """Process all due reminders (to be called by scheduler)"""
        now = datetime.utcnow()
        due_reminders = db.query(Reminder).filter(
            Reminder.scheduled_for <= now,
            Reminder.status == "pending"
        ).all()
        
        for reminder in due_reminders:
            await self._send_reminder(db, reminder)
    
    async def generate_reminders_for_occasion(self, db: Session, gift_idea_id: str, user_id: str):
        """Generate appropriate reminders for a gift idea based on occasion"""
        gift_idea = db.query(GiftIdea).filter(
            GiftIdea.id == gift_idea_id,
            GiftIdea.user_id == user_id
        ).first()
        
        if not gift_idea or not gift_idea.date:
            return []
        
        user = db.query(User).filter(User.id == user_id).first()
        lead_time = 7  # Default 7 days before
        
        # Use user preferences if available
        if user and user.preferences and "notificationLeadTime" in user.preferences:
            lead_time = user.preferences["notificationLeadTime"]
        
        # Create reminder for lead time days before
        reminder_date = gift_idea.date - timedelta(days=lead_time)
        
        # Only create if reminder date is in the future
        if reminder_date > datetime.utcnow():
            reminder_data = ReminderCreate(
                gift_idea_id=gift_idea_id,
                scheduled_for=reminder_date,
                message=f"Don't forget {gift_idea.recipient.name}'s {gift_idea.occasion} on {gift_idea.date.strftime('%B %d')}!",
                channel="push"
            )
            
            await self.create_reminder(db, reminder_data, user_id)
    
    async def _schedule_reminder(self, reminder_id: str):
        """Schedule a reminder in the background task system"""
        # Implementation depends on background task system
        # This could use Celery, FastAPI background tasks, etc.
        pass
    
    async def _cancel_reminder(self, reminder_id: str):
        """Cancel a scheduled reminder"""
        # Implementation depends on background task system
        pass
    
    async def _send_reminder(self, db: Session, reminder: Reminder):
        """Send a reminder notification"""
        try:
            # Get associated gift idea and user for context
            gift_idea = db.query(GiftIdea).filter(GiftIdea.id == reminder.gift_idea_id).first()
            user = db.query(User).filter(User.id == reminder.user_id).first()
            
            if not gift_idea or not user:
                raise Exception("Missing gift idea or user data")
            
            # Determine appropriate notification channel
            if reminder.channel == "push":
                # Send push notification (implementation in utils/notifications.py)
                await send_push_notification(
                    user_id=user.id,
                    title=f"Gift Reminder: {gift_idea.recipient.name}'s {gift_idea.occasion}",
                    body=reminder.message,
                    data={
                        "gift_idea_id": gift_idea.id,
                        "reminder_id": reminder.id,
                        "type": "reminder"
                    }
                )
            # Add other channels as needed
            
            # Update reminder status
            reminder.status = "sent"
            db.commit()
            
        except Exception as e:
            # Log error
            reminder.status = "failed"
            db.commit()
            raise e
```

## 4. iOS Client Implementation Plan

### 4.1 Project Structure

```
VibeKeeper/
  App/
    AppDelegate.swift          # App lifecycle management
    SceneDelegate.swift         # Scene management
    VibeKeeperApp.swift         # SwiftUI app entry point
  
  Features/
    Authentication/
      Views/
        LoginView.swift
        RegisterView.swift
      ViewModels/
        AuthViewModel.swift
    
    Capture/
      Views/
        CaptureView.swift
        TextCaptureView.swift
        VoiceCaptureView.swift
        ImageCaptureView.swift
      ViewModels/
        CaptureViewModel.swift
    
    GiftIdeas/
      Views/
        GiftIdeaListView.swift
        GiftIdeaDetailView.swift
        GiftIdeaEditView.swift
      ViewModels/
        GiftIdeaViewModel.swift
    
    Contacts/
      Views/
        ContactListView.swift
        ContactDetailView.swift
        ContactEditView.swift
      ViewModels/
        ContactViewModel.swift
    
    Reminders/
      Views/
        ReminderListView.swift
        ReminderDetailView.swift
      ViewModels/
        ReminderViewModel.swift
    
    Search/
      Views/
        SearchView.swift
      ViewModels/
        SearchViewModel.swift
  
  Core/
    API/
      NetworkManager.swift      # Base networking
      Endpoints.swift           # API endpoints
      APIClient.swift           # API client implementation
      Models/                   # API request/response models
    
    Storage/
      CoreDataStack.swift       # CoreData setup
      Models/                   # CoreData models
      Repositories/             # Repository pattern implementations
    
    Sync/
      SyncManager.swift         # iCloud sync
      SyncOperation.swift       # Sync operations
    
    Notifications/
      NotificationManager.swift  # Push notification handling
    
    Utils/
      DateUtils.swift           # Date handling
      FormatUtils.swift         # Formatting
      Extensions/               # Swift extensions
  
  Resources/
    Assets.xcassets             # App assets
    LaunchScreen.storyboard     # Launch screen
    Info.plist                  # App configuration
    VibeKeeper.xcdatamodeld     # CoreData model
```

### 4.2 Core Data Model

```swift
// CoreData models for local storage in VibeKeeper.xcdatamodeld

// User
entity User {
    uuid: String
    email: String
    name: String
    preferences: Binary // Serialized JSON
    createdAt: Date
    updatedAt: Date
    
    relationships {
        contacts: Contact[] // one-to-many
        giftIdeas: GiftIdea[] // one-to-many
        reminders: Reminder[] // one-to-many
    }
}

// Contact
entity Contact {
    uuid: String
    name: String
    relationship: String
    preferences: Binary // Serialized JSON
    notes: String
    createdAt: Date
    updatedAt: Date
    syncStatus: Integer // 0=synced, 1=pending, 2=conflict
    
    relationships {
        user: User // many-to-one
        giftIdeas: GiftIdea[] // one-to-many
        occasions: Occasion[] // one-to-many
    }
}

// GiftIdea
entity GiftIdea {
    uuid: String
    idea: String
    occasion: String
    date: Date
    tags: Binary // Serialized JSON array
    budgetAmount: Double
    budgetCurrency: String
    budgetRangeMin: Double
    budgetRangeMax: Double
    status: String // idea, purchased, given
    notes: String
    createdAt: Date
    updatedAt: Date
    syncStatus: Integer // 0=synced, 1=pending, 2=conflict
    
    relationships {
        user: User // many-to-one
        recipient: Contact // many-to-one
        mediaAssets: MediaAsset[] // one-to-many
        reminders: Reminder[] // one-to-many
    }
}

// MediaAsset
entity MediaAsset {
    uuid: String
    url: String
    type: String
    localUrl: String? // For offline access
    createdAt: Date
    syncStatus: Integer // 0=synced, 1=pending, 2=conflict
    
    relationships {
        giftIdea: GiftIdea // many-to-one
    }
}

// Reminder
entity Reminder {
    uuid: String
    scheduledFor: Date
    message: String
    channel: String
    status: String // pending, sent, cancelled
    createdAt: Date
    updatedAt: Date
    syncStatus: Integer // 0=synced, 1=pending, 2=conflict
    
    relationships {
        user: User // many-to-one
        giftIdea: GiftIdea // many-to-one
    }
}

// Occasion
entity Occasion {
    uuid: String
    name: String
    date: Date
    recurring: Boolean
    createdAt: Date
    updatedAt: Date
    syncStatus: Integer // 0=synced, 1=pending, 2=conflict
    
    relationships {
        contact: Contact // many-to-one
    }
}
```

### 4.3 API Client

```swift
import Foundation
import Combine

enum APIError: Error {
    case invalidURL
    case requestFailed(Error)
    case invalidResponse
    case decodingError(Error)
    case serverError(Int, String)
    case unauthorized
    case unknown
}

class APIClient {
    private let baseURL = "https://api.vibekeeper.app/api/v1"
    private var authToken: String?
    private let session: URLSession
    
    init(session: URLSession = .shared) {
        self.session = session
    }
    
    func setAuthToken(_ token: String) {
        self.authToken = token
    }
    
    func clearAuthToken() {
        self.authToken = nil
    }
    
    // Generic request method with Combine
    func request<T: Decodable>(
        endpoint: String,
        method: String = "GET",
        body: Data? = nil,
        headers: [String: String]? = nil
    ) -> AnyPublisher<T, APIError> {
        guard let url = URL(string: "\(baseURL)/\(endpoint)") else {
            return Fail(error: APIError.invalidURL).eraseToAnyPublisher()
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.httpBody = body
        
        // Set content type if body is present
        if body != nil {
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        }
        
        // Set auth token if available
        if let token = authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        // Add custom headers
        headers?.forEach { key, value in
            request.setValue(value, forHTTPHeaderField: key)
        }
        
        return session.dataTaskPublisher(for: request)
            .mapError { APIError.requestFailed($0) }
            .flatMap { data, response -> AnyPublisher<T, APIError> in
                guard let httpResponse = response as? HTTPURLResponse else {
                    return Fail(error: APIError.invalidResponse).eraseToAnyPublisher()
                }
                
                switch httpResponse.statusCode {
                case 200...299:
                    do {
                        let decoder = JSONDecoder()
                        decoder.keyDecodingStrategy = .convertFromSnakeCase
                        decoder.dateDecodingStrategy = .iso8601
                        let decoded = try decoder.decode(T.self, from: data)
                        return Just(decoded)
                            .setFailureType(to: APIError.self)
                            .eraseToAnyPublisher()
                    } catch {
                        return Fail(error: APIError.decodingError(error)).eraseToAnyPublisher()
                    }
                case 401:
                    return Fail(error: APIError.unauthorized).eraseToAnyPublisher()
                default:
                    return Fail(error: APIError.serverError(httpResponse.statusCode, String(data: data, encoding: .utf8) ?? "")).eraseToAnyPublisher()
                }
            }
            .eraseToAnyPublisher()
    }
    
    // Multipart upload for files
    func uploadMultipartFormData(
        endpoint: String,
        parameters: [String: String],
        fileData: Data,
        fileName: String,
        parameterName: String,
        mimeType: String
    ) -> AnyPublisher<Data, APIError> {
        guard let url = URL(string: "\(baseURL)/\(endpoint)") else {
            return Fail(error: APIError.invalidURL).eraseToAnyPublisher()
        }
        
        // Generate boundary string
        let boundary = "Boundary-\(UUID().uuidString)"
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        
        // Set auth token if available
        if let token = authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        // Create body
        var body = Data()
        
        // Add parameters
        for (key, value) in parameters {
            body.append("--\(boundary)\r\n")
            body.append("Content-Disposition: form-data; name=\"\(key)\"\r\n\r\n")
            body.append("\(value)\r\n")
        }
        
        // Add file data
        body.append("--\(boundary)\r\n")
        body.append("Content-Disposition: form-data; name=\"\(parameterName)\"; filename=\"\(fileName)\"\r\n")
        body.append("Content-Type: \(mimeType)\r\n\r\n")
        body.append(fileData)
        body.append("\r\n")
        
        // Add final boundary
        body.append("--\(boundary)--\r\n")
        
        request.httpBody = body
        
        return session.dataTaskPublisher(for: request)
            .mapError { APIError.requestFailed($0) }
            .map { $0.data }
            .eraseToAnyPublisher()
    }
}

// Extensions to help with string and data handling
extension Data {
    mutating func append(_ string: String) {
        if let data = string.data(using: .utf8) {
            self.append(data)
        }
    }
}
```

### 4.4 Capture View Model

```swift
import Foundation
import Combine
import SwiftUI
import AVFoundation

class CaptureViewModel: ObservableObject {
    enum CaptureMode {
        case text
        case voice
        case image
    }
    
    enum CaptureState {
        case ready
        case recording
        case processing
        case success
        case failure(Error)
    }
    
    // Published properties
    @Published var captureMode: CaptureMode = .text
    @Published var captureState: CaptureState = .ready
    @Published var textInput: String = ""
    @Published var capturedImage: UIImage?
    @Published var imageCaption: String = ""
    @Published var processingProgress: Double = 0
    @Published var extractedGiftIdea: GiftIdeaResponse?
    
    // Voice recording properties
    private var audioRecorder: AVAudioRecorder?
    private var recordingURL: URL?
    
    // Dependencies
    private let apiClient: APIClient
    private var cancellables = Set<AnyCancellable>()
    
    init(apiClient: APIClient = APIClient()) {
        self.apiClient = apiClient
        self.setupAudioRecording()
    }
    
    // MARK: - Actions
    
    func captureText() {
        guard !textInput.isEmpty else { return }
        
        captureState = .processing
        
        // Create parameters
        let params = ["text_content": textInput]
        
        // API call to process text
        apiClient.request(endpoint: "capture/text", method: "POST", body: try? JSONEncoder().encode(params))
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case let .failure(error) = completion {
                        self?.captureState = .failure(error)
                    }
                },
                receiveValue: { [weak self] (response: GiftIdeaResponse) in
                    self?.extractedGiftIdea = response
                    self?.captureState = .success
                }
            )
            .store(in: &cancellables)
    }
    
    func startVoiceRecording() {
        guard audioRecorder != nil, captureState == .ready else { return }
        
        captureState = .recording
        audioRecorder?.record()
    }
    
    func stopVoiceRecording() {
        guard captureState == .recording else { return }
        
        audioRecorder?.stop()
        captureState = .processing
        
        // Process the recorded audio
        processVoiceRecording()
    }
    
    func captureImage(image: UIImage) {
        capturedImage = image
    }
    
    func processImageCapture() {
        guard let image = capturedImage, let imageData = image.jpegData(compressionQuality: 0.8) else {
            captureState = .failure(NSError(domain: "VibeKeeper", code: 1001, userInfo: [NSLocalizedDescriptionKey: "Invalid image data"]))
            return
        }
        
        captureState = .processing
        
        // Upload image for processing
        apiClient.uploadMultipartFormData(
            endpoint: "capture/image",
            parameters: ["caption": imageCaption],
            fileData: imageData,
            fileName: "capture.jpg",
            parameterName: "image_file",
            mimeType: "image/jpeg"
        )
        .receive(on: DispatchQueue.main)
        .sink(
            receiveCompletion: { [weak self] completion in
                if case let .failure(error) = completion {
                    self?.captureState = .failure(error)
                }
            },
            receiveValue: { [weak self] data in
                do {
                    let decoder = JSONDecoder()
                    decoder.keyDecodingStrategy = .convertFromSnakeCase
                    let response = try decoder.decode(GiftIdeaResponse.self, from: data)
                    self?.extractedGiftIdea = response
                    self?.captureState = .success
                } catch {
                    self?.captureState = .failure(error)
                }
            }
        )
        .store(in: &cancellables)
    }
    
    func resetCapture() {
        captureState = .ready
        textInput = ""
        capturedImage = nil
        imageCaption = ""
        extractedGiftIdea = nil
        processingProgress = 0
    }
    
    // MARK: - Private Methods
    
    private func setupAudioRecording() {
        let audioSession = AVAudioSession.sharedInstance()
        
        do {
            try audioSession.setCategory(.record, mode: .default)
            try audioSession.setActive(true)
            
            // Create temp URL for recording
            let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            recordingURL = documentsPath.appendingPathComponent("voice_capture.m4a")
            
            // Recording settings
            let settings = [
                AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
                AVSampleRateKey: 44100,
                AVNumberOfChannelsKey: 1,
                AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
            ]
            
            // Create and configure recorder
            if let url = recordingURL {
                audioRecorder = try AVAudioRecorder(url: url, settings: settings)
                audioRecorder?.prepareToRecord()
            }
        } catch {
            print("Audio recording setup failed: \(error)")
        }
    }
    
    private func processVoiceRecording() {
        guard let url = recordingURL, FileManager.default.fileExists(atPath: url.path) else {
            captureState = .failure(NSError(domain: "VibeKeeper", code: 1002, userInfo: [NSLocalizedDescriptionKey: "Recording not found"]))
            return
        }
        
        do {
            let audioData = try Data(contentsOf: url)
            
            // Upload audio for processing
            apiClient.uploadMultipartFormData(
                endpoint: "capture/voice",
                parameters: [:],
                fileData: audioData,
                fileName: "voice_capture.m4a",
                parameterName: "voice_file",
                mimeType: "audio/m4a"
            )
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case let .failure(error) = completion {
                        self?.captureState = .failure(error)
                    }
                },
                receiveValue: { [weak self] data in
                    do {
                        let decoder = JSONDecoder()
                        decoder.keyDecodingStrategy = .convertFromSnakeCase
                        let response = try decoder.decode(GiftIdeaResponse.self, from: data)
                        self?.extractedGiftIdea = response
                        self?.captureState = .success
                    } catch {
                        self?.captureState = .failure(error)
                    }
                }
            )
            .store(in: &cancellables)
            
        } catch {
            captureState = .failure(error)
        }
    }
}
```

## 5. Implementation Steps & Timeline

### Phase 1: Core Backend Setup (2 weeks)

1. **Week 1: Initial Setup**
   - Set up project structure based on best practices
   - Configure FastAPI application with middleware
   - Set up SQLAlchemy and Alembic
   - Configure JWT authentication
   - Implement basic user model and auth endpoints

2. **Week 2: Core Data Models & Endpoints**
   - Implement SQLAlchemy models for all entities
   - Create Pydantic schemas for API
   - Implement basic CRUD operations
   - Set up core API endpoints

### Phase 2: AI Integration (2 weeks)

3. **Week 3: Entity Extraction Pipeline**
   - AI client for gift idea extraction
   - Implement text processing and entity extraction
   - Create prompt templates and response parsing
   - Set up validation mechanisms

4. **Week 4: Multi-modal Processing**
   - Implement voice transcription using Whisper
   - Set up image analysis using Vision models
   - Create unified capture processing pipeline
   - Test pipeline with various input types

### Phase 3: Advanced Backend Features (2 weeks)

5. **Week 5: Search & Recommendations**
   - Implement search functionality with filters
   - Create recommendation engine
   - Set up advanced query capabilities
   - Add related content suggestions

6. **Week 6: Notification System**
   - Build reminder scheduling system
   - Implement notification dispatch mechanisms
   - Create recurrence patterns for occasions
   - Set up background tasks for reminders

### Phase 4: iOS App Development (4 weeks)

7. **Weeks 7-8: Core iOS App**
   - Set up SwiftUI project structure
   - Implement authentication flow
   - Create data models and Core Data integration
   - Build API client for backend communication

8. **Weeks 9-10: iOS Features**
   - Implement multi-modal capture UI
   - Create gift idea management screens
   - Build contact/recipient management
   - Add search and browse functionality
   - Implement reminder UI and notifications

### Phase 5: Integration & Testing (2 weeks)

1. **Weeks 11-12: Testing & Refinement**

- End-to-end testing of core workflows
- Performance optimization
- Security review
- Bug fixes and refinements
- Prepare for initial release

## 6. Key Implementation Considerations

1. **Authentication & Security**
   - Use JWT for secure authentication
   - Implement proper token refresh mechanisms
   - Secure API endpoints with appropriate permissions
   - Follow iOS security best practices for token storage

2. **Offline Functionality**
   - Implement robust local storage with Core Data
   - Sync mechanism between local and cloud data
   - Conflict resolution strategy
   - Queue operations when offline

3. **Performance Optimization**
   - Optimize database queries with proper indexing
   - Implement efficient caching strategies
   - Minimize network requests
   - Optimize image processing and storage

4. **User Experience**
   - Ensure responsive UI during processing
   - Provide clear feedback during AI operations
   - Implement intuitive multi-modal capture flow
   - Make search and filtering intuitive

5. **Testing Strategy**
   - Unit tests for core services
   - Integration tests for API endpoints
   - UI tests for critical user flows
   - Performance and load testing

This implementation specification provides a detailed roadmap for developing the VibeKeeper app by leveraging your existing open source/free tech stack. The approach focuses on reusing core components while adapting them to the specific requirements of VibeKeeper and adding new features for gift idea management, multi-modal capture, and iOS-specific functionality.