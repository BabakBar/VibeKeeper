# VibeKeeper Development Guide

This document provides guidelines for continued development of the VibeKeeper iOS app, ensuring consistency and quality throughout the implementation process.

## Development Workflow

Follow this workflow for each new feature:

1. **Plan**: Clearly define the feature requirements and design
2. **Implement**: Write code for the feature in small, testable increments
3. **Test**: Verify the feature works as expected
4. **Commit**: Save your changes with descriptive commit messages
5. **Document**: Update any relevant documentation
6. **Review**: Conduct a self-review of the implementation

## Coding Standards

### Swift Style Guide

- Follow the [Swift API Design Guidelines](https://swift.org/documentation/api-design-guidelines/)
- Use clear, descriptive names for variables, functions, and types
- Maintain consistent indentation (4 spaces)
- Group related properties and methods together
- Use access control modifiers (`private`, `internal`, etc.) appropriately
- Keep functions focused on a single task
- Add comments for complex logic

### Architecture

VibeKeeper follows the MVVM (Model-View-ViewModel) architecture:

- **Models**: SwiftData model objects in `Core/Models/`
- **Views**: SwiftUI views in `Features/{Feature}/Views/`
- **ViewModels**: Presentation logic in `Features/{Feature}/ViewModels/`
- **Services**: Reusable business logic in `Core/Services/`

### UI/UX Guidelines

- Use the established theme colors from `Color+Theme.swift`
- Apply consistent styling using the extension methods in `View+Extensions.swift`
- Maintain accessibility support with appropriate text sizes and contrast
- Follow iOS Human Interface Guidelines for familiar interactions

## SwiftData Tips

- Use `@Query` for automatic updates in views when displaying collections
- Remember to handle error states in all database operations
- Relationships should be clearly defined in model classes
- Use the `@Environment(\.modelContext)` property wrapper to access the model context in views

## Testing Strategy

Each feature should include:

1. **Unit Tests**: Test ViewModels and business logic
2. **UI Tests**: Test user flows for critical features
3. **Integration Tests**: Test data flow between components

Use the in-memory SwiftData configuration for tests to prevent modifying real data.

## Feature Implementation Steps

### Adding a New View

1. Create the view file in the appropriate feature directory
2. Connect to its ViewModel via `@EnvironmentObject` or constructor injection
3. Implement the UI with consistent styling
4. Add navigation to the view from other relevant parts of the app
5. Test the view with both sample and real data

### Adding a New ViewModel

1. Create the ViewModel class with `@Published` properties
2. Implement necessary business logic methods
3. Use dependency injection for services and model context
4. Add error handling and loading states
5. Test the ViewModel with unit tests

### Adding a New Model

1. Define the model class with `@Model` attribute
2. Add appropriate properties with type annotations
3. Define relationships to other models
4. Implement constructors and any necessary methods
5. Update the schema in `VibeKeeperApp.swift`
6. Test model persistence and relationships

## Commit Message Guidelines

Use descriptive commit messages that explain what changes were made and why:

```
feat: Add gift idea creation form

- Implement form UI with validation
- Connect to GiftViewModel for persistence
- Add unit tests for form validation
```

## Incremental Development Plan

For each new feature:

1. Start with a minimal viable implementation
2. Test thoroughly
3. Refine and improve
4. Document any important decisions or patterns
5. Move to the next feature

This approach ensures stable, testable progress with minimal regressions.

## Resources

- [SwiftUI Documentation](https://developer.apple.com/documentation/swiftui)
- [SwiftData Documentation](https://developer.apple.com/documentation/swiftdata)
- [Combine Framework](https://developer.apple.com/documentation/combine)
- [Sign in with Apple](https://developer.apple.com/sign-in-with-apple/)