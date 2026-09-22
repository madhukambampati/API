# Phased Roadmap — One-Stop IT Learning Platform

This turns the full product blueprint into a sequenced, actionable backlog, mapped
against what actually exists in this repo today. It does not commit to building
everything — it is the plan to execute against incrementally, phase by phase,
re-scoping as needed.

**Guardrail (blueprint §36):** do not go wide before going deep. Every phase below
adds either infrastructure or *complete* role paths — never a pile of shallow pages.

---

## 0. Current state snapshot (as of this roadmap)

What exists today, for grounding every ticket below:

- **Runtime:** single Flask app (`app.py`), deployed as a Vercel serverless
  function. No persistent server process, no background jobs, no cron.
- **Data:** zero database. All user state (profile, theme, history, bookmarks,
  practice stats, streak, career checklist) lives in the browser's
  `localStorage` only — nothing syncs across devices, nothing survives a
  cleared browser.
- **Auth:** one shared `SITE_PASSWORD` gate (session cookie), not per-user
  accounts. No signup, no per-user data separation.
- **AI:** one Anthropic API key, one system prompt, one `/api/chat` endpoint.
  No retrieval, no per-mentor-mode routing, no evaluation harness.
- **Content:** static Jinja templates + hand-written JS data arrays
  (`static/practice.js` question bank, `static/*.js` per-page content).
  No CMS, no versioning, no review workflow.
- **Compute:** no sandboxed execution anywhere. Nothing runs user-submitted
  code, shell commands, or containers.
- **Pages today:** Home, Chat, Roadmaps, Practice (quiz + coding challenges,
  AI-graded via chat), Tech News, Resources, Glossary, Career (checklist +
  ATS resume checker), Tools (regex/JSON/cheatsheet), Progress, Bookmarks,
  History, Settings.

This is a solid **Phase-1-content** app. It has no infrastructure for
accounts, playgrounds, community, or a certification database — those are
new subsystems, not extensions of existing code.

---

## 1. Architecture decisions this roadmap assumes

These need a yes/no before Phase 0 tickets make sense. Flag to the user
before starting Phase 0:

1. **Database:** introduce a real database (e.g. Postgres via a managed
   provider — Vercel Postgres, Supabase, or Neon all work with a Vercel
   deployment) once we need anything to sync across devices. Nothing before
   Phase 0 needs this.
2. **Accounts:** move from one shared site password to per-user accounts
   (email+password or OAuth) only when we need to persist per-user data
   server-side (progress, portfolio, saved projects).
3. **Playgrounds/sandboxes:** these need real isolated compute (containers
   with resource/time/network limits) that a Vercel serverless function
   cannot provide. This is a separate infrastructure decision (e.g.
   Docker-in-a-VM service, a third-party code-execution API, or
   Kubernetes-based ephemeral pods) and should be scoped as its own spike
   before Phase 2 starts, not assumed to "just work."
4. **Rebrand:** the blueprint requires a parent brand broader than
   "SDET Mentor" (§29). **Decided:** the platform is now **TechOrbit** —
   "Every role. Every skill. One learning universe."

5. **Database deferred:** Epic 0.1 (accounts + database) is intentionally
   **not** being started yet. Epics 0.2 and 0.3 don't need it and proceed
   first; onboarding/personalization stays localStorage-only (single
   device, same as today) until Epic 0.1 is picked up.

---

## Phase 0 — Foundation infrastructure (new, prerequisite for Phase 2+)

Not in the blueprint's phase list explicitly, but required before "real
hands-on platform" (Phase 2) or portfolio/assessments can mean anything
beyond localStorage.

### Epic 0.1 — Database + accounts MVP
- [ ] Choose a managed Postgres provider compatible with Vercel deploys.
- [ ] Schema v1: `users`, `sessions`, `profiles`, `progress_events`,
      `bookmarks`.
- [ ] Replace `SITE_PASSWORD` single-gate with per-user signup/login
      (email+password to start; OAuth can come later).
- [ ] Migrate existing localStorage-only features (profile, bookmarks,
      streak, practice stats) to write through to the database when logged
      in, falling back to localStorage for guest/anonymous use.
- [ ] Data export + account deletion endpoints (blueprint §31 privacy
      requirement — do this from day one, not bolted on later).

### Epic 0.2 — Content model foundation
- [x] Define a structured schema for "Role" content (fields listed in
      blueprint §6) as JSON — `data/schema/role.schema.json`, no database
      needed. One proof instance: `data/roles/sdet.json`.
- [x] Define a structured schema for "Lesson"/"Topic" content (§7 fields) —
      `data/schema/lesson.schema.json`. One proof instance:
      `data/lessons/git-and-github.json`.
