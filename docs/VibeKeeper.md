# VibeKeeper AI – Technical Specification

---

## 1. Introduction

**Concept:** Capture and organize gift ideas and important dates (birthdays, anniversaries, occasions) for friends and family via voice or text. AI extracts recipient, gift idea, occasion/date, tags, budget, and notes. Track occasions and perfect presents.

User/Creator: I have many friends and family members, all over the world. I want to keep track of their birthdays and special occasions, and I often have gift ideas that I want to remember. I need a simple way to capture these ideas and get reminders when the time comes.
I want to be able to search for gift ideas by recipient, occasion, or tags. I also want to be able to set reminders for upcoming occasions and get notifications when it's time to buy a gift. when i want to travel and want to buy gifts for my friends and family, I want to be able to see all the gift ideas I have for them in one place. I also want to be able to see how much I've spent on gifts for each person, so I can stay within my budget.

**AI Twist:**

- Auto-tagging: recipient, relationship, occasion, category, budget
- Suggests similar/trending gifts based on user history and preferences
- Schedules and sends timely reminders (notifications) for upcoming occasions

**Key Features:**

- Multi-modal capture (voice, text, photo)
- Structured JSON output: `{ recipient, idea, occasion, date, tags, budget }`
- Search by recipient, occasion, budget, or tag
- Reminder management with push notifications
- Budget tracking for gift spending
- Gift history tracking and recommendations
- Calendar sync for important dates
- Integration with contacts for relationship management

**Target Audience:** Thoughtful gift-givers, planners, and busy individuals who want to track ideas and never miss a deadline.

**Origin:** Derived from the FabrikTakt core concept of "AI-powered capture, structuring, and retrieval of information" ([microsaas.md](microsaas.md)).

---

## 2. Core Features

- Multi-modal capture (text, voice, image)
- Entity extraction: recipient, idea, occasion, date, tags, budget
- Reminder scheduling & notifications
- Search & retrieval by recipient/occasion/tag
- Relationship management & contact integration
- Gift history tracking & recommendation engine
- Budget monitoring & price tracking integration
- Calendar sync (Apple Calendar, Google Calendar)

---

## 3. System Architecture

- Reuse FabrikTakt pipeline components:
  - Ingestion API
  - Pre-processing (Whisper for voice, Vision for images)
  - AI Orchestration (LLM for entity extraction)
  - Validation & Transformation
  - Persistence & Search
  - Notification service

**Platform Implementation Strategy:**

1. **iOS App (Phase 1):**
   - Swift UI frontend
   - Local SQLite + iCloud sync
   - iOS-native notifications & widgets
   - SiriKit integration for voice capture
2. **Backend Services (Phase 1-2):**
   - FastAPI backend on cloud
   - Postgres for structured data
   - S3/equivalent for media
   - Redis for caching & task queue
3. **Android App (Phase 2):**
   - Kotlin/Jetpack Compose frontend
   - Firebase integration
4. **Web App (Phase 3):**
   - React/Next.js frontend
   - PWA capabilities

