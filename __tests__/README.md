# VibeKeeper Testing Hub

Single source of truth for every test suite in the project (Jest for unit/integration/screen, Detox for E2E).

---

## Quick Start Commands

```bash
# Unit + schema + screen suites
npm test

# Integration (schema-only) - Drizzle + SQLite sanity checks
npm run test:integration

# Integration (services) - requires Node --experimental-vm-modules
npm run test:integration:services

# Watch / coverage helpers
npm run test:watch
npm run test:coverage

# Detox example (Android) - requires emulator/simulator
npm run build:e2e:android && npm run test:e2e:android
```

---

## Testing Layers

| Layer | Speed | Database | When to Use |
|-------|-------|----------|-------------|
| **[Unit](./guides/UNIT_TESTING.md)** | <100ms | Mocked | Pure logic (utils, stores, service helpers) |
| **[Integration](./guides/INTEGRATION_TESTING.md)** | 100-500ms | Real SQLite | Schema + service CRUD via unmock/rebind |
| **[Screen](./guides/SCREEN_TESTING.md)** | 200-500ms | Mocked DB, real stores | React components, navigation, user flows |
| **[E2E](./guides/E2E_TESTING.md)** | 30s-2min | Real | Complete user journeys on device/simulator |

---

## Documentation Map

### Essential Guides
- **[UNIT_TESTING.md](./guides/UNIT_TESTING.md)** - Patterns for pure logic and Zustand stores
- **[INTEGRATION_TESTING.md](./guides/INTEGRATION_TESTING.md)** - Real SQLite via unmock & rebind
- **[SCREEN_TESTING.md](./guides/SCREEN_TESTING.md)** - RTL patterns, `useFocusEffect` mocking
- **[E2E_TESTING.md](./guides/E2E_TESTING.md)** - Detox flows, assertions, best practices
- **[DETOX_SETUP.md](../docs/DETOX_SETUP.md)** - Platform requirements, run commands, CI guidance

### Reference
- **[HELPERS.md](./guides/HELPERS.md)** - `mockData`, `mockDrizzle`, `testDb`, `testUtils`

### Configuration
- **jest.config.js** - Base preset, transforms, coverage thresholds
- **jest.config.integration.js** - Opt-in config for service integration (uses Node experimental modules)
- **jest.setup.js** - Global mocks (Expo SQLite, router, db), fake timers

---

## Directory Layout

```
__tests__/
  README.md                     # <- This hub
  guides/
    UNIT_TESTING.md
    INTEGRATION_TESTING.md
    SCREEN_TESTING.md
    E2E_TESTING.md
    HELPERS.md
  helpers/                      # Shared utilities and factories
    mockData.ts
    mockDrizzle.ts
    testDb.ts
    testUtils.ts
  unit/
    utils/
    stores/
  integration/
    logFlow.test.ts             # Schema validation + Drizzle smoke tests
    services.test.ts            # Log/Settings services via unmock & rebind
  screens/
    index.test.tsx
    logs.test.tsx
    settings.test.tsx
  e2e/
    quickLog.e2e.ts
    logManagement.e2e.ts
    settingsPersistence.e2e.ts
```

---

## Working With the Pyramid

1. Choose the right layer (table above).  
2. Read the matching guide in `__tests__/guides/`.  
3. Use helpers from `__tests__/helpers/` for factories, store resets, timer control.  
4. Run the appropriate npm script (`npm test`, `npm run test:integration`, `npm run test:integration:services`, Detox commands).

---

## Key Concepts & Current Status (Nov 2025)

- **Mocking strategy**
  - Unit: rely on global mocks from `jest.setup.js`.
  - Integration: `jest.unmock('../../src/db')`, `jest.resetModules()`, `jest.doMock()` with `createTestDb()`, then dynamic `import`.
  - Screen: real Zustand stores, mocked db, `useFocusEffect` mocked to execute inside `act`.
  - E2E: no mocks; full app under Detox.

- **Fake timers**
  - Enabled globally. Use `setFixedDate()` for deterministic tests, `advanceTime()` / `waitForAsync()` to flush timers and microtasks.

- **Status snapshot**
  - Unit + store suites: 100% passing (85 tests).
  - Screen suites: 160 passing; 24 intentionally skipped (documented in spec files) for flows covered via Detox.
  - Integration: `npm run test:integration` (schema) passing; `npm run test:integration:services` exercises LogService and SettingsService with real SQLite.
  - Detox: quick log, log management, and settings persistence flows scripted; run when an emulator or simulator is available.

---

## Coverage Targets

| Priority | Areas | Target |
|----------|-------|--------|
| P0 | `dateUtils`, `logStore`, `settingsStore`, `statisticsService` | >= 90% |
| P1 | `LogService`, `SettingsService` | >= 85% |
| P2 | Integration suites, screen interactions | >= 75% |
| P3 | Edge cases, performance, accessibility | >= 60% |

Generate a report with `npm run test:coverage`.

---

## Common Issues

- **Module not found in integration tests** - path must be `../../src/db` and `jest.unmock` must run before any imports.  
- **`initializeDatabase` is not a function** - confirm the global mock in `jest.setup.js` re-exports `initializeDatabase` and `resetDatabase`.  
- **Screen tests loop or hang** - do not pre-set Zustand stores before render; drive state through user events or helper utilities.  
- **Service integration throws `ERR_REQUIRE_ESM`** - run via `npm run test:integration:services` (enables Node experimental VM modules).  
- **Detox cannot find elements** - add `testID` / `accessibilityLabel` props; ensure simulator/emulator is running before executing tests.

---

## External Resources

- [Jest](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Detox](https://wix.github.io/Detox/docs/introduction/welcome)
- [Drizzle ORM](https://orm.drizzle.team/)

