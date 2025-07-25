# 🎯 VibeKeeper Mini-MVP Checklist

## Overview

Build an AI-powered occasion & subscription tracking app completely with Go. Users can input forms or via natural language like "Bahar's birthday is on April 4th" or "i pay for spotify 9 euros each month" and AI extracts structured data.

## Tech Stack

- **Backend**: FastAPI + SQLAlchemy + SQLite
- **Frontend**: Nuxt 3 + Vue 3 + Tailwind CSS  
- **AI**: LiteLLM (OpenAI/GPT-4)
- **Auth**: JWT tokens (OAuth ready)
- **Package Management**: UV for Python, npm for Node

---

## 📋 Phase 0: Environment Setup ✅ **COMPLETED**

### Backend Setup ✅

- [x] Create `mini-mvp/backend` directory structure
- [x] Initialize UV project: `uv init --no-readme --no-pin-python`
- [x] Create virtual environment: `uv venv && source .venv/bin/activate`
- [x] Create `.env.example` file with API keys template
- [x] Create `.gitignore` for Python/Node/IDE files
- [x] Move existing files (`ai_extractor.py`, `models.py`) to backend structure
- [x] Create proper Python package structure with `__init__.py` files

### Frontend Setup ✅

- [x] Create `mini-mvp/frontend` directory
- [x] Initialize Nuxt 3: `npx nuxi@latest init . --force` (with Bun)
- [x] Install core dependencies: `bun add -D @nuxtjs/tailwindcss @pinia/nuxt`
- [x] Install utilities: `bun add dayjs axios @vueuse/nuxt`
- [x] Configure `nuxt.config.ts` with modules and runtime config
- [x] Create directory structure: `components/`, `composables/`, `middleware/`, `stores/`

### Dependencies Status ✅

**Backend Dependencies Installed:**
- [x] FastAPI, Uvicorn, SQLAlchemy, AIOSQLite
- [x] LiteLLM for AI integration
- [x] Pydantic, Python-Jose, Passlib for auth
- [x] Development tools: pytest, httpx, faker

**Frontend Dependencies Installed:**
- [x] Nuxt 3 + Vue 3 base
- [x] Tailwind CSS integration
- [x] Pinia for state management
- [x] VueUse utilities
- [x] Axios for API calls, DayJS for dates

---

## 📋 Phase 1: Backend Core (Day 1) ✅

### Dependencies & Configuration

- [ ] Install all backend dependencies via UV:
  ```bash
  uv add fastapi uvicorn[standard] sqlalchemy aiosqlite litellm pydantic python-multipart python-jose[cryptography] passlib[bcrypt] pydantic-settings python-dotenv
  ```
- [ ] Create `config.py` with environment settings
- [ ] Create `database.py` with async SQLAlchemy setup

### Data Models

- [ ] Create enhanced `models.py`:
  - [ ] User model (id, email, full_name, provider)
  - [ ] Occasion model with all fields
  - [ ] Helper methods (days_until, is_upcoming)
- [ ] Create `schemas.py` with Pydantic models:
  - [ ] Auth schemas (UserCreate, Token, etc.)
  - [ ] Occasion schemas (Create, Update, Response)
  - [ ] Filter schemas

### AI Integration

- [ ] Enhance `ai_extractor.py`:
  - [ ] Confidence scoring
  - [ ] Better date parsing
  - [ ] Relationship extraction
  - [ ] Error handling

### Authentication

- [ ] Create `auth.py`:
  - [ ] JWT token creation/verification
  - [ ] User management functions
  - [ ] Protected route dependencies

---

## 📋 Phase 2: Backend API (Day 2) ✅

### API Routes

- [ ] Create `api/auth.py`:
  - [ ] POST `/api/auth/login/test` (dev login)
  - [ ] POST `/api/auth/login/google` (placeholder)
  - [ ] GET `/api/auth/me` (current user)

- [ ] Create `api/occasions.py`:
  - [ ] POST `/api/occasions/extract` (AI extraction)
  - [ ] POST `/api/occasions/` (create)
  - [ ] GET `/api/occasions/` (list with filters)
  - [ ] GET `/api/occasions/{id}` (single)
  - [ ] PUT `/api/occasions/{id}` (update)
  - [ ] DELETE `/api/occasions/{id}` (delete)
  - [ ] GET `/api/occasions/search/` (search)

### Main Application

- [ ] Create `main.py`:
  - [ ] FastAPI app setup
  - [ ] CORS middleware
  - [ ] Database initialization
  - [ ] Router mounting
  - [ ] Health check endpoint

### Testing

- [ ] Create test fixtures (`tests/conftest.py`)
- [ ] Write AI extractor tests
- [ ] Write API endpoint tests
- [ ] Run tests: `uv run pytest -v`

---

