# VibeKeeper - Error Log & Troubleshooting Guide

**Last Updated**: 2025-10-22
**Status**: Web working ✅ | Mobile in progress ⏳

---

## Overview

This document tracks all errors encountered during the MVP implementation and testing phase, including root causes and solutions. This serves as a reference guide for future development and troubleshooting.

---

## Error History

### Error 1: Missing `react-native-gesture-handler`

**Date**: 2025-10-22
**Severity**: High (Blocking)
**Platform**: Native (Mobile)

#### Symptom
```
CommandError: "react-native-gesture-handler" is added as a dependency in your project's package.json
but it doesn't seem to be installed. Run "npm install", or the equivalent for your package manager, and try again.
```

#### Root Cause
- Dependency was listed in `package.json` but not installed in `node_modules`
- This is a fresh clone/setup issue

#### Solution Applied
```bash
npm install --legacy-peer-deps
```

#### Lesson Learned
- After modifying `package.json`, always run `npm install` before starting the dev server
- Use `--legacy-peer-deps` flag for Expo projects with testing libraries due to React peer dependency conflicts

---

### Error 2: React Version Peer Dependency Conflict

**Date**: 2025-10-22
**Severity**: High (Blocking)
**Platform**: All

#### Symptom
```
npm error ERESOLVE could not resolve
npm error Found: react@19.1.0
npm error Could not resolve dependency: peer react-test-renderer@">=16.8.0" from @testing-library/react-native@12.9.0
npm error Conflicting peer dependency: react@19.2.0
```

