# VibeKeeper Mini MVP - Validation Checklist

## Concept
AI-powered occasion keeper/reminder app and organization tool to validate the core value proposition with minimal tech complexity.

## Goal
Validate that users find value in:
1. Natural language occasion capture
2. AI extraction of recipient, occasion, budget, etc.
3. Simple organization of occasion reminders
4. Basic search and filter functionality for easy retrieval

## Tech Stack (Minimal)
- **Framework**: Python + Nuxt/Vue
- **Interactivity**: refer to Vue-Nuxt-guide.md
- **Server**: Uvicorn (async ASGI server)
- **AI**: LiteLLM library (supports multiple providers)
- **Storage**: SQLite with async ORM (simple file-based DB)
- **Styling**: refer to Vue-Nuxt-guide.md

## MVP Feature Checklist

### Core Features ✅

- [ ] **Simple Text Input Form**
  - Single textarea for capturing event, birthday, anniversary, etc.
  - Example: "Bahar birthday is on 04/04" - "My anniversary is on 05/05"

- [ ] **AI-Powered Extraction** (LiteLLM)
  - Extract: person name, occasion type, date, relationship, notes
  - Display confidence score
  - Allow manual editing of extracted data

- [ ] **Basic Occasion Display**
  - Card-based layout showing extracted information
  - Status indicators (upcoming/past/dismissed)
  - Edit/delete functionality

- [ ] **Simple Search & Filter**
  - Filter by person name
  - Filter by occasion type (birthday, anniversary, etc.)
  - Sort by date (upcoming first)

- [ ] **Database Persistence**
  - Save occasions to SQLite database
  - Simple single-user setup for MVP

### UI Components ✅

- [ ] **Landing Page**
  - Simple hero section explaining the concept
  - a big button to start using the app

- [ ] **Main App Interface**
  - Clean, minimal design
  - Mobile-friendly responsive layout
  - Clear visual hierarchy

- [ ] **Occasion Cards**
  - Display: person, occasion type, date, relationship, notes
  - Action buttons: edit, mark reminded, delete
  - Visual indicators for upcoming/past events
  - Days until/since counter

### Technical Implementation ✅

- [ ] **Database Setup**
  - SQLite with async ORM (SQLAlchemy or similar)
  - Simple occasion model (person, occasion, date, notes)
  - Basic CRUD operations

- [ ] **LiteLLM Integration**
  - Setup API key configuration
  - Create extraction prompt template
  - Handle API responses and errors
  - Parse JSON output from AI

## Validation Metrics

### AI Accuracy
- [ ] Extraction accuracy rate (target: >95% correct)
- [ ] User edit rate (lower is better)
- [ ] Fields successfully extracted (person, date should be 90%+)

## File Structure

```python
/mini-mvp/
├── main.py             # app entry point
├── components/
│   ├── __init__.py
│   ├── layout.py       # Base layout components
│   ├── forms.py        # Form components
│   └── cards.py        # Occasion card components
├── models.py           # Database models
├── ai_extractor.py     # LiteLLM integration
├── static/
│   └── style.css       # Minimal CSS
├── occasions.db        # SQLite database
└── requirements.txt    # Python dependencies
```

## Success Criteria
- [ ] **Technical**: App works end-to-end without errors
- [ ] **User Experience**: Users can add and find occasions easily
- [ ] **AI Performance**: Extraction works for 9/10 test cases

## Next Steps After Validation
If MVP shows promise:
1. Add user authentication
2. Build proper backend with database
3. Add push notifications/email reminders
4. Mobile app development
5. Calendar integration and recurring events

---

**Timeline**: 1-2 weeks to build and test
**Budget**: ~$20-50 for AI API calls during testing
**Risk**: Low - minimal investment, quick to pivot if needed

## Quick Start Commands

```bash
# Create virtual environment
uv venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies
uv pip install fasthtml htmx litellm uvicorn sqlalchemy aiosqlite

# Run development server
uvicorn main:app --reload
```