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

### Epic 0.4 — Branding-hierarchy fixes (added after user review)
A real review of the first rebrand pass found it was a surface-level
rename that didn't actually explain the TechOrbit → SDET Mentor
relationship, and left some premature commercial-sounding UI in place.
Fixed:
- [x] Homepage hero now leads with a TechOrbit badge carrying the full
      tagline, then an explicit "You're in SDET Mentor — TechOrbit's
      first complete academy" note, linking to the Career Explorer.
- [x] Sidebar brand block now shows the `TechOrbit └ SDET Mentor — QA &
      Quality Engineering Academy` hierarchy directly, not just the
      parent name.
- [x] Added a minimal `/careers` Career Explorer index: the one real
      role (SDET) plus 5 explicitly-labeled "Planned" / non-clickable
      placeholder cards (Developer, DevOps/SRE, Data & AI, Product/BA,
      Cloud/Platform) — makes the "every role" promise honestly show
      its current state instead of just being sidebar copy with nothing
      behind it. Still intentionally not in main nav; a fully-populated
      version is Epic 1.1.
- [x] Relabeled the sidebar "Upgrade to Pro" card and Settings "Pro"
      panel to "Accounts & Sync — coming soon," and changed the topbar's
      "Free Plan" label to "Local profile" — removes commercial-plan
      language for a feature that isn't built (ties to Epic 0.1).

Still open from this review, deliberately deferred (real content work,
not a copy fix — see Epic 1.1 and the Resources/Glossary backlog):
- Roadmaps and Resources/Glossary content is still QA-only. The
  Career Explorer's "Planned" cards are honest about this now, but
  actually building Developer/DevOps/Data/Product tracks and
  role-neutral resources is Phase 1+ content authoring, not something
  to rush here.

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

- [x] Build `/careers` index — basic version shipped in Phase 0 Epic 0.4;
      still needs real search/filter once there are enough roles to
      justify it (fine with 2-6 roles as plain cards for now).
- [x] Build `/careers/<role-slug>` generic template against the Epic 0.2
      schema — shipped in Phase 0 Epic 0.2.
- [x] Write full content for the 3 roles above:
  - [x] QA Engineer → SDET (`data/roles/sdet.json`)
  - [x] Full-Stack Developer (`data/roles/developer.json`) — roadmap
        stages are self-contained in the JSON, not linked to the
        Roadmaps page, since that page is scoped to the SDET Mentor
        academy, not general TechOrbit (see Epic 0.4 hierarchy note).
  - [x] DevOps Engineer (`data/roles/devops.json`) — same pattern,
        certs verified via web search (CKA, Terraform Associate, AWS
        DevOps Engineer Professional, AWS Cloud Practitioner).
- [x] Add 2-3 transition-path examples from §6 — SDET's transition paths
      plus Developer's "QA/SDET → Developer" and "Backend Developer →
      AI Engineer", plus DevOps's "Linux Administrator → DevOps
      Engineer" and "DevOps Engineer → SRE" (all named in the
      blueprint's own examples).

**Epic 1.1 complete** — all 3 recommended first roles shipped.

### Epic 1.2 — Onboarding + personalized dashboard (§4) — scoped down, no DB
- [x] Onboarding flow at `/onboarding` capturing: target role (from the
      real roles above, or "not sure yet"), experience level, weekly
      time, and primary goal. Stored in localStorage (`ONBOARDING_KEY`),
      not a database — consistent with the Epic 0.1 deferral.
      Deliberately dropped from the blueprint's full §4 list for this
      first pass: current role/education, preferred languages, preferred
      learning style, target completion date, interview timeline,
      accessibility needs, preferred language, geographic market — each
      would need corresponding personalization logic to be worth asking,
      which isn't built yet.
- [x] "Recommended for you" card on Home: shows the target role with a
      goal-specific tip and a direct link into its Career Explorer page,
      or a link to browse all roles if "not sure yet." Not the full
      blueprint dashboard (no skill-gap analysis, no suggested labs/
      projects beyond what the role page itself already lists — those
      need more infrastructure/content than a first pass justifies).
- [x] "Edit my plan" — linked from Settings, re-visiting `/onboarding`
      pre-fills previous answers.

### Epic 1.3 — AI mentor modes (no new infra — prompt/routing only)
- [x] Mentor-mode selector on Chat: QA/SDET, Developer, DevOps, Career
      Coach (the 4 modes recommended here; the blueprint's other 11 are
      not built). Selection persists in localStorage.
- [x] Each mode appends a focus fragment to the existing `SYSTEM_PROMPT`
      and is passed to `/api/chat` via a `mode` field; invalid/missing
      mode falls back to QA/SDET without erroring.
