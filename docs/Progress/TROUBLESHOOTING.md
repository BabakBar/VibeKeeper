# VibeKeeper - Troubleshooting Guide

**Last Updated**: 2025-10-26

Quick reference for common errors and fixes encountered during development.

---

## Dependency Issues

### React Version Conflicts

**Error:**
```
npm error ERESOLVE could not resolve
React 19.1.0 conflicts with @radix-ui, @react-navigation, @testing-library packages
```

**Fix:**
```bash
npx expo install --fix
npm install --legacy-peer-deps
```

**Note:** Expo SDK 54 officially supports React 19.1.0. Use `--legacy-peer-deps` for peer dependency warnings.

---

### Missing Dependencies

**Error:**
```
"react-native-gesture-handler" doesn't seem to be installed
```

**Fix:**
```bash
npm install --legacy-peer-deps
```

**Prevention:** Always run `npm install` after cloning or modifying `package.json`.

---

## Platform-Specific Issues

### Web Platform

**Error:**
```
Missing required dependencies: react-dom, react-native-web
```

**Fix:**
```bash
npx expo install react-dom react-native-web
```

---

### Android/iOS - Node Crypto Module

**Error:**
```
You attempted to import the Node standard library module "crypto"
It failed because the native React runtime does not include the Node standard library.
```

**Root Cause:** `crypto` module doesn't exist in React Native (only web polyfill).

**Fix:**
```typescript
// ❌ Don't use Node crypto
import * as crypto from 'crypto';
const id = crypto.randomUUID();

// ✅ Use cross-platform solution
const id = `log_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
```

---

## Navigation & Routing

### Nested NavigationContainer

**Error:**
```
Error: Looks like you have nested a 'NavigationContainer' inside another.
```

**Root Cause:** Expo Router automatically provides `NavigationContainer`.

**Fix:**
```diff
// src/app/_layout.tsx
- import { NavigationContainer } from '@react-navigation/native';
- <NavigationContainer>
    <Stack>...</Stack>
- </NavigationContainer>
+ <Stack>...</Stack>
```

---

### useSearchParams Not Found

**Error:**
```
(0, _expoRouter.useSearchParams) is not a function
```

**Root Cause:** `useSearchParams()` doesn't exist in expo-router 6.0.13.

**Fix:**
```typescript
// ❌ Wrong
import { useSearchParams } from 'expo-router';
const params = useSearchParams();

// ✅ Correct
import { useLocalSearchParams } from 'expo-router';
const params = useLocalSearchParams<{ mode?: string }>();
```

---

## Database Issues

### NOT NULL Constraint Failed

**Error:**
```
Error code: NOT NULL constraint failed: settings.created_at
```

**Root Cause:** Drizzle schema uses camelCase, but inserts used snake_case.

**Fix:**
```typescript
// ❌ Wrong
await db.insert(settingsTable).values({
  created_at: now,
  updated_at: now,
});

// ✅ Correct
await db.insert(settingsTable).values({
  createdAt: now,
  updatedAt: now,
});
```

**Prevention:** Match field names exactly to Drizzle schema. Remove `as any` casts to catch errors.

---

## Type Safety Issues

### Cannot Read Property of Undefined

**Error:**
```
TypeError: Cannot read property 'toString' of undefined
```

**Root Cause:** Optional chaining (`?.`) only protects first level.

**Fix:**
```typescript
// ❌ Wrong
settings?.costPerCigarette.toString() || '0.5'

// ✅ Correct
(settings?.costPerCigarette ?? 0.5).toString()
```

---

## Metro Bundler Issues

### Port Already in Use

**Error:**
```
Port 8081 is running this app in another window
```

**Fix:**
```bash
# Kill process on port 8081
lsof -ti:8081 | xargs kill -9

# Restart dev server
npm start
```

---

### Platform Incompatibility

**Error:**
```
Unable to initialize database - expo-sqlite requires native platform
```

**Root Cause:** SQLite doesn't work on web without polyfill.

**Fix:**
Implement platform-specific database initialization:

```typescript
// src/db/index.ts
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  // Use mock database or alternative storage
} else {
  // Use expo-sqlite
}
```

---

## Best Practices

### Type Safety
- ✅ Remove `as any` casts
- ✅ Use TypeScript strict mode
- ✅ Let compiler catch errors early

### Database
- ✅ Match camelCase field names to schema
- ✅ Test DB operations on all platforms
- ✅ Use proper TypeScript types

### Navigation
- ✅ One NavigationContainer (Expo Router handles it)
- ✅ Use `useLocalSearchParams()` not `useSearchParams()`
- ✅ Type route params with generics

### Dependencies
- ✅ Use `npx expo install` for Expo packages
- ✅ Use `--legacy-peer-deps` when needed
- ✅ Run `npx expo-doctor` to verify setup

---

## Quick Commands

```bash
# Check Expo compatibility
npx expo-doctor

# Fix package versions
npx expo install --fix

# Clean install
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Kill dev server
lsof -ti:8081 | xargs kill -9

# Start fresh
npm start
```

---

## Getting Help

1. Check this guide first
2. Run `npx expo-doctor` for diagnostics
3. Check error stack trace for file/line numbers
4. Search [Expo docs](https://docs.expo.dev)
5. Check GitHub issues for similar problems
