# TechOrbit — AI Learning Platform (POC)

_Every role. Every skill. One learning universe._

TechOrbit's deepest content today is for QA Engineers, SDETs, and AI-QA
practitioners: an AI chat mentor backed by Claude, plus real curated roadmaps, a
practice quiz bank, everyday QA utilities, and local progress tracking — no
account required. The platform's ambition is broader (see `ROADMAP.md`); QA/SDET
is the first fully-built path.

This is a proof of concept: a local multi-page Flask app, with all personal data
(history, bookmarks, progress, profile, theme) kept in your browser's localStorage.

## Pages

- **Home** — hero, personalized "Recommended for you" card (once onboarded),
  daily challenge with a streak counter, popular topics grid, quick-ask box
- **Explore Careers** — the Career Explorer at `/careers`: 3 fully-built roles
  (SDET, Full-Stack Developer, DevOps Engineer) with responsibilities, skills,
  roadmap, projects, interview topics, verified certifications, transition
  paths, and more, plus honestly-labeled "Planned" placeholders for roles not
  built yet
- **Onboarding** — `/onboarding`: a 4-question flow (target role, experience,
  weekly time, goal) that personalizes the Home page; answers stored in
  localStorage, editable any time from Settings
- **Chat** — the AI mentor, backed by the Claude API, with voice input and a
  mentor-mode selector (QA/SDET, Developer, DevOps, Career Coach)
- **Roadmaps** — 8 curated learning tracks (QA Foundations, Manual → SDET, AI-QA Specialist,
  Performance Testing, Security Testing, Mobile Testing, Framework Architect, DevOps for QA)
- **Tech News** — a live release feed (Selenium, Playwright, Cypress, k6, Anthropic/OpenAI SDKs,
  LangChain, ...) fetched server-side from GitHub and cached for 24 hours
- **Tech Radar** — `/radar`: Adopt/Trial/Assess/Watch/Declining/Emerging
  classification of technologies relevant to this platform's content, clearly
  labeled as editorial judgment, not a cited industry ranking
- **Resources** — curated links to real docs/courses/communities, plus a Visual Guides section
  (4 animated diagrams built into the app + 5 hand-picked real tutorial videos)
- **Glossary** — a searchable ~85-term QA/SDET/AI-QA dictionary, plus Git/HTTP/CLI/tool-comparison references
- **Career Tools** — certification guide, resume & portfolio checklists, and 3 AI mock-interview modes
  (the older QA-specific page, at `/career` — distinct from the Career Explorer above)
- **Practice** — a 39-question quiz bank plus 10 hands-on coding challenges reviewed by the AI mentor
  (reachable from Home and Roadmaps; not in the main sidebar)
- **Tools** — test data generator, regex tester, JSON formatter, selector cheat sheet
- **Progress** — stats read from your local activity (chat, practice, coding, streak, bookmarks)
- **Bookmarks** — chat answers you've starred
- **History** — questions you've asked, with "ask again"
- **Settings** — local profile, dark/light theme, API key status check, edit your learning plan

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
| `SITE_PASSWORD`     | unset               | If set, gates the whole app behind a password login (see below). |
| `SECRET_KEY`        | random per process  | Signs the login session cookie. **Set this explicitly for any real deployment** (especially serverless) — if it changes between requests, everyone gets logged out. |

## Deploying to Vercel

This app can run on Vercel via `vercel.json` (already included), which points
Vercel's Python runtime at `app.py`.

⚠️ **Before you deploy publicly:** anyone with the URL can use the Chat, Coding
Challenges, and ATS Checker features, and every one of those calls spends your
Anthropic API quota. Set `SITE_PASSWORD` (and a stable `SECRET_KEY`) as Vercel
environment variables so the app is gated behind a login page — otherwise it's
open to the entire internet.

Steps:

1. Push this repo to GitHub (already done if you're reading this from there).
2. In the [Vercel dashboard](https://vercel.com/new), import the repo and set
   the project root to `qa-mentor-agent/`.
3. Add environment variables in the Vercel project settings:
   - `ANTHROPIC_API_KEY` — your Claude API key
   - `SITE_PASSWORD` — a password to gate the app (strongly recommended)
   - `SECRET_KEY` — any long random string (generate one with
     `python -c "import secrets; print(secrets.token_hex(32))"`)
4. Deploy. Vercel will build `app.py` as a serverless Python function and
   route all traffic to it.

Notes specific to serverless:

- The Tech News 24-hour cache lives in memory, so it resets on cold starts —
  this just means GitHub gets queried a bit more often, not a functional
  problem. The 8 repo fetches run in parallel to stay well under Vercel's
  function timeout.
- There's no database — all personal data (history, bookmarks, progress,
  profile, theme) stays in each visitor's own browser via localStorage, so
  there's nothing server-side to persist across deployments.
