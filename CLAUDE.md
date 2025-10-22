# VibeKeeper - Development Guide

## Project Overview

**VibeKeeper** is a React Native mobile app (iOS/Android) for tracking cigarette consumption with an offline-first architecture.

**Vision**: Privacy-focused, local-first tracking. All data stored on device, no cloud required.

**For current implementation status and what's been completed, see**: [docs/IMPLEMENTATION_PROGRESS.md](./IMPLEMENTATION_PROGRESS.md)

**For detailed architecture and technical specifications, see**: [docs/TECHNICAL_SPECIFICATION.md](./docs/TECHNICAL_SPECIFICATION.md)

## Tech Stack

- **Framework**: Expo SDK 54 + React Native 0.81.4
- **Language**: TypeScript (strict mode)
- **Database**: Drizzle ORM + Expo SQLite
- **State Management**: Zustand
- **Styling**: React Native StyleSheet (native components)
- **Navigation**: Expo Router
- **Testing**: Jest + React Testing Library
- **Utilities**: React Native Gesture Handler, Async Storage, Victory Native (charts)

## Development Commands

```bash
# Start Expo dev server (choose platform)
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web

# Run tests
npm test

# Run tests in watch mode
npm test:watch
```

## Development Tools

This project uses modern CLI tools for better developer experience. See [.claude/TOOLS.md](.claude/TOOLS.md) for:

- **Search**: `rg` (ripgrep) instead of grep
- **Finding**: `fd` instead of find
- **Viewing**: `bat` instead of cat
- **Listing**: `eza` instead of ls
- **Data processing**: `jq`, `yq`, `xsv`
- **Git diffs**: `delta` for syntax-highlighted diffs
- And 8+ other modern tools (httpie, fzf, duf, dust, etc.)

Claude will automatically suggest these tools when appropriate via the tool validator hook.

## Project Conventions

### File Structure

When working with this project, follow this directory layout:

```
src/
├── app/              # Expo Router pages (screens)
├── db/              # Database layer (schema, initialization)
├── services/        # Business logic (CRUD, calculations)
├── stores/          # Zustand state management
├── utils/           # Utility functions and helpers
└── types/           # TypeScript type definitions
```

### Naming Conventions

- **Component Files**: PascalCase (`Button.tsx`, `LogList.tsx`)
- **Utility/Service Files**: camelCase (`dateUtils.ts`, `logService.ts`)
- **Directories**: kebab-case (`user-settings/`, `log-management/`)
- **React Components**: PascalCase (`<LogButton />`, `<SettingsScreen />`)
- **Functions & Variables**: camelCase (`getUserLogs()`, `isValidLog`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_LOGS = 1000`)

### Code Quality Standards

#### TypeScript
- Use strict mode (enforced by tsconfig.json)
- Define explicit types for all props and function parameters
- Export types alongside implementation
- Avoid `any`, use `unknown` if type is genuinely unknown
- Use discriminated unions for complex state

#### React Native Best Practices
- Use `StyleSheet.create()` for all styles (not inline objects)
- Functional components only (no class components)
- Use React hooks: `useState`, `useEffect`, `useCallback`, `useMemo`
- Add `accessibilityLabel` to interactive elements for screen readers
- Test changes on both iOS and Android simulators

#### Error Handling
- Use try-catch for all async operations
- Show user-friendly error messages via `Alert.alert()`
- Log errors to console for debugging
- Gracefully degrade functionality when operations fail

#### Comments & Documentation
- Write self-documenting code with clear names
- Use JSDoc for complex functions and components
- Inline comments only for non-obvious logic
- Avoid commenting the obvious

#### Pragmatism Over Perfection
- Backwards compatibility is acceptable when needed
- Fallbacks are acceptable for resilience
- Pragmatic solutions beat perfect architecture
- Ship working code, iterate and refine later

### Testing Strategy

**Test File Locations** (choose one approach):
```typescript
// Option 1: Co-located with code
src/services/logService.test.ts

// Option 2: Separate directory
__tests__/services/logService.test.ts
```

**Coverage Goals**: >80% for critical paths (services, utilities)

## Architecture Principles

These principles guide all implementation decisions:

1. **Offline-First**: All data stored locally in SQLite by default. Cloud sync is optional future enhancement.
2. **Type-Safe**: Full TypeScript coverage with strict mode. No `any` types.
3. **Mobile-Optimized**: Target 60fps rendering, keep memory under 100MB.
4. **Privacy-First**: User owns their data. No tracking, analytics, or cloud required.
5. **Feature-Sliced Design**: Organize code by domain/feature, not by type. Group related db, services, components together.

## Git Workflow

### Branch Naming
```
feature/cigarette-logging      # New feature
bugfix/stats-calculation       # Bug fix
refactor/database-layer        # Code refactoring
docs/readme-update             # Documentation
chore/upgrade-dependencies     # Maintenance
```

### Commit Messages (Conventional Commits)
```
feat(logs): add cigarette logging modal
fix(stats): correct daily count calculation
docs(readme): update setup instructions
chore(deps): upgrade expo to 54.0.15
refactor(db): simplify schema initialization
```

**Format**: `type(scope): brief description`

## Common Tasks

### Adding a New Dependency

```bash
# For Expo SDK packages, use expo install
npx expo install expo-notifications

# For npm packages, use npm install
npm install some-library
```

### Creating a New Service

1. Create file: `src/services/myService.ts`
2. Define TypeScript interface for operations
3. Implement static methods for CRUD operations
4. Integrate with Zustand store for state updates
5. Add error handling with try-catch

Example structure:
```typescript
import { MyType } from '../types';
import { myStore } from '../stores/myStore';
import { db } from '../db';

export class MyService {
  static async loadAll(): Promise<MyType[]> {
    try {
      const data = await db.select().from(myTable);
      myStore.setState({ items: data });
      return data;
    } catch (error) {
      throw new Error(`Failed to load: ${error}`);
    }
  }

  static async create(input: Partial<MyType>): Promise<MyType> {
    try {
      const result = await db.insert(myTable).values(input);
      // Update store
      myStore.setState(state => ({
        items: [...state.items, result]
      }));
      return result;
    } catch (error) {
      throw new Error(`Failed to create: ${error}`);
    }
  }
}
```

### Creating a New Screen

1. Create file: `src/app/myscreen.tsx`
2. Import React Native components and hooks
3. Define TypeScript interface for navigation params
4. Use `useLogStore` / `useSettingsStore` to access state
5. Implement business logic in handlers
6. Use `StyleSheet.create()` for all styles

Example structure:
```typescript
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useLogStore } from '../stores/logStore';

export default function MyScreen() {
  const router = useRouter();
  const logs = useLogStore((state) => state.logs);
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async () => {
    try {
      setIsLoading(true);
      // Do something
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Content */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
```

### Adding Database Schema

1. Edit `src/db/schema.ts` to define new tables
2. Update Drizzle schema with proper types
3. Update TypeScript interfaces in `src/types/index.ts`
4. Create service to handle CRUD operations
5. Update initialization in `src/db/index.ts` if needed

### Running the App

```bash
# Start dev server
npm start

# Choose platform:
# - Press 'a' for Android
# - Press 'i' for iOS
# - Press 'w' for web

# Or run specific platform directly:
npm run android
npm run ios
npm run web
```

## Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [Drizzle ORM](https://orm.drizzle.team)
- [Zustand](https://github.com/pmndrs/zustand)
- [Project Technical Specification](./docs/TECHNICAL_SPECIFICATION.md)
- [Implementation Progress](./IMPLEMENTATION_PROGRESS.md)
