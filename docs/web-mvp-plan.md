# VibeKeeper Web MVP - Implementation Plan

---

## 1. Project Overview

**Goal:** Build a web-first MVP of VibeKeeper that preserves the core AI-powered gift idea capture while being simpler to develop and validate than the full iOS app.

**Core Value Proposition:** AI-powered gift idea extraction and organization - capture ideas naturally via text and let AI structure them into searchable, actionable gift lists.

**Target Users:** Thoughtful gift-givers who want to remember ideas and never miss occasions, but prefer web/desktop workflow initially.

---

## 2. Scope & Features

### Core MVP Features (Must-Have)

- **AI-Powered Text Capture:** Natural language input with entity extraction
- **Smart Organization:** Auto-categorize by recipient, occasion, and tags
- **Gift Idea Dashboard:** Clean view of all ideas with filtering/search
- **Basic Reminders:** Browser notifications for upcoming occasions
- **Export/Share:** Simple sharing of gift lists

### Simplified from Full Vision (Add Later)

- ❌ Voice/image capture (Web Speech API can be added later)
- ❌ Complex contact management (basic recipient tracking only)
- ❌ Calendar integration (manual date entry for MVP)
- ❌ Budget tracking beyond basic amounts
- ❌ Mobile push notifications (browser notifications only)

---

## 3. Tech Stack

### Frontend

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + Headless UI
- **State Management:** React hooks + SWR for data fetching
- **UI Components:** Radix UI primitives + custom components
- **Fonts:** Inter or similar clean sans-serif

### Backend/Database

- **Backend:** Supabase (PostgreSQL + real-time + auth)
- **AI:** OpenAI API (GPT-4o-mini for cost efficiency)
- **Authentication:** Supabase Auth
- **File Storage:** Supabase Storage (for future image uploads)

### Deployment

- **Frontend:** Vercel (seamless Next.js integration)
- **Database:** Supabase hosted
- **Domain:** Custom domain on Vercel

### Development Tools

- **Package Manager:** pnpm
- **Code Quality:** ESLint + Prettier + TypeScript strict mode
- **Testing:** Vitest + Testing Library (unit tests)
- **Analytics:** Vercel Analytics (built-in)

---

## 4. Data Model

### Database Schema (Supabase/PostgreSQL)

```sql
-- Users (handled by Supabase Auth)
-- auth.users table exists by default

-- Recipients/Contacts
CREATE TABLE recipients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  relationship VARCHAR,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gift Ideas
CREATE TABLE gift_ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES recipients(id) ON DELETE SET NULL,
  recipient_name VARCHAR, -- Denormalized for cases where recipient not in contacts
  idea TEXT NOT NULL,
  occasion VARCHAR,
  occasion_date DATE,
  budget_amount DECIMAL(10,2),
  budget_currency VARCHAR(3) DEFAULT 'USD',
  tags TEXT[], -- PostgreSQL array
  status VARCHAR DEFAULT 'idea', -- 'idea', 'purchased', 'given'
  notes TEXT,
  original_input TEXT, -- Store original user input for reference
  ai_confidence DECIMAL(3,2), -- AI extraction confidence score
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reminders
CREATE TABLE reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  gift_idea_id UUID REFERENCES gift_ideas(id) ON DELETE CASCADE,
  reminder_date TIMESTAMP WITH TIME ZONE NOT NULL,
  message TEXT,
  status VARCHAR DEFAULT 'pending', -- 'pending', 'sent', 'dismissed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_gift_ideas_user_id ON gift_ideas(user_id);
CREATE INDEX idx_gift_ideas_recipient_id ON gift_ideas(recipient_id);
CREATE INDEX idx_gift_ideas_occasion_date ON gift_ideas(occasion_date);
CREATE INDEX idx_recipients_user_id ON recipients(user_id);
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_reminder_date ON reminders(reminder_date);
```

---

## 5. AI Integration

### Entity Extraction System

```typescript
// types/ai.ts
interface ExtractedGiftIdea {
  recipient: string;
  idea: string;
  occasion?: string;
  date?: string; // YYYY-MM-DD format
  budget?: {
    amount?: number;
    currency?: string;
    range?: [number, number];
  };
  tags?: string[];
  notes?: string;
  confidence: number; // 0-1 score
}

// lib/ai-extractor.ts
const EXTRACTION_PROMPT = `
You are an AI assistant that extracts structured gift idea information from natural language input.

Extract the following information if present:
- recipient: Who is this gift for?
- idea: What is the gift idea/item?
- occasion: What's the occasion? (birthday, anniversary, Christmas, graduation, etc.)
- date: When is the occasion? (return in YYYY-MM-DD format if year not specified, assume current year)
- budget: How much to spend? (extract amount and currency)
- tags: Keywords that describe the gift (materials, categories, colors, etc.)
- notes: Any additional context or requirements

