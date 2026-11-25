---
title: Harness Engineering
summary: Everything around the model that makes AI reliable in production — context engineering, validation, guardrails, retries, caching, observability, sandboxing and cost control.
time: 4 hours
level: Advanced
outcomes:
  - Explain what a harness is and why reliability comes from it, not from the model alone
  - Engineer context deliberately, including caching, compaction and memory
  - Add validation, guardrails, retries, fallbacks and permissions around model calls
  - Instrument systems for observability and control cost and latency
---

# What is a harness?

The **harness** is everything in your system that is *not the model weights*: the prompts, context assembly, tools, retrieval, memory, validation, permissions, retries, logging, evaluation and human checkpoints. The model is the engine; the harness is the car — steering, brakes, seat belts and dashboard.

```diagram
 user ─► INPUT CHECKS ─► CONTEXT BUILDER ─► MODEL ─► OUTPUT VALIDATION ─► ACTION GATE ─► result
          (auth, PII,     (system prompt,     │        (schema, policy,     (permissions,
           injection)      retrieval, memory) │         grounding)           approvals)
                                              ▼
                                         TOOLS (sandboxed) ──► results back into context
 ─────────────────── observability: logs · traces · metrics · evals · cost ───────────────────
```

> **Key idea:** The same model in a poor harness is flaky; in a good harness it is dependable. Much of what people call "model quality" in products is actually **harness quality**. Upgrading a model is occasional; improving the harness is continuous.

## Design principles

1. **Constrain, then verify.** Narrow the model's freedom (schemas, enums, allowed tools) and check its output in code.
2. **Make failure cheap and visible.** Fail fast, log everything, degrade gracefully.
3. **Least privilege.** The model gets the minimum tools and permissions required.
4. **Determinism where possible.** Use code for what code does well (maths, lookups, formatting).
5. **Measure.** Every harness component is justified by an eval or a metric.
6. **Human in the loop for irreversible actions.**

# Context engineering

The model only knows what's in its context window. **Context engineering** is deliberately assembling the *smallest set of high-signal tokens* that makes the right next step likely. It generalises prompt engineering from "write a good instruction" to "manage the entire information state."

## What goes in the context

| Layer | Content | Notes |
| --- | --- | --- |
| **System prompt** | Role, rules, format, escalation | Stable; version-controlled; cacheable |
| **Tool definitions** | Names, descriptions, schemas | Keep few and clear — they cost tokens every call |
| **Retrieved knowledge** | RAG chunks, documents | Only what's relevant; cite sources |
| **Memory** | User preferences, prior facts | Retrieved when relevant |
| **Conversation / task history** | Recent turns, tool results | Trimmed and summarised |
| **The current request** | The user's message | Often placed last |

## Principles

- **Context is finite and precious.** More is not better: irrelevant tokens distract and dilute; accuracy can drop as the window fills ("context rot").
- **Put stable content first, variable content last** — this enables caching and keeps key instructions prominent.
- **Order matters.** Put long documents before the question; restate critical constraints near the end for long contexts.
- **Prefer just-in-time retrieval** (search when needed) over preloading everything.
- **Clean tool outputs.** Strip HTML boilerplate, truncate, paginate, return summaries with an option to drill in.

## Prompt caching

Providers can cache a repeated **prefix** of your prompt (system prompt + tool definitions + a large document). Cached tokens are much cheaper and faster. To benefit: keep the prefix **byte-identical** between calls and put anything that changes (the user question, timestamps) *after* it. Check your provider's rules for minimum sizes and cache lifetime.

```python
# Illustration: mark the large, stable part of the prompt as cacheable (Anthropic-style API).
r = client.messages.create(
    model=MODEL, max_tokens=500,
    system=[
        {"type": "text", "text": BIG_POLICY_DOCUMENT,
         "cache_control": {"type": "ephemeral"}},       # cache this stable prefix
    ],
    messages=[{"role": "user", "content": user_question}],   # the variable part comes last
)
print(r.usage)   # inspect cache read/creation token counts to confirm it's working
```

