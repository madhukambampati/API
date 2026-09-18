# QA Mentor — AI Learning Agent (POC)

A small AI chatbot built for QA Engineers, SDETs, and AI-QA practitioners who want a
learning companion — explains testing concepts, reviews automation code, and can quiz
you on manual testing, Selenium/Playwright/Cypress, API testing, performance testing,
CI/CD for tests, and AI-QA topics.

This is a proof of concept: a local Flask web app with a simple chat UI, backed by the
Anthropic Claude API.

## Prerequisites

- Python 3.9+
- An Anthropic API key ([console.anthropic.com](https://console.anthropic.com))

## Setup

```sh
cd qa-mentor-agent
python -m venv venv
source venv/bin/activate   # on Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` and set your key:

```
ANTHROPIC_API_KEY=sk-ant-...
```

## Run

```sh
python app.py
```

Then open **http://localhost:5000** in your browser and start chatting.

## How it works

- `app.py` — Flask server; `/api/chat` sends the conversation to Claude with a system
  prompt tuned as a QA/SDET/AI-QA learning mentor, and returns the reply.
- `templates/index.html`, `static/app.js`, `static/style.css` — a minimal chat UI.
- Conversation history is kept client-side in the browser tab (no database) — refreshing
  the page starts a new conversation.

## Configuration

Environment variables (set in `.env`):

| Variable            | Default            | Description                              |
|---------------------|---------------------|-------------------------------------------|
| `ANTHROPIC_API_KEY` | —                   | Required. Your Claude API key.            |
| `CLAUDE_MODEL`      | `claude-sonnet-5`   | Model to use.                             |
| `MAX_TOKENS`        | `1024`              | Max tokens per reply.                     |
| `PORT`              | `5000`              | Port the Flask app listens on.            |
