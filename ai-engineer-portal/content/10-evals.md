---
title: Evals
summary: How to test and evaluate non-deterministic AI systems systematically — datasets, graders, LLM-as-judge, RAG and agent evals, and CI.
time: 4 hours
level: Intermediate
outcomes:
  - Explain why evals are the foundation of AI engineering and what makes a good one
  - Build an eval dataset from real usage, with edge cases and negatives
  - Choose between code-based, LLM-judge and human graders and validate your judge
  - Evaluate RAG and agents, and run evals in CI and production
---

# Why evals are everything

Traditional software is deterministic: the same input gives the same output, so a unit test either passes or fails. AI systems are probabilistic, sensitive to wording, and quietly change when models update. You cannot *read* a prompt and know if it works.

> **Key idea:** **If you can't measure it, you can't improve it — and you can't safely change it.** Evals are to AI engineering what tests are to software engineering, plus a compass for every decision: prompt, model, retrieval, chunk size, agent design.

Evals let you:

- **Choose** between models, prompts and architectures with evidence.
- **Catch regressions** when you edit a prompt or a provider ships a new model version.
- **Quantify** progress and report it honestly.
- **Spend wisely** — find the cheapest model that clears the bar.
- **Ship with confidence** and detect production drift.

## Vibes versus evals

"I tried five examples and it looked good" is a *vibe check*: fine for a prototype, dangerous for anything else. Five examples cannot reveal a 10% failure rate, edge cases, or whether your last change broke what used to work.

## The anatomy of an eval

```diagram
  dataset            system under test           grader               metrics
 (inputs +   ──►  (prompt/model/RAG/agent) ──► (compares output  ──►  accuracy, pass rate,
  expected /          produces output            to expectation)       cost, latency…
  criteria)
```

1. **Dataset** — realistic inputs with expected outputs or grading criteria.
2. **Task** — the thing being tested (a function that takes input, returns output).
3. **Grader** — decides pass/fail or a score.
4. **Aggregate** — compute metrics, slice by category, compare runs.

## Eval-driven development

Write the eval *first* (like test-driven development): define success, collect cases, measure the baseline, improve, re-measure. It stops you "improving" things that were never broken.

# Building the dataset

The dataset is the most valuable asset in your AI project. A model can be swapped tomorrow; a good eval set stays.

## Where cases come from

1. **Real usage** — production logs, support tickets, user questions (anonymise personal data).
2. **Subject-matter experts** — write the hard and important cases.
3. **Failures** — every bug report becomes a permanent test case.
4. **Synthetic** — use an LLM to generate variations and edge cases, then **review them by hand**; unreviewed synthetic data tends to be easy and repetitive.

## What to include

- **Typical** cases (the bulk).
- **Edge cases**: empty input, very long input, typos, other languages, ambiguity.
- **Negative cases**: things the system should *refuse* or answer "I don't know".
- **Adversarial cases**: prompt injection attempts, off-topic or abusive input.
- **Balanced categories**, so one easy class doesn't hide failures in a hard one.

## How many?

Start with **20–50** well-chosen cases — enough to catch big problems. Grow to hundreds as the product matures. Remember statistics: with 20 cases, a score moving from 85% to 90% is *noise*. Use more cases (or repeated runs) to detect small differences.

## Format

Keep it simple, versioned, and in your repo:

```json
{"id": "refund-001", "tags": ["refunds", "typical"],
 "input": "Can I return my order after 3 weeks?",
 "expected": "yes",
 "notes": "policy allows 30 days"}
```

## Keep a held-out set

As with ML (module 3), if you tune prompts against the same examples forever you overfit them. Hold out a **test set** you rarely look at, and refresh it with new real examples over time.

> **Warning:** Beware **contamination**: if eval examples are pasted into your prompt as few-shot examples, or the model saw the benchmark in training, scores are inflated.

# Graders: how to score outputs

Choose the **cheapest grader that is reliable** for the task.

## 1. Code-based (deterministic) graders — prefer when possible

| Check | Example |
| --- | --- |
| **Exact match** | Classification label equals expected |
| **Regex / contains** | Answer includes "30 days" |
| **Schema validation** | JSON parses and matches the schema |
| **Execution** | Generated code passes unit tests; SQL returns the right rows |
| **Constraint checks** | Under 100 words; no banned phrases; cites a source |
| **Numeric tolerance** | Extracted total within 1% |

