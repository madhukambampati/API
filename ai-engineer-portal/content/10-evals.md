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

Here is a complete, runnable eval. The "system under test" is a deliberately simple keyword classifier so it runs anywhere; in real life `task` would call your prompt or model.

```python run
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
            print("FAIL", r["id"], "->", r["output"][:80])
    return results

# --- the system under test (swap in your LLM call here) ---
def classify(text):
    t = text.lower()
    if any(w in t for w in ["refund", "charge", "invoice"]):
        return "billing"
    if any(w in t for w in ["crash", "error"]):
        return "bug"
    return "other"

cases = [
    {"id": "t1", "tags": ["typical"], "input": "Please refund my last order", "expected": "billing"},
    {"id": "t2", "tags": ["typical"], "input": "The app crashes on start", "expected": "bug"},
    {"id": "t3", "tags": ["edge"],    "input": "My card was declined", "expected": "billing"},
    {"id": "t4", "tags": ["edge"],    "input": "Error: refund button does nothing", "expected": "bug"},
    {"id": "t5", "tags": ["typical"], "input": "How do I change my username?", "expected": "other"},
]
results = run_eval(cases, classify)
```

> **Expected output:**
> ```text
> 3/5 = 60%
> FAIL t3 -> other
> FAIL t4 -> billing
> ```

Two failures, and both are informative: "card was declined" has no keyword the classifier knows, and "refund button does nothing" is a bug *about* billing, which the rule mislabels. Each failure tells you exactly what to improve — that is the point of reading failures, not just the score.

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

### Measuring judge agreement

Before trusting a judge, compare it with your own labels on the same outputs:

```python run
human = ["pass", "pass", "fail", "pass", "fail", "pass", "fail", "pass", "pass", "fail"]
judge = ["pass", "pass", "fail", "pass", "pass", "pass", "fail", "fail", "pass", "fail"]

agree = sum(h == j for h, j in zip(human, judge)) / len(human)
print(f"agreement: {agree:.0%}")

# Where do they disagree? These are the rubric problems to fix.
for i, (h, j) in enumerate(zip(human, judge)):
    if h != j:
        print(f"case {i}: human={h} judge={j}")
```

> **Expected output:**
> ```text
> agreement: 80%
> case 4: human=fail judge=pass
> case 7: human=pass judge=fail
> ```

80% agreement on 10 cases is a start, not proof. Read each disagreement: is the rubric ambiguous, or is the judge missing something? Fix the rubric, re-run, and only trust scores once agreement is high on 50+ cases.

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

> **Solution:**
> What a good result looks like:
>
> - **A dataset file** (`evals/rag.jsonl`) with 30 rows: question, the chunk ID that should be retrieved, a reference answer, and tags (`typical`, `edge`, `unanswerable`).
> - **A script** that prints recall@3 (use the recall code from module 8's solution), the judge's faithfulness score, and per-tag pass rates.
> - **Judge validation**: the agreement code above, run on your 20 hand labels, with each disagreement explained.
> - **A before/after table**, for example: *recall@3 0.70 → 0.87 after adding keyword (BM25) search; faithfulness 0.80 → 0.93 after adding "answer only from the sources"; unanswerable handled 2/5 → 5/5.*
> - **One paragraph** on what still fails and why.
>
> If your numbers did not improve, that is still a valid result — write down what you tried and what you learned.

# @quiz

? Why are evals called the foundation of AI engineering?
- They make the model larger and smarter
+ They make change measurable
- They are a legal requirement for every AI product sold to customers
- They replace the need to write prompts
! Without measurement, every prompt or model change is a guess.

? A task has a checkable right answer (a category label). Which grader should you prefer?
- An LLM judge with a rubric
+ A code check such as exact match
- A human reviewer for every case
- User thumbs-up and thumbs-down
! Code graders are free, instant and perfectly repeatable. Use them wherever they apply.

? Your LLM judge and your own labels agree on 6 of 10 cases. What should you do?
- Trust the judge, because models are always more consistent than people are
+ Read the disagreements and fix the rubric before trusting it
- Average the judge and your labels together
- Drop the cases where you disagree
! A judge is a model that can be wrong. Calibrate it against human labels first.

? A RAG system has low recall@k. Where should you focus?
- On the wording of the generation prompt
+ On retrieval: chunking, search and query rewriting
- On the colours of the chat interface
- On lowering the model's temperature
! If the right chunk is not retrieved, generation cannot recover the answer.

? Why run each agent task several times in an eval?
- Agents only succeed on the third attempt
+ Outputs vary, so one run can be lucky or unlucky
- Repeated runs warm up the provider's cache
- The eval framework requires at least three runs before it reports a score
! Report pass rate and consistency; production cares about reliability, not one good run.

? Where should most new eval cases come from over time?
- Random text collected from the internet
+ Real usage and failures, reviewed
- Synthetic data that nobody has checked
- The model's own descriptions of what it is good and bad at
! Turning production failures into permanent test cases is the improvement flywheel.

? Accuracy moves from 85% to 90% on a 20-case eval. What is the right reading?
- A clear, proven 5-point improvement
+ Possibly noise: each case is worth 5 points
- The model has stopped hallucinating
- Proof that the new prompt is better for every kind of question
! With 20 cases each case is 5%. Use more cases or repeated runs before trusting small gains.