## Managing long histories

- **Sliding window**: keep the last N turns (simple, loses old facts).
- **Summarise**: compress older turns into a running summary.
- **Structured memory**: extract durable facts ("prefers metric units") into a store; retrieve per request.
- **Compaction in agents**: summarise progress, decisions and open questions; restart the context from that summary plus the latest state.
- **Offload to files**: keep large artefacts outside the window; load excerpts on demand.

> **Tip:** Periodically print the *exact* final prompt your system sends. You will often be shocked by what's in it.

# Validation, guardrails and error handling

## Validate everything the model produces

Model output is **untrusted input** to the rest of your program.

- **Schema validation** (Pydantic/JSON Schema) for structured output; retry once with the error message.
- **Business rules** in code: amounts within limits, IDs that exist, dates in the future.
- **Grounding checks**: do cited quotes actually appear in the source? Do numbers match the tool output?
- **Policy/safety checks**: a classifier or second-model check for disallowed content, PII leakage, off-topic replies.
- **Never execute raw model output** (shell commands, SQL, code) without sandboxing and validation. Use parameterised queries and allow-lists.

## Input guardrails

- Authenticate and rate-limit users.
- Detect and redact **PII** that shouldn't reach the model or logs.
- Screen for abuse and obvious **prompt-injection** patterns (a speed bump, not a wall — see module 13).
- Cap input length.

## Retries, timeouts and fallbacks

```python
import time, random

def with_retries(fn, tries=4, base=1.0):
    for attempt in range(tries):
        try:
            return fn()
        except TransientError:                       # 429, 5xx, network
            if attempt == tries - 1:
                raise
            time.sleep(base * 2 ** attempt + random.random() * 0.3)   # exponential backoff + jitter
```

| Failure | Response |
| --- | --- |
| Timeout / 5xx / 429 | Retry with backoff and jitter; honour `Retry-After` |
| Invalid output | Retry once with the error; then fall back |
| Provider outage | **Fallback model or provider**, or graceful degraded mode |
| Low confidence | Escalate to a human or a stronger model |
| Budget exceeded | Stop and report; never loop silently |

Make operations **idempotent** (safe to repeat) — use idempotency keys for anything with side effects, so a retry doesn't send two emails or charge twice.

## Permissions and sandboxing

- **Least privilege per tool**: read-only DB user; scoped API tokens; allow-listed domains for fetch tools.
- **Sandbox code execution**: containers or restricted runtimes with no secrets, limited CPU/memory/time, and controlled network.
- **Approval gates** for destructive or external actions; show the user *what will happen* before it happens.
- **Separate duties**: the component that decides is not the component that holds the credentials.
- **Never put secrets in prompts or context.** Tools hold credentials; the model only names the action.

## Rate and cost limits

Per-user and per-tenant quotas, per-request token caps, per-run step and dollar budgets for agents, and a global kill switch.

# Observability, cost and operations

## Log and trace everything (responsibly)

For each request, a **trace** should capture: request ID, user/tenant (hashed), prompt version, model and parameters, the assembled prompt (or a reference), retrieved chunk IDs, each tool call with inputs/outputs/latency, final output, validation results, token counts, cost and total latency.

```diagram
 trace: request 8f2a
 ├─ retrieve        120 ms   top5: [d12, d7, d33, d2, d90]
 ├─ llm call #1     1.8 s    in 3,100 / out 210   cached 2,800   $0.004
 ├─ tool: lookup    340 ms   order_id=551 → shipped
 ├─ llm call #2     1.1 s    in 3,400 / out 160
 └─ validate        ✓ schema  ✓ grounded  ✓ policy
```

Tools exist for this (LLM observability platforms, OpenTelemetry), or you can start with structured JSON logs. Apply data-retention and privacy rules — logs of user conversations are sensitive data.