Fast, free, perfectly repeatable. Use them for everything they can cover.

```python
def grade_label(output: str, expected: str) -> bool:
    return output.strip().lower() == expected.lower()

def run_eval(cases, task):
    results = []
    for c in cases:
        out = task(c["input"])
        results.append({"id": c["id"], "tags": c["tags"], "pass": grade_label(out, c["expected"]), "output": out})
    passed = sum(r["pass"] for r in results)
    print(f"{passed}/{len(results)} = {passed/len(results):.0%}")
    for r in results:
        if not r["pass"]:
            print("FAIL", r["id"], "→", r["output"][:80])
    return results
```

## 2. LLM-as-judge — for open-ended quality

When correctness is subjective (summaries, tone, helpfulness, faithfulness), use a strong model to grade against a **rubric**.

```text
You are grading a customer-support answer.

<question>{question}</question>
<policy>{policy}</policy>
<answer>{answer}</answer>

Score each criterion 0 or 1 and explain briefly BEFORE scoring:
1. faithful: every claim is supported by the policy
2. complete: answers the whole question
3. tone: polite and concise
Return JSON: {"reasoning": "...", "faithful": 0|1, "complete": 0|1, "tone": 0|1}
```

Best practices:

- **Narrow, binary criteria** beat vague 1–10 scores.
- **Reasoning first**, then the score.
- **Give the reference answer or source** when one exists.
- **Use a different (ideally stronger) model** than the one being judged to reduce self-preference bias.
- **Randomise the order** when comparing two answers (judges favour position A and longer answers).

> **Warning:** An LLM judge is itself a model that can be wrong. **Validate it:** have a human label ~50 cases, run the judge, and measure agreement. If agreement is poor, fix the rubric before trusting any number it produces.

## 3. Human evaluation

The gold standard for taste, safety and edge cases; slow and costly. Use it to **calibrate** automated graders, to review samples regularly, and for launch decisions. Provide clear guidelines and have two reviewers on a subset to measure consistency.

## 4. User signals in production

Thumbs up/down, edits, escalation to a human, retries, and task completion — noisy but real. Feed failures back into your dataset.

## Pairwise comparison

To compare two systems, show both outputs (order randomised) and ask which is better against the rubric. Easier and more reliable than absolute scores.

## Metrics beyond quality

Track alongside quality: **cost per task, latency (p50/p95), tokens used, tool calls, refusal rate**. A "better" prompt that triples cost may not be better.

# Evaluating RAG and agents

## RAG: evaluate the two halves separately

```diagram
 question ─► RETRIEVAL ─► chunks ─► GENERATION ─► answer
              eval A                  eval B
```

**Retrieval metrics** (need to know which chunks *should* be found):

- **Recall@k** — is the right chunk in the top k?
- **Precision@k** — what fraction of the top k are relevant?
- **MRR / nDCG** — how high up is the first/ideal result?

**Generation metrics:**

