# VibeKeeper

VibeKeeper is an iOS app for capturing and managing gift ideas and important dates for friends and family. It uses AI to extract relevant information from voice, text, or image inputs.

## Project Overview

VibeKeeper helps users:
- Track gift ideas for contacts
- Remember important dates and occasions
- Set reminders for upcoming events
- Manage gift budgets and purchases

## Current Status

The project is in early development stages with the foundation architecture in place. See [Progress Report](docs/progress.md) for detailed status.

## Getting Started

### Prerequisites

- Xcode 15.0+
- iOS 18.0+ target
- Swift 5.9+

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/VibeKeeper.git
   ```
2. Open `VibeKeeper.xcodeproj` in Xcode
3. Build and run on a simulator or device

## Architecture

VibeKeeper uses MVVM architecture with SwiftData for persistence:

- **Models**: SwiftData model classes for persistence
- **Views**: SwiftUI views for the user interface
- **ViewModels**: Classes that manage UI state and business logic
- **Services**: Shared utilities and business logic

## Documentation

- [Technical Specification](docs/VibeKeeper-spec.md): Detailed technical specs
- [Foundation Plan](docs/foundation-plan.md): Step-by-step implementation plan
- [Progress Report](docs/progress.md): Current development status
- [Development Guide](docs/development-guide.md): Guidelines for development

## Development Workflow

We follow an incremental development approach:
1. Implement small, focused features
2. Test thoroughly
3. Commit working changes
4. Document decisions and patterns
5. Move to the next feature

See the [Development Guide](docs/development-guide.md) for more details.

## Features & Roadmap

### Foundation (Completed)
- SwiftData models and relationships
- MVVM architecture
- Basic UI theming
- Authentication with Apple

### In Progress
- Gift management views
- Contact management views
- Reminder system

### Planned
- AI-powered information extraction
- Voice and image capture
- Calendar integration
- Advanced search
- Budget tracking

## License

[Add license information here]

---

*VibeKeeper is currently in development and not yet available on the App Store.*