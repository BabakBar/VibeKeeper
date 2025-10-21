# GitHub Issues Guide for VibeKeeper

This document outlines the GitHub issues structure for tracking VibeKeeper development.

---

## Issue Structure

### Epics (High-Level Features)

Create epic issues for major feature sets that span multiple sprints.

**Recommended Epics**:

1. **[EPIC] Database & State Management** - Sprint 1
2. **[EPIC] Design System & UI Foundation** - Sprint 2
3. **[EPIC] Cigarette Logging System** - Sprint 3
4. **[EPIC] Dashboard & Statistics** - Sprint 4-5
5. **[EPIC] Pricing & Cost Tracking** - Sprint 6
6. **[EPIC] Settings & Data Management** - Sprint 7
7. **[EPIC] Onboarding & Polish** - Sprint 8
8. **[EPIC] Testing & Quality Assurance** - Sprint 9
9. **[EPIC] Beta Release & Deployment** - Sprint 10

### User Stories (Features)

Break down epics into specific user stories and features.

### Tasks (Implementation Details)

Create task-level issues for specific implementation work.

---

## Epic 1: Database & State Management

**Sprint**: 1
**Priority**: P0

### User Stories

#### Story 1.1: Set Up Database Schema
```markdown
**Title**: [FEATURE] Implement SQLite database schema with Drizzle ORM

**Description**:
Set up the complete database schema using Expo SQLite and Drizzle ORM to support all data storage needs.

**Acceptance Criteria**:
- [ ] Drizzle ORM configured with Expo SQLite
- [ ] All tables created (cigarette_logs, price_configs, user_settings)
- [ ] Indexes created for performance
- [ ] Migration system working
- [ ] Seed data script created
- [ ] Database client exported and functional

**Priority**: P0
**Estimate**: Medium (3-5 days)
**Sprint**: 1
```

#### Story 1.2: Implement State Management
```markdown
**Title**: [FEATURE] Set up Zustand state management stores

**Description**:
Create Zustand stores for managing application state with persistence.

**Acceptance Criteria**:
- [ ] Cigarette store implemented
- [ ] Settings store implemented
- [ ] Pricing store implemented
- [ ] Persistence middleware configured
- [ ] TypeScript types defined
- [ ] Unit tests written (>80% coverage)

**Priority**: P0
**Estimate**: Medium (3-5 days)
**Sprint**: 1
```

---

## Epic 2: Design System & UI Foundation

**Sprint**: 2
**Priority**: P0

### User Stories

#### Story 2.1: Create Design System
```markdown
**Title**: [FEATURE] Implement design system with theme support

**Description**:
Build a comprehensive design system with colors, typography, spacing, and theme switching.

**Acceptance Criteria**:
- [ ] Color palette implemented (light/dark themes)
- [ ] Typography system created
- [ ] Spacing/layout utilities defined
- [ ] NativeWind configured
- [ ] Theme switching functional
- [ ] Theme persists across app restarts

**Priority**: P0
**Estimate**: Medium (3-5 days)
**Sprint**: 2
```

#### Story 2.2: Build Component Library
```markdown
**Title**: [FEATURE] Create reusable UI component library

**Description**:
Build foundational UI components following the design system.

**User Stories**:
- As a developer, I want reusable components so that I can build UIs faster

**Acceptance Criteria**:
- [ ] Button component (all variants)
- [ ] Card component
- [ ] Input component
- [ ] Text/Typography component
- [ ] Screen wrapper component
- [ ] Icon system (SVG-based)
- [ ] All components have TypeScript types
- [ ] Component tests written

**Priority**: P0
**Estimate**: Large (1-2 weeks)
**Sprint**: 2
```

#### Story 2.3: Set Up Navigation
```markdown
**Title**: [FEATURE] Configure Expo Router navigation structure

**Description**:
Set up file-based routing with Expo Router including tabs and modals.

**Acceptance Criteria**:
- [ ] Tab navigation configured
- [ ] Modal routes created
- [ ] Navigation types defined
- [ ] Deep linking tested
- [ ] Screen transitions smooth

**Priority**: P0
**Estimate**: Small (1-2 days)
**Sprint**: 2
```

---

## Epic 3: Cigarette Logging System

**Sprint**: 3
**Priority**: P0

