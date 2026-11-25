---
title: LLMs
summary: How large language models are trained, what their settings do, how to choose one — and, crucially, where they fail.
time: 3.5 hours
level: Intermediate
outcomes:
  - Describe the stages of building a modern assistant: pre-training, instruction tuning, preference tuning
  - Use context windows, temperature and other parameters deliberately
  - Choose a model by capability, cost, latency and constraints
  - Recognise hallucinations and other failure modes and know the mitigations
---

# How LLMs are built

A modern assistant is made in stages. Knowing them explains both its talents and its quirks.

```diagram
 raw text (web, books, code)
        │  Stage 1: PRE-TRAINING   (predict the next token; months, thousands of GPUs)
        ▼
 BASE MODEL — knows language & facts, but just continues text
        │  Stage 2: SUPERVISED FINE-TUNING (SFT) on example instructions → good answers
        ▼
 INSTRUCTION-FOLLOWING MODEL
        │  Stage 3: PREFERENCE TUNING (RLHF / DPO / RL from AI or verifiable feedback)
        ▼
 ASSISTANT — helpful, safer, follows format, can use tools, can reason
```

## Stage 1: Pre-training

The model reads trillions of tokens and learns to predict the next one. To do that well it must absorb grammar, facts, reasoning patterns, code and style. Output: a **base model**. Ask a base model "What is the capital of France?" and it may continue with more quiz questions — it completes text, it doesn't *answer*.

## Stage 2: Supervised fine-tuning

Humans (and increasingly other models) write thousands of example conversations — instruction in, ideal answer out. Training on these teaches the format and behaviour of an assistant.

## Stage 3: Preference and reinforcement tuning

Next, humans (or AI judges) rank alternative responses and the model is trained to produce the preferred kind. Variants: **RLHF** (reinforcement learning from human feedback), **DPO**, and **reinforcement learning on verifiable tasks** (maths, code that passes tests), which has driven today's **reasoning models**. This is also where safety behaviour — refusing harmful requests, being honest about uncertainty — is shaped.

## Reasoning models

Some models are trained to produce an internal chain of thought before the final answer, spending extra tokens "thinking". They are noticeably better at maths, code and multi-step problems, at the price of higher latency and cost. Many APIs let you set how much thinking budget to allow.

## Knowledge cutoff

A model's knowledge stops at its training cutoff. It does not know about later events unless you provide them in the prompt or give it search tools. Never rely on a model's memory for fast-changing facts.

> **Key idea:** An LLM is a compressed statistical model of its training text, then shaped to behave as an assistant. It has **knowledge** (patterns absorbed) but no live access to the world and no guarantee of truth.

# Working with LLMs: tokens, context and parameters

## Context window

The **context window** is everything the model can "see" in one request: system prompt + conversation history + any documents you include + the answer it is writing. It is measured in tokens, and modern models range from tens of thousands to over a million.

- The model is **stateless**. It remembers nothing between API calls; to hold a conversation you re-send the history every time.
- More context = more cost and latency, and quality can drop for details buried in the middle of very long inputs ("lost in the middle").
- Context is your most precious resource: *put the right information in, leave the rest out.* Module 11 expands this as **context engineering**.

## Sampling parameters

After computing probabilities for the next token, the system must pick one.

| Parameter | What it does | Typical use |
| --- | --- | --- |
| **temperature** | Reshapes probabilities. 0 ≈ always pick the top token; higher = more varied | 0–0.3 for extraction/code/classification; 0.7–1 for brainstorming/writing |
| **top_p** (nucleus) | Only sample from the smallest set of tokens whose probabilities add to p | Alternative way to trim unlikely tokens |
| **max_tokens** | Hard cap on output length | Always set it; protects cost |
| **stop sequences** | Stop generating when a string appears | Structured output delimiters |

