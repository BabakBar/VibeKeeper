# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VibeKeeper is an AI-powered occasion tracking application. Users input natural language like "Bahar birthday is on 04/04" and AI extracts structured data (person, occasion, date).

## Current Focus: Mini MVP

Building a simple validation prototype using:

- **Framework**: FastHTML (Python)
- **Database**: SQLite 
- **AI**: LiteLLM
- **Server**: Uvicorn

## Development Commands

**IMPORTANT**: Always use `uv` for package management and environment management in this project. Use `uv add` for proper dependency management with pyproject.toml and uv.lock.

```bash
# Setup (Proper UV Project Management)
cd mini-mvp
uv init --no-readme --no-pin-python  # Initialize if not done
uv add python-fasthtml litellm uvicorn sqlalchemy aiosqlite

# Alternative: Manual venv setup (less preferred)
uv venv venv
source venv/bin/activate
uv pip install python-fasthtml litellm uvicorn sqlalchemy aiosqlite

# Run
uv run uvicorn main:app --reload --port 8001
# Or with activated venv:
uvicorn main:app --reload --port 8001
```

## Expected Project Structure

```text
/mini-mvp/
├── main.py             # FastHTML app entry point
├── components/         # UI components
├── models.py           # Database models
├── ai_extractor.py     # LiteLLM integration
└── occasions.db        # SQLite database
```

## Environment Variables

```bash
LITELLM_API_KEY=your-api-key
LITELLM_MODEL=gpt-4o-mini
```

## Core Features

- Text input form for occasion capture
- AI extraction of person/occasion/date from natural language
- Display occasions in card format
- Basic search/filter functionality

## AI Integration

Uses LiteLLM to extract structured data from natural language input.

## Development Workflow

1. **Explore**: Read files, use subagents to investigate
2. **Plan**: Create implementation plan & checklists (use ultrathink for complex features)
3. **Code**: Test-driven development, verify solutions as you implement
4. **Commit**: Write tests, commit; code, iterate, commit