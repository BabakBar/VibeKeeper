# VibeKeeper - Architecture Specification

**Version**: 1.0
**Last Updated**: October 21, 2025

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Design Principles](#design-principles)
3. [System Architecture](#system-architecture)
4. [Application Layers](#application-layers)
5. [State Management](#state-management)
6. [Data Flow](#data-flow)
7. [Code Organization](#code-organization)
8. [Key Architectural Decisions](#key-architectural-decisions)
9. [Cross-Cutting Concerns](#cross-cutting-concerns)
10. [Performance Patterns](#performance-patterns)

---

## 1. Architecture Overview

VibeKeeper follows an **offline-first, feature-based architecture** optimized for mobile performance and user privacy.

### Architecture Type

**Hybrid: Feature-Sliced Design + Layered Architecture**

```
┌─────────────────────────────────────────────┐
│            Presentation Layer                │
│    (React Components, Expo Router)          │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│          Application Layer                   │
│    (Business Logic, Services, Hooks)        │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│            Data Layer                        │
│    (Drizzle ORM, SQLite, Stores)            │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│         Infrastructure Layer                 │
│    (Database, Storage, Native APIs)         │
└─────────────────────────────────────────────┘
```

### Core Characteristics

- **Offline-first**: No network required for primary features
- **Type-safe**: Full TypeScript coverage
- **Reactive**: Automatic UI updates on data changes
- **Modular**: Feature-based code organization
- **Testable**: Dependency injection, pure functions
- **Performant**: Optimized for 60fps, minimal re-renders

---

## 2. Design Principles

### 2.1 SOLID Principles

**Single Responsibility**
- Each module has one reason to change
- Components have single, well-defined purposes
- Services handle specific business domains

**Open/Closed**
- Features extensible without modification
- Plugin-based configuration
- Composition over inheritance

**Liskov Substitution**
- Interface-based programming
- Mockable dependencies for testing

**Interface Segregation**
- Focused, minimal interfaces
- No forced implementations

**Dependency Inversion**
- Depend on abstractions, not concretions
- Dependency injection for services

### 2.2 React/React Native Principles

**Component Composition**
```typescript
<Screen>
  <Header />
  <Content>
    <StatsCard />
    <ChartView />
  </Content>
  <FAB onPress={handleLog} />
</Screen>
```

**Hooks for Logic Reuse**
```typescript
function useLogCigarette() {
  const { addLog } = useCigaretteStore();
  const { haptic } = useHaptics();

  return useCallback(async () => {
    await addLog();
    haptic.impactAsync();
  }, [addLog, haptic]);
}
```

**Separation of Concerns**
- UI components: Presentation only
- Hooks: State and effects
- Services: Business logic
- Stores: Global state

### 2.3 Mobile-First Principles

- **Performance**: 60fps interactions, <2s cold start
- **Offline**: All features work without network
- **Battery**: Efficient rendering, minimal background work
- **Storage**: Optimized database, small bundle size
- **Accessibility**: Screen reader support, dynamic fonts

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────┐
│                    User Interface                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐     │
│  │   Tabs     │  │   Modals   │  │   Screens  │     │
│  └────────────┘  └────────────┘  └────────────┘     │
└───────────────────────┬──────────────────────────────┘
                        │ Expo Router
┌───────────────────────┴──────────────────────────────┐
│              Application State Layer                  │
│  ┌──────────┐  ┌───────────┐  ┌──────────────┐      │
│  │ Zustand  │  │  Context  │  │ React Query  │      │
│  │  Stores  │  │   (Theme) │  │  (Future)    │      │
│  └──────────┘  └───────────┘  └──────────────┘      │
└───────────────────────┬──────────────────────────────┘
                        │ Services & Hooks
┌───────────────────────┴──────────────────────────────┐
│                 Business Logic Layer                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐   │
│  │  Cigarette   │  │  Statistics  │  │  Pricing │   │
│  │   Service    │  │   Service    │  │  Service │   │
│  └──────────────┘  └──────────────┘  └──────────┘   │
└───────────────────────┬──────────────────────────────┘
                        │ Drizzle ORM
┌───────────────────────┴──────────────────────────────┐
│                   Data Access Layer                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐   │
│  │   SQLite     │  │ AsyncStorage │  │  Secure  │   │
│  │   Database   │  │              │  │  Store   │   │
│  └──────────────┘  └──────────────┘  └──────────┘   │
└──────────────────────────────────────────────────────┘
```

### 3.2 Component Architecture

```
┌─────────────────────────────────────────┐
│         Screen Components                │
│  (Route-based, full-screen views)       │
└───────────────┬─────────────────────────┘
                │
┌───────────────┴─────────────────────────┐
│       Feature Components                 │
│  (Domain-specific, reusable)            │
└───────────────┬─────────────────────────┘
                │
┌───────────────┴─────────────────────────┐
│         UI Components                    │
│  (Generic, design system)               │
└─────────────────────────────────────────┘
```

**Example Hierarchy**:
```
<HomeScreen>                    ← Screen
  <DashboardHeader />           ← Feature
    <Typography variant="h1" /> ← UI
  <QuickStats />                ← Feature
    <StatsCard />               ← Feature
      <Card>                    ← UI
        <Text />                ← UI
```

---

## 4. Application Layers

### 4.1 Presentation Layer

**Responsibility**: UI rendering, user interaction, navigation

**Components**:
- **Screens**: Full-page views (app/*)
- **Feature Components**: Domain-specific UI
- **Shared Components**: Reusable UI primitives
- **Layouts**: Screen structure and composition

**Technologies**:
- React Native components
- Expo Router for navigation
- NativeWind for styling
- Reanimated for animations

**Example**:
```typescript
// app/(tabs)/index.tsx
export default function HomeScreen() {
  const { todayCount } = useTodayStats();
  const { logCigarette } = useLogCigarette();

  return (
    <ScreenWrapper>
      <DashboardHeader count={todayCount} />
      <QuickStats />
      <RecentLogs />
      <FAB onPress={logCigarette} icon="plus" />
    </ScreenWrapper>
  );
}
```

### 4.2 Application Layer

**Responsibility**: Business logic, data transformation, orchestration

**Components**:
- **Services**: Business logic modules
- **Hooks**: Stateful logic and side effects
- **Utils**: Pure helper functions
- **Validators**: Input validation

**Technologies**:
- Custom React hooks
- Zod for validation
- Date-fns for date logic

**Example**:
```typescript
// features/cigarettes/services/statistics.service.ts
export class StatisticsService {
  async getDailyStats(date: Date): Promise<DailyStats> {
    const logs = await this.getLogsForDay(date);
    const cost = await this.calculateCost(logs.length);

    return {
      count: logs.length,
      cost,
      firstCigaretteTime: logs[0]?.timestamp,
      lastCigaretteTime: logs[logs.length - 1]?.timestamp,
      averageInterval: this.calculateAverageInterval(logs),
    };
  }

  private calculateAverageInterval(logs: CigaretteLog[]): number {
    // Implementation
  }
}
```

### 4.3 Data Layer

**Responsibility**: Data persistence, state management, caching

**Components**:
- **Database**: SQLite with Drizzle ORM
- **Stores**: Zustand global state
- **Storage**: AsyncStorage for preferences
- **Queries**: Data access abstractions

**Technologies**:
- Expo SQLite
- Drizzle ORM
- Zustand
- AsyncStorage

**Example**:
```typescript
// features/cigarettes/stores/cigarette.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CigaretteStore {
  todayCount: number;
  lastLogTime: Date | null;
  addLog: () => Promise<void>;
}

export const useCigaretteStore = create<CigaretteStore>()(
  persist(
    (set, get) => ({
      todayCount: 0,
      lastLogTime: null,

      addLog: async () => {
        const log = await db.insert(cigaretteLogs).values({
          timestamp: new Date(),
        });

        set((state) => ({
          todayCount: state.todayCount + 1,
          lastLogTime: new Date(),
        }));
      },
    }),
    {
      name: 'cigarette-store',
    }
  )
);
```

### 4.4 Infrastructure Layer

**Responsibility**: Platform integrations, native APIs, external services

**Components**:
- **Database Client**: SQLite connection
- **Storage Providers**: File system, secure store
- **Native Modules**: Haptics, notifications
- **External APIs**: Future cloud sync

**Technologies**:
- Expo modules (SQLite, SecureStore, Notifications, Haptics)
- Platform-specific code (iOS/Android)

---

## 5. State Management

### 5.1 State Categories

```
┌─────────────────────────────────────────┐
│          Application State               │
├─────────────────────────────────────────┤
│                                          │
│  ┌──────────────────────────────────┐   │
│  │      Server State (Future)       │   │
│  │  - Cloud sync data               │   │
│  │  - Remote configuration          │   │
│  │  Tool: TanStack Query            │   │
│  └──────────────────────────────────┘   │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │       Global Client State        │   │
│  │  - Current user settings         │   │
│  │  - Active price config           │   │
│  │  - Today's count cache           │   │
│  │  Tool: Zustand                   │   │
│  └──────────────────────────────────┘   │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │       Local Component State      │   │
│  │  - Form inputs                   │   │
│  │  - UI toggles                    │   │
│  │  - Animation states              │   │
│  │  Tool: useState/useReducer       │   │
│  └──────────────────────────────────┘   │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │      Context (Cross-cutting)     │   │
│  │  - Theme                         │   │
│  │  - Authentication (future)       │   │
│  │  Tool: React Context             │   │
│  └──────────────────────────────────┘   │
│                                          │
└─────────────────────────────────────────┘
```

### 5.2 State Management Strategy

**When to use Zustand**:
- Global app state
- Shared across multiple features
- Needs persistence
- Frequent updates

**When to use Context**:
- Rarely changing values (theme, auth)
- Deep prop drilling avoidance
- Provider-based architecture

**When to use useState**:
- Component-local state
- Form inputs
- UI toggles
- Temporary state

**When to use TanStack Query** (Future):
- Server data fetching
- Caching
- Background sync
- Optimistic updates

### 5.3 State Architecture

```typescript
// Global Store Structure
{
  cigarettes: {
    todayCount: number;
    weekCount: number;
    lastLogTime: Date | null;
    isLogging: boolean;
  },
  settings: {
    theme: 'light' | 'dark' | 'auto';
    currency: string;
    notificationsEnabled: boolean;
  },
  pricing: {
    currentPrice: number;
    cigarettesPerPack: number;
    currency: string;
  }
}
```

---

## 6. Data Flow

### 6.1 Unidirectional Data Flow

```
User Action
    ↓
Event Handler (Component)
    ↓
Store Action / Service Call
    ↓
Business Logic (Service Layer)
    ↓
Data Mutation (ORM)
    ↓
Database Update (SQLite)
    ↓
Live Query Trigger
    ↓
Store Update
    ↓
Component Re-render
    ↓
UI Update
```

### 6.2 Example: Logging a Cigarette

```typescript
// 1. User taps FAB button
<FAB onPress={handleLogCigarette} />

// 2. Event handler
function handleLogCigarette() {
  logCigarette(); // From hook
}

// 3. Hook/Service
export function useLogCigarette() {
  const { addLog } = useCigaretteStore();
  const haptics = useHaptics();

  return useCallback(async () => {
    await addLog(); // Store action
    haptics.impactAsync(); // Feedback
  }, [addLog]);
}

// 4. Store action
addLog: async () => {
  // Business logic
  const now = new Date();

  // Database insert
  await db.insert(cigaretteLogs).values({
    timestamp: now,
  });

  // State update
  set((state) => ({
    todayCount: state.todayCount + 1,
    lastLogTime: now,
  }));
}

// 5. Component subscribes and re-renders
function DashboardHeader() {
  const todayCount = useCigaretteStore((s) => s.todayCount);

  return <Text>{todayCount}</Text>; // Auto-updates!
}
```

### 6.3 Live Query Flow

```
Database Change (INSERT, UPDATE, DELETE)
    ↓
SQLite Change Listener
    ↓
Drizzle useLiveQuery Hook
    ↓
Component Re-render
    ↓
UI Update
```

**Example**:
```typescript
function RecentLogs() {
  const { data: logs } = useLiveQuery(
    db.select()
      .from(cigaretteLogs)
      .orderBy(cigaretteLogs.timestamp, 'desc')
      .limit(10)
  );

  return <LogList logs={logs || []} />;
}
```

---

## 7. Code Organization

### 7.1 Project Structure

```
src/
├── app/                          # Expo Router pages
│   ├── (tabs)/                   # Tab navigation group
│   │   ├── _layout.tsx           # Tab layout
│   │   ├── index.tsx             # Home screen
│   │   ├── statistics.tsx        # Statistics screen
│   │   └── settings.tsx          # Settings screen
│   ├── modals/                   # Modal screens
│   │   ├── log-cigarette.tsx
│   │   └── edit-price.tsx
│   ├── _layout.tsx               # Root layout
│   └── +not-found.tsx            # 404 screen
│
├── features/                     # Feature modules
│   ├── cigarettes/
│   │   ├── components/          # Feature UI components
│   │   │   ├── LogButton.tsx
│   │   │   ├── QuickStats.tsx
│   │   │   └── RecentLogs.tsx
│   │   ├── hooks/               # Feature hooks
│   │   │   ├── useLogCigarette.ts
│   │   │   ├── useTodayStats.ts
│   │   │   └── useDeleteLog.ts
│   │   ├── services/            # Business logic
│   │   │   └── cigarette.service.ts
│   │   ├── stores/              # Feature stores
│   │   │   └── cigarette.store.ts
│   │   ├── types/               # TypeScript types
│   │   │   └── cigarette.types.ts
│   │   └── utils/               # Feature utilities
│   │       └── validation.ts
│   │
│   ├── statistics/
│   │   ├── components/
│   │   │   ├── DailyChart.tsx
│   │   │   ├── WeeklyChart.tsx
│   │   │   └── StatsCard.tsx
│   │   ├── hooks/
│   │   │   ├── useStatistics.ts
│   │   │   └── usePeriodStats.ts
│   │   ├── services/
│   │   │   └── statistics.service.ts
│   │   └── types/
│   │       └── statistics.types.ts
│   │
│   ├── pricing/
│   │   ├── components/
│   │   │   ├── PriceInput.tsx
│   │   │   └── CostDisplay.tsx
│   │   ├── hooks/
│   │   │   └── usePricing.ts
│   │   ├── services/
│   │   │   └── pricing.service.ts
│   │   └── stores/
│   │       └── pricing.store.ts
│   │
│   └── settings/
│       ├── components/
│       │   ├── ThemeSelector.tsx
│       │   └── DataManagement.tsx
│       ├── hooks/
│       │   └── useSettings.ts
│       └── stores/
│           └── settings.store.ts
│
├── shared/                       # Shared/common code
│   ├── components/              # Reusable UI components
│   │   ├── ui/                  # Design system primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Text.tsx
│   │   │   └── FAB.tsx
│   │   ├── layout/              # Layout components
│   │   │   ├── Screen.tsx
│   │   │   ├── Container.tsx
│   │   │   └── Spacer.tsx
│   │   └── feedback/            # Feedback components
│   │       ├── Loading.tsx
│   │       └── ErrorBoundary.tsx
│   │
│   ├── hooks/                   # Shared hooks
│   │   ├── useHaptics.ts
│   │   ├── useTheme.ts
│   │   └── useNotifications.ts
│   │
│   ├── utils/                   # Utility functions
│   │   ├── date.utils.ts
│   │   ├── currency.utils.ts
│   │   └── validation.utils.ts
│   │
│   ├── types/                   # Global TypeScript types
│   │   ├── global.types.ts
│   │   └── navigation.types.ts
│   │
│   └── constants/               # App constants
│       ├── colors.ts
│       ├── typography.ts
│       └── config.ts
│
├── db/                          # Database layer
│   ├── schema/                  # Drizzle schemas
│   │   ├── cigarette-logs.ts
│   │   ├── price-configs.ts
│   │   ├── user-settings.ts
│   │   └── index.ts
│   ├── migrations/              # SQL migrations
│   │   └── 0000_initial.sql
│   ├── client.ts                # Database client
│   └── seed.ts                  # Development seed data
│
├── theme/                       # Design system
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   └── index.ts
│
└── assets/                      # Static assets
    ├── images/
    ├── icons/
    └── fonts/
```

### 7.2 File Naming Conventions

- **Components**: PascalCase (`QuickStats.tsx`)
- **Hooks**: camelCase with 'use' prefix (`useTodayStats.ts`)
- **Services**: camelCase with '.service' suffix (`cigarette.service.ts`)
- **Stores**: camelCase with '.store' suffix (`cigarette.store.ts`)
- **Types**: camelCase with '.types' suffix (`cigarette.types.ts`)
- **Utils**: camelCase with '.utils' suffix (`date.utils.ts`)
- **Tests**: Same name with '.test' suffix (`QuickStats.test.tsx`)

### 7.3 Import Conventions

```typescript
// 1. External dependencies
import React, { useState } from 'react';
import { View, Text } from 'react-native';

// 2. Absolute imports (via path alias)
import { Button } from '@/shared/components/ui';
import { useTodayStats } from '@/features/cigarettes/hooks';
import { db } from '@/db/client';

// 3. Relative imports (same feature)
import { cigaretteService } from './services/cigarette.service';
import { CigaretteLog } from './types/cigarette.types';

// 4. Styles (if applicable)
import styles from './QuickStats.styles';
```

**TypeScript path aliases** (tsconfig.json):
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/app/*": ["./src/app/*"],
      "@/features/*": ["./src/features/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/db/*": ["./src/db/*"],
      "@/theme/*": ["./src/theme/*"]
    }
  }
}
```

---

## 8. Key Architectural Decisions

### ADR-001: Offline-First Architecture

**Decision**: All core functionality works offline

**Rationale**:
- Users should be able to log cigarettes anytime
- No dependency on network reliability
- Faster response times
- Better privacy (data stays local)

**Consequences**:
- More complex sync logic (future)
- Local storage management
- Data export/import features needed

### ADR-002: Feature-Based Code Organization

**Decision**: Organize code by feature, not layer

**Rationale**:
- Easier to locate related code
- Better encapsulation
- Scalable for team collaboration
- Clear feature boundaries

**Consequences**:
- Some code duplication (acceptable)
- Need shared/common folder for truly reusable code

### ADR-003: TypeScript Everywhere

**Decision**: Use TypeScript for all code

**Rationale**:
- Catch errors at compile time
- Better IDE support
- Self-documenting code
- Easier refactoring

**Consequences**:
- Learning curve for team
- Longer initial development
- Better long-term maintainability

### ADR-004: Drizzle ORM over Raw SQL

**Decision**: Use Drizzle ORM for database access

**Rationale**:
- Type-safe queries
- Migrations support
- Live query hooks
- Better developer experience

**Consequences**:
- Additional dependency
- Slight performance overhead (minimal)
- Learning curve

### ADR-005: Zustand over Redux/MobX

**Decision**: Use Zustand for state management

**Rationale**:
- Lightweight (1KB)
- Simple API, no boilerplate
- Great TypeScript support
- Excellent performance

**Consequences**:
- Less ecosystem/middleware
- Need custom solutions for some patterns

### ADR-006: Expo Managed Workflow

**Decision**: Stay in Expo managed workflow with config plugins

**Rationale**:
- Faster development
- OTA updates
- EAS build services
- Good enough for requirements

**Consequences**:
- Some native limitations
- Dependency on Expo services

---

## 9. Cross-Cutting Concerns

### 9.1 Error Handling

**Strategy**: Centralized error handling with user-friendly messages

```typescript
// shared/utils/error-handler.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string
  ) {
    super(message);
  }
}

export function handleError(error: unknown) {
  if (error instanceof AppError) {
    showToast(error.userMessage);
    logError(error);
  } else if (error instanceof Error) {
    showToast('Something went wrong');
    logError(error);
  }
}
```

### 9.2 Logging

**Strategy**: Development console, production analytics

```typescript
// shared/utils/logger.ts
export const logger = {
  debug: (message: string, data?: any) => {
    if (__DEV__) {
      console.log(`[DEBUG] ${message}`, data);
    }
  },

  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
    // Send to Sentry in production
  },
};
```

### 9.3 Analytics (Future)

```typescript
// shared/services/analytics.service.ts
export const analytics = {
  trackEvent: (name: string, properties?: Record<string, any>) => {
    // Implementation
  },

  trackScreen: (screenName: string) => {
    // Implementation
  },
};
```

### 9.4 Internationalization (Future)

```typescript
// Use i18n library
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <Text>{t('common.save')}</Text>;
}
```

---

## 10. Performance Patterns

### 10.1 React Performance Optimization

**Memoization**:
```typescript
// Memoize expensive components
const ExpensiveChart = React.memo(DailyChart);

// Memoize expensive calculations
const stats = useMemo(
  () => calculateComplexStats(logs),
  [logs]
);

// Memoize callbacks
const handlePress = useCallback(
  () => doSomething(id),
  [id]
);
```

**Code Splitting**:
```typescript
// Lazy load heavy components
const StatisticsScreen = lazy(() => import('./statistics'));
```

**List Virtualization**:
```typescript
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={logs}
  renderItem={renderLog}
  estimatedItemSize={80}
/>
```

### 10.2 Database Performance

**Indexing**:
```sql
CREATE INDEX idx_timestamp ON cigarette_logs(timestamp DESC);
```

**Query Optimization**:
```typescript
// Use specific columns, not SELECT *
db.select({
  id: cigaretteLogs.id,
  timestamp: cigaretteLogs.timestamp,
})

// Limit results
.limit(100)

// Use prepared statements
const stmt = db.prepare(query);
```

**Caching**:
```typescript
// Cache frequently accessed data
const priceCache = new Map<string, PriceConfig>();
```

### 10.3 Bundle Size Optimization

- Modular imports (`import { format } from 'date-fns'` not `import * as dateFns`)
- Tree shaking enabled
- Remove unused dependencies
- Use SVG for icons

---

## Conclusion

This architecture provides a solid foundation for VibeKeeper, balancing:
- **Performance**: Fast, responsive, 60fps
- **Maintainability**: Clear structure, type safety
- **Scalability**: Feature-based organization
- **User Experience**: Offline-first, instant feedback
- **Privacy**: Local-first data storage

---

**End of Architecture Specification**