## Metrics and alerts

- **Quality**: eval scores, sampled-judge scores, user feedback rate, escalation rate.
- **Reliability**: error rate, retry rate, timeout rate, validation failure rate.
- **Performance**: p50/p95/p99 latency, time-to-first-token.
- **Cost**: tokens and dollars per request / per user / per feature; cache hit rate.
- **Safety**: blocked-content rate, injection-detection hits, refusals.

Alert on *changes*, not just thresholds — a sudden spike in tokens per request usually means a bug (runaway loop, bloated context).

## Cost and latency playbook

| Lever | Effect |
| --- | --- |
| **Prompt caching** | Big savings on repeated prefixes |
| **Model routing / cascades** | Cheap model first; escalate on low confidence |
| **Shorter context** | Retrieval instead of stuffing; summaries |
| **Shorter outputs** | Concise formats; `max_tokens`; structured fields |
| **Streaming** | Perceived latency |
| **Parallel calls** | Cut wall-clock for independent steps |
| **Response caching** | Zero cost for repeated questions (watch for personalisation and freshness) |
| **Batch APIs** | Discounts for non-urgent work |
| **Smaller / fine-tuned models** | Lower unit cost at scale (module 12) |

## Versioning and safe change

- **Version prompts, tools and configs** like code; record which version produced each output.
- **Pin model versions** where possible and test before upgrading.
- Release gradually: **shadow mode → canary → full rollout**, watching metrics and rolling back if they dip.
- Keep a **kill switch** and a documented incident process.

## A harness checklist

Before shipping an LLM feature, can you answer yes to all of these?

- Is every model output validated before it is used?
- Are all tools least-privilege, and risky ones gated by approval?
- Are there timeouts, retries with backoff, and a fallback path?
- Are there per-request and per-user cost and step limits?
- Are traces logged, with privacy handled?
- Does an eval suite run on every change, with a baseline to beat?
- Can you roll back a prompt or model change in minutes?
- Do you know what happens when the provider is down?

> **Exercise:** Take the chatbot skeleton from module 7 and add: (1) a Pydantic-validated JSON reply with a `sources` list, (2) a grounding check that each source quote appears in the policy, (3) a daily token budget that refuses to answer past a limit, (4) structured JSON logging of every call. Then deliberately break each part and watch the harness catch it.

# @quiz

? What is the "harness" in harness engineering?
- The GPU cluster
+ Everything around the model: context assembly, tools, validation, permissions, retries, logging and evals
- The model's training data
- The tokenizer
! Reliability comes largely from the system around the model.

? How should you treat model output in your program?
- As trusted, verified data
+ As untrusted input to validate (schema, business rules, grounding) before use
- As always correct if temperature is 0
- As code to execute directly
! Validate before acting; sandbox anything executable.

? To benefit from prompt caching you should…
- Change the system prompt on every call
+ Keep the large stable prefix identical and put variable content after it
- Put the user question first
- Disable logging
! Caches match on an identical prefix.

? A tool call sends an email. A network error occurs and the call is retried. What protects against sending two emails?
- Higher temperature
+ Idempotency (e.g. an idempotency key) on side-effecting operations
- A longer prompt
- Retrying faster
! Retries are only safe when operations are idempotent.

? Which is the safest place for an API credential used by a tool?
- In the system prompt
+ Held by your tool/execution layer, never visible to the model
- In the user message
- In the conversation history
! The model should name actions; credentials stay in code.

? Tokens per request suddenly triple after a deployment. What is the most likely cause?
+ A bug such as bloated context or a runaway loop — investigate traces
- The model got smarter
- Users are happier
- Temperature changed itself
! Alert on changes in token usage; it often signals harness faults.

? What does context engineering aim for?
- Using the entire context window
+ Assembling the smallest set of high-signal information that makes the right next step likely
- Writing very long system prompts
- Disabling retrieval
! Quality depends on relevance and clarity, not quantity.
