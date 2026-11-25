# AI Engineer Path — learning portal

A complete, free, self-contained curriculum that takes a learner from "what is AI?" to designing, evaluating, securing and shipping AI systems. No backend, no accounts, no external services — progress is stored in the learner's browser.

- **14 modules · 62 lessons · 90 quiz questions · 9 projects · 83-term glossary**
- Search (`/`), dark/light theme, progress tracking, module quizzes (70% to pass, options shuffled each attempt), an interactive Playground (temperature, token cost, cosine similarity, chunking), and a printable completion certificate.

## Run it

Open `site/index.html` directly in a browser, or:

```bash
npm run serve        # http://localhost:8080
```

## Edit the content

Content lives in `content/` as Markdown — one file per module (`NN-name.md`), plus `glossary.md`, `projects.md`, `resources.md`.

```
---
title: ...  summary: ...  time: 4 hours  level: Beginner|Intermediate|Advanced  icon: 🧠
outcomes:
  - ...
---
# Lesson title          ← each top-level "# " starts a lesson
## Section              ← "##" headings feed the on-page table of contents
> **Tip:** ...          ← callouts: Key idea, Tip, Warning, Note, Example, Exercise
# @quiz                 ← last section: "? question", "+ correct", "- wrong", "! explanation"
```

Then rebuild and validate:

```bash
npm run build        # content/*.md → site/js/content.js
npm test             # build + check links, quiz integrity, unrendered markdown
```

`site/js/content.js` is generated and committed so the site works with no build step.

## Deploy

`site/` is plain static files — upload it to GitHub Pages, Netlify, Vercel, Cloudflare Pages or any web server. Routing is hash-based (`#/…`), so no server rewrite rules are needed.

## Keeping it current

Concepts are durable; model names, prices and library APIs are not. Code samples use a single `MODEL` constant — update it from your provider's docs. Review `content/resources.md` and the code samples periodically.