![System Architecture Diagram](#)

---

## 4. Data Model

### Core Entities

#### User
```json
{
  "id": "UUID",
  "email": "String",
  "name": "String",
  "preferences": {
    "notificationLeadTime": "Int",
    "defaultBudgetRange": [25, 100],
    "preferredNotificationChannels": ["push", "email", "telegram"]
  },
  "created_at": "DateTime",
  "updated_at": "DateTime"
}
```

#### Contact/Recipient
```json
{
  "id": "UUID",
  "userId": "UUID",
  "name": "String",
  "relationship": "String",
  "preferences": {
    "likes": ["String"],
    "dislikes": ["String"],
    "sizes": {},
    "favoriteColors": ["String"]
  },
  "notes": "String",
  "created_at": "DateTime",
  "updated_at": "DateTime"
}
```

#### GiftIdea
```json
{
  "id": "UUID",
  "userId": "UUID",
  "recipientId": "UUID",
  "idea": "String",
  "occasion": "String",
  "date": "Date",
  "tags": ["String"],
  "budget": {
    "amount": 45.00,
    "currency": "USD",
    "range": [40, 50]
  },
  "status": "idea",
  "notes": "String",
  "mediaUrls": ["String"],
  "created_at": "DateTime",
  "updated_at": "DateTime"
}
```

#### Reminder
```json
{
  "id": "UUID",
  "userId": "UUID",
  "giftIdeaId": "UUID",
  "scheduledFor": "DateTime",
  "message": "String",
  "channel": "push",
  "status": "pending",
  "created_at": "DateTime",
  "updated_at": "DateTime"
}
```

**DB tables (Postgres):**

- users
- contacts
- gift_ideas
- reminders
- occasions (recurring dates)
- media_assets

---

## 5. API Endpoints

### Authentication

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`

### Capture & Core

- `POST /api/v1/capture` (projectType=VibeKeeper)
- `GET /api/v1/search` (Query: recipient, occasion, tag, dateRange, budget)
- `GET /api/v1/suggestions` (Gift recommendations)

### Contacts/Recipients

- `GET /api/v1/contacts`
- `POST /api/v1/contacts`
- `GET /api/v1/contacts/{id}`
- `PUT /api/v1/contacts/{id}`
- `DELETE /api/v1/contacts/{id}`

### Gift Ideas

- `GET /api/v1/gift-ideas`
- `POST /api/v1/gift-ideas`
- `GET /api/v1/gift-ideas/{id}`
- `PUT /api/v1/gift-ideas/{id}`
- `DELETE /api/v1/gift-ideas/{id}`

### Reminders

- `GET /api/v1/reminders`
- `POST /api/v1/reminders`
- `GET /api/v1/reminders/{id}`
- `PUT /api/v1/reminders/{id}`
- `DELETE /api/v1/reminders/{id}`

---

## 6. AI Orchestration & Prompting

### Entity Extraction Prompt Template

```
You are an AI assistant helping to extract structured information about gift ideas from user input.
Extract the following entities if present:

- recipient: Who is this gift for?
- idea: What is the gift idea?
- occasion: What's the occasion? (birthday, anniversary, Christmas, etc.)
- date: When is the occasion? (YYYY-MM-DD format)
- tags: Keywords that describe the gift (comma-separated list)
- budget: How much is the user planning to spend? (numeric value)
- notes: Any additional information

User input: {userInput}
```

### Example Prompt + Expected JSON Output

**Prompt:**
> I want to get Sarah a knitted scarf for her birthday on February 15th. Budget around $40-50. She likes blue and purple colors.

**Expected Output:**
```json
{
  "recipient": "Sarah",
  "idea": "knitted scarf",
  "occasion": "birthday",
  "date": "2024-02-15",
  "tags": ["knitted", "scarf", "blue", "purple", "winter", "accessories"],
  "budget": {
    "amount": 45,
    "range": [40, 50],
    "currency": "USD"
  },
  "notes": "She likes blue and purple colors."
}
```

### Error Handling & Fallbacks

- **Incomplete Extraction:** If key fields (recipient, idea) can't be extracted, prompt user for clarification
- **Date Parsing:** Ask for explicit confirmation if date is ambiguous
- **Budget Parsing:** Handle currency symbols, ranges, and approximate values ("around $50")
- **Confidence Scoring:** Include confidence level for each extracted entity
- **Feedback Loop:** Allow users to correct AI extraction errors to improve model over time

---

## 7. Notifications

### Scheduler

- Uses background tasks (Celery/FastAPI BackgroundTasks) for scheduled reminders
- Calculates optimal reminder times based on:
  - User preference settings
  - Occasion proximity
  - Gift status (idea vs. purchased)
- Calendar integration with iOS Calendar and later Google Calendar

### Notification Channels

- **iOS Push Notifications:** Primary channel for Phase 1
- **Email:** Secondary channel for important reminders
- **Telegram Integration:** Optional, leveraging FabrikTakt's bot framework
- **iOS Widgets:** At-a-glance upcoming occasions
- **Apple Watch Integration:** Quick capture and timely reminders

### Message Templates

- **Upcoming Occasion:**
  > Don't forget {recipient}'s {occasion} on {date} ({daysUntil} days from now)
- **Gift Idea Reminder:**
  > You had an idea to get {recipient} a {idea} for their {occasion}
- **Budget Alert:**
  > You've saved {count} gift ideas for {recipient} totaling {totalBudget}
- **Gift History:**
  > Last year you got {recipient} a {previousGift} for their {occasion}

---

## 8. Frontend Flow Sketch

### iOS-First Approach

- **Swift UI Components:**
  - Tab navigation (Ideas, Contacts, Calendar, Settings)
  - Multi-modal capture sheet (text, voice, photo)
  - Contact detail view with occasion timeline
  - Gift idea cards with status tracking
  - Search interface with natural language capability
  - Reminder inbox and settings

### User Flow Diagrams

1. **Capture Flow:**
   - Quick add → capture method → AI processing → review & confirm
   - Voice: "Hey Siri, add gift idea to VibeKeeper"
2. **Search & Browse Flow:**
   - Filter by contact → view gift ideas → sort by date/occasion
   - Natural language search: "What should I get Dad for his birthday?"
3. **Reminder Management Flow:**
   - Receive notification → view details → mark purchased/given/dismissed
   - Set custom reminder schedules

### Mobile-First Wireframes

- Capture UI (text/voice/photo)
- Search & filter screens
- Reminder inbox
- Contact profile view
- Occasion timeline
- Settings panel

[Insert wireframe placeholders]

---

## 9. Deployment & Infrastructure

### iOS App Infrastructure

- Swift UI + Combine for reactive UI
- Core Data for local persistence
- CloudKit for iCloud sync
- App Extensions:
  - Share extension for quick capture
  - Siri integration
  - Widget extension

### Backend Services

- **Compute:** FastAPI on Docker containers; scalable cloud functions for AI
- **Storage:** Postgres with JSON; S3/equivalent for media
- **Caching & Queue:** Redis for caching; Redis/RabbitMQ for task queue
- **AI Services:** OpenAI API/Equivalent; reuse FabrikTakt's AI orchestration

### Authentication & Security

- OAuth 2.0 / OpenID Connect
- JWT for API authentication
- HTTPS throughout
- Data encryption at rest and in transit
- Privacy-focused approach

### Monitoring & Logging

- Centralized logging (from FabrikTakt)
- Performance monitoring
- Error tracking
- Usage analytics

---

## 10. Development Roadmap

### Phase 1: iOS MVP (3 months)

- Core capture & entity extraction
- Basic recipient management
- Simple reminders & notifications
- Local persistence with iCloud sync
- Essential AI functions

### Phase 2: Backend & Android (3 months)

- Full backend API implementation
- Advanced AI features
- Android app development
- Cross-platform data synchronization

### Phase 3: Web & Advanced Features (4 months)

- Web application
- Enhanced recommendation engine
- Social features (optional)
- Third-party integrations

**Future Enhancements:**

- Price Tracking: API integrations for price tracking
- Social Recommendations: Opt-in sharing of anonymized gift ideas
- AR Integration: Visualize gifts in space
- Group Gifting: Coordinate shared gifts
- Import from Contacts: Auto-import birthdays and dates

---

## 11. References to FabrikTakt

This project leverages FabrikTakt platform components:

1. **Core AI Pipeline:** Capture-structure-retrieve pattern ([microsaas.md](microsaas.md))
2. **Prompt Engineering:** Entity extraction techniques
3. **Backend Infrastructure:** Modular API architecture
4. **Storage Patterns:** Structured/unstructured storage approach

Refer to FabrikTakt docs for:

- AI orchestration patterns
- Prompt templates and tuning
- Entity extraction validation
- Multi-modal input processing

---

## 12. Additional Notes

- **Compliance:** GDPR and CCPA built-in
- **Accessibility:** iOS and Android accessibility support
- **Internationalization:** Multi-language support (start with English)
- **Data Ownership:** Users retain complete ownership of their data