## 📋 Phase 3: Frontend Setup (Day 3) ✅

### Configuration

- [ ] Configure `nuxt.config.ts`:
  - [ ] API proxy setup
  - [ ] Tailwind CSS
  - [ ] Module configuration
  - [ ] TypeScript strict mode

### Core Files

- [ ] Create `types/index.ts` with TypeScript interfaces
- [ ] Create `assets/css/main.css` with Tailwind utilities
- [ ] Create `app.vue` with auth initialization

### Composables & Stores

- [ ] Create `composables/useApi.ts` (API client base)
- [ ] Create `composables/useAuth.ts` (auth logic)
- [ ] Create `composables/useOccasions.ts` (occasions API)
- [ ] Create `stores/auth.ts` (Pinia auth state)
- [ ] Create `middleware/auth.ts` (route protection)

### Pages

- [ ] Create `pages/login.vue`:
  - [ ] Test login form
  - [ ] OAuth placeholders
  - [ ] Error handling

- [ ] Create `pages/index.vue`:
  - [ ] Landing page
  - [ ] Hero section
  - [ ] Feature cards
  - [ ] CTA buttons

---

## 📋 Phase 4: Frontend Components (Day 4) ✅

### Layout Components

- [ ] Create `components/AppLayout.vue`:
  - [ ] Header with user info
  - [ ] Logout functionality
  - [ ] Main content wrapper

### Feature Components

- [ ] Create `components/OccasionInput.vue`:
  - [ ] Textarea for natural language
  - [ ] AI extraction display
  - [ ] Confidence score
  - [ ] Save/cancel actions

- [ ] Create `components/OccasionCard.vue`:
  - [ ] Display all occasion details
  - [ ] Days until indicator
  - [ ] Edit/delete buttons
  - [ ] Status badges

- [ ] Create `components/SearchFilter.vue`:
  - [ ] Search input
  - [ ] Type filter dropdown
  - [ ] Upcoming only toggle
  - [ ] Debounced updates

- [ ] Create `components/ConfidenceScore.vue`:
  - [ ] Visual confidence bar
  - [ ] Color coding
  - [ ] Percentage display

### Main App Page

- [ ] Create `pages/app.vue`:
  - [ ] Protected by auth middleware
  - [ ] Occasion input form
  - [ ] Search/filter controls
  - [ ] Occasions grid
  - [ ] Loading states
  - [ ] Empty states

---

## 📋 Phase 5: Testing & Polish (Day 5) ✅

### Backend Testing

- [ ] Run all tests: `uv run pytest -v`
- [ ] Test API manually via docs: `http://localhost:8001/docs`
- [ ] Verify all endpoints work
- [ ] Check error handling

### Frontend Testing

- [ ] Test login flow
- [ ] Test occasion creation
- [ ] Test AI extraction accuracy
- [ ] Test search/filter
- [ ] Test edit/delete
- [ ] Test responsive design

### Integration Testing

- [ ] Full user journey test
- [ ] Error state testing
- [ ] Performance with 50+ occasions
- [ ] Cross-browser testing

### Final Polish

- [ ] Loading animations
- [ ] Error messages
- [ ] Success feedback
- [ ] Mobile optimization
- [ ] Accessibility basics

---

## 🚀 Launch Commands

### Backend

```bash
cd mini-mvp/backend
source .venv/bin/activate
uv run uvicorn main:app --reload --port 8001
```

### Frontend

```bash
cd mini-mvp/frontend
npm install
npm run dev
```

### Access Points

- Frontend: http://localhost:3000
- API Docs: http://localhost:8001/docs

---

## ✅ Success Metrics

### Functionality

- [ ] Natural language → structured data (>90% accuracy)
- [ ] All CRUD operations work
- [ ] Search and filters functional
- [ ] Data persists between sessions

### User Experience  

- [ ] < 3 clicks to add occasion
- [ ] < 2s AI extraction time
- [ ] Mobile responsive
- [ ] Clear error messages

### Technical

- [ ] Tests passing
- [ ] No console errors
- [ ] API response < 200ms
- [ ] Handles edge cases

---

## 🐛 Common Issues & Fixes

1. **LITELLM_API_KEY Error**: Check `.env` file has valid OpenAI key
2. **CORS Error**: Verify backend allows `http://localhost:3000`
3. **Auth Error**: Check JWT_SECRET_KEY is set
4. **Port in Use**: Kill process `lsof -ti:8001 | xargs kill -9`
5. **Import Errors**: Ensure virtual env is activated

---

## 📝 Next Steps After MVP

1. **Authentication**: Implement real OAuth (Google/Apple)
2. **Notifications**: Email/push reminders
3. **Features**: Recurring events, attachments, sharing
4. **Mobile**: PWA or native apps
5. **Scale**: PostgreSQL, Redis, deployment