- **Faithfulness / groundedness** — are all claims supported by the retrieved context? (the hallucination check)
- **Answer relevance / correctness** — does it answer the question, matching the reference?
- **Citation accuracy** — do the cited passages really say that?
- **Abstention** — does it say "I don't know" when it should (and *not* when it shouldn't)?

Diagnosis becomes mechanical: low recall@k → fix retrieval; high recall but low faithfulness → fix generation; both fine but wrong answers → check the dataset or the knowledge base itself.

## Agents: evaluate outcomes *and* trajectories

- **Outcome**: was the final state correct? (file contains the fix, ticket created with correct fields, tests pass.) Check the **environment state**, not the agent's claim.
- **Trajectory**: how did it get there? Steps taken, tools called, wrong turns, loops, wasted cost.
- **Safety**: did it ever attempt a forbidden or destructive action?
- **Reliability**: run each task **multiple times** (e.g. 5–10); report pass rate and consistency (`pass^k`: succeeds every time), not a single lucky run.
- **Cost & time**: tokens, tool calls, wall-clock per task.

Build **sandboxed test environments** with known starting states so outcomes can be checked automatically.

## Other task types

| Task | Typical eval |
| --- | --- |
| Classification / extraction | Exact match, per-field precision/recall |
| Summarisation | Faithfulness (LLM judge with source), coverage of key points, length limits |
| Code generation | Unit tests / execution |
| Chatbot | Rubric judge on multi-turn transcripts + human sampling |
| Safety | Red-team set; refusal and leakage rates |

# Running evals in practice

## Compare runs, slice results

Record every run: model, prompt version, retrieval settings, date, per-case results. Then:

- **Compare** versions side by side and look at *which cases changed*, not only the average.
- **Slice** by tag/category — an average can hide a collapse in an important segment.
- Read **failures in detail**; clusters of similar failures point straight at the fix.

## Variance

Because outputs vary, run each case several times for important decisions, or at least don't over-read small differences. As a rule: a change is "real" only if it is bigger than run-to-run noise.

## Evals in CI

Treat prompts and pipelines like code:

1. Commit prompts, eval sets and graders.
2. On every pull request, run a **fast subset** (cheap model, ~50 cases, code graders).
3. Fail the build if the pass rate drops below a threshold or a **must-pass** (safety) case fails.
4. Nightly: run the **full** suite, including LLM-judged and multi-run agent tests.
5. When a provider announces a model change, run the full suite *before* switching.

```python
# pytest-style gate
def test_ticket_classifier_quality():
    results = run_eval(load_cases("evals/tickets.jsonl"), classify_ticket)
    rate = sum(r["pass"] for r in results) / len(results)
    assert rate >= 0.90, f"accuracy dropped to {rate:.0%}"
    assert all(r["pass"] for r in results if "must_pass" in r["tags"])
```

## Online evaluation and monitoring

Offline evals can't cover everything real users do. In production:

- **Log** inputs, outputs, retrieved context, tool calls, latency, cost (mind privacy).
- **Sample and grade** a slice of live traffic automatically (LLM judge) and manually.
- Track **drift**: the mix of user questions changes; quality can decay silently.
- Add **user feedback** buttons and route negative cases into the dataset.
- **A/B test** significant changes on a small share of traffic.

## The flywheel

```diagram
   production logs ─► find failures ─► add to eval set ─► fix system ─► run evals ─► ship
         ▲                                                                             │
         └─────────────────────────────────────────────────────────────────────────────┘
```

Teams that build this loop improve steadily; teams that don't, plateau and fear every change.

> **Exercise:** For your RAG project from module 8, write 30 questions (5 unanswerable). Record recall@3 and a faithfulness check with an LLM judge. Hand-label 20 outputs and compute the judge's agreement with you. Fix the worst failure cluster and report the before/after numbers.

# @quiz

? Why are evals described as the foundation of AI engineering?
- They make the model larger
+ They let you measure quality, compare options, catch regressions and change things safely
- They are required by law
- They replace the need for prompts
! Without measurement, every change is a guess.

? Which grader should you prefer when a task has a verifiable correct answer?
- LLM-as-judge
+ A deterministic code-based check (exact match, schema, unit tests)
- Human review of every case
- A thumbs-up button
! Code graders are fast, free and perfectly repeatable.

? Why should you validate an LLM judge?
- Judges never make mistakes
+ A judge is itself a model; check its agreement with human labels before trusting its scores
- To make it cheaper
- Because judges can't read text
! Calibrate against ~50 human-labelled cases first.

? A RAG system has low recall@k. Where should you focus?
- The generation prompt
+ Retrieval (chunking, embeddings, hybrid search, reranking, query rewriting)
- The UI colours
- Lowering temperature
! If the right chunk isn't retrieved, generation can't recover.

? Why run an agent eval multiple times per task?
- To increase cost
+ Outputs vary; reporting pass rate and consistency avoids being misled by one lucky or unlucky run
- Agents only work on the third try
- To warm up the cache
! Reliability, not best-case performance, determines production value.

? Where should new eval cases mostly come from over time?
- Random internet text
+ Real usage and real failures, reviewed and added to the dataset
- Only synthetic data with no review
- The model's own training data
! Production failures turned into permanent test cases form the improvement flywheel.

? What is "contamination" in evals?
- Dirty hardware
+ Eval examples leaking into prompts or training data, inflating scores
- Using too many tags
- Slow graders
! Keep test cases separate from few-shot examples and tuning data.