- [ ] "Last verified" disclaimers on AI answers about tools/versions —
      not done; would need per-answer metadata the chat endpoint doesn't
      currently track.

### Epic 1.4 — Search (§24, scoped down)
- [x] Client-side search improved on Home's topic grid: typo tolerance
      (Levenshtein distance) and a bidirectional synonym/acronym map
      (e2e, api, ci, cd, sdet, oop, llm, ai, qa, ui, ux, sql, rest, jwt,
      bva, ep) — works whichever direction the user types.
- [ ] Search across roles/lessons/glossary/resources (only the Home
      topic grid was improved, not a unified cross-content search) —
      not done.
- [ ] Defer: full knowledge-graph search, chat-history search (needs
      Phase 0 accounts + DB).

**Phase 1 status: content/prompt/search work done to the scoped level
above. Epic 0.1 (accounts + database) remains deliberately deferred —
see "What's blocked on infrastructure" below.**

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
- [~] Partially satisfied inline: each of the 3 shipped roles already
      lists 4-5 certifications with verified official links and a
      `governance.last_reviewed` date (e.g. SDET → ISTQB/AWS/Postman,
      DevOps → CKA/Terraform Associate/AWS DevOps Professional). Not
      done: a dedicated `/certifications` navigator page with prep
      time, cost, renewal requirements, and free study roadmaps per
      cert — still a real gap versus §21's full field list.

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

- [x] Technology Radar (§27) at `/radar` — 12 technologies across
      Adopt/Trial/Assess/Watch/Declining/Emerging, grounded in what
      this platform's 3 shipped roles actually cover (Playwright,
      Docker, Kubernetes, TypeScript, AI coding assistants, LLM eval
      frameworks, agentic AI, etc.), not a full sweep of the blueprint's
      20+ domains. Each entry is explicitly labeled as TechOrbit's own
      editorial judgment, not a cited industry ranking. Done out of
      phase order since it's content-only with no infra dependency.
- [ ] Emerging-tech content tracks (quantum, robotics, edge AI) clearly
      labeled proven vs. speculative (§17) — not done; the radar above
      touches AI/agentic trends but doesn't cover quantum/robotics/edge.
- [ ] Community features **only after** moderation tooling exists
      (§26 explicit requirement) — do not ship forums first and add
      moderation later. Not started; needs a moderation-tooling
      decision first, see below.

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

## What's blocked on infrastructure (can't be completed without it)

Asked to "complete all the phases," this is the honest boundary: everything
above this line that's checked off was achievable inside the current
architecture (Flask + localStorage, one Anthropic API key, no database,
no sandboxed compute). Everything below needs a real infrastructure or
account decision that only the project owner can make — provisioning a
service, creating credentials, accepting a cost/risk tradeoff. None of it
was faked or stubbed to look done; it's left explicitly unstarted.

- **Epic 0.1 (accounts + database):** needs a managed Postgres provider
  (Vercel Postgres, Supabase, Neon, etc.) — an account and connection
  string someone has to create. Blocks: true cross-device sync, the
  blueprint's full onboarding field list, portfolio pages, structured
  assessment history, and anything else that needs to outlive a single
  browser's localStorage.
- **Phase 2 playgrounds (all of them — coding, SQL, API, Linux,
  Kubernetes, etc.):** need real isolated, resource-limited compute.
  A Vercel serverless function cannot safely run arbitrary user code.
  This needs a dedicated infrastructure spike (a hosted code-execution
  API, or a self-managed container service) and a decision on cost
  limits and abuse handling before any playground ships — not a normal
  content ticket.
- **Phase 4 real cloud specialization labs:** hands-on AWS/Azure/GCP
  exercises need actual cloud accounts with cost controls — a bigger,
  separate risk than the Phase 2 spike above.
- **Phase 5 community/forums:** blueprint §26 explicitly requires
  moderation tooling to exist *before* community features ship. No
  moderation system exists, so no community features were built either,
  by design — not an oversight.

None of these were skipped by choice to save time; they're skipped
because completing them here would mean either fabricating
infrastructure that isn't real, or making account/cost decisions that
aren't this session's to make.

## What's explicitly out of scope until re-visited

- Any feature implying the AI can guarantee correctness for every
  question (blueprint §23 explicitly disclaims this — keep it that way
  in UI copy).
- Community/forums before moderation tooling exists.
- Cloud-account-based playgrounds (real AWS/Azure/GCP sandboxes) — cost
  and abuse risk requires a dedicated spike, not a normal feature ticket.
- Certification/salary data presented without a source + last-verified
  date.