### User Stories

#### Story 3.1: Quick Log Functionality
```markdown
**Title**: [FEATURE] One-tap cigarette logging

**Description**:
Enable users to log a cigarette with a single tap from anywhere in the app.

**User Stories**:
- As a user, I want to log a cigarette with one tap so that tracking is effortless
- As a user, I want immediate feedback so that I know my log was recorded

**Acceptance Criteria**:
- [ ] FAB button visible on all main screens
- [ ] Tap FAB logs cigarette immediately
- [ ] Haptic feedback on successful log
- [ ] Count updates in real-time
- [ ] Success animation plays
- [ ] Log appears in recent entries instantly
- [ ] Performance: Log completes in <200ms

**Priority**: P0
**Estimate**: Medium (3-5 days)
**Sprint**: 3
```

#### Story 3.2: Detailed Logging
```markdown
**Title**: [FEATURE] Log cigarette with timestamp and notes

**Description**:
Allow users to log with custom timestamp and optional notes.

**User Stories**:
- As a user, I want to add notes to my logs so that I can track context
- As a user, I want to backdate entries so that I can log accurately

**Acceptance Criteria**:
- [ ] Modal UI for detailed logging
- [ ] Time picker (defaults to now)
- [ ] Notes text input (optional)
- [ ] Validation for future dates
- [ ] Save button functional
- [ ] Cancel closes modal

**Priority**: P0
**Estimate**: Medium (3-5 days)
**Sprint**: 3
```

#### Story 3.3: Edit and Delete Logs
```markdown
**Title**: [FEATURE] Edit and delete cigarette log entries

**Description**:
Users can correct mistakes by editing or deleting log entries.

**User Stories**:
- As a user, I want to edit entries so that I can fix mistakes
- As a user, I want to delete entries so that I can remove accidental logs

**Acceptance Criteria**:
- [ ] Tap entry to open edit modal
- [ ] Edit timestamp and notes
- [ ] Swipe-to-delete gesture
- [ ] Confirmation dialog for delete
- [ ] Optimistic updates
- [ ] Changes reflect immediately

**Priority**: P0
**Estimate**: Small (1-2 days)
**Sprint**: 3
```

---

## Epic 4: Dashboard & Statistics

**Sprint**: 4-5
**Priority**: P0

### User Stories

#### Story 4.1: Home Dashboard
```markdown
**Title**: [FEATURE] Home screen dashboard with today's stats

**Description**:
Display today's cigarette count and quick stats on the home screen.

**User Stories**:
- As a user, I want to see today's count at a glance
- As a user, I want to see when I had my first and last cigarette

**Acceptance Criteria**:
- [ ] Large count display (today's total)
- [ ] Quick stats cards (first/last time)
- [ ] Recent entries list (last 10)
- [ ] Pull-to-refresh
- [ ] Empty state for first use
- [ ] Live updates on new logs
- [ ] Performance: <50ms render time

**Priority**: P0
**Estimate**: Large (1-2 weeks)
**Sprint**: 4
```

#### Story 4.2: Daily Statistics
```markdown
**Title**: [FEATURE] Daily statistics with hourly distribution

**Description**:
Show detailed daily statistics including hourly distribution chart.

**Acceptance Criteria**:
- [ ] Hourly distribution chart
- [ ] Average time between cigarettes
- [ ] Comparison with yesterday
- [ ] Peak hour indicator
- [ ] Charts render smoothly
- [ ] Data updates in real-time

**Priority**: P0
**Estimate**: Medium (3-5 days)
**Sprint**: 4
```

#### Story 4.3: Weekly & Monthly Statistics
```markdown
**Title**: [FEATURE] Weekly and monthly statistics views

**Description**:
Aggregate and visualize statistics over weekly and monthly periods.

**User Stories**:
- As a user, I want to see weekly trends so that I can track changes
- As a user, I want to see monthly totals so that I understand patterns

**Acceptance Criteria**:
- [ ] Period selector (Day/Week/Month tabs)
- [ ] Line chart for trends
- [ ] Bar chart for daily breakdown
- [ ] Metric cards (total, average, peak)
- [ ] Comparison with previous period
- [ ] Efficient SQL aggregations
- [ ] Charts render in <500ms

**Priority**: P0
**Estimate**: Large (1-2 weeks)
**Sprint**: 5
```

