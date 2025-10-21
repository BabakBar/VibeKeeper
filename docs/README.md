# VibeKeeper Documentation

Welcome to the VibeKeeper technical documentation. This directory contains all specifications, architecture documents, and guides for developing the VibeKeeper mobile application.

---

## 📚 Documentation Index

### Core Specifications

1. **[Technical Specification](./TECHNICAL_SPECIFICATION.md)** ⭐️ START HERE
   - Complete technical overview
   - Technology stack and dependencies
   - Feature specifications
   - Security and performance requirements
   - 60+ pages of comprehensive documentation

2. **[Architecture](./ARCHITECTURE.md)**
   - System architecture and design patterns
   - Code organization and structure
   - State management strategy
   - Data flow and components
   - Key architectural decisions (ADRs)

3. **[Data Model](./DATA_MODEL.md)**
   - Database schema and tables
   - Entity relationships
   - Query patterns and optimization
   - Migration strategy
   - Sample data and seed scripts

4. **[UI/UX Design](./UI_UX_DESIGN.md)**
   - Design system and principles
   - Screen specifications and layouts
   - Component library
   - Animations and interactions
   - Accessibility guidelines

5. **[Implementation Roadmap](./IMPLEMENTATION_ROADMAP.md)**
   - 10-week sprint plan
   - Phase breakdown with timelines
   - Resource planning and budgets
   - Risk management
   - Definition of Done criteria

6. **[GitHub Issues Guide](./GITHUB_ISSUES_GUIDE.md)**
   - Issue templates and structure
   - Epic and user story breakdown
   - Labels and milestones
   - Project board setup
   - How to track development progress

---

## 🚀 Quick Start for Developers

### 1. Read These First
1. [Technical Specification](./TECHNICAL_SPECIFICATION.md) - Get the big picture
2. [Architecture](./ARCHITECTURE.md) - Understand the code structure
3. [Implementation Roadmap](./IMPLEMENTATION_ROADMAP.md) - See what to build when

### 2. Understand the Data Layer
- [Data Model](./DATA_MODEL.md) - Database schema and queries
- Review Drizzle ORM documentation

### 3. Learn the Design System
- [UI/UX Design](./UI_UX_DESIGN.md) - Colors, typography, components
- Review NativeWind documentation

### 4. Set Up Your Development Environment
See main [README.md](../README.md) for installation instructions

### 5. Start Contributing
- Check [GitHub Issues Guide](./GITHUB_ISSUES_GUIDE.md) for how to pick up tasks
- Follow the sprint plan in [Implementation Roadmap](./IMPLEMENTATION_ROADMAP.md)

---

## 📋 Project Overview

### What is VibeKeeper?

VibeKeeper is a mobile habit-tracking application designed to help users monitor their cigarette consumption. The app provides:

- **One-tap logging** of cigarettes
- **Detailed statistics** (daily, weekly, monthly)
- **Cost tracking** based on user-defined pricing
- **Complete offline functionality** with optional cloud sync
- **Privacy-first** approach (all data stored locally)

### Tech Stack Summary

| Category | Technology |
|----------|-----------|
| **Framework** | Expo SDK 54, React Native 0.81.4 |
| **Language** | TypeScript 5+ |
| **Navigation** | Expo Router v3 (file-based) |
| **State** | Zustand + TanStack Query |
| **Database** | Expo SQLite + Drizzle ORM |
| **Styling** | NativeWind v4 (Tailwind CSS) |
| **Charts** | Victory Native |
| **Testing** | Jest + RTL + Detox |
| **Deployment** | EAS Build & Submit |

### Target Platforms

- **iOS**: 14.0+ (iPhone 6s and newer)
- **Android**: 7.0+ (API Level 24+)

### Development Timeline

- **MVP**: 8-10 weeks
- **Beta Release**: Week 10
- **Public Launch**: TBD (after beta feedback)

---

## 🎯 Key Features (MVP)

### Phase 1: Core Features
✅ Cigarette logging (quick and detailed)
✅ Daily statistics with charts
✅ Weekly and monthly analytics
✅ Cost calculation and tracking
✅ Settings and preferences
✅ Data export/import
✅ Offline-first architecture

