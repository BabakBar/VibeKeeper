# Archived Testing Documentation

This directory contains the original comprehensive testing strategy documents that have been restructured for better scalability and maintainability.

## What Happened

The original TESTING_STRATEGY.md and TESTING_STRATEGY_CORRECTIONS.md files were comprehensive but large and difficult to navigate. The strategy has been restructured into:

- **`__tests__/README.md`** - Hub document linking to all testing guides
- **`__tests__/guides/UNIT_TESTING.md`** - Unit testing patterns and examples
- **`__tests__/guides/INTEGRATION_TESTING.md`** - Integration testing with real SQLite
- **`__tests__/guides/SCREEN_TESTING.md`** - React Native component testing
- **`__tests__/guides/E2E_TESTING.md`** - Detox E2E testing
- **`__tests__/guides/HELPERS.md`** - Helper utilities reference

## Key Changes

1. **Broke down into focused layers** - Each testing layer has its own guide
2. **Made README a hub** - Single entry point with links to detailed guides
3. **Removed duplication** - No more cross-document repetition
4. **Improved scalability** - Easy to add new testing patterns without bloating a single file

## Migration Notes

All critical information from the original files has been migrated to the new structure:

- ✅ Jest configuration examples → `__tests__/README.md` + jest.config.js
- ✅ jest.setup.js mocking strategy → Preserved with all blocker fixes
- ✅ Unit testing patterns → `__tests__/guides/UNIT_TESTING.md`
- ✅ Integration testing (unmock/rebind) → `__tests__/guides/INTEGRATION_TESTING.md`
- ✅ Screen testing (RTL) → `__tests__/guides/SCREEN_TESTING.md`
- ✅ E2E testing (Detox) → `__tests__/guides/E2E_TESTING.md`
- ✅ Helper utilities → `__tests__/guides/HELPERS.md`

## Reference

If you need to understand the history of blocker fixes and corrections, see:
- `TESTING_STRATEGY_CORRECTIONS.md` - Original issue analysis and fixes

New developers should start with `__tests__/README.md`.
