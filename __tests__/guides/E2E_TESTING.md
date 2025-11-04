# E2E Testing Guide (Detox)

**Target**: Complete user flows on real device simulators
**Coverage Goal**: 3 critical flows (minimum for MVP release)
**Speed**: 30s-2min per test
**Framework**: Detox with detox-expo-helpers
**Database**: Real Expo SQLite (on device)
**Environment**: iOS Simulator and/or Android Emulator

---

## What to Test

E2E tests validate that the full app works end-to-end on device. Three critical flows minimum:

1. **Quick Log Flow** (30 seconds)
   - Launch app → Tap quick add → See counter increment → Success

2. **Full Log Management** (1 minute)
   - Navigate to logs → Add log with notes → Edit log → Delete log → Verify removed

3. **Settings Persistence** (45 seconds)
   - Change cost → Kill app → Relaunch → Verify setting persisted

---

## Setup

### Install Detox

```bash
npm install --save-dev detox detox-expo-helpers
npx detox init
```

### Configuration (.detoxrc.js)

```javascript
module.exports = {
  testRunner: 'jest',
  apps: {
    ios: {
      type: 'ios.app',
      binaryPath: 'artifacts/ios/Release.app',
      build: 'xcodebuild -workspace ios/VibeKeeper.xcworkspace -scheme VibeKeeper -configuration Release -sdk iphonesimulator -derivedDataPath ios/build -quiet'
    },
    android: {
      type: 'android.apk',
      binaryPath: 'artifacts/android/app/build/outputs/apk/release/app-release.apk',
      build: 'cd android && gradlew assembleRelease assembleAndroidTest -DtestBuildType=release'
    }
  },
  configurations: {
    'ios.sim.debug': {
      device: {
        type: 'iPhone 15'
      },
      app: 'ios'
    },
    'android.emu.debug': {
      device: {
        type: 'android.emulator',
        device: {
          avdName: 'Pixel_4_API_31'
        }
      },
      app: 'android'
    }
  },
  testRunner: 'jest'
};
```

---

## Basic E2E Test Structure

```typescript
// e2e/quickLog.e2e.ts
describe('Quick Log Flow', () => {
  beforeAll(async () => {
    // Launch app before tests
    await device.launchApp();
  });

  beforeEach(async () => {
    // Reload before each test to reset state
    await device.reloadReactNative();
  });

  it('increments count when adding cigarette', async () => {
    // Find quick add button and tap
    await element(by.id('quickAddButton')).multiTap(1);

    // Verify counter is now 1
    await expect(element(by.text('1'))).toBeVisible();
  });
});
```

---

## Finding Elements

```typescript
// By ID (recommended)
await element(by.id('quickAddButton')).tap();

// By text
await element(by.text('Quick Add')).tap();

// By label
await element(by.label('Quick add cigarette')).tap();

// By type
await element(by.type('RCTTouchableOpacity')).tap();

// Nested matchers
await element(
  by.id('logsList').and(by.text('morning smoke'))
).tap();
```

---

## User Interactions

```typescript
// Tap
await element(by.id('button')).tap();

// Long press
await element(by.id('button')).longPress();

// Multi-tap (double, triple, etc)
await element(by.id('button')).multiTap(2);

// Type text
await element(by.id('notesInput')).typeText('New notes');

// Clear text
await element(by.id('notesInput')).clearText();

// Scroll
await waitFor(element(by.text('Bottom Item')))
  .toBeVisible()
  .whileElement(by.id('logsList'))
  .scroll(500, 'down');

// Swipe
await element(by.id('item')).swipe('right');
```

---

## Example: Quick Log Flow

```typescript
// e2e/quickLog.e2e.ts
describe('Quick Log Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should add cigarette and increment counter', async () => {
    // Initial state - counter should be 0
    await expect(element(by.text('0'))).toBeVisible();

    // Tap quick add button
    await element(by.id('quickAddButton')).tap();

    // Counter should now be 1
    await expect(element(by.text('1'))).toBeVisible();
  });

  it('should add multiple cigarettes', async () => {
    // Add 3 cigarettes
    await element(by.id('quickAddButton')).multiTap(3);

    // Counter should be 3
    await expect(element(by.text('3'))).toBeVisible();
  });
});
```

---

## Example: Full Log Management

```typescript
// e2e/logManagement.e2e.ts
describe('Log Management Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should complete full log lifecycle', async () => {
    // Navigate to logs screen
    await element(by.id('logsTabButton')).tap();
    await expect(element(by.text('My Logs'))).toBeVisible();

    // Tap add log button
    await element(by.id('addLogButton')).tap();

    // Fill in notes
    await element(by.id('notesInput')).typeText('Test cigarette');

    // Tap save
    await element(by.id('saveButton')).tap();

    // Verify log appears in list
    await expect(element(by.text('Test cigarette'))).toBeVisible();

    // Tap edit button
    await element(by.id('editButton')).atIndex(0).tap();

    // Update notes
    await element(by.id('notesInput')).clearText();
    await element(by.id('notesInput')).typeText('Updated note');
    await element(by.id('saveButton')).tap();

    // Verify update
    await expect(element(by.text('Updated note'))).toBeVisible();

    // Tap delete
    await element(by.id('deleteButton')).atIndex(0).tap();

    // Confirm delete
    await element(by.text('Yes')).tap();

    // Verify log is gone
    await expect(element(by.text('Updated note'))).not.toBeVisible();
  });
});
```

