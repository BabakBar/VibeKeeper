# VibeKeeper

VibeKeeper is an AI-powered, open-source web app built entirely in Go. Its mission is to help users track occasions, manage subscriptions, and organize their lives with the power of AI—using text, forms, or even voice input.

## Features

- **AI-Powered Data Extraction:** Uses LLMs to understand and extract relevant data from user input, whether typed or spoken.
- **Occasion and Subscription Tracking:** Add, track, analyze and get reminders for important dates, renewals, and events.
- **Flexible Input:** Supports structured forms, text input, and voice commands.
- **Fully Written in Go:** Backend, AI integration, and web server are all implemented in Golang for performance and simplicity.
- **Open Source:** MIT licensed and welcoming contributions.

## Getting Started

### Prerequisites

- Go 1.24+
- (For AI features) Access to an LLM provider API key (e.g. OpenAI, Local LLM with Ollama, etc.)
- (Optional) Docker

## Project Structure

```
/cmd           # Main application entrypoint
/internal      # App core logic (AI, occasion tracking, etc.)
/web           # Static assets & frontend
/config        # Config files and environment
```

## Roadmap

- [ ] Basic web UI for adding/tracking occasions and subscriptions
- [ ] LLM-powered natural language and voice input
- [ ] Notification and reminder system
- [ ] User authentication (optional)
- [ ] Export/import data
- [ ] Docker support

---

> **VibeKeeper**  
> "Keep your vibes on track—with a little help from AI."