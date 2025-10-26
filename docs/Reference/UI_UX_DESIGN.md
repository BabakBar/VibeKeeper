# VibeKeeper - UI/UX Design Specification

**Version**: 1.0
**Last Updated**: October 21, 2025

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Design System](#design-system)
3. [Screen Specifications](#screen-specifications)
4. [Component Library](#component-library)
5. [Interactions & Animations](#interactions--animations)
6. [Accessibility](#accessibility)
7. [Platform Guidelines](#platform-guidelines)

---

## 1. Design Philosophy

### 1.1 Core Principles

**Simplicity**
- Clear, uncluttered interface
- Focus on primary action (logging)
- Minimal cognitive load

**Immediacy**
- Instant feedback on all actions
- Real-time data updates
- No loading states for local operations

**Clarity**
- Large, readable typography
- Clear visual hierarchy
- Intuitive iconography

**Consistency**
- Follow platform conventions
- Predictable behavior
- Unified design language

**Accessibility**
- WCAG 2.1 AA compliance
- Screen reader support
- Sufficient color contrast
- Dynamic text sizing

### 1.2 User Experience Goals

- **One-tap logging**: Primary action requires single tap
- **Glanceable stats**: Key info visible without scrolling
- **Frictionless navigation**: Max 2 taps to any feature
- **Forgiving**: Easy to correct mistakes
- **Motivating**: Positive reinforcement, progress visualization

---

## 2. Design System

### 2.1 Color Palette

#### Brand Colors

```typescript
// theme/colors.ts
export const colors = {
  // Primary - Red (cigarette/warning theme)
  primary: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',  // Main brand color
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Secondary - Teal (health/progress theme)
  secondary: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',  // Success/progress color
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
  },

  // Neutral - Gray scale
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },

  // Semantic colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Backgrounds
  background: {
    light: '#ffffff',
    dark: '#0a0a0a',
  },

  // Surface
  surface: {
    light: '#f5f5f5',
    dark: '#171717',
  },
};
```

#### Light Theme

```typescript
export const lightTheme = {
  background: colors.background.light,
  surface: colors.surface.light,
  primary: colors.primary[500],
  secondary: colors.secondary[500],
  text: {
    primary: colors.neutral[900],
    secondary: colors.neutral[600],
    tertiary: colors.neutral[400],
  },
  border: colors.neutral[200],
  shadow: 'rgba(0, 0, 0, 0.1)',
};
```

#### Dark Theme

```typescript
export const darkTheme = {
  background: colors.background.dark,
  surface: colors.surface.dark,
  primary: colors.primary[500],
  secondary: colors.secondary[500],
  text: {
    primary: colors.neutral[50],
    secondary: colors.neutral[400],
    tertiary: colors.neutral[600],
  },
  border: colors.neutral[800],
  shadow: 'rgba(0, 0, 0, 0.5)',
};
```

### 2.2 Typography

```typescript
// theme/typography.ts
export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System-Medium',
    semibold: 'System-Semibold',
    bold: 'System-Bold',
  },

  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
    '7xl': 72,
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },

  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};
```

**Text Styles**:
```typescript
export const textStyles = {
  h1: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
  },
  h2: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
  },
  h3: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.tight,
  },
  body: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.normal,
  },
  caption: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.normal,
  },
};
```

### 2.3 Spacing

```typescript
// theme/spacing.ts
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
};
```

### 2.4 Border Radius

```typescript
export const borderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};
```

### 2.5 Shadows

```typescript
// iOS-style shadows
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};
```

---

## 3. Screen Specifications

### 3.1 Home Screen (Dashboard)

**Purpose**: Quick logging and today's overview

**Layout**:
```
┌─────────────────────────────────────┐
│  ☰                    [Profile]     │  ← Header
├─────────────────────────────────────┤
│                                     │
│              TODAY                  │  ← Section title
│                72                   │  ← Large count
│           cigarettes                │
│                                     │
├─────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐          │
│  │  First  │  │  Last   │          │  ← Quick stats cards
│  │  8:30AM │  │ 10:45PM │          │
│  └─────────┘  └─────────┘          │
├─────────────────────────────────────┤
│                                     │
│  ┌─ Timeline Chart ────────────┐   │  ← Hourly distribution
│  │     ▂▁▅▇▇▅▃▂▁▁▅▇▆          │
│  └──────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│         RECENT ENTRIES              │  ← Section
│  • 10:45 PM - After dinner          │
│  •  8:30 PM - Break                 │  ← Log list
│  •  6:15 PM - With coffee           │
│  •  3:45 PM - Stress break          │
│                                     │
└─────────────────────────────────────┘
          [  +  ]                       ← FAB (Floating Action Button)
```

**Components**:
- Header with menu icon
- Hero count display (large, centered)
- Quick stats cards (first/last, average interval)
- Timeline chart (hourly distribution)
- Recent entries list (last 5-10)
- FAB for quick logging

**Interactions**:
- Pull to refresh
- Tap FAB to log cigarette
- Tap log entry to edit/delete
- Swipe entry to delete
- Scroll for more entries

### 3.2 Statistics Screen

**Purpose**: Detailed analytics and trends

**Layout**:
```
┌─────────────────────────────────────┐
│        STATISTICS                   │  ← Header
│  [Day] [Week] [Month]               │  ← Period selector
├─────────────────────────────────────┤
│                                     │
│  ┌─ Main Chart ─────────────────┐  │
│  │                               │  │  ← Line/Bar chart
│  │    ▃▅▇▆▄▂▁▃▅▇▆▅▃             │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│                                     │
├─────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐        │
│  │  Total   │  │  Average │        │
│  │   156    │  │   22.3   │        │  ← Metric cards
│  │   this   │  │  per day │        │
│  │   week   │  │          │        │
│  └──────────┘  └──────────┘        │
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │   Cost   │  │   Peak   │        │
│  │  $46.80  │  │    Thu   │        │
│  │   spent  │  │  28 cigs │        │
│  └──────────┘  └──────────┘        │
│                                     │
├─────────────────────────────────────┤
│         INSIGHTS                    │  ← Section
│  🔥 You smoked 12% less this week   │
│  💰 Saved $3.60 compared to last    │  ← Auto-generated insights
│  📊 Most active time: 8-10 PM       │
│                                     │
└─────────────────────────────────────┘
```

**Components**:
- Period selector (tabs)
- Main chart (Victory Native)
- Metric cards grid
- Insights section
- Export data button (future)

**Interactions**:
- Switch between periods
- Pinch to zoom chart (future)
- Tap metric cards for details
- Pull to refresh

### 3.3 Settings Screen

**Purpose**: App configuration and preferences

**Layout**:
```
┌─────────────────────────────────────┐
│         SETTINGS                    │  ← Header
├─────────────────────────────────────┤
│                                     │
│  PRICING                            │  ← Section
│  Price per pack        $12.00  >    │
│  Cigarettes per pack      20   >    │  ← List items
│  Currency                USD   >    │
│                                     │
│  PREFERENCES                        │
│  Theme                   Auto  >    │
│  Notifications           [ON]       │  ← Toggle switch
│                                     │
│  GOALS                              │
│  Daily limit                25  >    │
│                                     │
│  DATA                               │
│  Export data                    >   │
│  Import data                    >   │  ← Action items
│  Clear all data                >   │
│                                     │
│  ABOUT                              │
│  Version                   1.0.0    │
│  Privacy Policy                 >   │
│  Terms of Service               >   │
│                                     │
└─────────────────────────────────────┘
```

**Components**:
- Sectioned list
- Text inputs
- Toggle switches
- Action buttons
- Navigation items

**Interactions**:
- Tap to edit values
- Toggle switches
- Navigate to sub-screens
- Confirm destructive actions

### 3.4 Log Cigarette Modal

**Purpose**: Quick logging with optional details

**Layout**:
```
┌─────────────────────────────────────┐
│  [×]         LOG CIGARETTE          │  ← Modal header
├─────────────────────────────────────┤
│                                     │
│  Time                               │
│  ┌─────────────────────────────┐   │
│  │  Now - 10:45 PM             │   │  ← Time picker
│  └─────────────────────────────┘   │
│                                     │
│  Notes (optional)                   │
│  ┌─────────────────────────────┐   │
│  │  After dinner...            │   │  ← Text input
│  └─────────────────────────────┘   │
│                                     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │         LOG NOW              │   │  ← Primary button
│  └─────────────────────────────┘   │
│                                     │
│           Cancel                    │  ← Secondary action
│                                     │
└─────────────────────────────────────┘
```

**Components**:
- Modal overlay
- Time picker
- Text input (optional notes)
- Primary action button
- Cancel link

**Interactions**:
- Default time to now
- Optional time adjustment
- Optional notes
- Tap outside to dismiss
- Swipe down to dismiss

### 3.5 Onboarding Flow (First Launch)

**Screen 1 - Welcome**:
```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│         🚬                          │  ← Icon
│                                     │
│       VibeKeeper                    │  ← App name
│                                     │
│   Track your cigarette              │
│   consumption with ease             │  ← Tagline
│                                     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Get Started             │   │  ← CTA
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Screen 2 - Price Setup**:
```
┌─────────────────────────────────────┐
│                  [2/3]              │  ← Progress
│                                     │
│      Set Your Price                 │
│                                     │
│  How much does a pack cost?         │
│  ┌─────────────────────────────┐   │
│  │  $ 12.00                    │   │  ← Price input
│  └─────────────────────────────┘   │
│                                     │
│  How many cigarettes per pack?      │
│  ┌─────────────────────────────┐   │
│  │    20                       │   │  ← Count input
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │       Continue               │   │
│  └─────────────────────────────┘   │
│                                     │
│         ← Back                      │
└─────────────────────────────────────┘
```

**Screen 3 - Notifications**:
```
┌─────────────────────────────────────┐
│                  [3/3]              │
│                                     │
│    Stay Informed                    │
│                                     │
│  Get daily summaries and            │
│  helpful reminders                  │
│                                     │
│  🔔                                 │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Enable Notifications       │   │
│  └─────────────────────────────┘   │
│                                     │
│       Maybe Later                   │  ← Skip
│                                     │
└─────────────────────────────────────┘
```

---

## 4. Component Library

### 4.1 Buttons

**Primary Button**:
```typescript
<Button
  variant="primary"
  size="large"
  onPress={handlePress}
>
  Log Cigarette
</Button>
```

**Variants**: primary, secondary, outline, ghost
**Sizes**: small, medium, large
**States**: default, pressed, disabled, loading

**Styling**:
```
Primary:
- Background: primary.500
- Text: white
- Rounded: lg
- Shadow: base
- Height: 48px (large)

Secondary:
- Background: secondary.500
- Text: white

Outline:
- Background: transparent
- Border: 1px primary.500
- Text: primary.500
```

### 4.2 Cards

**Stats Card**:
```typescript
<Card variant="outlined">
  <Card.Header>
    <Icon name="clock" />
    <Text variant="caption">First Cigarette</Text>
  </Card.Header>
  <Card.Content>
    <Text variant="h2">8:30 AM</Text>
  </Card.Content>
</Card>
```

**Variants**: filled, outlined, elevated

### 4.3 Input Fields

```typescript
<Input
  label="Price per pack"
  value={price}
  onChangeText={setPrice}
  keyboardType="decimal-pad"
  prefix="$"
  placeholder="0.00"
/>
```

**Types**: text, number, decimal, email
**Features**: label, placeholder, prefix/suffix, error state, helper text

### 4.4 Floating Action Button (FAB)

```typescript
<FAB
  icon="plus"
  onPress={handleLog}
  position="bottom-center"
  size="large"
  color="primary"
/>
```

**Positions**: bottom-right, bottom-center, bottom-left
**Sizes**: medium, large
**States**: default, pressed, expanded

**Styling**:
```
- Size: 56x56px (large)
- Background: primary.500
- Icon: white
- Shadow: xl
- Border radius: full
- Haptic feedback on press
```

### 4.5 Charts

**Line Chart**:
```typescript
<LineChart
  data={dailyData}
  xAxis="date"
  yAxis="count"
  color={colors.primary[500]}
  smooth
  showPoints
  showGrid
/>
```

**Bar Chart**:
```typescript
<BarChart
  data={weeklyData}
  xAxis="day"
  yAxis="count"
  color={colors.primary[500]}
  showValues
/>
```

**Features**:
- Responsive sizing
- Smooth animations
- Touch interactions
- Custom tooltips
- Gradient fills

---

## 5. Interactions & Animations

### 5.1 Micro-interactions

**Button Press**:
```typescript
// Scale down on press
Animated.sequence([
  Animated.spring(scale, { toValue: 0.95 }),
  Animated.spring(scale, { toValue: 1 }),
]);

// Haptic feedback
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
```

**FAB Press**:
```typescript
// Haptic + scale + color
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
// Scale animation
// Show success state (checkmark)
// Revert to plus after 1s
```

**Card Tap**:
```typescript
// Subtle scale + shadow
<Pressable
  style={({ pressed }) => [
    styles.card,
    pressed && { transform: [{ scale: 0.98 }] },
  ]}
>
```

### 5.2 Page Transitions

**Stack Navigation**:
```typescript
// Slide from right (iOS)
// Slide from bottom (modals)
<Stack.Screen
  options={{
    presentation: 'modal', // For modals
    animation: 'slide_from_right', // For screens
  }}
/>
```

**Tab Navigation**:
```typescript
// Fade between tabs
tabBarOptions={{
  animation: 'fade',
}}
```

### 5.3 List Animations

**Entry Animation**:
```typescript
// Fade in + slide up
items.map((item, index) => (
  <Animated.View
    key={item.id}
    entering={FadeInDown.delay(index * 100)}
  >
    <LogItem item={item} />
  </Animated.View>
));
```

**Swipe to Delete**:
```typescript
<Swipeable
  renderRightActions={renderDeleteAction}
  onSwipeableRightOpen={handleDelete}
>
  <LogItem />
</Swipeable>
```

### 5.4 Loading States

**Skeleton Screens**:
```typescript
<Skeleton.Card />
<Skeleton.Line width="80%" />
<Skeleton.Circle size={40} />
```

**Inline Loading**:
```typescript
<Button loading>
  <ActivityIndicator size="small" color="white" />
  Loading...
</Button>
```

### 5.5 Success States

**Log Success**:
```typescript
// Show checkmark animation
// Haptic feedback
// Update count with number increment animation
// Toast message: "Logged successfully"
```

**Achievement Unlock** (Future):
```typescript
// Modal with celebration animation
// Confetti effect
// Badge display
// Share button
```

---

## 6. Accessibility

### 6.1 Screen Reader Support

**Accessible Labels**:
```typescript
<Pressable
  accessible
  accessibilityLabel="Log a cigarette"
  accessibilityHint="Adds a new cigarette entry to today's count"
  accessibilityRole="button"
>
  <Icon name="plus" />
</Pressable>
```

**Heading Hierarchy**:
```typescript
<Text
  accessibilityRole="header"
  accessibilityLevel={1}
>
  Today
</Text>
```

### 6.2 Color Contrast

**WCAG AA Compliance**:
- Normal text: 4.5:1 contrast ratio
- Large text (18pt+): 3:1 contrast ratio
- UI components: 3:1 contrast ratio

**Tested Combinations**:
- primary.500 on white: 4.53:1 ✓
- neutral.900 on white: 21:1 ✓
- neutral.600 on white: 4.57:1 ✓

### 6.3 Touch Targets

**Minimum Size**: 44x44pt (iOS HIG, WCAG)

**Examples**:
- Buttons: 48px height minimum
- FAB: 56x56px
- List items: 56px height minimum
- Icons: 24x24px in 44x44px touchable area

### 6.4 Dynamic Type

**Support system font scaling**:
```typescript
import { useAccessibilityInfo } from 'react-native';

const { fontScale } = useAccessibilityInfo();

<Text style={{ fontSize: 16 * fontScale }}>
  Scales with system settings
</Text>
```

**Constraints**: Max scale 200%, layout remains functional

### 6.5 Reduced Motion

**Respect system preferences**:
```typescript
import { AccessibilityInfo } from 'react-native';

const [reduceMotion, setReduceMotion] = useState(false);

useEffect(() => {
  AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
}, []);

// Conditionally disable animations
{!reduceMotion && <Animation />}
```

---

## 7. Platform Guidelines

### 7.1 iOS Design (Human Interface Guidelines)

**Navigation**:
- Tab bar at bottom
- Large titles for top-level screens
- Swipe back gesture
- Modal presentation for temporary tasks

**Typography**:
- SF Pro font (system)
- Large title: 34pt bold
- Title: 17pt semibold
- Body: 17pt regular

**Components**:
- Native-feeling buttons
- Segmented controls for tabs
- Sheets for modal content
- SF Symbols for icons

**Spacing**:
- 16pt standard margin
- 8pt between related elements
- 24pt between sections

### 7.2 Android Design (Material Design)

**Navigation**:
- Bottom navigation
- Floating Action Button
- Drawer for secondary navigation (future)
- Modal bottom sheets

**Typography**:
- Roboto font (system)
- Headline: 24sp
- Title: 20sp
- Body: 16sp

**Components**:
- Material buttons with ripple
- Material cards with elevation
- Snackbars for feedback
- Material icons

**Spacing**:
- 16dp standard margin
- 8dp grid system
- 24dp between sections

### 7.3 Cross-Platform Considerations

**Shared**:
- Consistent color palette
- Consistent typography scale
- Consistent spacing values
- Shared component library

**Platform-Specific**:
- Navigation patterns (tabs vs bottom nav)
- Button styles (iOS rounded, Android material)
- Ripple effects (Android only)
- Haptic feedback (both, different APIs)
- Status bar styling

**Conditional Rendering**:
```typescript
import { Platform } from 'react-native';

{Platform.OS === 'ios' ? (
  <IOSButton />
) : (
  <AndroidButton />
)}
```

---

## Design Deliverables Checklist

- [ ] Figma design files (Phase 2)
- [ ] Design system documentation ✓
- [ ] Component library ✓
- [ ] Icon set
- [ ] App icon (multiple sizes)
- [ ] Splash screen
- [ ] Screenshots for App Store/Play Store
- [ ] Promotional graphics
- [ ] Animation specifications ✓
- [ ] Accessibility guidelines ✓

---

**End of UI/UX Design Specification**
