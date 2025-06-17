# VibeKeeper Mini-MVP

A simple AI-powered occasion tracking application built with FastHTML.

## Features

- Natural language input for occasion tracking
- AI extraction of person, occasion type, and date
- Real-time search and filtering
- Clean, responsive UI
- SQLite database storage

## Setup

### Method 1: UV Project Management (Recommended)

1. **Install dependencies:**
   ```bash
   cd mini-mvp
   uv sync
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and add your API key
   ```

3. **Run the application:**
   ```bash
   uv run uvicorn main:app --reload --port 8001
   ```

### Method 2: Manual Virtual Environment

1. **Create and activate virtual environment:**
   ```bash
   cd mini-mvp
   source .venv/bin/activate
   ```

2. **Install dependencies (if needed):**
   ```bash
   uv pip install python-fasthtml litellm uvicorn sqlalchemy aiosqlite
   ```

3. **Run the application:**
   ```bash
   uvicorn main:app --reload --port 8001
   ```

4. **Visit http://localhost:8001**

## Usage

- Enter natural language like "Bahar birthday is on 04/04"
- The AI will extract structured data automatically
- Search through saved occasions using the search box
- All data is stored locally in SQLite

## Environment Variables

- `LITELLM_API_KEY`: Your OpenAI API key
- `LITELLM_MODEL`: AI model to use (default: gpt-4o-mini)

## Project Structure

```
mini-mvp/
├── main.py           # FastHTML application
├── models.py         # Database models
├── ai_extractor.py   # AI extraction logic
├── occasions.db      # SQLite database (created automatically)
└── components/       # UI components (for future expansion)
```