# VibeKeeper - Cigarette Tracker
## Technical Specification v1.0

**Document Status**: Draft
**Last Updated**: October 21, 2025
**Project**: VibeKeeper Mobile Application
**Platform**: iOS & Android (React Native/Expo)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [Technical Stack](#technical-stack)
4. [System Architecture](#system-architecture)
5. [Core Features](#core-features)
6. [Data Model](#data-model)
7. [User Interface & Experience](#user-interface--experience)
8. [Technical Requirements](#technical-requirements)
9. [Security & Privacy](#security--privacy)
10. [Performance & Optimization](#performance--optimization)
11. [Testing Strategy](#testing-strategy)
12. [Deployment & Distribution](#deployment--distribution)
13. [Implementation Roadmap](#implementation-roadmap)
14. [Dependencies](#dependencies)
15. [Success Metrics](#success-metrics)

---

## 1. Executive Summary

VibeKeeper is a mobile habit-tracking application designed to help users monitor their cigarette consumption. The app provides real-time tracking, statistical analysis, and cost calculation features to support users in understanding and managing their smoking habits.

**Key Objectives**:
- Enable quick and effortless cigarette logging
- Provide insightful daily, weekly, and monthly statistics
- Calculate and visualize cost impact based on consumption
- Maintain complete offline functionality with optional cloud sync
- Deliver a clean, intuitive user experience

**Target Platforms**: iOS 14+ and Android 7.0+ (API Level 24+)

**Development Timeline**: 8-10 weeks (MVP)

---

## 2. Project Overview

### 2.1 App Classification

- **Type**: Personal Tracking & Health Utility
- **Complexity**: Simple-to-Moderate
- **Primary User Activities**:
  - Quick data logging (cigarette entries)
  - Statistics visualization
  - Cost tracking
  - Habit analysis
- **Offline Support**: Required (offline-first architecture)

### 2.2 User Personas

**Primary Persona - "Conscious Smoker"**
- Age: 25-45
- Goal: Track and potentially reduce cigarette consumption
- Pain Points: Losing track of daily count, unaware of spending
- Tech Savviness: Moderate
- Usage Pattern: Multiple quick entries throughout the day

**Secondary Persona - "Health-Conscious Individual"**
- Age: 30-50
- Goal: Monitor reduction progress over time
- Pain Points: Need visual feedback on habit changes
- Tech Savviness: High
- Usage Pattern: Regular tracking with weekly review sessions

### 2.3 Core Value Propositions

1. **Frictionless Logging**: One-tap cigarette logging from anywhere in the app
2. **Insightful Analytics**: Clear visualizations of consumption patterns
3. **Cost Awareness**: Real-time calculation of financial impact
4. **Privacy-First**: All data stored locally, optional cloud backup
5. **Always Available**: Full offline functionality, no internet required

---

## 3. Technical Stack

### 3.1 Framework & Runtime

| Component | Version | Rationale |
|-----------|---------|-----------|
| **Expo SDK** | 54.0.14 | Latest stable with React Native 0.81, precompiled XCFrameworks for faster iOS builds |
| **React Native** | 0.81.4 | Android 16 support, last version supporting Legacy Architecture transition |
| **React** | 19.1.0 | Latest with Concurrent Features for optimal performance |
| **TypeScript** | ^5.7.x | Latest type safety features, enhanced developer experience |
| **Node.js** | 22.20.0+ | LTS version with optimal performance |

**New Architecture**: Enabled (Fabric + TurboModules)

### 3.2 Navigation & Routing

```typescript
// Primary: Expo Router v3
"expo-router": "^4.0.x"
```

**Features**:
- File-based routing with TypeScript support
- Built on React Navigation v6
- Type-safe navigation params
- Deep linking and universal links support
- Automatic route generation from file structure

**Structure**:
```
app/
├── (tabs)/                    # Tab-based main navigation
│   ├── index.tsx             # Home/Dashboard
│   ├── statistics.tsx        # Statistics view
│   ├── settings.tsx          # Settings
│   └── _layout.tsx           # Tab layout
├── modals/
│   ├── log-cigarette.tsx     # Quick log modal
│   └── edit-price.tsx        # Price configuration
├── _layout.tsx               # Root layout
└── +not-found.tsx            # 404 handler
```

### 3.3 State Management

**Global State - Zustand v5**
```typescript
"zustand": "^5.0.x"
"zustand-persist": "^0.5.x"  // For persistence middleware
```

**Rationale**:
- Lightweight (~1KB)
- No boilerplate
- Built-in TypeScript support
- Easy testing
- Excellent performance with React 19

**Server State - TanStack Query v5**
```typescript
"@tanstack/react-query": "^5.59.x"
```

**Usage**: Future cloud sync, remote analytics (Phase 2)

### 3.4 UI & Styling

**Primary Styling - NativeWind v4**
```typescript
"nativewind": "^4.1.x"
"tailwindcss": "^3.4.x"
```

**Features**:
- Tailwind CSS for React Native
- Hot-reloading for theme changes
- Custom CSS support
- rem unit scaling
- Animation support with Reanimated

**UI Components**
```typescript
"react-native-reanimated": "^3.16.x"    // Animations
"react-native-gesture-handler": "^2.20.x" // Gestures
"expo-linear-gradient": "~14.0.x"       // Gradients
"expo-blur": "~14.0.x"                  // Blur effects
"react-native-svg": "^15.8.x"           // Vector graphics
"@shopify/flash-list": "^1.7.x"         // Performant lists
```

**Chart Library - Victory Native**
```typescript
"victory-native": "^41.4.x"
```

**Rationale**:
- Native performance with react-native-skia
- Declarative API
- Comprehensive chart types (Line, Bar, Pie)
- Responsive and accessible

### 3.5 Data & Storage

**Local Database - Expo SQLite + Drizzle ORM**
```typescript
"expo-sqlite": "~15.0.x"
"drizzle-orm": "^0.36.x"
"drizzle-kit": "^0.28.x"
```

**Features**:
- Type-safe queries
- Live queries with useLiveQuery hook
- Automatic re-renders on data changes
- SQL migrations bundled in app
- Drizzle Studio for development inspection

**Simple Storage - Async Storage**
```typescript
"@react-native-async-storage/async-storage": "^2.1.x"
```

**Usage**: User preferences, app settings, onboarding state

**Secure Storage - Expo Secure Store**
```typescript
"expo-secure-store": "~14.0.x"
```

**Usage**: Encryption keys, sensitive user data (future)

### 3.6 Forms & Validation

```typescript
"react-hook-form": "^7.53.x"
"zod": "^3.23.x"
```

**Rationale**:
- Minimal re-renders
- Built-in TypeScript support
- Zod integration for schema validation
- Small bundle size

### 3.7 Date & Time

```typescript
"date-fns": "^4.1.x"
```

**Rationale**:
- Modular (tree-shakeable)
- Immutable
- TypeScript support
- Locale support for future internationalization

### 3.8 Notifications

```typescript
"expo-notifications": "~0.29.x"
```

**Features**:
- Local notifications
- Scheduled reminders
- Custom notification sounds
- Badge management

### 3.9 Development & Debugging

```typescript
"expo-dev-client": "~5.0.x"      // Custom native testing
"react-native-flipper": "^0.282.x" // Debugging
"@dev-plugins/react-query": "^0.0.x" // TanStack Query devtools
```

### 3.10 Testing

```typescript
"jest": "^29.7.x"
"@testing-library/react-native": "^12.7.x"
"@testing-library/react-hooks": "^8.0.x"
"detox": "^20.27.x"  // E2E testing
```

### 3.11 Code Quality

```typescript
"eslint": "^9.x"
"@typescript-eslint/parser": "^8.x"
"@typescript-eslint/eslint-plugin": "^8.x"
"prettier": "^3.3.x"
"husky": "^9.x"      // Git hooks
"lint-staged": "^15.x"
```

### 3.12 Build & Deployment

**EAS (Expo Application Services)**
```json
"eas-cli": "^13.x"
```

**Features**:
- Cloud builds for iOS and Android
- Over-the-air (OTA) updates
- Automated versioning
- Build profiles (development, preview, production)
- App Store/Play Store submission

---

## 4. System Architecture

### 4.1 Architecture Pattern

**Pattern**: Offline-First, Feature-Based Architecture

```
src/
├── app/                      # Expo Router pages
├── features/                 # Feature modules
│   ├── cigarettes/
│   │   ├── components/      # Feature-specific components
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # Business logic
│   │   ├── stores/          # Zustand stores
│   │   └── types/           # TypeScript types
│   ├── statistics/
│   ├── pricing/
│   └── settings/
├── shared/                   # Shared utilities
│   ├── components/          # Reusable UI components
│   ├── hooks/               # Shared hooks
│   ├── utils/               # Helper functions
│   ├── types/               # Global types
│   └── constants/           # App constants
├── db/                       # Database layer
│   ├── schema/              # Drizzle schemas
│   ├── migrations/          # SQL migrations
│   └── client.ts            # DB client
├── theme/                    # Design system
│   ├── colors.ts
│   ├── typography.ts
│   └── spacing.ts
└── assets/                   # Static assets
```

### 4.2 Data Flow

```
User Interaction
      ↓
UI Component (React Native)
      ↓
Zustand Store (State Management)
      ↓
Service Layer (Business Logic)
      ↓
Drizzle ORM (Type-safe queries)
      ↓
Expo SQLite (Local Database)
      ↓
File System (Persistent Storage)
```

### 4.3 State Management Strategy

**Local UI State**: React useState/useReducer
**Global App State**: Zustand stores
**Server State**: TanStack Query (future)
**Form State**: React Hook Form
**Database State**: Drizzle ORM with Live Queries

### 4.4 Security Architecture

- **Data Encryption**: SQLite database encryption (SQLCipher)
- **Secure Storage**: Expo Secure Store for sensitive data
- **No Cloud Dependencies**: All data local by default
- **Optional Cloud Sync**: End-to-end encrypted backup (Phase 2)

---

## 5. Core Features

### 5.1 Feature List (MVP - Phase 1)

#### F1: Cigarette Logging
**Priority**: P0 (Critical)

**Description**: Users can quickly log each cigarette consumed with a single tap.

**User Stories**:
- As a user, I can log a cigarette with one tap from the home screen
- As a user, I can see my current daily count immediately after logging
- As a user, I can edit or delete a log entry if I made a mistake
- As a user, I can add a timestamp to a log entry (defaults to now)

**Technical Implementation**:
- Quick-action floating button on home screen
- Modal overlay for confirmation
- Haptic feedback on successful log
- Optimistic UI updates
- SQLite insert with automatic timestamp

**Acceptance Criteria**:
- Log action completes in <200ms
- Haptic feedback provided
- Count updates immediately
- Entry appears in history instantly

#### F2: Daily Statistics
**Priority**: P0 (Critical)

**Description**: Display current day's smoking data with visual indicators.

**Metrics Displayed**:
- Total cigarettes today
- Time of first/last cigarette
- Average time between cigarettes
- Current streak (hours since last)
- Hourly distribution chart
- Comparison with yesterday

**Technical Implementation**:
- Live queries updating on data changes
- Memoized calculations for performance
- Victory Native charts
- Date-fns for time calculations

#### F3: Weekly & Monthly Statistics
**Priority**: P0 (Critical)

**Description**: Aggregate statistics over longer periods.

**Metrics Displayed**:
- Daily average for the week/month
- Trend line (increasing/decreasing)
- Peak day and count
- Total count
- Cost impact
- Day-by-day bar chart

**Technical Implementation**:
- Efficient SQL aggregation queries
- Cached calculations
- Scroll-to-zoom charts
- Export data option (Phase 2)

#### F4: Price Tracking & Cost Calculation
**Priority**: P0 (Critical)

**Description**: Track cigarette costs based on user-defined pricing.

**Features**:
- Set price per pack (20 cigarettes)
- Support multiple currencies
- Auto-calculate cost per cigarette
- Display daily/weekly/monthly costs
- Show money saved when consumption decreases

**Technical Implementation**:
- Price stored in settings
- Real-time cost calculation
- Currency formatting with Intl API
- Price history tracking (Phase 2)

#### F5: Settings & Preferences
**Priority**: P0 (Critical)

**Features**:
- Set cigarettes per pack (default: 20)
- Set price per pack
- Choose currency
- Theme selection (light/dark/auto)
- Notification preferences
- Data management (export/import)

#### F6: Data Persistence
**Priority**: P0 (Critical)

**Requirements**:
- All data stored locally in SQLite
- Automatic backups
- Data survives app updates
- Migration system for schema changes

### 5.2 Future Features (Phase 2+)

#### F7: Notifications & Reminders
- Daily summary notification
- Custom reminder intervals
- Goal-based notifications
- Streak notifications

#### F8: Goals & Challenges
- Set daily/weekly limits
- Reduction goals
- Achievement badges
- Progress tracking

#### F9: Cloud Sync & Backup
- Optional cloud backup (Supabase)
- Multi-device sync
- End-to-end encryption
- Restore from backup

#### F10: Advanced Analytics
- AI-powered insights
- Pattern recognition
- Trigger identification
- Health impact estimation

#### F11: Social Features
- Anonymous comparison
- Support groups
- Accountability partners

---

## 6. Data Model

See [DATA_MODEL.md](./DATA_MODEL.md) for detailed schema definitions.

### 6.1 Core Entities

```typescript
// Cigarette Log Entry
interface CigaretteLog {
  id: string;              // UUID
  timestamp: Date;         // When logged
  createdAt: Date;         // Record creation
  updatedAt: Date;         // Last modification
  notes?: string;          // Optional notes
  location?: Location;     // Optional location (Phase 2)
}

// Price Configuration
interface PriceConfig {
  id: string;
  pricePerPack: number;
  cigarettesPerPack: number;
  currency: string;
  effectiveFrom: Date;
  createdAt: Date;
}

// User Settings
interface UserSettings {
  id: string;
  theme: 'light' | 'dark' | 'auto';
  currency: string;
  notificationsEnabled: boolean;
  dailyGoal?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### 6.2 Database Schema (Drizzle)

```typescript
// db/schema/cigarettes.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const cigaretteLogs = sqliteTable('cigarette_logs', {
  id: text('id').primaryKey(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const priceConfigs = sqliteTable('price_configs', {
  id: text('id').primaryKey(),
  pricePerPack: integer('price_per_pack').notNull(), // In cents
  cigarettesPerPack: integer('cigarettes_per_pack').notNull().default(20),
  currency: text('currency').notNull().default('USD'),
  effectiveFrom: integer('effective_from', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const userSettings = sqliteTable('user_settings', {
  id: text('id').primaryKey(),
  theme: text('theme', { enum: ['light', 'dark', 'auto'] }).default('auto'),
  currency: text('currency').notNull().default('USD'),
  notificationsEnabled: integer('notifications_enabled', { mode: 'boolean' }).default(false),
  dailyGoal: integer('daily_goal'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});
```

---

## 7. User Interface & Experience

See [UI_UX_DESIGN.md](./UI_UX_DESIGN.md) for detailed design specifications.

### 7.1 Design Principles

1. **Simplicity First**: Minimal friction for primary action (logging)
2. **Visual Hierarchy**: Important info prominent, details accessible
3. **Feedback**: Immediate visual and haptic feedback
4. **Consistency**: Follow platform guidelines (iOS HIG, Material Design)
5. **Accessibility**: WCAG 2.1 AA compliance

### 7.2 Navigation Structure

```
Tab Navigation (Bottom)
├── Home (Dashboard)
├── Statistics
└── Settings

Modals
├── Log Cigarette
├── Edit Price
└── Edit Entry
```

### 7.3 Key Screens

#### Home Screen (Dashboard)
- Large daily count display
- Quick log button (FAB)
- Today's timeline
- Quick stats cards
- Recent entries list

#### Statistics Screen
- Period selector (Day/Week/Month)
- Main chart (line or bar)
- Key metrics cards
- Cost summary
- Comparison indicators

#### Settings Screen
- Profile section
- Price configuration
- App preferences
- Data management
- About/Help

### 7.4 Color Palette

```typescript
// theme/colors.ts
export const colors = {
  primary: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',  // Main brand color
    600: '#dc2626',
    900: '#7f1d1d',
  },
  success: {
    500: '#10b981',
  },
  warning: {
    500: '#f59e0b',
  },
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    500: '#737373',
    700: '#404040',
    900: '#171717',
  },
};
```

### 7.5 Typography

```typescript
// theme/typography.ts
export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System-Medium',
    bold: 'System-Bold',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
};
```

---

## 8. Technical Requirements

### 8.1 Platform Requirements

**iOS**:
- Minimum: iOS 14.0
- Target: iOS 18.0
- Devices: iPhone 6s and newer

**Android**:
- Minimum: Android 7.0 (API 24)
- Target: Android 16 (API 35)
- Devices: Modern Android phones and tablets

### 8.2 Performance Requirements

| Metric | Target | Critical |
|--------|--------|----------|
| App Launch Time | <2s | <3s |
| Log Entry Response | <200ms | <500ms |
| Screen Transition | <16ms (60fps) | <33ms (30fps) |
| Database Query | <50ms | <100ms |
| Chart Rendering | <500ms | <1s |
| Memory Usage | <100MB | <150MB |

### 8.3 Storage Requirements

- Initial app size: <20MB
- Database growth: ~10KB per 1000 entries
- Maximum database size: 100MB
- Assets: <5MB

### 8.4 Network Requirements

- **Offline-first**: No network required for core features
- **Optional sync**: Background sync when available
- **Graceful degradation**: All features work offline

### 8.5 Accessibility Requirements

- Screen reader support (VoiceOver/TalkBack)
- Dynamic font sizing
- Sufficient color contrast (WCAG AA)
- Touch target size: Minimum 44x44pt
- Keyboard navigation (future)

---

## 9. Security & Privacy

### 9.1 Data Privacy

**Principles**:
- Privacy by design
- Minimal data collection
- User data ownership
- No third-party tracking
- No advertisements

**Implementation**:
- All data stored locally by default
- No analytics without consent
- Optional cloud sync with encryption
- Transparent data usage policy

### 9.2 Data Security

**At Rest**:
- SQLite database encryption (SQLCipher)
- Expo Secure Store for sensitive data
- Encrypted backups

**In Transit** (Phase 2):
- TLS 1.3 for all network communication
- Certificate pinning
- End-to-end encryption for sync

### 9.3 Authentication (Phase 2)

- Email/Password with bcrypt hashing
- Biometric authentication (Face ID/Touch ID)
- Session management
- Secure token storage

### 9.4 Permissions

**Required**:
- Storage (for database)

**Optional**:
- Notifications (for reminders)
- Location (for context tracking - Phase 2)
- Camera (for habit photos - Phase 2)

---

## 10. Performance & Optimization

### 10.1 Optimization Strategies

**React Native New Architecture**:
- Fabric renderer for faster UI updates
- TurboModules for native module calls
- Concurrent rendering
- Automatic batching

**Code Optimization**:
- Code splitting with dynamic imports
- Tree shaking for smaller bundles
- Lazy loading for heavy components
- Memoization (React.memo, useMemo, useCallback)

**Database Optimization**:
- Indexed columns for fast queries
- Query result caching
- Batch operations
- Connection pooling

**Asset Optimization**:
- SVG for icons (scalable, small)
- WebP for images (when needed)
- Lazy loading for images
- Expo Image for optimized loading

**List Performance**:
- FlashList for large lists
- Virtualization
- Item memoization
- Optimistic updates

### 10.2 Bundle Size Optimization

- Remove unused dependencies
- Use modular imports
- Enable Hermes bytecode
- Compress assets

### 10.3 Monitoring

**Development**:
- Flipper for debugging
- React DevTools
- Performance Monitor
- Memory Profiler

**Production** (Phase 2):
- Sentry for error tracking
- Analytics for usage patterns
- Performance monitoring
- Crash reporting

---

## 11. Testing Strategy

### 11.1 Test Coverage Goals

- Unit Tests: >80% coverage
- Integration Tests: Critical flows
- E2E Tests: Main user journeys
- Manual Testing: UI/UX validation

### 11.2 Testing Pyramid

```
           E2E Tests (Detox)
          /                  \
     Integration Tests
    /                        \
  Unit Tests (Jest + RTL)
```

### 11.3 Unit Testing

**Framework**: Jest + React Native Testing Library

**Coverage**:
- Utility functions (100%)
- Custom hooks (>90%)
- State management (>90%)
- Components (>80%)
- Business logic (>95%)

**Example**:
```typescript
// __tests__/features/cigarettes/hooks/useLogCigarette.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useLogCigarette } from '@/features/cigarettes/hooks/useLogCigarette';

describe('useLogCigarette', () => {
  it('should log cigarette and update count', async () => {
    const { result } = renderHook(() => useLogCigarette());

    await act(async () => {
      await result.current.logCigarette();
    });

    expect(result.current.todayCount).toBe(1);
  });
});
```

### 11.4 Integration Testing

**Focus Areas**:
- Database operations
- State management flow
- Navigation flow
- Form submissions

### 11.5 E2E Testing

**Framework**: Detox

**Critical Flows**:
1. Onboarding and setup
2. Log first cigarette
3. View statistics
4. Update price configuration
5. Change settings

**Example**:
```typescript
// e2e/cigarette-logging.e2e.ts
describe('Cigarette Logging', () => {
  it('should log a cigarette successfully', async () => {
    await element(by.id('log-button')).tap();
    await expect(element(by.id('daily-count'))).toHaveText('1');
  });
});
```

### 11.6 Manual Testing

**Checklist**:
- UI/UX flow validation
- Cross-device testing (iOS/Android)
- Performance testing
- Accessibility testing
- Edge case validation

---

## 12. Deployment & Distribution

### 12.1 Build Configuration

**Environment Profiles**:

```javascript
// eas.json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "XXXXXXXXXX",
        "appleTeamId": "XXXXXXXXXX"
      },
      "android": {
        "serviceAccountKeyPath": "./path/to/api-key.json"
      }
    }
  }
}
```

### 12.2 Versioning Strategy

**Semantic Versioning**: MAJOR.MINOR.PATCH

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

**Example**: v1.2.3

### 12.3 Release Process

1. **Code Freeze**: Feature complete, testing begins
2. **QA Testing**: Comprehensive testing
3. **Beta Release**: Internal testing via TestFlight/Internal Testing
4. **Public Beta**: Limited public release
5. **Production Release**: App Store/Play Store submission
6. **Post-Release Monitoring**: Track crashes, user feedback

### 12.4 OTA Updates

**Expo Updates**:
- Critical bug fixes
- Non-native changes
- Configuration updates
- No app store review needed

**Update Channels**:
- `development`: For dev team
- `preview`: For beta testers
- `production`: For all users

### 12.5 App Store Metadata

**App Name**: VibeKeeper - Cigarette Tracker

**Description**:
```
Track your cigarette consumption with ease. VibeKeeper helps you stay aware of your smoking habits with simple logging, insightful statistics, and cost tracking.

Features:
• One-tap cigarette logging
• Daily, weekly, and monthly statistics
• Cost calculation and tracking
• Beautiful charts and insights
• Complete offline functionality
• Privacy-focused: your data stays on your device

Whether you're tracking for awareness or working towards reduction, VibeKeeper gives you the data you need.
```

**Keywords**: cigarette, tracker, habit, smoking, health, statistics, cost

**Category**: Health & Fitness

**Screenshots**: 5-8 per platform (see UI_UX_DESIGN.md)

**Privacy Policy**: Required (see docs/PRIVACY_POLICY.md)

---

## 13. Implementation Roadmap

See [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md) for detailed timeline.

### 13.1 Phase 1: MVP (Weeks 1-6)

**Week 1-2: Foundation**
- Project setup and configuration
- Database schema and migrations
- Design system implementation
- Navigation structure

**Week 3-4: Core Features**
- Cigarette logging functionality
- Daily statistics
- Price configuration
- Settings management

**Week 5-6: Polish & Testing**
- Weekly/monthly statistics
- Charts and visualizations
- Unit and integration tests
- UI polish and animations

### 13.2 Phase 2: Enhancement (Weeks 7-10)

- Notifications and reminders
- Goals and challenges
- Advanced analytics
- Cloud sync (optional)
- Beta release

### 13.3 Phase 3: Launch (Weeks 11-12)

- Production builds
- App store submission
- Marketing materials
- User documentation

### 13.4 Phase 4: Iteration (Ongoing)

- User feedback implementation
- Performance optimization
- New features
- Platform updates

---

## 14. Dependencies

### 14.1 Core Dependencies

```json
{
  "dependencies": {
    "expo": "~54.0.14",
    "expo-router": "^4.0.0",
    "react": "19.1.0",
    "react-native": "0.81.4",

    "zustand": "^5.0.2",
    "@tanstack/react-query": "^5.59.0",

    "expo-sqlite": "~15.0.0",
    "drizzle-orm": "^0.36.0",
    "@react-native-async-storage/async-storage": "^2.1.0",

    "nativewind": "^4.1.23",
    "tailwindcss": "^3.4.0",
    "react-native-reanimated": "^3.16.0",
    "react-native-gesture-handler": "^2.20.0",
    "react-native-svg": "^15.8.0",
    "@shopify/flash-list": "^1.7.0",
    "victory-native": "^41.4.0",

    "react-hook-form": "^7.53.0",
    "zod": "^3.23.8",

    "date-fns": "^4.1.0",

    "expo-notifications": "~0.29.0",
    "expo-haptics": "~14.0.0"
  },
  "devDependencies": {
    "@babel/core": "^7.25.0",
    "@types/react": "~19.1.0",
    "typescript": "^5.7.0",

    "drizzle-kit": "^0.28.0",

    "jest": "^29.7.0",
    "@testing-library/react-native": "^12.7.0",
    "detox": "^20.27.0",

    "eslint": "^9.0.0",
    "prettier": "^3.3.0",
    "husky": "^9.0.0",
    "lint-staged": "^15.0.0"
  }
}
```

### 14.2 Dependency Update Strategy

- **Major versions**: Quarterly review
- **Minor versions**: Monthly updates
- **Patch versions**: As needed
- **Security updates**: Immediate

### 14.3 Expo SDK Migration

- Follow Expo upgrade guide
- Test on preview builds
- Gradual rollout
- Monitor for issues

---

## 15. Success Metrics

### 15.1 Technical Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Crash-free Rate | >99.5% | Sentry/Crashlytics |
| App Launch Time | <2s | Performance monitoring |
| User Retention (Day 1) | >60% | Analytics |
| User Retention (Day 7) | >40% | Analytics |
| User Retention (Day 30) | >25% | Analytics |
| Average Session Duration | >2 min | Analytics |
| Daily Active Users | Growth | Analytics |

### 15.2 User Experience Metrics

- Time to first log: <30s from app open
- Log success rate: >99%
- UI responsiveness: 60fps
- User satisfaction: >4.5 stars

### 15.3 Business Metrics (Optional)

- Downloads per day
- Active users
- User reviews and ratings
- Feature adoption rates

---

## Document Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-21 | Claude | Initial technical specification |

---

## Appendix

### A. Glossary

- **OTA**: Over-the-Air updates
- **EAS**: Expo Application Services
- **TurboModules**: New React Native native module system
- **Fabric**: New React Native rendering system
- **SQLCipher**: Encrypted SQLite database

### B. References

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [NativeWind Documentation](https://www.nativewind.dev/)
- [Victory Native Documentation](https://commerce.nearform.com/open-source/victory-native/)

### C. Additional Resources

- Design mockups: Figma link (TBD)
- API documentation: docs/API.md (Phase 2)
- User documentation: docs/USER_GUIDE.md (Phase 3)

---

**End of Technical Specification**
