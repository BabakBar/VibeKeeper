# Detox E2E Testing Setup

This document provides instructions for running Detox E2E tests on Android emulator and iOS simulator.

## Prerequisites

### Android

1. **Android SDK & Emulator**: Ensure you have Android SDK API 30 or higher installed
2. **Emulator**: Create or use an existing AVD named `Pixel_4_API_30`
   ```bash
   # Check available AVDs
   emulator -list-avds
   
   # Create new AVD if needed
   # Use Android Studio's AVD Manager or command line
   ```

### iOS (Mac only)

1. **Xcode**: Xcode 12+ with command line tools
2. **iOS Simulator**: Available via Xcode

## Running Detox Tests

### Android

#### Step 1: Build the Debug APK

```bash
npm run build:e2e:android
```

This builds the app APK with Detox test instrumentation for Android emulator.

#### Step 2: Start the Android Emulator

```bash
# List available emulators
emulator -list-avds

# Start specific emulator
emulator -avd Pixel_4_API_30 -wipe-data  # Recommended for clean state
```

#### Step 3: Run Detox Tests

```bash
npm run test:e2e:android
```

Detox will:
- Wait for emulator to be ready
- Install the APK
- Run all tests in `__tests__/e2e/**/*.e2e.ts`
- Report results

### iOS

#### Step 1: Build the Debug App

```bash
npm run build:e2e:ios
```

#### Step 2: Run Detox Tests

```bash
npm run test:e2e:ios
```

## E2E Test Structure

Tests are located in `__tests__/e2e/` and follow Detox patterns:

- `quickLog.e2e.ts` - Quick add cigarette logging
- `logManagement.e2e.ts` - Full log lifecycle (add, edit, delete)
- `settingsPersistence.e2e.ts` - Settings persistence across app restarts

## Detox Best Practices

### 1. Use Synchronization

Detox automatically waits for the app to be in an idle state (no pending animations or async operations).

### 2. Element Finders

```typescript
// Find by ID (recommended)
element(by.id('myButton'))

// Find by text
element(by.text('Save'))

// Find by label
element(by.label('logout-button'))

// Find by type
element(by.type('RCTTouchableOpacity'))
```

### 3. User Interactions

```typescript
// Tap
await element(by.id('myButton')).tap();

// Type text
await element(by.id('input')).typeText('hello');

// Scroll
await element(by.id('scrollView')).scroll(500, 'down');

// Swipe
await element(by.id('view')).swipe('up');
```

### 4. Assertions

```typescript
// Visibility
await expect(element(by.id('success'))).toBeVisible();

// Text content
await expect(element(by.text('Logged in'))).toBeVisible();

// Non-existence
await expect(element(by.id('errorMsg'))).not.toBeVisible();
```

### 5. Waits and Synchronization

```typescript
// Wait for element to appear
await waitFor(element(by.text('Loading complete')))
  .toBeVisible()
  .withTimeout(5000);

// Device actions
await device.reloadReactNative();  // Reload JS without full app restart
```

## Troubleshooting

### Emulator Won't Start

```bash
# Kill all running emulator instances
adb kill-server

# Start fresh
emulator -avd Pixel_4_API_30 -wipe-data
```

### App Not Installing

```bash
# Clear ADB cache and restart
adb kill-server
adb start-server

# Try building and testing again
npm run build:e2e:android && npm run test:e2e:android
```

### Tests Timing Out

- Check if app is responding: `adb shell input tap 500 500`
- Increase timeout in test: `withTimeout(10000)` 
- Run single test: `npm run test:e2e:android -- --testNamePattern="test-name"`

### Element Not Found

- Print the screen hierarchy: Add `await device.takeScreenshot('error')` before assertion
- Verify element IDs match: Check `accessibilityLabel` or `testID` in components

## CI/CD Integration

To run Detox in CI/CD pipeline:

```bash
# Build artifacts
npm run build:e2e:android

# Run tests (headless)
npm run test:e2e:android -- --headless --cleanup --recordLogs all
```

## Next Steps

1. Ensure Android emulator has `Pixel_4_API_30` AVD
2. Run `npm run build:e2e:android` to create test APK
3. Start emulator
4. Run `npm run test:e2e:android` to validate setup

See `__tests__/e2e/` for test examples.
