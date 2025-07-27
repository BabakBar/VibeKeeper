# VibeKeeper Project Roadmap (Go)

**Project Overview:** VibeKeeper is a Go-based web app for AI-powered life organization. It will let users add events and subscription-renewal reminders via text, forms or voice. Internally it will extract dates and details using LLM APIs (OpenAI, Gemini, Claude). We’ll use a modern Go stack (Gin, modules, Docker, etc.) and clean architecture (domain, repository, service layers).

**Technology Stack:** Use the latest Go (1.24.x as of 2025). For HTTP, use [Gin](https://gin-gonic.com) (high-performance Go web framework requiring Go 1.16+). For persistence, use GORM (gorm.io/gorm) with a relational database (SQLite or Postgres via the GORM driver). For configuration and CLI flags, use Viper and Cobra (spf13/cobra). For AI, use these Go SDKs:

* **OpenAI (GPT & Whisper):** use the [go-openai](https://github.com/sashabaranov/go-openai) wrapper. It supports ChatGPT/GPT-4 and Whisper APIs (it requires Go 1.18+). E.g. you can transcribe audio via `CreateTranscription` (Whisper).
* **Google Gemini (VertexAI):** use Google’s unified GenAI Go SDK (`google.golang.org/genai`). This library lets you easily switch between the Gemini Developer API and Vertex AI. For example:

  ```go
  client, err := genai.NewClient(ctx, &genai.ClientConfig{Backend: genai.BackendGeminiAPI})
  ```

  You then call `client.Models.GenerateContent` or `client.Chats.Create`, etc..
* **Anthropic Claude:** use [go-anthropic](https://github.com/liushuangls/go-anthropic) (unofficial). It requires Go 1.21+. Example usage:

  ```go
  client := anthropic.NewClient("YOUR_API_KEY")
  resp, err := client.CreateMessages(ctx, anthropic.MessagesRequest{
      Model: anthropic.ModelClaude3Haiku20240307,
      Messages: []anthropic.Message{anthropic.NewUserTextMessage("Event next Thursday")},
  })
  fmt.Println(resp.Content[0].GetText())
  ```

  This parses user text into structured info.

For logging use a structured logger (e.g. Uber/zap) and for input validation use a library like `go-playground/validator`.

## Project Structure

Follow a **Go project layout** with separate layers. For example:

```
vibekeeper/
├─ cmd/
│   ├─ vibekeeper/        # main HTTP server (Gin)
│   │    └─ main.go
│   └─ vibekeeper-cli/    # optional CLI entry point (Cobra)
│        └─ main.go
├─ internal/              # application code (private)
│   ├─ handlers/          # HTTP handlers (Gin controllers)
│   ├─ services/          # business logic / use-cases
│   ├─ ai/                # interfaces to LLM providers
│   ├─ models/            # domain models (e.g. Occasion, Subscription) 
│   ├─ repository/        # data access (GORM-based DB code)
│   └─ config/            # configuration loading (env, files)
├─ web/                   # static assets (HTML/CSS/JS for front-end)
├─ docs/                  # design docs, architecture notes
├─ Dockerfile             # multi-stage Docker build
├─ docker-compose.yml     # (optional, for local containers)
├─ go.mod, go.sum
└─ Makefile or scripts    # handy commands (migrate, test, etc.)
```

This roughly follows clean/hexagonal patterns: the **domain/models** hold core entities; **repository** has DB persistence; **services/usecases** contain business logic; **handlers** define Gin routes/endpoints. Additional layers like `delivery` or `infrastructure` can be added as needed (see example clean-architecture layout). For instance, a `delivery/http` or `handlers` directory handles HTTP transport, while `infrastructure` can hold e.g. database connection code. The `config` folder and environment variables (managed via Viper or built-in flags) handle all configuration.

> *“`domain` contains core data structures; `repository` contains data-access code; `usecase` (services) contains business logic*”. This separation makes the code maintainable and testable.

## Development Roadmap

We can break development into the following steps (not time-bound, just phases):


1. **Initialize Project:** ✅ Done — Project initialized, Go modules set up, Go upgraded, Gin installed, and `/ping` endpoint working.

2. **Define Data Models & DB:** ⏳ Next — Design the core models (e.g. `Occasion` with fields like ID, Title, Date, Type; `Subscription` with Title, RenewalDate, etc.). Use GORM to map these to a database. In code, `AutoMigrate(&Occasion{}, &Subscription{})`. Set up a database connection (SQLite or Postgres). Write repository functions (Create, List, Update, Delete).

3. **Implement API Endpoints:** Build RESTful endpoints in Gin (e.g. `POST /api/occasions`, `GET /api/occasions`, etc.) tied to your handlers. Use JSON binding to parse requests, call service-layer logic, and return JSON responses. Keep handlers thin (just parse input and call service functions).

4. **Basic Front-End:** Since no JS framework is required, create simple HTML/CSS pages under `web/`. For example, an “Add Event” form and a list view. Use vanilla JS or fetch API to call your Gin endpoints. (You can also serve these static files via Gin’s `router.Static()` or similar). Optionally use a CSS framework (e.g. Bootstrap) for quick styling.

5. **AI-Powered Parsing:** Implement an AI “parser” service. This takes user input (text or voice transcript) and extracts structured data (date, event name, category). Define a Go interface (e.g. `type AIClient interface { ParseEvent(ctx, text) (EventInfo, error) }`) to allow plugging different providers.

   * **OpenAI:** Call the ChatCompletion or function-calling API through go-openai, passing a prompt like “Extract event name and date from: \[user text]”.
   * **Gemini:** Similarly, use genai (`client.Models.GenerateContent`) with an appropriate prompt or model (e.g. “gemini-2.5-flash”).
   * **Claude:** Use the go-anthropic client to send `MessagesRequest`.
     Always test that each client returns the correct fields. Implement a configuration switch (e.g. an env var) to choose the provider at runtime.

6. **Voice Input:** In the UI, add a “Record” button that uses the browser’s Web Speech API or MediaRecorder to get microphone input and send it to the server. On the server side, you could accept an audio file and send it to Whisper for transcription. For example, with go-openai:

   ```go
   req := openai.AudioRequest{Model: openai.Whisper1, FilePath: "upload.wav"}
   resp, _ := client.CreateTranscription(ctx, req)
   ```

   This will return the recognized text. Then feed that text into the LLM parsing step. (Using browser-side speech-to-text is simpler and offloads this work, but either way, your Go backend will receive a text string to parse.)

7. **Scheduling & Reminders:** Implement a way to notify users before events. This could be a background goroutine or a scheduled cron job (e.g. using [`github.com/robfig/cron`](https://github.com/robfig/cron)). Periodically check the DB for upcoming dates (e.g. tomorrow’s birthdays) and send reminders (e.g. via email or push – you could integrate an email service or just log them).

8. **CLI Tool (Optional):** Use [Cobra](https://github.com/spf13/cobra) to build a command-line interface in `cmd/vibekeeper-cli`. This can offer commands like `vibekeeper-cli add-event --name "Meeting" --date "2025-08-01"` or `list-events`. A CLI is not strictly required, but it provides a useful exercise in Go tooling and gives an alternate interface for power users. Cobra is widely used (Kubernetes, Hugo, GitHub CLI use it) and supports subcommands, flags, and auto-completion. You might integrate Viper for 12-factor configuration (env vars) if needed.

9. **Containerize with Docker:** Write a **multi-stage Dockerfile**. In the first stage use an official Go builder image (e.g. `golang:1.24-alpine`) to compile the binary with `CGO_ENABLED=0 GOOS=linux go build -o /app/vibekeeper`. Then use a minimal scratch or Alpine image for runtime. The Docker build instructions in the Docker docs show this pattern. For example:

   ```Dockerfile
   FROM golang:1.24-alpine AS builder
   WORKDIR /app
   COPY go.mod ./
   COPY go.sum ./
   RUN go mod download
   COPY . .
   RUN go build -o vibekeeper ./cmd/vibekeeper
   FROM alpine:latest
   WORKDIR /app
   COPY --from=builder /app/vibekeeper .
   ENTRYPOINT ["/app/vibekeeper"]
   ```

   Then test the container locally (`docker build`, `docker run`).

10. **Deploy via Coolify:** Coolify (a self-hosted Heroku-like platform) can connect to your repo and build the Docker image. In Coolify, create a new “Self-hosted app,” point it at your repo, and let it use the Dockerfile. Set environment variables for your API keys (OpenAI, Google, Anthropic) in Coolify’s UI. Coolify will handle running the container on your VPS and setting up SSL. (No vendor lock-in – you control the VPS and data.)

11. **Testing and QA:** Write unit tests for your business logic (e.g. date calculations, LLM response parsing). Use Go’s testing framework or a library like `testify`. Optionally add integration tests that spin up a test server and DB.

12. **Monitoring & Best Practices:** Use structured logs (timestamps, severity). Handle errors carefully and sanitize any user input sent to AI. Respect rate limits of the APIs (cache results if needed).

Throughout development, refer to Go best practices (formatting with `gofmt`, linting with `staticcheck`). Keep functions small and decoupled (for example, one layer shouldn’t directly depend on two different LLM SDKs; instead use interfaces).

## Libraries & Versions Summary

* **Go version:** Use the latest Go (≥1.24). All major AI libraries require ≥1.18 or 1.21, so 1.24 is safe.
* **Web framework:** Gin (latest, \~v1.10).
* **ORM:** GORM v1.24+ (`gorm.io/gorm`) with `gorm.io/driver/sqlite` or `postgres`.
* **AI SDKs:** `github.com/sashabaranov/go-openai` (v0.14+), `google.golang.org/genai`, `github.com/liushuangls/go-anthropic/v2`.
* **CLI/Config:** `github.com/spf13/cobra` and `github.com/spf13/viper`.
* **Others:** `github.com/google/uuid` for IDs, `time` (std lib) for dates, `github.com/robfig/cron` (scheduling), and any logging library (e.g. `go.uber.org/zap`).

## Why Include a CLI?

While the web UI is primary, a CLI tool can automate tasks and is great for learning Go. Many Go projects expose CLI subcommands (e.g. Kubernetes and GitHub CLI use Cobra). In VibeKeeper’s case, the CLI could let you quickly script adding or querying events from the terminal. It also reinforces writing idiomatic Go code (flags, commands, config). This is optional but recommended for learning and flexibility.

## Final Notes

No front-end framework is needed – start with simple HTML/CSS/JS pages. Rely on AI **APIs** (OpenAI, Google Gemini, Anthropic) to do the heavy lifting. Use Go modules (`go mod`) to manage dependencies and keep your code well-factored. Containerize early and deploy to your VPS with Coolify. Avoid worrying about timelines; iterate feature by feature. By the end, you will have a modern Go service with AI integrations, a clean codebase, and cloud deployment experience.

**Sources:** Guidelines and best practices from the Go community; AI SDK documentation.