#### Root Cause
- React 19.1.0 in project vs React 19.2.0 required by react-test-renderer
- @radix-ui packages require React ^16.8 || ^17.0 || ^18.0 (don't support React 19)
- npm's ERESOLVE flag enforces strict peer dependency checking

#### Solution Applied
```bash
npm install --legacy-peer-deps
```

#### Lesson Learned
- Expo projects with testing libraries commonly have peer dependency conflicts
- `--legacy-peer-deps` is the standard workaround (not just a workaround, but the recommended approach for Expo)
- React 19 is still bleeding edge; consider downgrading to React 18 for production apps

---

### Error 3: Web Dependencies Missing

**Date**: 2025-10-22
**Severity**: High (Blocking web platform)
**Platform**: Web

#### Symptom
```
It looks like you're trying to use web support but don't have the required dependencies installed.
Install react-dom@19.1.0, react-native-web@^0.21.0 by running:
npx expo install react-dom react-native-web
```

#### Root Cause
- Web platform wasn't initially targeted, so web dependencies weren't installed
- MVP was mobile-first, but web support was added later

#### Solution Applied
```bash
npm install react-dom react-native-web --legacy-peer-deps
```

#### Lesson Learned
- Always install web dependencies when setting up for multi-platform deployment
- Use `npx expo install` for Expo-specific packages, `npm install` for others

---

### Error 4: `expo-sqlite` Won't Bundle on Web

**Date**: 2025-10-22
**Severity**: High (Breaking web build)
**Platform**: Web

#### Symptom
```
Web Bundling failed 8505ms index.js (656 modules)
Unable to resolve "react-native-safe-area-context" from "node_modules\expo-router\build\views\Navigator.js"
```

(This revealed the real issue: `expo-sqlite` is native-only API)

#### Root Cause
- `expo-sqlite` is a native mobile API (uses iOS/Android frameworks)
- Cannot be bundled for web (no browser SQLite access)
- Metro tries to include it in web bundle → fails

#### Solution Applied
**File**: `src/db/index.ts`

```typescript
import { Platform } from 'react-native';

// Conditional imports based on platform
if (Platform.OS !== 'web') {
  const SQLite = require('expo-sqlite');
  const { drizzle } = require('drizzle-orm/expo-sqlite');
  // Initialize SQLite
} else {
  // Use in-memory mock for web
  db = { /* mock implementation */ };
}

export async function initializeDatabase() {
  if (Platform.OS === 'web') {
    console.log('Running on web - using in-memory database mock');
    return true;
  }
  // Native initialization...
}
```

#### Lesson Learned
- Native APIs (SQLite, Camera, etc.) need conditional imports using `Platform.OS`
- Web requires fallback implementations or mocks
- Check platform before importing native modules

---

### Error 5: Missing Expo Router Peer Dependencies (Multiple)

**Date**: 2025-10-22
**Severity**: High (Blocking bundling)
**Platform**: Web primarily

#### Symptoms
```
Unable to resolve "react-native-safe-area-context"
Unable to resolve "expo-linking"
```

#### Root Cause
- Expo Router has undeclared peer dependencies
- These dependencies weren't auto-installed with `expo-router@3.4.0`
- Expo router depends on: @react-navigation packages, react-native-safe-area-context, etc.

#### Solution Applied
```bash
npm install react-native-safe-area-context --legacy-peer-deps
npm install react-native-screens @react-navigation/native-stack --legacy-peer-deps
npm install expo-linking expo-status-bar @react-native-community/masked-view --legacy-peer-deps
npm install @react-navigation/native --legacy-peer-deps
```

#### Dependencies Needed by Expo Router
| Package | Why | Version |
|---------|-----|---------|
| `react-native-safe-area-context` | Safe area handling for notches | ^5.6.1 |
| `react-native-screens` | Navigation optimization | ^4.17.1 |
| `@react-navigation/native-stack` | Stack navigation | ^7.3.28 |
| `@react-navigation/native` | Core navigation library | Latest |
| `expo-linking` | Deep linking support | ^8.0.8 |

#### Lesson Learned
- Check `package.json` in installed `node_modules/expo-router` for peer dependencies
- Expo Router documentation mentions these but they're not auto-installed
- Always install `@react-navigation/native` as a transitive dependency

---

### Error 6: `No filename found. This is likely a bug in expo-router`

**Date**: 2025-10-22
**Severity**: High (Blocking - prevents app launch)
**Platform**: Mobile (Expo Go)

#### Symptom
```
Uncaught Error: No filename found. This is likely a bug in expo-router.
    at useContextKey (D:\Tools\GitHub\VibeKeeper\node_modules\expo-router\build\Route.js:46:15)
    at Slot (D:\Tools\GitHub\VibeKeeper\node_modules\expo-router\build\views\Navigator.js:99:49)
```

#### Root Cause
- `expo-router/entry` was never imported in the entry point
- Router couldn't register route filenames from `src/app/` directory
- Manual Stack configuration in `App.js` conflicted with router's auto-routing

#### Solution Applied

**File**: `App.js` - BEFORE (wrong)
```javascript
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="src/app" ... />  // ❌ Manual routing
      </Stack>
    </GestureHandlerRootView>
  );
}
```

**File**: `App.js` - AFTER (correct)
```javascript
export default function App() {
  return <StatusBar style="auto" />;  // ✅ Minimal wrapper
}
```

**File**: `index.js`
```javascript
import App from './App';
import 'expo-router/entry';  // ✅ Import LAST to bootstrap router
```

**File**: `_layout.tsx`
```typescript
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer theme={DefaultTheme}>
        <Stack screenOptions={...}>
          {/* Routes auto-discovered from file structure */}
        </Stack>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
```

#### Lesson Learned
- **Correct Expo Router Architecture**:
  1. `index.js` imports `expo-router/entry` LAST
  2. `App.js` is a minimal wrapper (just status bar)
  3. `_layout.tsx` defines the router and wraps with providers
  4. Never manually define Stack.Screen for auto-routed pages
- Providers (GestureHandlerRootView, NavigationContainer) must wrap the Stack
- Entry point order matters: register app, then import router entry

---

### Error 7: `Cannot use 'import.meta' outside a module`

**Date**: 2025-10-22
**Severity**: High (Blocking - Metro bundling fails)
**Platform**: Mobile (Hermes runtime)

#### Symptom
```
Uncaught SyntaxError: Cannot use 'import.meta' outside a module
```

#### Root Cause
- Zustand v4.4.0 provides both ESM (with `import.meta`) and CommonJS builds
- Metro's `unstable_enablePackageExports` (default true in SDK 53+) picks the ESM build
- Hermes runtime (native mobile) only supports CommonJS, not ESM with `import.meta`
- Runtime error when Hermes tries to execute `import.meta.env`

#### Solution Applied

**File**: `metro.config.js` (new file)
```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable unstable_enablePackageExports to avoid import.meta issues with zustand
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
```

#### Explanation
- Forces Metro to use CommonJS builds (`.cjs`) instead of ESM (`.mjs`)
- Zustand will use its CommonJS entry point
- No more `import.meta` errors on Hermes runtime

#### Lesson Learned
- When you see `import.meta` errors on native, it's usually an ESM vs CommonJS mismatch
- Create `metro.config.js` and set `unstable_enablePackageExports = false` as a global fix
- Reference: [Expo Issue #36384](https://github.com/expo/expo/issues/36384)

---

### Error 8: `Couldn't find a theme. Is your component inside NavigationContainer?`

**Date**: 2025-10-22
**Severity**: High (Blocking - web crashes)
**Platform**: Web

#### Symptom
```
Uncaught Error: Couldn't find a theme. Is your component inside NavigationContainer or does it have a theme?
    at useTheme (node_modules/@react-navigation/core/lib/module/theming/useTheme.js)
```

#### Root Cause
- `Stack` navigator from expo-router needs a theme context on web
- Without `NavigationContainer`, the theme context is missing
- Native platforms have built-in theme, web doesn't

#### Solution Applied

**File**: `src/app/_layout.tsx`
```typescript
import { NavigationContainer } from '@react-navigation/native';
import { DefaultTheme } from '@react-navigation/native';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer theme={DefaultTheme}>  {/* ✅ Added wrapper */}
        <Stack screenOptions={...}>
          {/* Routes */}
        </Stack>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
```

#### Lesson Learned
- Always wrap Stack with `NavigationContainer` when using `@react-navigation`
- Provide a theme (DefaultTheme or DarkTheme) to avoid web errors
- Some patterns work on native but fail on web (platform-aware development)

---

### Error 9: `Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node`

**Date**: 2025-10-22
**Severity**: High (Blocking - web crashes)
**Platform**: Web

#### Symptom
```
Uncaught Error: Failed to execute 'removeChild' on 'Node':
The node to be removed is not a child of this node.
    at removeChildFromContainer (node_modules/react-dom/cjs/react-dom-client.development.js)
```

#### Root Cause
- React DOM cleanup conflict on web platform
- `registerRootComponent` (native Expo function) was being called AND `expo-router/entry` was trying to mount
- Both were trying to mount the app, causing DOM node conflicts
- Web needs expo-router to handle mounting, not registerRootComponent

#### Solution Applied

**File**: `index.js` - BEFORE (wrong)
```javascript
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);  // ❌ Native-only function
import 'expo-router/entry';  // ❌ Also trying to mount
```

**File**: `index.js` - AFTER (correct)
```javascript
import App from './App';

// expo-router/entry handles root mounting for all platforms
import 'expo-router/entry';  // ✅ Single mount strategy
```

#### Explanation
- `expo-router/entry` is smart enough to handle mounting on all platforms (native and web)
- Don't use `registerRootComponent` when using expo-router
- Let expo-router manage the root mounting entirely

#### Lesson Learned
- When using expo-router, it owns the root mounting responsibility
- Don't mix `registerRootComponent` with `expo-router/entry`
- Trust expo-router to handle platform differences (native vs web)

---

## Summary of Files Modified

| File | Changes | Purpose |
|------|---------|---------|
| `src/db/index.ts` | Platform-aware SQLite import | Use native SQLite on mobile, mock on web |
| `src/app/_layout.tsx` | Added NavigationContainer + theme | Provide navigation context for web |
| `App.js` | Simplified to minimal wrapper | Remove conflicting routing logic |
| `index.js` | Removed registerRootComponent | Let expo-router handle mounting |
| `metro.config.js` | Created with unstable_enablePackageExports=false | Fix zustand import.meta error |
| `package.json` | Added missing dependencies | Install required peer dependencies |

---

## Files Created

| File | Purpose |
|------|---------|
| `metro.config.js` | Metro bundler configuration (CommonJS/ESM handling) |
| `docs/ERROR_LOG.md` | This troubleshooting guide |

---

## Dependency Installation Summary

### Required by Expo Router
```bash
npm install react-native-safe-area-context react-native-screens @react-navigation/native-stack --legacy-peer-deps
npm install expo-linking @react-navigation/native --legacy-peer-deps
```

### Required for Web
```bash
npm install react-dom react-native-web --legacy-peer-deps
```

### Total New Dependencies Installed
- react-native-safe-area-context
- react-native-screens
- @react-navigation/native-stack
- @react-navigation/native
- expo-linking
- react-dom
- react-native-web

---

## Current Status

✅ **Web Platform**
- App loads in browser
- Landing page displays correctly
- Database mock working
- Navigation structure initialized

⏳ **Mobile Platform (Expo Go)**
- Still debugging
- See next section for mobile-specific issues

---

## Next Steps / Known Issues

### Mobile (Expo Go) - Investigation Needed
- App not loading in Expo Go on Android
- Need to check:
  1. Expo Go console logs
  2. Network connectivity between device and dev server
  3. QR code scanner accuracy
  4. Port 8082 accessibility from mobile

### Recommended Debugging Steps
```bash
# 1. Clear all caches
rm -rf node_modules/.cache
npx expo start --clear

# 2. Check device network
# - Device must be on same network as dev machine
# - Verify IP address: 192.168.178.29:8082

# 3. Check dev server logs for errors
# - Watch for React/Metro errors
# - Check LogBox warnings

# 4. If QR code doesn't work, manual entry:
# - In Expo Go, go to "Scan QR Code"
# - Type in: exp://192.168.178.29:8082
```

---

## Key Learnings

### Architecture Patterns
1. **Entry Point Order Matters**: App registration → Router entry import
2. **Provider Hierarchy**: Gesture Handler → Navigation Container → Stack
3. **Platform Awareness**: Always use `Platform.OS` for native-only APIs
4. **Theme Context**: Web requires explicit NavigationContainer + theme

### Configuration Files
1. **metro.config.js**: Controls bundling behavior (ESM vs CommonJS)
2. **tsconfig.json**: Already configured with path aliases and strict mode
3. **package.json**: Keep peer dependencies compatible with --legacy-peer-deps flag

### Debugging Techniques
1. **Metro Bundler Errors**: Look at the import stack trace
2. **Runtime Errors**: Check which platform (web vs mobile) and adjust accordingly
3. **Network Issues**: Verify device ↔ dev server connectivity
4. **Module Resolution**: Use `unstable_enablePackageExports` setting

---

## References

- [Expo Router Documentation](https://docs.expo.dev/routing/introduction/)
- [React Navigation Theming](https://reactnavigation.org/docs/theming/)
- [Expo Issue #36384 - import.meta error](https://github.com/expo/expo/issues/36384)
- [Metro Configuration](https://metrobundler.dev/docs/configuration/)

---

**Document Version**: 1.0
**Last Updated**: 2025-10-22
**Maintained By**: Claude Code Assistant
