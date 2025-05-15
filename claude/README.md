# Claude-Optimized Repository Structure

This directory contains resources specifically designed to enhance Claude's ability to assist with VibeKeeper development. The structure and content are organized to provide Claude with comprehensive project context, patterns, and technical insights.

## Directory Structure

### `/claude/metadata/`
Normalized information about the codebase structure, dependencies, and classifications.
- `file_classification.json` - Type and purpose of each file
- `component_dependencies.json` - Component relationships and dependencies
- `error_patterns.json` - Common errors and their solutions

### `/claude/code_index/`
Semantic analysis of code structure and relationships.
- `semantic_structure.json` - Entity relationships and data structure
- `intent_classification.json` - Purpose and intent behind code components

### `/claude/patterns/`
Implementation patterns and best practices for VibeKeeper.
- `swiftui_patterns.md` - SwiftUI architecture patterns with examples
- `ai_integration_patterns.md` - Patterns for AI entity extraction and processing

### `/claude/cheatsheets/`
Quick reference guides for common operations.
- `swiftui_basics.md` - Common SwiftUI components and patterns
- `ai_integration.md` - AI service integration reference

### `/claude/qa/`
Database of common issues and their solutions.
- `common_issues.md` - Frequently encountered problems and solutions

### `/claude/models/`
Model-friendly documentation with explicit sections.
- `gift_idea_model.md` - GiftIdea component documentation
- `capture_service.md` - Capture service documentation

### `/claude/delta/`
Semantic change logs between versions.
- `v0.1_initial_structure.md` - Changes in initial repository setup

### `/claude/ios/`
iOS-specific development resources and guides.
- `ios_development_resources.md` - Latest iOS development practices and resources

## Usage

This directory is designed for Claude's consumption and should not be modified manually unless adding new resources or updating existing ones. The structure helps Claude:

1. Understand the codebase structure and relationships
2. Follow consistent implementation patterns
3. Navigate common issues and solutions
4. Reference best practices for iOS and AI development
5. Track changes between versions
6. Access detailed component documentation

## Memory Anchors

Key memory anchors have been placed throughout the documentation to help Claude quickly reference important concepts:

- `GiftIdea_Core_Properties` (MA-01)
- `CaptureService_MultiModal_Processing` (MA-101)
- `iOS_Dev_Resources_20240516` (MA-301)
- `Initial_Repository_Setup_20240516` (MA-D001)

## Maintenance

When making significant changes to the VibeKeeper codebase, consider updating the relevant Claude resources:

1. Add new components to `component_dependencies.json`
2. Document new patterns in the appropriate files
3. Add solutions to newly encountered problems in `common_issues.md`
4. Create delta summaries for major changes
5. Update model documentation when components change significantly

This ensures Claude maintains an accurate understanding of the project as it evolves.