Respond with valid JSON only. Include a confidence score (0-1) for the overall extraction quality.

Examples:
Input: "I want to get Sarah a knitted blue scarf for her birthday on February 15th, around $40-50"
Output: {
  "recipient": "Sarah",
  "idea": "knitted blue scarf", 
  "occasion": "birthday",
  "date": "2024-02-15",
  "budget": {"amount": 45, "currency": "USD", "range": [40, 50]},
  "tags": ["knitted", "scarf", "blue", "winter", "accessories"],
  "confidence": 0.95
}

Input: "Maybe a cookbook for Mom's anniversary"
Output: {
  "recipient": "Mom",
  "idea": "cookbook",
  "occasion": "anniversary", 
  "tags": ["cookbook", "cooking", "books"],
  "confidence": 0.8
}
`;

export async function extractGiftIdea(userInput: string): Promise<ExtractedGiftIdea> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: EXTRACTION_PROMPT },
      { role: "user", content: userInput }
    ],
    temperature: 0.3, // Lower temperature for more consistent extraction
    max_tokens: 500
  });

  try {
    const extracted = JSON.parse(response.choices[0].message.content || '{}');
    
    // Validation and cleanup
    return {
      recipient: extracted.recipient || '',
      idea: extracted.idea || userInput.slice(0, 100), // Fallback to input
      occasion: extracted.occasion,
      date: extracted.date,
      budget: extracted.budget,
      tags: extracted.tags || [],
      notes: extracted.notes,
      confidence: extracted.confidence || 0.5
    };
  } catch (error) {
    // Fallback for parsing errors
    return {
      recipient: '',
      idea: userInput,
      confidence: 0.1
    };
  }
}
```

---

## 6. UI/UX Design

### Design System

**Color Palette:**

