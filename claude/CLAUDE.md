# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VibeKeeper is an iOS app for capturing and managing gift ideas and important dates for friends and family. It uses AI to extract relevant information from voice, text, or image inputs. The project is in early development stages with Swift and SwiftUI.

## Environment Setup

### Development Requirements

- Xcode 15+ (for Swift and SwiftUI development)
- iOS 16+ target
- SwiftUI knowledge

## Development Commands

### Build and Run

```bash
# Open the project in Xcode
open VibeKeeper.xcodeproj

# From Xcode, use the Run button to build and launch the simulator
# Alternatively, use Command+R
```

### Testing

```bash
# When tests are implemented, run from Xcode using:
# - Command+U for all tests
# - Or select specific test target/class/method and use the Run button
```

## Project Architecture

VibeKeeper follows a model-view-viewmodel (MVVM) architecture typical for SwiftUI apps.

### Key Components

1. **Data Models**
   - User
   - Contact/Recipient
   - GiftIdea
   - Reminder
   - Occasion
   - MediaAsset

2. **Views**
   - SwiftUI interface with multi-modal capture capabilities
   - Gift idea management screens
   - Contact/recipient management
   - Search functionality
   - Reminder system

3. **Backend Integration**
   - Future FastAPI backend planned
   - AI entity extraction for gift ideas
   - Multi-modal processing (text, voice, image)

## Important Implementation Notes

- The app will initially use local storage with Swift Data and later integrate with iCloud
- Phase 1 is iOS-only, with plans for backend, Android and web versions later
- AI functionality will extract: recipient, gift idea, occasion/date, tags, budget, and notes
- The app will include a reminder system for upcoming occasions

## File Organization

- `VibeKeeper/` - Main app directory
  - `ContentView.swift` - Main view
  - `VibeKeeperApp.swift` - App entry point
  - `Assets.xcassets/` - App assets

## Claude-Optimized Resources

The repository contains a dedicated `/claude` directory with structured resources to enhance Claude's assistance capabilities. When searching for information or context, check these locations:

### Core Reference Materials

- `/claude/metadata/` - Component dependencies, file classifications, and error patterns
- `/claude/code_index/` - Semantic code relationships and structure
- `/claude/patterns/` - Implementation patterns with examples
- `/claude/models/` - Detailed component documentation with schemas
- `/claude/cheatsheets/` - Quick reference guides
- `/claude/qa/` - Solutions to common problems
- `/claude/ios/` - iOS-specific resources and best practices
- `/claude/delta/` - Version change summaries

### How to Use These Resources

1. **When starting to understand a component:**
   - First check `/claude/models/` for comprehensive documentation
   - Then look at `/claude/patterns/` for implementation examples

2. **When working with specific features:**
   - For AI integration, see `/claude/patterns/ai_integration_patterns.md` and `/claude/cheatsheets/ai_integration.md`
   - For SwiftUI, see `/claude/patterns/swiftui_patterns.md` and `/claude/cheatsheets/swiftui_basics.md`

3. **When implementing iOS-specific functionality:**
   - Check `/claude/ios/ios_development_resources.md` for latest iOS development practices

4. **When facing issues:**
   - See `/claude/qa/common_issues.md` for solutions to common problems
   - Check `/claude/metadata/error_patterns.json` for error patterns and fixes

5. **When understanding relationships:**
   - Use `/claude/metadata/component_dependencies.json` for component relationships
   - Use `/claude/code_index/semantic_structure.json` for data structures

### Using Memory Anchors

The documentation contains memory anchors for quick reference to important concepts:

- Core model anchors are prefixed with `MA-0x` (e.g., `GiftIdea_Core_Properties MA-01`)
- Service anchors are prefixed with `MA-1xx` (e.g., `CaptureService_MultiModal_Processing MA-101`)
- iOS development anchors are prefixed with `MA-3xx` (e.g., `iOS_Dev_Resources_20240516 MA-301`)
- Delta/version anchors are prefixed with `MA-Dxxx` (e.g., `Initial_Repository_Setup_20240516 MA-D001`)

Reference these anchors to quickly access specific information across multiple assists.

## Future Development Plans

According to the spec documentation, development will proceed in phases:

1. iOS MVP (3 months)
2. Backend & Android (3 months)
3. Web & Advanced Features (4 months)

For full implementation details, refer to:
- `/docs/VibeKeeper.md` and `/docs/VibeKeeper-spec.md` for overall specifications
- `/claude/models/` for detailed component designs
- `/claude/patterns/` for implementation patterns
- `/claude/ios/ios_development_resources.md` for iOS best practices