### Phase 2: Enhancements (Post-MVP)
🔮 Notifications and reminders
🔮 Goals and challenges
🔮 Achievement system
🔮 Cloud backup and sync
🔮 Widget support
🔮 Apple Watch companion app

### Phase 3: Advanced (Future)
🔮 AI-powered insights
🔮 Pattern recognition
🔮 Social features
🔮 Multi-habit tracking

---

## 📁 Documentation Structure

```
docs/
├── README.md                          # This file
├── TECHNICAL_SPECIFICATION.md         # Main technical spec (60+ pages)
├── ARCHITECTURE.md                    # Architecture and design patterns
├── DATA_MODEL.md                      # Database schema and queries
├── UI_UX_DESIGN.md                    # Design system and UI specs
├── IMPLEMENTATION_ROADMAP.md          # Sprint plan and timeline
└── GITHUB_ISSUES_GUIDE.md             # Issue tracking guide
```

---

## 🏗️ Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────┐
│         Presentation Layer                   │
│    (React Components, Expo Router)          │
└───────────────────┬─────────────────────────┘
                    ↓
┌───────────────────┴─────────────────────────┐
│        Application Layer                     │
│    (Business Logic, Services, Hooks)        │
└───────────────────┬─────────────────────────┘
                    ↓
┌───────────────────┴─────────────────────────┐
│          Data Layer                          │
│    (Drizzle ORM, SQLite, Stores)            │
└───────────────────┬─────────────────────────┘
                    ↓
┌───────────────────┴─────────────────────────┐
│       Infrastructure Layer                   │
│    (Database, Storage, Native APIs)         │
└─────────────────────────────────────────────┘
```

### Code Organization

```
src/
├── app/              # Expo Router pages (file-based routing)
├── features/         # Feature modules (cigarettes, statistics, etc.)
├── shared/           # Shared components, hooks, utils
├── db/               # Database layer (Drizzle ORM)
└── theme/            # Design system (colors, typography)
```

For detailed architecture, see [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 🗄️ Database Schema

### Core Tables

1. **cigarette_logs** - Individual cigarette entries
   - id, timestamp, notes, created_at, updated_at

2. **price_configs** - Pricing configuration
   - id, price_per_pack, cigarettes_per_pack, currency, effective_from

3. **user_settings** - App preferences
   - id, theme, currency, notifications_enabled, daily_goal

For complete schema and queries, see [DATA_MODEL.md](./DATA_MODEL.md)

---

## 🎨 Design System

### Color Palette

- **Primary**: Red (`#ef4444`) - Brand/action color
- **Secondary**: Teal (`#14b8a6`) - Success/progress
- **Neutral**: Gray scale for UI elements

### Typography

- **Font**: System (SF Pro on iOS, Roboto on Android)
- **Scale**: 12px (xs) to 72px (7xl)
- **Weights**: Regular, Medium, Semibold, Bold

### Components

- Buttons (4 variants, 3 sizes)
- Cards (3 variants)
- Inputs (multiple types)
- Charts (Line, Bar, Pie)
- FAB (Floating Action Button)

For complete design specs, see [UI_UX_DESIGN.md](./UI_UX_DESIGN.md)

---

## 📅 Development Sprints

| Sprint | Week | Focus | Key Deliverables |
|--------|------|-------|------------------|
| 1 | 1 | Foundation | Database, State Management |
| 2 | 2 | UI | Design System, Components, Navigation |
| 3 | 3 | Logging | Cigarette logging, Edit/Delete |
| 4 | 4 | Dashboard | Home screen, Daily stats |
| 5 | 5 | Statistics | Weekly/Monthly analytics |
| 6 | 6 | Pricing | Cost calculation |
| 7 | 7 | Settings | Preferences, Data management |
| 8 | 8 | Polish | Onboarding, Animations |
| 9 | 9 | Testing | QA, Bug fixes |
| 10 | 10 | Release | Beta builds, Store submission |

