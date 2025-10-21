# VibeKeeper - Data Model Specification

**Version**: 1.0
**Last Updated**: October 21, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Database Technology](#database-technology)
3. [Schema Design](#schema-design)
4. [Entity Definitions](#entity-definitions)
5. [Relationships](#relationships)
6. [Indexes](#indexes)
7. [Migrations](#migrations)
8. [Queries](#queries)
9. [Data Lifecycle](#data-lifecycle)

---

## 1. Overview

VibeKeeper uses a **local-first** data architecture with SQLite as the primary database. All data is stored on-device, ensuring privacy and offline functionality.

### Key Principles

- **Offline-first**: No server dependency for core functionality
- **Type-safe**: Drizzle ORM provides full TypeScript types
- **Performant**: Indexed queries, optimized schema
- **Versioned**: Migration system for schema evolution
- **Encrypted**: Database encryption for sensitive data

---

## 2. Database Technology

### Stack

```typescript
"expo-sqlite": "~15.0.0"        // SQLite for React Native
"drizzle-orm": "^0.36.0"        // Type-safe ORM
"drizzle-kit": "^0.28.0"        // Migration toolkit
```

### Features Used

- **Live Queries**: Automatic re-renders on data changes
- **Prepared Statements**: Performance and security
- **Transactions**: Atomic operations
- **Foreign Keys**: Data integrity (future)
- **Triggers**: Automatic timestamps (future)

### Database Configuration

```typescript
// src/db/client.ts
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

const expoDb = openDatabaseSync('vibekeeper.db', {
  enableChangeListener: true, // Required for live queries
});

export const db = drizzle(expoDb);
```

---

## 3. Schema Design

### ERD (Entity Relationship Diagram)

```
┌─────────────────────┐
│  cigarette_logs     │
│─────────────────────│
│ id (PK)             │
│ timestamp           │
│ notes               │
│ created_at          │
│ updated_at          │
└─────────────────────┘

┌─────────────────────┐
│  price_configs      │
│─────────────────────│
│ id (PK)             │
│ price_per_pack      │
│ cigarettes_per_pack │
│ currency            │
│ effective_from      │
│ created_at          │
└─────────────────────┘

┌─────────────────────┐
│  user_settings      │
│─────────────────────│
│ id (PK)             │
│ theme               │
│ currency            │
│ notifications       │
│ daily_goal          │
│ created_at          │
│ updated_at          │
└─────────────────────┘
```

---

## 4. Entity Definitions

### 4.1 Cigarette Logs

**Purpose**: Records each cigarette consumed

```typescript
// src/db/schema/cigarette-logs.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const cigaretteLogs = sqliteTable('cigarette_logs', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  timestamp: integer('timestamp', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),

  notes: text('notes'),

  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),

  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});
```

**TypeScript Type**:
```typescript
export type CigaretteLog = typeof cigaretteLogs.$inferSelect;
export type NewCigaretteLog = typeof cigaretteLogs.$inferInsert;
```

**Field Descriptions**:

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | TEXT | NO | UUID primary key |
| `timestamp` | INTEGER | NO | When cigarette was consumed (Unix ms) |
| `notes` | TEXT | YES | Optional user notes |
| `created_at` | INTEGER | NO | Record creation timestamp (Unix ms) |
| `updated_at` | INTEGER | NO | Last update timestamp (Unix ms) |

**Constraints**:
- `id` must be unique UUID
- `timestamp` cannot be in the future
- `timestamp` indexed for fast date queries

**Indexes**:
```sql
CREATE INDEX idx_cigarette_logs_timestamp ON cigarette_logs(timestamp DESC);
CREATE INDEX idx_cigarette_logs_created_at ON cigarette_logs(created_at DESC);
```

---

### 4.2 Price Configurations

**Purpose**: Tracks cigarette pricing over time

```typescript
// src/db/schema/price-configs.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const priceConfigs = sqliteTable('price_configs', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  pricePerPack: integer('price_per_pack')
    .notNull(), // Stored in cents to avoid floating point issues

  cigarettesPerPack: integer('cigarettes_per_pack')
    .notNull()
    .default(20),

  currency: text('currency', { length: 3 })
    .notNull()
    .default('USD'),

  effectiveFrom: integer('effective_from', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),

  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
});
```

**TypeScript Type**:
```typescript
export type PriceConfig = typeof priceConfigs.$inferSelect;
export type NewPriceConfig = typeof priceConfigs.$inferInsert;
```

**Field Descriptions**:

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | TEXT | NO | UUID primary key |
| `price_per_pack` | INTEGER | NO | Price in cents (avoid decimals) |
| `cigarettes_per_pack` | INTEGER | NO | Cigarettes per pack (default: 20) |
| `currency` | TEXT | NO | ISO 4217 currency code (USD, EUR, etc.) |
| `effective_from` | INTEGER | NO | When this price became active (Unix ms) |
| `created_at` | INTEGER | NO | Record creation timestamp (Unix ms) |

**Business Rules**:
- `price_per_pack` must be > 0
- `cigarettes_per_pack` must be between 1-50
- `currency` must be valid ISO 4217 code
- Only one active price per time period

**Indexes**:
```sql
CREATE INDEX idx_price_configs_effective_from ON price_configs(effective_from DESC);
```

**Price Calculation**:
```typescript
const pricePerCigarette = pricePerPack / cigarettesPerPack;
const costForLogs = logCount * pricePerCigarette;
```

---

### 4.3 User Settings

**Purpose**: Stores user preferences and app configuration

```typescript
// src/db/schema/user-settings.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const userSettings = sqliteTable('user_settings', {
  id: text('id')
    .primaryKey()
    .default('default'), // Singleton: always 'default'

  theme: text('theme', { enum: ['light', 'dark', 'auto'] })
    .notNull()
    .default('auto'),

  currency: text('currency', { length: 3 })
    .notNull()
    .default('USD'),

  notificationsEnabled: integer('notifications_enabled', { mode: 'boolean' })
    .notNull()
    .default(false),

  dailyGoal: integer('daily_goal'),

  onboardingCompleted: integer('onboarding_completed', { mode: 'boolean' })
    .notNull()
    .default(false),

  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),

  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});
```

**TypeScript Type**:
```typescript
export type UserSettings = typeof userSettings.$inferSelect;
export type UpdateUserSettings = Partial<Omit<UserSettings, 'id' | 'createdAt'>>;
```

**Field Descriptions**:

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | TEXT | NO | Always 'default' (singleton pattern) |
| `theme` | TEXT | NO | UI theme: light, dark, or auto |
| `currency` | TEXT | NO | Preferred currency for cost display |
| `notifications_enabled` | INTEGER | NO | Enable/disable notifications |
| `daily_goal` | INTEGER | YES | Daily cigarette limit goal |
| `onboarding_completed` | INTEGER | NO | Has user completed onboarding |
| `created_at` | INTEGER | NO | Record creation timestamp |
| `updated_at` | INTEGER | NO | Last update timestamp |

**Singleton Pattern**: Only one settings record exists with id='default'

---

## 5. Relationships

### Current (MVP)

No foreign key relationships in MVP to keep schema simple.

### Future (Phase 2+)

```typescript
// Goals table (future)
export const goals = sqliteTable('goals', {
  id: text('id').primaryKey(),
  type: text('type', { enum: ['daily', 'weekly', 'monthly'] }).notNull(),
  targetCount: integer('target_count').notNull(),
  startDate: integer('start_date', { mode: 'timestamp_ms' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp_ms' }),
  achieved: integer('achieved', { mode: 'boolean' }).default(false),
});

// Achievements table (future)
export const achievements = sqliteTable('achievements', {
  id: text('id').primaryKey(),
  achievementType: text('achievement_type').notNull(),
  unlockedAt: integer('unlocked_at', { mode: 'timestamp_ms' }).notNull(),
});
```

---

## 6. Indexes

### Performance Indexes

```sql
-- Cigarette logs: optimize date range queries
CREATE INDEX idx_cigarette_logs_timestamp
ON cigarette_logs(timestamp DESC);

-- Cigarette logs: optimize recent entries queries
CREATE INDEX idx_cigarette_logs_created_at
ON cigarette_logs(created_at DESC);

-- Price configs: optimize price lookup by date
CREATE INDEX idx_price_configs_effective_from
ON price_configs(effective_from DESC);
```

### Index Strategy

- **Timestamp indexes**: Support daily/weekly/monthly aggregations
- **DESC order**: Most recent records accessed most frequently
- **Composite indexes**: Future optimization for complex queries

---

## 7. Migrations

### Migration System

```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema/*',
  out: './src/db/migrations',
  driver: 'expo',
  dialect: 'sqlite',
} satisfies Config;
```

### Initial Migration (v1)

```sql
-- src/db/migrations/0000_initial.sql
CREATE TABLE IF NOT EXISTS cigarette_logs (
  id TEXT PRIMARY KEY NOT NULL,
  timestamp INTEGER NOT NULL,
  notes TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS price_configs (
  id TEXT PRIMARY KEY NOT NULL,
  price_per_pack INTEGER NOT NULL,
  cigarettes_per_pack INTEGER DEFAULT 20 NOT NULL,
  currency TEXT DEFAULT 'USD' NOT NULL,
  effective_from INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS user_settings (
  id TEXT PRIMARY KEY DEFAULT 'default' NOT NULL,
  theme TEXT DEFAULT 'auto' NOT NULL,
  currency TEXT DEFAULT 'USD' NOT NULL,
  notifications_enabled INTEGER DEFAULT 0 NOT NULL,
  daily_goal INTEGER,
  onboarding_completed INTEGER DEFAULT 0 NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Indexes
CREATE INDEX idx_cigarette_logs_timestamp ON cigarette_logs(timestamp DESC);
CREATE INDEX idx_cigarette_logs_created_at ON cigarette_logs(created_at DESC);
CREATE INDEX idx_price_configs_effective_from ON price_configs(effective_from DESC);
```

### Migration Commands

```bash
# Generate migration
npx drizzle-kit generate:sqlite

# Run migrations (bundled with app)
# Migrations run automatically on app start
```

### Bundling Migrations

```javascript
// metro.config.js
module.exports = {
  resolver: {
    sourceExts: ['js', 'json', 'ts', 'tsx', 'sql'], // Add .sql
  },
  transformer: {
    babelTransformerPath: require.resolve('react-native-sql-transformer'),
  },
};
```

---

## 8. Queries

### 8.1 Common Queries

#### Get Today's Cigarettes

```typescript
import { db } from '@/db/client';
import { cigaretteLogs } from '@/db/schema';
import { gte, lte } from 'drizzle-orm';
import { startOfDay, endOfDay } from 'date-fns';

export async function getTodaysCigarettes() {
  const today = new Date();
  const start = startOfDay(today);
  const end = endOfDay(today);

  return await db
    .select()
    .from(cigaretteLogs)
    .where(
      gte(cigaretteLogs.timestamp, start),
      lte(cigaretteLogs.timestamp, end)
    )
    .orderBy(cigaretteLogs.timestamp, 'desc');
}
```

#### Get Daily Count for Date Range

```typescript
import { sql } from 'drizzle-orm';

export async function getDailyCounts(startDate: Date, endDate: Date) {
  return await db
    .select({
      date: sql<string>`date(${cigaretteLogs.timestamp} / 1000, 'unixepoch', 'localtime')`,
      count: sql<number>`count(*)`,
    })
    .from(cigaretteLogs)
    .where(
      gte(cigaretteLogs.timestamp, startDate),
      lte(cigaretteLogs.timestamp, endDate)
    )
    .groupBy(sql`date(${cigaretteLogs.timestamp} / 1000, 'unixepoch', 'localtime')`)
    .orderBy(sql`date`);
}
```

#### Get Current Price Configuration

```typescript
export async function getCurrentPrice() {
  const now = new Date();

  return await db
    .select()
    .from(priceConfigs)
    .where(lte(priceConfigs.effectiveFrom, now))
    .orderBy(priceConfigs.effectiveFrom, 'desc')
    .limit(1);
}
```

#### Calculate Cost for Period

```typescript
export async function calculateCostForPeriod(
  startDate: Date,
  endDate: Date
) {
  const logs = await db
    .select()
    .from(cigaretteLogs)
    .where(
      gte(cigaretteLogs.timestamp, startDate),
      lte(cigaretteLogs.timestamp, endDate)
    );

  const price = await getCurrentPrice();

  if (!price.length) return 0;

  const pricePerCigarette = price[0].pricePerPack / price[0].cigarettesPerPack;
  const totalCost = logs.length * pricePerCigarette;

  return totalCost / 100; // Convert cents to dollars
}
```

### 8.2 Live Queries (React Hooks)

```typescript
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

export function useTodaysCigarettes() {
  const today = new Date();
  const start = startOfDay(today);
  const end = endOfDay(today);

  const { data } = useLiveQuery(
    db
      .select()
      .from(cigaretteLogs)
      .where(
        gte(cigaretteLogs.timestamp, start),
        lte(cigaretteLogs.timestamp, end)
      )
      .orderBy(cigaretteLogs.timestamp, 'desc')
  );

  return {
    logs: data || [],
    count: data?.length || 0,
  };
}
```

---

## 9. Data Lifecycle

### 9.1 Data Creation

```typescript
// Log a cigarette
const newLog: NewCigaretteLog = {
  timestamp: new Date(),
  notes: 'After lunch',
};

await db.insert(cigaretteLogs).values(newLog);
```

### 9.2 Data Updates

```typescript
// Update a log entry
await db
  .update(cigaretteLogs)
  .set({
    notes: 'Updated note',
    updatedAt: new Date(),
  })
  .where(eq(cigaretteLogs.id, logId));
```

### 9.3 Data Deletion

```typescript
// Delete a log entry
await db
  .delete(cigaretteLogs)
  .where(eq(cigaretteLogs.id, logId));
```

### 9.4 Data Archival (Future)

- Archive logs older than 1 year
- Export to CSV/JSON
- Cloud backup (encrypted)

### 9.5 Data Export

```typescript
export async function exportAllData() {
  const logs = await db.select().from(cigaretteLogs);
  const prices = await db.select().from(priceConfigs);
  const settings = await db.select().from(userSettings);

  return {
    version: '1.0',
    exportDate: new Date().toISOString(),
    data: {
      cigaretteLogs: logs,
      priceConfigs: prices,
      userSettings: settings,
    },
  };
}
```

### 9.6 Data Import

```typescript
export async function importData(exportData: any) {
  await db.transaction(async (tx) => {
    // Clear existing data
    await tx.delete(cigaretteLogs);
    await tx.delete(priceConfigs);

    // Import new data
    await tx.insert(cigaretteLogs).values(exportData.data.cigaretteLogs);
    await tx.insert(priceConfigs).values(exportData.data.priceConfigs);
    await tx.update(userSettings)
      .set(exportData.data.userSettings[0])
      .where(eq(userSettings.id, 'default'));
  });
}
```

---

## Sample Data

### Development Seed Data

```typescript
// src/db/seed.ts
export async function seedDatabase() {
  // Create default settings
  await db.insert(userSettings).values({
    id: 'default',
    theme: 'auto',
    currency: 'USD',
    notificationsEnabled: false,
    onboardingCompleted: false,
  });

  // Create initial price config
  await db.insert(priceConfigs).values({
    pricePerPack: 1200, // $12.00
    cigarettesPerPack: 20,
    currency: 'USD',
    effectiveFrom: new Date(),
  });

  // Create sample logs (last 7 days)
  const sampleLogs: NewCigaretteLog[] = [];
  for (let day = 6; day >= 0; day--) {
    const date = new Date();
    date.setDate(date.getDate() - day);

    const logsPerDay = Math.floor(Math.random() * 10) + 5; // 5-15 per day

    for (let i = 0; i < logsPerDay; i++) {
      const hour = Math.floor(Math.random() * 14) + 8; // 8am - 10pm
      const minute = Math.floor(Math.random() * 60);

      date.setHours(hour, minute, 0, 0);

      sampleLogs.push({
        timestamp: new Date(date),
      });
    }
  }

  await db.insert(cigaretteLogs).values(sampleLogs);
}
```

---

## Performance Considerations

### Query Optimization

1. **Use indexes** for all timestamp queries
2. **Limit results** for large datasets
3. **Batch operations** when possible
4. **Cache frequently accessed data** (price configs, settings)
5. **Use prepared statements** for repeated queries

### Storage Optimization

1. **Integer timestamps** (more efficient than TEXT)
2. **Normalized data** (no duplication)
3. **Minimal nullable fields** (better compression)
4. **Vacuum database** periodically to reclaim space

```typescript
// Vacuum command
await db.run(sql`VACUUM`);
```

---

## Security

### Database Encryption (Phase 2)

```typescript
import SQLite from 'react-native-sqlite-storage';
import SQLCipher from '@journeyapps/react-native-sqlite-storage';

const db = SQLCipher.openDatabase({
  name: 'vibekeeper.db',
  location: 'default',
  key: encryptionKey, // From Expo Secure Store
});
```

### Data Validation

```typescript
import { z } from 'zod';

const cigaretteLogSchema = z.object({
  timestamp: z.date().max(new Date(), 'Cannot log future cigarettes'),
  notes: z.string().max(500).optional(),
});

// Validate before insert
const validated = cigaretteLogSchema.parse(newLog);
```

---

## Future Enhancements

### Phase 2
- Location tracking (optional)
- Photo attachments
- Mood tracking
- Trigger identification

### Phase 3
- Cloud sync with conflict resolution
- Multi-device support
- Shared accountability groups
- AI-powered insights

---

**End of Data Model Specification**
