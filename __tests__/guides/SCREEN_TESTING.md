# Screen Testing Guide

**Target**: React Native components and navigation
**Coverage Goal**: ≥75% for critical screens
**Speed**: 200-500ms per test
**Framework**: React Native Testing Library
**Database**: Mocked (jest.setup.js)
**Stores**: Real Zustand stores

---

## What to Test

- **Home Screen** (`src/app/index.tsx`) - Stats display, quick add button, navigation
- **Logs Screen** (`src/app/logs.tsx`) - Log list, date navigation, delete operations
- **Settings Screen** (`src/app/settings.tsx`) - Input fields, save/reset buttons
- **Navigation** - Stack navigation, modal presentations

---

## Basic Screen Test Structure

```typescript
// __tests__/screens/index.test.tsx
import { render, screen, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../../src/app/index';
import { resetStores } from '../helpers/testUtils';

describe('HomeScreen', () => {
  beforeEach(() => {
    resetStores(); // Clear store state
  });

  it('renders today stats', () => {
    const { getByText } = render(<HomeScreen />);

    expect(getByText(/Today/i)).toBeTruthy();
  });

  it('displays quick add button', () => {
    const { getByTestId } = render(<HomeScreen />);

    const button = getByTestId('quick-add-button');
    expect(button).toBeTruthy();
  });
});
```

---

## Testing User Interactions

### Tapping Buttons

```typescript
it('increments count when quick add is tapped', async () => {
  const { getByTestId, getByText } = render(<HomeScreen />);

  const button = getByTestId('quick-add-button');
  fireEvent.press(button);

  // Wait for store update
  await waitForAsync();

  expect(getByText('1')).toBeTruthy();
});
```

### Typing in TextInputs

```typescript
it('updates notes when user types', () => {
  const { getByTestId } = render(<SettingsScreen />);

  const input = getByTestId('cost-input');
  fireEvent.changeText(input, '0.75');

  expect(input.props.value).toBe('0.75');
});
```

### Navigation

```typescript
it('navigates to logs screen', () => {
  const mockNavigate = jest.fn();
  const mockRouter = {
    push: mockNavigate,
  };

  // Mock useRouter hook
  jest.mocked(useRouter).mockReturnValue(mockRouter);

  const { getByTestId } = render(<HomeScreen />);
  fireEvent.press(getByTestId('logs-button'));

  expect(mockNavigate).toHaveBeenCalledWith('logs');
});
```

---

## Testing with Store State

```typescript
// __tests__/screens/logs.test.tsx
import { render } from '@testing-library/react-native';
import LogsScreen from '../../src/app/logs';
import { useLogStore } from '../../src/stores/logStore';
import { createMockLogs } from '../helpers/mockData';

describe('LogsScreen', () => {
  beforeEach(() => {
    resetStores();
  });

  it('displays logs from store', () => {
    // Setup store with test data
    const logs = createMockLogs(3);
    useLogStore.setState({ logs });

    const { getByText } = render(<LogsScreen />);

    // Should render all 3 logs
    logs.forEach(log => {
      if (log.notes) {
        expect(getByText(log.notes)).toBeTruthy();
      }
    });
  });

  it('shows empty state when no logs', () => {
    useLogStore.setState({ logs: [] });

    const { getByText } = render(<LogsScreen />);

    expect(getByText(/No logs/i)).toBeTruthy();
  });
});
```

---

## Testing Async Operations

```typescript
import { waitFor } from '@testing-library/react-native';

it('loads logs on mount', async () => {
  const { getByText } = render(<HomeScreen />);

  // Wait for async load to complete
  await waitFor(() => {
    expect(getByText(/Today/i)).toBeTruthy();
  });
});
```

---

## Testing Settings Persistence