- [x] Build one generic template that renders any Role/Lesson from that
      schema — `templates/role_detail.html` at `/careers/<slug>` and
      `templates/lesson_detail.html` at `/lessons/<slug>`. Linked as
      low-key "early preview" links from Career and Roadmaps for now;
      **not** in main nav yet — a real `/careers` index + 3-5 fully
      populated roles is still Phase 1 Epic 1.1, not done here.

### Epic 0.3 — Rebrand
- [x] Decide parent brand name + visual identity — **TechOrbit**, tagline
      "Every role. Every skill. One learning universe.", brand icon 🪐.
- [x] Sweep `templates/`, `app.py`, `README.md` for "SDET Mentor" /
      "QA Mentor" and replace.

---

## Phase 1 — Strong foundation (content-first, fits mostly on Phase 0)

### Epic 1.1 — Career Explorer (§6)
Ship **3-5 complete role pages**, not a shallow catalogue. Recommended
first set (covers distinct domains + reuses this app's existing QA/SDET
content):
- QA Engineer → SDET (already has content — retrofit into new schema)
- Software Developer (backend or full-stack)
- DevOps Engineer

Per role, every blueprint §6 field is required before it ships:
role definition, daily responsibilities, skills, roadmap, labs (link to
Phase-2 playgrounds once they exist; static exercises until then),
projects, interview topics, certifications, related roles, transition
paths, "is this role right for me" assessment, AI-effect note, future
outlook, sources.

- [ ] Build `/careers` index (searchable/filterable, not a giant sidebar
      per blueprint §5).
- [ ] Build `/careers/<role-slug>` generic template against the Epic 0.2
      schema.
- [ ] Write full content for the 3 roles above.
- [ ] Add 2-3 transition-path examples from §6 (e.g. Manual QA →
      Automation → SDET, since that's this app's strongest existing
      content).

### Epic 1.2 — Onboarding + personalized dashboard (§4)
- [ ] Onboarding flow capturing: current role, target role, experience
      level, weekly time, learning goal, certification interest.
      (Requires Epic 0.1 accounts to persist past one session.)
- [ ] Personalized dashboard: recommended roadmap, daily lesson, daily
      challenge (already exists), suggested next action.
- [ ] "Edit my plan" — users can change answers any time.

### Epic 1.3 — AI mentor modes (no new infra — prompt/routing only)
- [ ] Add a mentor-mode selector to Chat: Developer, QA/SDET, DevOps,
      Career Coach to start (subset of blueprint §23's 15 modes).
- [ ] Each mode = a distinct system prompt + optional role context passed
      into the existing `/api/chat` call. No architecture change needed.
- [ ] Add "last verified" disclaimers to AI answers about tools/versions
      (cheap trust signal, no infra needed).

### Epic 1.4 — Search (§24, scoped down)
- [ ] Client-side search across existing static content first (roles,
      lessons, glossary, resources) — no search infra needed yet.
- [ ] Typo tolerance + synonym list for common QA/dev acronyms.
- [ ] Defer: full knowledge-graph search, chat-history search (needs
      Phase 0 accounts + DB).

**Phase 1 exit criteria:** 3 complete role paths live, accounts + basic
personalization working, mentor modes shipped, rebrand done.

---

## Phase 2 — Real hands-on platform (playgrounds)

Gate: architecture decision 3 (sandboxed compute) must be resolved first —
this is the single biggest new infrastructure investment in the whole
blueprint.

### Epic 2.1 — Playground infrastructure spike
- [ ] Evaluate options: hosted code-execution API (e.g. Judge0-style),
      ephemeral container service, or self-managed Docker-in-VM.
- [ ] Define hard limits for every playground: CPU/memory, wall-clock
      timeout, no outbound network by default, disk quota, per-user rate
      limit.
- [ ] Build one working playground end-to-end (Coding Playground, simplest
      case) before replicating the pattern to others.

### Epic 2.2 — Additional playgrounds (build in this order, each depends
on 2.1's pattern)
- [ ] SQL playground (sample DB + query editor — lowest risk, no shell).
- [ ] API playground (request builder against public practice APIs — no
      code execution needed, just proxied HTTP calls with logging).
- [ ] Linux/terminal playground (highest risk — needs the strictest
      sandboxing from 2.1).
- [ ] Web (HTML/CSS/JS) playground with live preview.
- [ ] QA playground (intentionally-buggy sample site + bug-report
      exercises — content work once 2.1 exists for any automation parts).

### Epic 2.3 — Projects + portfolio (§19)
- [ ] Project schema: problem statement, requirements, milestones,
      rubric, starter files.
- [ ] One guided + one independent project per shipped role (start with
      the 3 roles from Phase 1).
- [ ] Portfolio page per user (needs Phase 0 accounts): completed
      projects, badges, résumé link.

### Epic 2.4 — Structured assessments (§20)
- [ ] Move Practice quiz grading from ad-hoc to a rubric-based model:
      score + explanation + skill-level estimate + next-action suggestion.
- [ ] Add scenario/troubleshooting question types beyond multiple-choice.

### Epic 2.5 — Certification navigator (§21, scoped)
- [ ] Start with 3-5 certifications tied to the 3 shipped roles (e.g.
      ISTQB, one cloud cert, one Kubernetes/Docker cert).
- [ ] Every entry requires: official source link, last-verified date,
      prerequisites, cost with date context, free study roadmap. No
      auto-scraping — manual curation with a review-date field so stale
      entries surface automatically.

---

## Phase 3 — Data, product and AI curricula

- [ ] Data & Analytics role path (reuse Career Explorer pattern from 1.1).
- [ ] BA / Product Management role path.
- [ ] AI/ML foundations content track (§13) — content only, no training
      infra.
- [ ] RAG engineering content track + one RAG playground (embeddings +
      vector search demo, read-only sample corpus — no user-uploaded
      documents until a storage/security review happens).
- [ ] AI evaluation harness for this platform's *own* chatbot (§23
      "answer-quality controls") — golden Q&A set, regression checks
      before each mentor-prompt change ships. This is dogfooding, and
      should happen before adding more mentor modes.