> **Try it:** Open the [Playground](#/playground) and slide the temperature. Watch how probability moves from the top candidate to the rest.

Even at temperature 0, outputs are *mostly* but not perfectly deterministic (hardware and batching effects). Design systems that tolerate small variation.

## The messages format

Chat APIs share one structure:

```json
{
  "system": "You are a concise support assistant for Acme.",
  "messages": [
    {"role": "user", "content": "How do I reset my password?"},
    {"role": "assistant", "content": "Go to Settings → Security → Reset."},
    {"role": "user", "content": "And if I lost my phone?"}
  ]
}
```

- **System prompt**: standing instructions — role, rules, format, tone.
- **User** messages: the input. **Assistant** messages: prior model replies.
- Tool calls and results are also messages (module 7).

## Cost, latency, throughput

- **Cost** = input tokens × input price + output tokens × output price. Output tokens usually cost several times more than input.
- **Latency** has two parts: time-to-first-token (prompt processing) and tokens-per-second (generation). Long outputs are slow.
- **Rate limits** cap requests or tokens per minute; plan for `429` errors.

Estimate costs *before* you build — the [Playground](#/playground) has a calculator.

# Choosing a model

There is no best model, only the best fit for a task and its constraints.

## Axes to compare

| Axis | Questions |
| --- | --- |
| **Capability** | Does it pass *your* eval? (Not a leaderboard.) |
| **Cost** | Price per million input / output tokens at your volume |
| **Latency** | Is a 20-second answer acceptable? Is it interactive? |
| **Context length** | Do your documents fit? |
| **Modalities** | Need images, audio, PDFs? |
| **Tool use / structured output** | Reliable function calling? |
| **Privacy & compliance** | Can data leave your environment? Retention policy? |
| **Availability** | Rate limits, regions, vendor stability |

## Model tiers

Providers usually offer a family: a **small/fast/cheap** model, a **balanced** model, and a **large/most-capable** model (plus reasoning variants). A strong pattern is **routing**: send easy requests to the small model and escalate hard ones — or use a big model to design the approach and small ones to execute at scale.

## Decision procedure

1. Write down the task and 20+ real example inputs with ideal outputs (an eval — module 10).
2. Start with a capable mid/large model to see what is *possible*.
3. Try cheaper models on the same eval. Pick the cheapest that clears your quality bar.
4. Re-test periodically; new models appear constantly and prices fall.

> **Warning:** Public benchmarks are a rough hint, not proof. Models can be tuned to benchmarks, and your task is not the benchmark. **Your own eval is the only comparison that counts.**

# Limitations and failure modes

Understanding failure is what separates a demo from a product.

## Hallucination

A model produces plausible text, not verified truth. When it lacks knowledge it may invent facts, citations, API functions or quotes, in a confident tone. Causes: training rewards fluent continuation; knowledge is lossy; the prompt may push for an answer.

Mitigations:

- **Ground it**: supply source documents (RAG) and instruct "answer only from the context; say 'I don't know' otherwise."
- **Require citations** pointing to exact passages — and *verify* they exist.
- **Use tools** for facts, maths and code execution instead of memory.
- **Lower temperature**; add verification steps; use evals that include "should refuse" cases.
- **Human review** where the cost of error is high.

## Other failure modes

| Failure | What it looks like | Mitigation |
| --- | --- | --- |
| **Arithmetic / counting errors** | Wrong sums, miscounted items | Use a calculator/code tool |
| **Stale knowledge** | Out-of-date answers | Retrieval, search tool, date in prompt |
| **Sycophancy** | Agrees with your wrong premise | Ask for critique; neutral prompts |
| **Prompt sensitivity** | Small wording change flips answer | Evals; test paraphrases |
| **Long-context loss** | Misses a detail in the middle of a huge input | Retrieve or chunk; put key facts first/last |
| **Format drift** | Ignores requested JSON shape | Structured output / schema validation |
| **Prompt injection** | Text in a document hijacks the model | Treat all external text as untrusted (module 13) |
| **Bias** | Reflects societal biases in training data | Test across groups; policies; human oversight |
| **Non-determinism** | Different answers on re-run | Tolerate variance; measure over many runs |
| **Over-refusal / under-refusal** | Refuses harmless tasks, or complies with harmful ones | Clear instructions; safety evals |

## A healthy mental model

Treat an LLM like a **very fast, widely-read, sometimes overconfident junior colleague**: brilliant at drafting, summarising, translating, brainstorming and routine reasoning; needs clear instructions, source material to cite, and review of anything consequential.

> **Common mistake:** Treating a fluent answer as a correct answer. Fluency is the one thing LLMs never lack.

# @quiz

? What is a "base model"?
- A model that has been fully safety-tuned
+ A pre-trained model that continues text but cannot follow instructions
- The cheapest tier in a provider's model family
- A small model that only handles source code
! Instruction following and assistant behaviour are added in later tuning stages.

? Why does a chat app re-send the conversation history on every API call?
- Providers charge less for repeated text
+ The model is stateless and only knows the current request
- The provider deletes the history after a day, so it must be uploaded again
- It makes responses stream faster to the user
! Nothing is remembered between calls; your application must supply the history each time.

? Which temperature suits extracting fields from invoices?
- 1.5, for variety
+ 0 to 0.3
- 2.0, for creativity
- It makes no real difference for extraction tasks
! Extraction should give the same answer every time, so low randomness is best.

? You must pick a model for your product. What is the most reliable method?
- Choose whichever model is currently at the top of a well-known public leaderboard
- Choose the model with the most parameters
+ Test candidates on your own eval; pick the cheapest that passes
- Choose the newest release from any provider
! Public benchmarks are hints. Your task-specific eval is the only comparison that counts.

? An assistant invents details about your company's refund policy. What is the most effective fix?
- Raise the temperature so it explores more
+ Supply the policy text and allow "I don't know"
- Tell it to "be accurate and never make anything up" in capital letters
- Shorten the system prompt to one sentence
! Grounding answers in supplied sources, with permission to abstain, sharply reduces invention.

? A key detail sits in the middle of a 300-page document you pasted in. What risk should you expect?
+ Details deep inside may be missed
- The model reads only the first word of each page
- Long inputs are free, so the model skips them
- The API always rejects requests that are longer than a hundred pages
! Quality can drop for information in the middle of huge contexts. Retrieve or restructure instead.