---

## Example: Settings Persistence

```typescript
// e2e/settingsPersistence.e2e.ts
describe('Settings Persistence', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should persist cost setting across app restart', async () => {
    // Navigate to settings
    await element(by.id('settingsTabButton')).tap();
    await expect(element(by.text('Settings'))).toBeVisible();

    // Change cost to 1.0
    await element(by.id('costInput')).clearText();
    await element(by.id('costInput')).typeText('1.0');
    await element(by.id('saveButton')).tap();

    // Verify save succeeded
    await expect(element(by.text('Settings saved'))).toBeVisible();

    // Kill app
    await device.sendToHome();
    await device.launchApp({ newInstance: false });

    // Navigate back to settings
    await element(by.id('settingsTabButton')).tap();

    // Verify cost is still 1.0
    await expect(element(by.id('costInput')).and(by.text('1.0')))
      .toBeVisible();
  });
});
```

---

## Waiting and Assertions

### Wait for Element

```typescript
// Wait with timeout (default 5000ms)
await waitFor(element(by.id('result')))
  .toBeVisible()
  .withTimeout(10000);

// Multiple conditions
await waitFor(element(by.id('button')))
  .toBeVisible()
  .and(element(by.text('Ready')))
  .toBeVisible();
```

### Expectations

```typescript
// Visibility
await expect(element(by.id('button'))).toBeVisible();
await expect(element(by.id('hidden'))).not.toBeVisible();

// Text content
await expect(element(by.id('counter'))).toHaveText('5');

// Disabled state
await expect(element(by.id('submitButton'))).not.toBeEnabled();
```

---

## Handling Dialogs

```typescript
// Dismiss alert
await element(by.text('OK')).tap();

// Confirm action
await element(by.text('Yes, delete')).tap();

// Wait for dialog
await waitFor(element(by.text('Are you sure?')))
  .toBeVisible()
  .withTimeout(5000);
```

---

## Running E2E Tests

```bash
# Build app for testing
npm run build:e2e:ios

# Run E2E tests
npm run test:e2e:ios

# Run specific test file
npm run test:e2e:ios -- quickLog.e2e.ts

# Build and run together
npm run build:e2e:ios && npm run test:e2e:ios

# Android
npm run build:e2e:android && npm run test:e2e:android
```

---

## Best Practices

### Add testID to Components

Make elements findable:

```typescript
// src/app/index.tsx
<TouchableOpacity testID="quickAddButton">
  <Text>+ Add</Text>
</TouchableOpacity>

<TextInput testID="notesInput" placeholder="Notes" />

<View testID="logsList">
  {/* logs */}
</View>
```

### Use Descriptive Test Names

```typescript
✓ it('should add cigarette and show updated count')
✗ it('adds')
✗ it('button works')
```

### Reset State Between Tests

```typescript
beforeEach(async () => {
  await device.reloadReactNative();
});
```

### Use Explicit Waits

```typescript
// ✓ Good: Wait for element
await waitFor(element(by.text('Saved')))
  .toBeVisible()
  .withTimeout(5000);

// ✗ Bad: Fixed delay
await new Promise(r => setTimeout(r, 2000));
```

### Keep Tests Independent

```typescript
// ✓ Each test is self-contained
it('should add one cigarette', async () => {
  await element(by.id('quickAddButton')).tap();
  await expect(element(by.text('1'))).toBeVisible();
});

// ✗ Don't depend on previous tests
it('should have 2 total from previous test', async () => {
  // Fails if previous test didn't run
});
```

---

## Detox Tips

### Record Interactions

Detox can help record interactions for debugging:

```bash
# Start device and recorder
npx detox test e2e/quickLog.e2e.ts --record-logs all
```

### Debug Slow Tests

Add logging:

```typescript
it('should complete flow', async () => {
  console.log('Step 1: Tapping button');
  await element(by.id('button')).tap();

  console.log('Step 2: Waiting for result');
  await waitFor(element(by.text('Done')))
    .toBeVisible()
    .withTimeout(10000);
});
```

---

## Running on CI

Package.json scripts are already configured:

```json
{
  "scripts": {
    "test:e2e:ios": "detox test --configuration ios.sim.debug",
    "test:e2e:android": "detox test --configuration android.emu.debug"
  }
}
```

---

## Common Issues

**"Cannot find element"**
→ Element may not be visible or testID is wrong. Check component.

**"Timeout waiting for element"**
→ Increase timeout with `.withTimeout(15000)` or check element exists.

**"App crashes during test"**
→ Check device logs. May be database initialization issue.

**"Tests flaky on CI"**
→ Add explicit waits instead of fixed delays. Use `.waitFor()`.

---

## Next Steps & Resources

- [Detox Official Docs](https://wix.github.io/Detox/)
- [Detox API Reference](https://wix.github.io/Detox/docs/api/actions)
- Start with 3 critical flows, expand as needed