## Phase 4 — Infrastructure & specialization

- [ ] Security curriculum + role path (labs run only in the Phase-2
      sandboxed infra, explicitly scoped/authorized per blueprint §15).
- [ ] Networking + Linux administration role paths.
- [ ] Cloud specialization tracks (AWS/Azure/GCP) — content first;
      hands-on cloud playgrounds are a much larger infra lift than 2.1
      (real cloud accounts, cost controls) — separate spike.
- [ ] SRE/observability role path + incident-simulation playground.

## Phase 5 — Emerging tech & community

- [ ] Technology Radar (§27) — Adopt/Trial/Assess/Watch/Declining
      classification, content-only, no infra.
- [ ] Emerging-tech content tracks (quantum, robotics, edge AI) clearly
      labeled proven vs. speculative (§17).
- [ ] Community features **only after** moderation tooling exists
      (§26 explicit requirement) — do not ship forums first and add
      moderation later.

---

## Cross-cutting backlogs (continuous, not phase-gated)

These apply from Phase 0 onward and should get a ticket in whichever
phase touches the relevant surface, not deferred to "later":

- **Accessibility (§28):** WCAG pass on every new template — keyboard
  nav, focus states, contrast, aria-live, alt text. Already partially
  done on existing pages this session; keep the bar for everything new.
- **Security/privacy (§31):** rate limiting, secret handling, encrypted
  storage once a DB exists, audit logs on any admin action, no exposing
  server-side keys — non-negotiable from Epic 0.1 onward.
- **Governance (§33):** every content item needs author, reviewer,
  version, last-reviewed date, next-review date once Epic 0.2's content
  schema exists. Retrofit this field onto Phase 1 role pages, don't wait.
- **Success metrics (§34):** instrument completion/skill-demonstration
  events (not just page views) starting with Epic 0.1's `progress_events`
  table.

---

## Suggested sequencing

```
Phase 0 (infra) ──┬── Phase 1 (content: careers, onboarding, mentor modes, search)
                   │         │
                   │         ▼
                   └──> Phase 2 (playgrounds — gated on its own infra spike)
                                 │
                                 ▼
                        Phase 3 (data/product/AI curricula)
                                 │
                                 ▼
                        Phase 4 (infra specializations)
                                 │
                                 ▼
                        Phase 5 (emerging tech + community)
```

Phase 2's playground infrastructure spike is the largest single risk in
this roadmap — it's a different kind of system (sandboxed multi-tenant
compute) from everything built so far, and should be scoped and estimated
on its own before committing to a timeline for Phase 2.

---

## What's explicitly out of scope until re-visited

- Any feature implying the AI can guarantee correctness for every
  question (blueprint §23 explicitly disclaims this — keep it that way
  in UI copy).
- Community/forums before moderation tooling exists.
- Cloud-account-based playgrounds (real AWS/Azure/GCP sandboxes) — cost
  and abuse risk requires a dedicated spike, not a normal feature ticket.
- Certification/salary data presented without a source + last-verified
  date.