```typescript
// __tests__/screens/settings.test.tsx
describe('SettingsScreen', () => {
  beforeEach(() => {
    resetStores();
  });

  it('displays current cost setting', () => {
    const settings = createMockSettings({ costPerCigarette: 0.75 });
    useSettingsStore.setState({ settings });

    const { getByDisplayValue } = render(<SettingsScreen />);

    expect(getByDisplayValue('0.75')).toBeTruthy();
  });

  it('saves updated cost', async () => {
    useSettingsStore.setState({ settings: createMockSettings() });

    const { getByTestId, getByText } = render(<SettingsScreen />);

    const input = getByTestId('cost-input');
    fireEvent.changeText(input, '1.0');

    const saveButton = getByText(/Save/i);
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(useSettingsStore.getState().settings?.costPerCigarette).toBe(1.0);
    });
  });

  it('shows confirmation before reset', async () => {
    const { getByText } = render(<SettingsScreen />);

    const resetButton = getByText(/Reset/i);
    fireEvent.press(resetButton);

    // Alert.alert should be called
    expect(Alert.alert).toHaveBeenCalledWith(
      expect.stringContaining('Reset'),
      expect.any(String)
    );
  });
});
```

---

## Accessibility Testing

```typescript
it('has proper accessibility labels', () => {
  const { getByLabelText } = render(<HomeScreen />);

  expect(getByLabelText('Quick add cigarette')).toBeTruthy();
  expect(getByLabelText('Navigate to logs')).toBeTruthy();
});

it('button has accessible role', () => {
  const { getByRole } = render(<HomeScreen />);

  const button = getByRole('button', { name: /quick add/i });
  expect(button).toBeTruthy();
});
```

---

## Testing Modal Navigation

```typescript
it('renders logs as modal', () => {
  // Test that modal presentation works
  const { getByTestId } = render(<LogsScreen />);

  expect(getByTestId('logs-screen')).toBeTruthy();
});
```

---

## Common Testing Patterns

### Check Element Visibility
```typescript
expect(screen.getByText('Text')).toBeTruthy();
expect(screen.queryByText('Hidden')).toBeNull(); // Not rendered
```

### Check Props/Attributes
```typescript
const input = getByTestId('cost-input');
expect(input.props.value).toBe('0.5');
expect(input.props.placeholder).toBe('Cost per cigarette');
```

### Simulate User Actions
```typescript
fireEvent.press(button);                   // Tap
fireEvent.changeText(input, 'new text');   // Type
fireEvent.scroll(flatList, { y: 100 });    // Scroll
```

### Wait for Updates
```typescript
await waitFor(() => {
  expect(element).toHaveTextContent('Updated');
});

await waitForAsync(); // Wait for promise queue
```

---

## Adding testID to Components

Make components testable by adding `testID` props:

```typescript
// src/app/index.tsx
<TouchableOpacity testID="quick-add-button" onPress={quickAdd}>
  <Text>+ Add</Text>
</TouchableOpacity>

<TextInput testID="cost-input" value={cost} />
```

---

## Running Screen Tests

```bash
# Run all screen tests
npm test -- screens

# Run specific screen
npm test -- index.test.tsx

# Run with coverage
npm run test:coverage
```

---

## Mocking Navigation

Navigation is mocked globally in jest.setup.js:

```typescript
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
}));
```

Override in specific tests if needed:

```typescript
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn((route) => {
      expect(route).toBe('logs');
    }),
  }),
}));
```

---

## Common Issues

**"render is not defined"**
→ Import from React Native Testing Library:
```typescript
import { render } from '@testing-library/react-native';
```

**"fireEvent.press doesn't work"**
→ Make sure component has onPress handler:
```typescript
<TouchableOpacity onPress={handlePress}>
  <Text>Tap me</Text>
</TouchableOpacity>
```

**"Store state not updating"**
→ Call `resetStores()` in beforeEach to clear previous state

**"Navigation mock not working"**
→ Verify jest.mock('expo-router') is in jest.setup.js

---

## Next Steps

→ See **[E2E_TESTING.md](./E2E_TESTING.md)** for end-to-end testing with Detox on real devices