For detailed sprint breakdown, see [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md)

---

## 🧪 Testing Strategy

### Test Coverage Goals

- **Unit Tests**: >80% coverage
- **Integration Tests**: Critical flows
- **E2E Tests**: Main user journeys
- **Manual Testing**: UI/UX validation

### Testing Stack

- **Jest**: Unit testing
- **React Native Testing Library**: Component testing
- **Detox**: E2E testing
- **Manual**: Cross-device validation

---

## 🔒 Security & Privacy

### Privacy-First Approach

- ✅ All data stored locally by default
- ✅ No third-party tracking
- ✅ No advertisements
- ✅ Optional cloud backup (end-to-end encrypted)
- ✅ User owns their data

### Security Measures

- Database encryption (SQLCipher)
- Secure storage for sensitive data
- HTTPS for all network communication (future)
- No sensitive data logging

---

## 🚢 Deployment

### Build System

- **EAS Build**: Cloud builds for iOS and Android
- **OTA Updates**: Instant updates for JS changes
- **Build Profiles**: Development, Preview, Production

### Distribution

- **iOS**: TestFlight → App Store
- **Android**: Internal Testing → Beta → Production

For deployment details, see [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md) Section 12

---

## 📊 Success Metrics

### Technical Metrics

- App launch time: <2s
- Crash-free rate: >99.5%
- Test coverage: >80%
- Performance: 60fps

### User Metrics

- Day 1 retention: >60%
- Day 7 retention: >40%
- Day 30 retention: >25%
- User rating: >4.5 stars

---

## 🤝 Contributing

### Getting Started

1. Read the [Technical Specification](./TECHNICAL_SPECIFICATION.md)
2. Review the [Architecture](./ARCHITECTURE.md)
3. Set up your development environment (see main README)
4. Check the [GitHub Issues Guide](./GITHUB_ISSUES_GUIDE.md) for available tasks
5. Follow the coding standards and conventions

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Follow project configuration
- **Prettier**: Auto-format on save
- **Testing**: Write tests for all new features
- **Documentation**: Update docs for significant changes

### Pull Request Process

1. Create a feature branch from `main`
2. Write code and tests
3. Ensure all tests pass
4. Update documentation if needed
5. Submit PR with clear description
6. Address review feedback
7. Merge after approval

---

## 📞 Support & Resources

### Documentation

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [NativeWind Documentation](https://www.nativewind.dev/)

### Community

- GitHub Issues: Bug reports and feature requests
- Discussions: Q&A and general discussion
- Discord: Real-time chat (if available)

### License

MIT License - See [LICENSE](../LICENSE) file

---

## 📝 Changelog

### Version 1.0 (October 21, 2025)

- ✅ Initial technical specification
- ✅ Architecture documentation
- ✅ Data model specification
- ✅ UI/UX design guide
- ✅ Implementation roadmap
- ✅ GitHub issues guide
- ✅ Project initialization with Expo SDK 54

---

## 🎯 Next Steps

### For Project Managers
1. Review [Implementation Roadmap](./IMPLEMENTATION_ROADMAP.md)
2. Set up [GitHub Project board](./GITHUB_ISSUES_GUIDE.md#project-board)
3. Create sprint milestones
4. Schedule sprint planning meetings

### For Developers
1. Read [Technical Specification](./TECHNICAL_SPECIFICATION.md)
2. Study [Architecture](./ARCHITECTURE.md)
3. Set up development environment
4. Pick up first issue from Sprint 1

### For Designers
1. Review [UI/UX Design](./UI_UX_DESIGN.md)
2. Create Figma mockups (optional)
3. Design app icon and splash screen
4. Prepare marketing assets

### For QA
1. Review [Testing Strategy](./IMPLEMENTATION_ROADMAP.md#testing-strategy)
2. Set up testing environment
3. Prepare test cases
4. Plan cross-device testing

---

**Last Updated**: October 21, 2025
**Document Version**: 1.0
**Project Status**: Planning Complete, Ready for Development

---

*VibeKeeper - Track your habits, own your data*