---

## Epic 5: Pricing & Cost Tracking

**Sprint**: 6
**Priority**: P0

### User Stories

#### Story 5.1: Price Configuration
```markdown
**Title**: [FEATURE] Configure cigarette pricing

**Description**:
Allow users to set price per pack and cigarettes per pack.

**User Stories**:
- As a user, I want to set my pack price so that costs are calculated accurately
- As a user, I want to specify pack size so that per-cigarette cost is correct

**Acceptance Criteria**:
- [ ] Price input (currency formatted)
- [ ] Cigarettes per pack input (default: 20)
- [ ] Currency selector
- [ ] Input validation
- [ ] Price history tracking
- [ ] Saves to database

**Priority**: P0
**Estimate**: Medium (3-5 days)
**Sprint**: 6
```

#### Story 5.2: Cost Calculation
```markdown
**Title**: [FEATURE] Calculate and display cigarette costs

**Description**:
Calculate costs based on consumption and display throughout the app.

**Acceptance Criteria**:
- [ ] Cost per cigarette calculated correctly
- [ ] Daily cost displayed on dashboard
- [ ] Weekly/monthly costs in statistics
- [ ] Currency formatting correct
- [ ] Handles price changes over time
- [ ] Cost comparison with previous periods

**Priority**: P0
**Estimate**: Medium (3-5 days)
**Sprint**: 6
```

---

## Epic 6: Settings & Data Management

**Sprint**: 7
**Priority**: P0

### User Stories

#### Story 6.1: App Settings
```markdown
**Title**: [FEATURE] Settings screen with preferences

**Description**:
Comprehensive settings screen for app configuration.

**Acceptance Criteria**:
- [ ] Theme selector (Light/Dark/Auto)
- [ ] Notification toggle
- [ ] Currency selector
- [ ] Daily goal input
- [ ] About section with version
- [ ] Settings persist correctly

**Priority**: P0
**Estimate**: Medium (3-5 days)
**Sprint**: 7
```

#### Story 6.2: Data Export/Import
```markdown
**Title**: [FEATURE] Export and import data

**Description**:
Allow users to export their data to JSON and import it back.

**User Stories**:
- As a user, I want to export my data so that I have a backup
- As a user, I want to import data so that I can restore from backup

**Acceptance Criteria**:
- [ ] Export to JSON file
- [ ] Share exported file
- [ ] Import from JSON file
- [ ] Validation on import
- [ ] Confirmation dialogs
- [ ] Error handling

**Priority**: P1
**Estimate**: Medium (3-5 days)
**Sprint**: 7
```

---

## Epic 7: Onboarding & Polish

**Sprint**: 8
**Priority**: P1

### User Stories

#### Story 7.1: Onboarding Flow
```markdown
**Title**: [FEATURE] First-time user onboarding

**Description**:
Guide new users through initial setup.

**Acceptance Criteria**:
- [ ] Welcome screen
- [ ] Price setup screen
- [ ] Notification permission screen
- [ ] Skip functionality
- [ ] Onboarding completion stored
- [ ] Only shows once

**Priority**: P1
**Estimate**: Medium (3-5 days)
**Sprint**: 8
```

#### Story 7.2: UI Polish
```markdown
**Title**: [TASK] Polish UI and animations

**Description**:
Refine all animations, transitions, and visual details.

**Acceptance Criteria**:
- [ ] All animations smooth (60fps)
- [ ] Haptic feedback consistent
- [ ] Loading states polished
- [ ] Error states friendly
- [ ] Typography refined
- [ ] Spacing consistent
- [ ] No visual glitches

**Priority**: P1
**Estimate**: Large (1-2 weeks)
**Sprint**: 8
```

---

## Epic 8: Testing & QA

**Sprint**: 9
**Priority**: P0

### User Stories

#### Story 8.1: Automated Testing
```markdown
**Title**: [TASK] Write comprehensive test suite

**Description**:
Achieve >80% test coverage with unit, integration, and E2E tests.

**Acceptance Criteria**:
- [ ] Unit tests for all services (>90% coverage)
- [ ] Component tests for all UI (>80% coverage)
- [ ] Integration tests for critical flows
- [ ] E2E tests for main user journeys
- [ ] All tests passing in CI

**Priority**: P0
**Estimate**: Extra Large (2+ weeks)
**Sprint**: 9
```

