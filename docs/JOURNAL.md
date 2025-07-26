# VibeKeeper Project Journal

## 2025-07-27

## 2025-07-27 (continued)

### Go Module & Dependency Management Concepts
- `go.mod` is like Python's `pyproject.toml` or `requirements.txt`: it declares your module name, Go version, and direct dependencies.
- `go.sum` is like `uv.lock` or `poetry.lock`: it records the exact versions and checksums of all (direct and transitive) dependencies, ensuring reproducible and secure builds.
- Both files should always be committed to version control.

### Key Commands Used
```sh
# Initialize a new Go module
go mod init github.com/BabakBar/VibeKeeper

# Upgrade Go using Homebrew
brew install go

# Set PATH to use Homebrew Go
export PATH="/opt/homebrew/bin:$PATH"

# Remove old Go installation
sudo rm -rf /usr/local/go

# Check Go version and binary location
go version
which go

# Update go.mod to use the latest Go version
go mod edit -go=1.24

# Add Gin as a dependency
go get github.com/gin-gonic/gin@latest
```

### Learning Points
- Go modules and sum files are essential for reproducible, secure builds.
- Always commit both `go.mod` and `go.sum`.
- Managing your PATH is crucial when multiple Go versions are installed.

## Project Directory Structure & Architecture (2025-07-27)

### High-Level Go App Architecture
- Modern Go apps are organized for clarity, modularity, and testability, often following clean or hexagonal architecture principles.
- The goal is to separate concerns: API/transport, business logic, data access, and configuration.

### Folder Intentions
- `cmd/vibekeeper/` — Main application entry point (the Gin server lives here)
- `internal/handlers/` — HTTP handlers/controllers (define API endpoints, parse requests, return responses)
- `internal/services/` — Business logic and use cases (core app logic, orchestrates between handlers and repositories)
- `internal/ai/` — Integrations with AI/LLM providers (OpenAI, Gemini, Claude, etc.)
- `internal/models/` — Domain models/entities (e.g., Occasion, Subscription)
- `internal/repository/` — Data access layer (database operations, GORM code)
- `internal/config/` — Configuration loading (env vars, config files)
- `web/` — Static assets (HTML, CSS, JS for the front-end)
- `docs/` — Documentation, design notes, and your project journal

### Why This Structure?
- Keeps code organized and maintainable as the project grows
- Makes it easy to test and swap out components (e.g., change database or AI provider)
- Follows Go community best practices and clean architecture principles

### Reference
- [Go Project Layout](https://github.com/golang-standards/project-layout)
- [Clean Architecture in Go](https://medium.com/@rayato159/how-to-implement-clean-architecture-in-golang-en-f50d66378ebf)
