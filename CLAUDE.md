# VibeKeeper - Claude Development Guide

## Project Overview

**VibeKeeper** is a React Native mobile app (iOS/Android) for tracking cigarette consumption. Currently in **Phase 0: Pre-Development** - planning is complete, implementation has not started.

**Status**: Planning ✅ | Setup ⏳ | Implementation ⏳

## Current State (What EXISTS Now)

```
VibeKeeper/
├── App.js                 # Expo template (not modified)
├── package.json           # Minimal: expo, react, react-native only
├── docs/                  # Comprehensive planning docs
│   ├── TECHNICAL_SPECIFICATION.md
│   ├── ARCHITECTURE.md
│   └── ...
├── .claude/              # Claude Code configuration
└── .mcp.json            # MCP servers (context7, sequential-thinking)
```

**What's NOT built yet**:
- ❌ No `src/` directory
- ❌ No TypeScript configuration
- ❌ No database (Drizzle/SQLite)
- ❌ No state management (Zustand)
- ❌ No component library
- ❌ No navigation setup
- ❌ No testing infrastructure

## Tech Stack (Planned, Not Implemented)

- **Framework**: Expo SDK 54 + React Native 0.81.4
- **Language**: TypeScript (to be configured)
- **Database**: Drizzle ORM + Expo SQLite (to be installed)
- **State**: Zustand v5 (to be installed)
- **Styling**: NativeWind v4 (to be installed)
- **Navigation**: Expo Router v3/v4 (to be configured)
- **Testing**: Jest + React Native Testing Library (to be configured)

## Development Commands

```bash
# Development
npm start                # Start Expo dev server
npm run android         # Run on Android
npm run ios             # Run on iOS

# Not yet configured:
# npm run type-check    # (TypeScript not setup)
# npm test              # (Jest not setup)
# npm run lint          # (ESLint not setup)
```

## Project Conventions

### When Building This Project

1. **Incremental Setup** - Don't assume infrastructure exists. Build it step by step:
   ```
   Phase 0: ✅ Planning complete
   Phase 1: Configure TypeScript, ESLint, directory structure
   Phase 2: Install & configure database layer
   Phase 3: Set up navigation & routing
   Phase 4: Implement features
   ```

2. **Check Before Using** - Before importing or using:
   - Verify package exists in `package.json`
   - Verify directory/file exists
   - Verify configuration is complete
   - If missing: create/install first, then use

3. **File Structure** - When creating `src/`, follow this layout:
   ```
   src/
   ├── app/              # Expo Router pages
   ├── features/         # Feature modules
   ├── shared/           # Shared components/utils
   ├── db/              # Database layer
   └── theme/           # Design system
   ```

4. **Naming Conventions**:
   - **Files**: PascalCase for components (`Button.tsx`), camelCase for utils (`formatDate.ts`)
   - **Directories**: kebab-case (`user-settings/`)
   - **Components**: PascalCase (`<LogButton />`)
   - **Functions**: camelCase (`getUserLogs()`)

### Code Quality

1. **TypeScript**:
   - Use strict mode once configured
   - Define explicit types for all props and functions
   - Avoid `any`, use `unknown` if type is truly unknown
   - Export types alongside implementation

2. **React Native Best Practices**:
   - Use `StyleSheet.create()` for styles
   - Functional components only (no class components)
   - Use React hooks (`useState`, `useEffect`, `useCallback`, `useMemo`)
   - Add `accessibilityLabel` to interactive elements
   - Test on both iOS and Android

3. **Error Handling**:
   - Use try-catch for async operations
   - Show user-friendly error messages
   - Log errors for debugging
   - Gracefully degrade functionality

4. **Comments**:
   - Write self-documenting code with clear naming
   - Use JSDoc for complex functions/components
   - Inline comments for complex logic only
   - Avoid obvious comments

5. **Flexibility**:
   - Backwards compatibility is acceptable when needed
   - Fallbacks are acceptable for resilience
   - Pragmatic solutions over perfect architecture
   - Ship working code, iterate later

### Testing Strategy (Once Configured)

```typescript
// Test file location
// Option 1: Co-located
src/features/cigarettes/LogButton.test.tsx

// Option 2: Separate
__tests__/features/cigarettes/LogButton.test.tsx
```

**Test Coverage Goals**: >80% for critical paths

## Architecture Principles (For Implementation)

1. **Offline-First**: All data local by default, cloud sync optional
2. **Feature-Sliced**: Group by domain, not by type
3. **Type-Safe**: Full TypeScript coverage
4. **Mobile-Optimized**: 60fps target, <100MB memory
5. **Privacy-First**: User owns their data, no tracking

## Git Workflow

```bash
# Branch naming
feature/cigarette-logging
bugfix/stats-calculation
refactor/database-layer

# Commit messages (Conventional Commits)
feat(cigarettes): add logging modal
fix(stats): correct daily count calculation
docs(readme): update setup instructions
chore(deps): upgrade expo to 54.0.15
```

## Common Tasks

### Adding a New Dependency

```bash
# Use npx expo install for Expo SDK packages
npx expo install expo-sqlite

# Use npm install for other packages
npm install zustand
```

### Creating a New Component

1. Check if infrastructure exists (src/, TypeScript, etc.)
2. If not, set up infrastructure first
3. Create component with proper structure:
   ```typescript
   import { View, Text, StyleSheet } from 'react-native';

   interface ButtonProps {
     title: string;
     onPress: () => void;
   }

   export function Button({ title, onPress }: ButtonProps) {
     return (
       <View style={styles.container}>
         <Text>{title}</Text>
       </View>
     );
   }

   const styles = StyleSheet.create({
     container: { padding: 12 },
   });
   ```

### Setting Up Database

1. Install dependencies: `npx expo install expo-sqlite`
2. Install Drizzle: `npm install drizzle-orm drizzle-kit`
3. Create `src/db/` structure
4. Define schemas in `src/db/schema/`
5. Create migrations
6. Initialize database client

## Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [Drizzle ORM](https://orm.drizzle.team)
- [Project Specs](./docs/TECHNICAL_SPECIFICATION.md)

## For Claude

**Current Phase**: Pre-Development Setup
**Next Steps**: Configure TypeScript, ESLint, directory structure
**Remember**: Infrastructure doesn't exist yet - build it incrementally and verify before using.

When user asks to implement features, first check what infrastructure is missing and offer to set it up.
