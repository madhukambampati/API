# AI Engineer Path — learning portal

A complete, free, self-contained curriculum that takes a learner from "what is AI?" to designing, evaluating, securing and shipping AI systems. No backend, no accounts, no external services — progress is stored in the learner's browser.

- **14 modules · 65 lessons · 93 quiz questions · 9 projects with rubrics · 83-term glossary**
- **Runnable code:** Python examples run in the page (Pyodide, loaded on first click), are editable, and show an expected-output box.
- **Exercises with hidden solutions**, module quizzes (every question must be answered, 70% to pass, options shuffled each attempt), progress tracking with backup/restore, search (`/`), dark/light theme, an interactive Playground, a 404 page and a printable completion certificate.

## Run it

Open `site/index.html` directly in a browser, or:

```bash
npm run serve        # http://localhost:8080
```

## Edit the content

Content lives in `content/` as Markdown — one file per module (`NN-name.md`), plus `glossary.md`, `projects.md`, `resources.md`.

```
---
title: ...  summary: ...  time: 4 hours  level: Beginner|Intermediate|Advancedoutcomes:
  - ...
---
# Lesson title          ← each top-level "# " starts a lesson
## Section              ← "##" headings feed the on-page table of contents
> **Tip:** ...          ← callouts: Key idea, Tip, Warning, Note, Example, Exercise
# @quiz                 ← last section: "? question", "+ correct", "- wrong", "! explanation"
```

Extra Markdown features:

- ` ```python run ` makes a code block editable and runnable in the browser (pure Python, NumPy, pandas, scikit-learn and pydantic work; network calls and API keys do not).
- `> **Expected output:**` followed by a quoted ` ```text ` block shows what the code prints.
- `> **Solution:**` renders as a collapsed "Show solution" box.

Then rebuild and validate:

```bash
npm run build        # content/*.md → site/js/content.js
npm test             # build + check links, quiz integrity and balance, unrendered markdown
python3 scripts/verify_examples.py          # run every runnable example; compare with its Expected output
python3 scripts/verify_examples.py --fill   # insert missing Expected output boxes (review before committing)
```

`npm test` fails if quiz answers become guessable by length (one length position holding more than 45% of correct answers). `verify_examples.py` needs `numpy pandas scikit-learn pydantic`.

`site/js/content.js` is generated and committed so the site works with no build step.

## Deploy

`site/` is plain static files — upload it to GitHub Pages, Netlify, Vercel, Cloudflare Pages or any web server. Routing is hash-based (`#/…`), so no server rewrite rules are needed.

## Keeping it current

Concepts are durable; model names, prices and library APIs are not. Code samples use a single `MODEL` constant — update it from your provider's docs. Review `content/resources.md` and the code samples periodically.