- Primary: Persian Green (#00A693) - from existing brand
- Secondary: Teal variations for gradients
- Neutral: Modern grays (zinc/slate scale)
- Semantic: Success, warning, error states

**Typography:**

- Headings: Inter 600/700
- Body: Inter 400/500
- Monospace: JetBrains Mono (for any code/data)

**Layout:**

- 8pt grid system
- 16px base font size
- Generous whitespace
- Mobile-first responsive design

### Component Architecture

```typescript
// components/ui/ - Base components
- Button.tsx
- Input.tsx
- Card.tsx
- Modal.tsx
- Badge.tsx
- Loading.tsx

// components/gift/ - Gift-specific components
- GiftCaptureForm.tsx
- GiftIdeaCard.tsx
- GiftIdeaList.tsx
- GiftIdeaFilters.tsx

// components/layout/ - Layout components
- Header.tsx
- Sidebar.tsx
- Layout.tsx
```

### Key Screens Wireframe

**1. Dashboard/Home:**
```
┌─────────────────────────────────────┐
│ Header: VibeKeeper + User Menu      │
├─────────────────────────────────────┤
│ Quick Capture Box                   │
│ "I want to get..."                  │
│ [Submit] [Voice*] [Photo*]          │
├─────────────────────────────────────┤
│ Filters: [All] [By Person] [Date]   │
├─────────────────────────────────────┤
│ Gift Ideas Grid:                    │
│ ┌─────┐ ┌─────┐ ┌─────┐             │
│ │Card1│ │Card2│ │Card3│             │
│ └─────┘ └─────┘ └─────┘             │
└─────────────────────────────────────┘
```

**2. Gift Idea Card:**
```
┌─────────────────────────┐
│ 👤 Sarah               │
│ 🎁 Knitted Blue Scarf  │
│ 🎂 Birthday - Feb 15   │
│ 💰 $40-50              │
│ 🏷️ knitted, blue, cozy │
│                        │
│ [Edit] [✓ Purchased]   │
└─────────────────────────┘
```

---

## 7. Development Phases

### Phase 1: Foundation (Week 1-2)

**Goals:** Basic app structure, auth, and simple gift storage

**Tasks:**

- [ ] Next.js project setup with TypeScript + Tailwind
- [ ] Supabase project setup and database schema
- [ ] Authentication flow (email + Google OAuth)
- [ ] Basic Layout component and routing
- [ ] Simple gift idea form (no AI yet)
- [ ] Gift list display with basic CRUD
- [ ] Deploy to Vercel

**Deliverable:** Working web app where users can manually add/edit/delete gift ideas

### Phase 2: AI Integration (Week 3)

**Goals:** Core AI extraction functionality

**Tasks:**

- [ ] OpenAI API integration
- [ ] AI extraction prompt engineering and testing
- [ ] Smart capture form with AI processing
- [ ] Confidence indicators and manual correction flow
- [ ] Error handling for AI failures
- [ ] Loading states and user feedback

**Deliverable:** AI-powered gift idea capture working end-to-end

### Phase 3: Smart Features (Week 4)

**Goals:** Search, filtering, and organization

**Tasks:**

- [ ] Advanced search and filtering
- [ ] Auto-tagging and categorization
- [ ] Recipient management (basic)
- [ ] Date parsing and occasion detection
- [ ] Export functionality
- [ ] Basic analytics (gift count, budget totals)

**Deliverable:** Full-featured MVP ready for user testing

### Phase 4: Polish & Launch Prep (Week 5-6)

**Goals:** Production readiness and initial user feedback

**Tasks:**

- [ ] UI polish and responsive design
- [ ] Performance optimization
- [ ] SEO and metadata
- [ ] Error tracking (Sentry)
- [ ] User onboarding flow
- [ ] Basic reminder system (browser notifications)
- [ ] Launch preparation

**Deliverable:** Production-ready MVP for soft launch

---

## 8. Deployment & Infrastructure

### Environment Setup

```bash
# Development
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-key
NODE_ENV=development

# Production (Vercel)
# Same vars but production Supabase instance
```

### Monitoring & Analytics

- **Error Tracking:** Sentry for error monitoring
- **Analytics:** Vercel Analytics (privacy-focused)
- **Performance:** Vercel Speed Insights
- **Logs:** Vercel Functions logs + Supabase logs

### Security Considerations

- Row Level Security (RLS) on all Supabase tables
- API rate limiting for OpenAI calls
- Input sanitization for user content
- HTTPS everywhere (Vercel default)
- Environment variable security

---

## 9. Success Metrics & Validation

### MVP Success Criteria

- [ ] **User Registration:** 50 users in first month
- [ ] **Core Feature Usage:** 80% of users create at least 3 gift ideas
- [ ] **AI Accuracy:** >70% extraction confidence on average
- [ ] **User Retention:** 40% of users return within a week
- [ ] **Technical Performance:** <2s page load, <99.9% uptime

### User Feedback Collection

- In-app feedback widget
- User interviews with early adopters
- Usage analytics (privacy-respecting)
- Feature request tracking

### Iteration Plan

**Month 2:** Voice capture (Web Speech API)
**Month 3:** Image upload and analysis
**Month 4:** Mobile PWA features
**Month 5:** iOS companion app planning

---

## 10. Cost Estimation

### Monthly Operating Costs (MVP scale)

**Infrastructure:**

- Supabase Free tier: $0 (up to 500MB, 50MB storage)
- Vercel Pro: $20/month (after free tier)
- Domain: $12/year

**AI Costs:**

- OpenAI GPT-4o-mini: ~$0.15/1K tokens
- Estimated: 50 extractions/day × 200 tokens × $0.15/1K = $1.50/month

**Total: ~$25/month for MVP scale (first 100 active users)**

**Scaling costs:**

- Supabase Pro: $25/month (8GB database, 100GB storage)
- Additional AI usage scales linearly with users

---

## 11. Future Enhancements

### Post-MVP Features (Roadmap)

1. **Voice Capture:** Web Speech API integration
2. **Image Analysis:** Upload product photos for AI description
3. **Price Tracking:** API integration for price monitoring
4. **Social Features:** Share lists with family/friends
5. **Mobile App:** React Native or native iOS/Android
6. **Advanced AI:** Personal preference learning, gift recommendations
7. **Integrations:** Calendar sync, shopping sites, Amazon wishlist import

### Technical Improvements

- Offline PWA capabilities
- Real-time collaborative lists
- Advanced search (vector embeddings)
- A/B testing framework
- Advanced analytics dashboard

---

## 12. Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (package manager)
- Supabase account
- OpenAI API account
- Vercel account (for deployment)

### Quick Start Commands

```bash
# Create project
npx create-next-app@latest vibekeeper --typescript --tailwind --app --src-dir --import-alias "@/*"

# Install additional dependencies
pnpm add @supabase/supabase-js openai @headlessui/react @heroicons/react

# Development dependencies
pnpm add -D @types/node eslint-config-prettier prettier

# Start development
pnpm dev
```

### First Steps

1. Set up Supabase project and run schema migrations
2. Configure environment variables
3. Build authentication flow
4. Create basic gift idea CRUD
5. Integrate OpenAI API for extraction
6. Deploy to Vercel for testing

---

**Ready to build the future of thoughtful gift-giving! 🎁**