#### Story 8.2: Cross-Platform Testing
```markdown
**Title**: [TASK] Test on iOS and Android devices

**Description**:
Comprehensive testing across device types and OS versions.

**Acceptance Criteria**:
- [ ] Tested on iOS 14+ devices
- [ ] Tested on Android 7.0+ devices
- [ ] No platform-specific bugs
- [ ] Consistent UI across platforms
- [ ] Performance acceptable on all devices

**Priority**: P0
**Estimate**: Large (1-2 weeks)
**Sprint**: 9
```

---

## Epic 9: Beta Release

**Sprint**: 10
**Priority**: P0

### User Stories

#### Story 9.1: App Store Preparation
```markdown
**Title**: [TASK] Prepare for App Store submission

**Description**:
Create all assets and metadata for iOS App Store.

**Acceptance Criteria**:
- [ ] App icons (all sizes)
- [ ] Screenshots (all devices)
- [ ] App description written
- [ ] Privacy policy published
- [ ] TestFlight build uploaded
- [ ] Beta testers invited

**Priority**: P0
**Estimate**: Medium (3-5 days)
**Sprint**: 10
```

#### Story 9.2: Play Store Preparation
```markdown
**Title**: [TASK] Prepare for Play Store submission

**Description**:
Create all assets and metadata for Google Play Store.

**Acceptance Criteria**:
- [ ] Feature graphic created
- [ ] Screenshots (all devices)
- [ ] Store listing complete
- [ ] Privacy policy linked
- [ ] Internal testing build uploaded
- [ ] Beta testers recruited

**Priority**: P0
**Estimate**: Medium (3-5 days)
**Sprint**: 10
```

---

## Labels to Create

Create these labels in GitHub for issue management:

### Priority Labels
- `priority: P0 - critical` (red)
- `priority: P1 - high` (orange)
- `priority: P2 - medium` (yellow)
- `priority: P3 - low` (green)

### Type Labels
- `type: epic` (purple)
- `type: feature` (blue)
- `type: bug` (red)
- `type: task` (gray)
- `type: documentation` (light blue)

### Status Labels
- `status: backlog` (gray)
- `status: ready` (green)
- `status: in progress` (yellow)
- `status: in review` (orange)
- `status: blocked` (red)
- `status: done` (blue)

### Sprint Labels
- `sprint: 1`
- `sprint: 2`
- ... through `sprint: 10`

### Component Labels
- `component: database`
- `component: ui`
- `component: navigation`
- `component: statistics`
- `component: pricing`
- `component: settings`

---

## Milestones

Create these milestones to track sprint progress:

1. **Sprint 1: Foundation** - Week 1 (Database & State)
2. **Sprint 2: Design System** - Week 2 (UI Components & Navigation)
3. **Sprint 3: Logging** - Week 3 (Cigarette Logging)
4. **Sprint 4: Dashboard** - Week 4 (Home Screen & Basic Stats)
5. **Sprint 5: Statistics** - Week 5 (Advanced Statistics)
6. **Sprint 6: Pricing** - Week 6 (Cost Tracking)
7. **Sprint 7: Settings** - Week 7 (Preferences & Data)
8. **Sprint 8: Polish** - Week 8 (Onboarding & UX)
9. **Sprint 9: Testing** - Week 9 (QA & Bug Fixes)
10. **Sprint 10: Release** - Week 10 (Beta Launch)

---

## Project Board

Set up a GitHub Project board with columns:

- **Backlog** - Not yet ready
- **Ready** - Ready to work on
- **In Progress** - Currently being worked on
- **In Review** - Pull request open
- **Done** - Completed and merged

---

## How to Use This Guide

1. **Create Labels**: Set up all labels in GitHub first
2. **Create Milestones**: Create sprint milestones
3. **Create Epic Issues**: Start with the 9 epic issues
4. **Create Story Issues**: Add user story issues under each epic
5. **Link Issues**: Reference epic issues in story issues
6. **Set Up Project Board**: Move issues through the workflow
7. **Track Progress**: Update issues as work progresses

---

**Note**: This structure provides comprehensive tracking while remaining flexible for adjustments as development progresses.
