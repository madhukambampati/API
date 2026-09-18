# QA Mentor — AI Learning Agent (POC)

A learning app for QA Engineers, SDETs, and AI-QA practitioners: an AI chat mentor
backed by Claude, plus real curated roadmaps, a practice quiz bank, everyday QA
utilities, and local progress tracking — no account required.

This is a proof of concept: a local multi-page Flask app, with all personal data
(history, bookmarks, progress, profile, theme) kept in your browser's localStorage.

## Pages

- **Home** — hero, popular topics grid, quick-ask box
- **Chat** — the AI mentor, backed by the Claude API
- **Roadmaps** — 3 real curated learning tracks (QA foundations, Manual → SDET, AI-QA specialist)
- **Practice** — a 14-question quiz bank with instant feedback and explanations
- **Tools** — test data generator, regex tester, JSON formatter, selector cheat sheet
- **Progress** — stats read from your local activity
- **Bookmarks** — chat answers you've starred
- **History** — questions you've asked, with "ask again"
- **Settings** — local profile, dark/light theme, API key status check

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

- `app.py` — Flask server with a route per page, plus `/api/chat` (sends the
  conversation to Claude with a system prompt tuned as a QA/SDET/AI-QA mentor) and
  `/api/status` (reports whether an API key is configured, used by the Settings page).
- `templates/base.html` — shared sidebar/topbar layout every page extends.
- `static/common.js` — shared localStorage helpers (profile, theme, history,
  bookmarks, practice stats, topics viewed) and topbar behavior.
- Each page has its own template + JS file (e.g. `chat.html`/`chat.js`,
  `practice.html`/`practice.js`, ...).
- Everything except the Claude replies themselves is stored in your browser's
  localStorage — there's no database and no login.

## Configuration

Environment variables (set in `.env`):

| Variable            | Default            | Description                              |
|---------------------|---------------------|-------------------------------------------|
| `ANTHROPIC_API_KEY` | —                   | Required. Your Claude API key.            |
| `CLAUDE_MODEL`      | `claude-sonnet-5`   | Model to use.                             |
| `MAX_TOKENS`        | `1024`              | Max tokens per reply.                     |
| `PORT`              | `5000`              | Port the Flask app listens on.            |
