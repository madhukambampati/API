# Data warm-up: ticket explorer
@level Beginner
@time 2–3 hours
@after Module 2 · Python & Math

Build the dataset you will reuse throughout the course.

**Build**
- Create `tickets.csv` with 60 made-up support tickets: `id`, `text`, `category` (billing / bug / other), `urgency` (1–5).
- Load it with pandas; print counts per category and mean urgency per category.
- Write a `cosine()` function and find the two most similar tickets using TF-IDF vectors from scikit-learn.

**Done when:** a script prints the summary table and the most-similar pair, and the repo has a README and `requirements.txt`.

# Classic ML ticket classifier
@level Beginner
@time 3–4 hours
@after Module 3 · Machine Learning Essentials

**Build**
- Train a TF-IDF + logistic regression classifier on your tickets with a proper train/test split.
- Report precision, recall and F1 per class, and the confusion matrix.
- Read the 5 worst mistakes and write down what they have in common.

**Stretch:** compare against a majority-class baseline and against 5-fold cross-validation.

**Done when:** you can explain, with numbers, how much better than baseline the model is and where it fails.

# Prompted chatbot with memory
@level Beginner
@time 3–5 hours
@after Modules 6–7 · Prompt Engineering, LLM APIs

**Build**
- A command-line chatbot with a system prompt (a tutor, a coach, or a support agent).
- Streaming output, retries with backoff, a timeout and token-usage logging.
- History trimming so conversations do not grow without bound.

**Stretch:** add a `/summary` command that compresses old turns into a running summary.

**Done when:** it survives a dropped network connection and a 50-turn conversation, and logs cost per turn.

# Structured extractor
@level Intermediate
@time 4–6 hours
@after Module 7 · Building with LLM APIs

Turn messy text (invoices, résumés, or emails) into validated JSON.

**Build**
- Define a Pydantic schema; extract fields with a model; validate and retry once on failure.
- Return `null` for missing fields instead of guessing.
- Write 30 labelled documents and a script reporting per-field accuracy.

**Done when:** you have a table of field-level accuracy, you have improved it at least twice, and each improvement is explained in the README.

# Document Q&A with RAG
@level Intermediate
@time 6–10 hours
@after Module 8 · RAG

**Build**
- Index 20+ pages of documentation you care about: chunk with overlap, embed, store (FAISS, Chroma or pgvector).
- Answer questions with citations that point to the source chunk; abstain when the answer is not present.
- Add hybrid search (BM25 + vectors) and a reranking step.

**Done when:** answers cite sources, unanswerable questions get “I don’t know”, and a log shows retrieved chunks for each query.

# RAG evaluation harness
@level Intermediate
@time 6–8 hours
@after Module 10 · Evals

**Build**
- A 40-question eval set (8 unanswerable) with the expected source chunk for each.
- Metrics: recall@k, faithfulness (LLM judge), answer correctness, and abstention accuracy.
- Hand-label 25 answers; compute the judge's agreement with you; fix the rubric until agreement is acceptable.
- Run before/after comparisons for each retrieval change and record them in a table.
- A script that exits non-zero if quality drops below a threshold (so it can run in CI).

**Done when:** every change to your RAG project is justified by a number.

# Tool-using agent
@level Advanced
@time 8–12 hours
@after Module 9 · Agentic Systems

**Build**
- An agent with 3–5 tools (for example: search docs, run Python in a sandbox, read/write a notes file).
- Step, time and cost budgets; a written plan before acting; a verification step before declaring success.
- Human approval for any side-effecting tool.
- An eval of 15 tasks, each run 5 times, reporting pass rate, average steps and cost.

**Done when:** you can show a failure trace, explain its cause and show the harness change that fixed it.

# Production hardening
@level Advanced
@time 8–12 hours
@after Modules 11 and 13 · Harness Engineering, Production & Safety

**Build**
- Wrap an earlier project in a FastAPI service with input validation, auth, rate limiting and streaming.
- Output validation, retries, a fallback model and a daily budget.
- Structured traces of every request.
- A threat model, a prompt-injection test document, and two mitigations — added to your eval suite as permanent cases.

**Done when:** you can run a script that attacks the service and see it fail safely.

# Capstone: a domain assistant
@level Advanced
@time 20–40 hours
@after The whole course

Choose a real domain you care about (a university, a hobby, a small business, an open-source project) and build an assistant that combines everything.

**Requirements**
- RAG over real domain content, with citations and abstention.
- At least one agentic tool-using capability with approvals.
- A 100-case eval set with slices, a judge validated against human labels, and CI gating.
- Full harness: validation, guardrails, retries, budgets, observability.
- A security and fairness review and a red-team report.
- Cost and latency table, plus a comparison against at least one cheaper model or an open model.

**Deliverables:** public repo, architecture diagram, README with eval tables and failure analysis, a 3-minute demo video, and a short write-up of what you would do next. This is your portfolio centrepiece.
