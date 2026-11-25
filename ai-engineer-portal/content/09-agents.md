---
title: Agentic Systems
summary: Tools, planning, memory, multi-agent patterns and the agent loop — when to build agents, how, and how to keep them under control.
time: 4.5 hours
level: Advanced
outcomes:
  - Distinguish workflows from agents and choose the simplest design that works
  - Build an agent loop with tools, a step budget and error handling
  - Design planning, memory and context strategies for longer tasks
  - Apply multi-agent patterns, MCP and human-in-the-loop controls appropriately
---

# What is an agent?

An **agent** is an LLM that, in a loop, decides what to do next, takes actions through tools, observes the results, and continues until the task is done.

```diagram
        ┌────────────────────────────────────────────┐
        │                                            ▼
 goal ─►│  THINK/DECIDE ─► ACT (call a tool) ─► OBSERVE (result) ─┐
        │      ▲                                                  │
        │      └──────────────── update context ◄─────────────────┘
        └─ stop when: goal met · step budget used · needs a human
```

## Workflows versus agents

| | **Workflow** | **Agent** |
| --- | --- | --- |
| Control flow | Fixed in *your code* | Chosen by the *model* at runtime |
| Predictability | High | Lower |
| Cost / latency | Low, bounded | Higher, variable |
| Best for | Known, repeatable steps | Open-ended problems where the steps can't be pre-written |

Common workflow patterns (all simpler than agents):

- **Prompt chaining** — step A's output feeds step B.
- **Routing** — classify input, send to a specialised prompt/tool.
- **Parallelisation** — run independent subtasks at once, or vote across runs.
- **Orchestrator–workers** — a model splits a task, workers do the pieces, results are merged.
- **Evaluator–optimiser** — one model drafts, another critiques, loop until good.

> **Key idea:** Use the **simplest** thing that works. Try a single prompt → add retrieval → add a fixed workflow → only then an agent. Every step up buys flexibility and costs predictability, money and debuggability.

## When an agent is appropriate

- The path to the answer isn't known in advance (debugging, research, data analysis).
- Mistakes are recoverable or reviewed by a human.
- The value of the task justifies the extra cost and latency.
- You can **verify** results — with tests, checks or a rubric.

## When it is not

- A fixed pipeline would do. (Most business automations.)
- Errors are catastrophic and irreversible and no human reviews.
- You haven't yet built evals. (You won't know if it works.)

# Anatomy of an agent

Five parts: **model**, **instructions**, **tools**, **memory/context**, and the **loop with its guardrails**.

## 1. Model

Reasoning-capable models plan and recover from errors better. Use a stronger model to plan and smaller ones for routine steps if cost matters.

## 2. Instructions

The system prompt defines goal, boundaries, tool-use guidance, stopping rules and escalation. Be explicit about when to **stop and ask** rather than guess.

## 3. Tools

Tools are the agent's hands and eyes. Common categories:

| Category | Examples |
| --- | --- |
| **Read / retrieve** | search, RAG, database query, read file, web fetch |
| **Compute** | code interpreter, calculator, data analysis |
| **Act** | send email, create ticket, write file, call internal API |
| **Observe the world** | take screenshot, read browser DOM, run tests |
| **Delegate** | call another agent |

Design guidance (reprise of module 7, now with higher stakes):

- Few, clear, **non-overlapping** tools beat dozens of similar ones.
- Descriptions say *when* and *when not* to use the tool.
- Return **compact, informative** results; paginate large ones.
- Make errors **actionable** so the model can self-correct.
- Separate **read-only** from **side-effecting** tools; gate the latter.

## 4. Memory and context

The context window is the agent's working memory. Long tasks outgrow it, so you need strategies (next lesson).

## 5. The loop and its guardrails

A minimal agent in code — compare with the tool loop in module 7; the difference is mostly **budgets, logging and stop rules**:

```python
import json, time
import anthropic

client = anthropic.Anthropic()
MODEL = "claude-sonnet-5-5"

def run_agent(goal, tools, registry, system, max_steps=12, max_seconds=120):
    messages = [{"role": "user", "content": goal}]
    started = time.time()
    for step in range(max_steps):
        if time.time() - started > max_seconds:
            return {"status": "timeout", "messages": messages}
        resp = client.messages.create(model=MODEL, max_tokens=1500, system=system,
                                      tools=tools, messages=messages)
        messages.append({"role": "assistant", "content": resp.content})

        if resp.stop_reason != "tool_use":                         # model says it's done
            text = "".join(b.text for b in resp.content if b.type == "text")
            return {"status": "done", "answer": text, "steps": step + 1}

        results = []
        for b in resp.content:
            if b.type != "tool_use":
                continue
            print(f"step {step+1}: {b.name}({json.dumps(b.input)[:80]})")   # trace every action
            try:
                out = registry[b.name](**b.input)
                results.append({"type": "tool_result", "tool_use_id": b.id, "content": str(out)[:4000]})
            except Exception as e:
                results.append({"type": "tool_result", "tool_use_id": b.id,
                                "content": f"Tool error: {e}", "is_error": True})
        messages.append({"role": "user", "content": results})
    return {"status": "max_steps", "messages": messages}
```

Essential guardrails in those 30 lines: **step cap**, **time cap**, **output truncation**, **error feedback** and **tracing**.

# Planning, memory and context

## Planning

- **Implicit planning** — a capable reasoning model plans internally.
- **Explicit plan** — ask the agent to write a numbered plan first, then execute step by step, ticking off items and re-planning when reality differs. A visible plan is easy to inspect, log and show to users.
- **Plan–execute–verify** — after each phase, check the result against the goal ("did the tests pass?") before moving on.

## Reflection and self-correction

Let the agent examine its own result: run the code, read the error, fix, retry. The strongest agents have a **verifier** in the loop: unit tests, a schema validator, a rubric, a second model, or a human. *Verification beats self-assessment*: a model saying "looks good" is weak evidence; a passing test is strong evidence.

## The three kinds of memory

| Type | What | Implementation |
| --- | --- | --- |
| **Short-term** | The current conversation and tool results | The context window |
| **Working / scratchpad** | Plans, notes, intermediate results for the current task | A file or state object the agent reads and writes |
| **Long-term** | Facts and preferences across sessions | A store (database, files, vector index) searched when relevant |

## Managing context on long tasks

Context fills up with tool outputs. Tactics:

- **Truncate and summarise** large tool results; keep full text outside the context and fetch on demand.
- **Compaction**: when nearing the limit, summarise earlier steps into a compact note and continue.
- **Notes to self**: have the agent maintain a progress file (done / next / decisions) it re-reads after compaction.
- **Sub-agents with clean contexts**: delegate a messy subtask; get back only a short result.
- **Just-in-time retrieval**: load details when needed (search, grep) instead of preloading everything.

> **Key idea:** Context is a budget. Every token in the window competes for the model's attention. The best agents are the ones whose context holds exactly what the next decision needs.

# Multi-agent systems, MCP and human control

## Multi-agent patterns

| Pattern | How it works | Use when |
| --- | --- | --- |
| **Orchestrator + workers** | A lead agent decomposes the task; specialised workers run (often in parallel); lead merges | Research, large code changes, broad searches |
| **Pipeline of specialists** | Planner → coder → reviewer → tester | Clear stages with different instructions |
| **Debate / critic** | Agents argue or critique; a judge decides | Reducing blind spots in analysis |
| **Hand-off / routing** | A triage agent passes the conversation to the right specialist | Customer support with distinct domains |

Trade-offs: multi-agent systems can explore in parallel and keep contexts clean, but they use **many more tokens**, are harder to debug, and coordination can fail (duplicated work, contradictory conclusions, lost information in hand-offs). Start with one agent; split only when evals show a clear gain.

## Model Context Protocol (MCP)

**MCP** is an open standard for connecting models to tools and data. Instead of writing a custom integration for every app × every model, a **server** exposes tools/resources/prompts in a standard format, and any MCP-capable **client** (an assistant, IDE or your own agent) can use it.

```diagram
 your agent / assistant (MCP client) ◄──standard protocol──► MCP servers
                                                              ├─ GitHub    (issues, PRs)
                                                              ├─ Database  (read-only SQL)
                                                              └─ Docs / Drive / Slack …
```

Benefits: reuse, a growing ecosystem, clear boundaries. Cautions: an MCP server is *code with access* — only connect servers you trust, grant least privilege, and treat tool results as untrusted input.

## Human-in-the-loop

Autonomy should match risk.

| Risk of the action | Control |
| --- | --- |
| Read-only, reversible | Let the agent proceed |
| Reversible side effects (draft an email) | Proceed, show the result |
| Hard to reverse (send, pay, delete, deploy) | **Require human approval** before executing |
| Safety-critical | Don't automate end-to-end |

Add **checkpoints** (agent proposes a plan; human approves), **dry-run modes**, and clear **audit logs** of every action.

## Common agent failure modes

- **Loops** — repeating the same failing action. Fix: step caps, detect repeats, change strategy.
- **Premature "done"** — claiming success without verifying. Fix: required verification step.
- **Tool misuse** — wrong tool or arguments. Fix: clearer tool descriptions, validation, examples.
- **Context overflow / drift** — forgets the goal midway. Fix: notes, compaction, restating the goal.
- **Over-eager actions** — does more than asked. Fix: explicit scope, approvals, least privilege.
- **Compounding errors** — a small early mistake poisons later steps. Fix: verify at each stage.
- **Prompt injection** via tool results or web pages — module 13.

> **Warning:** Success rates multiply. An agent that is 95% reliable per step is only ~60% reliable over 10 steps (0.95¹⁰). Long autonomous chains need verification at every stage.

# A worked design: research assistant

Task: "Compare three vector databases for our team and recommend one."

**Workflow-first thinking.** Can this be a fixed pipeline? Partially: search → read → extract → compare → write is a known shape. So build a workflow with **model-driven sub-steps** rather than a free-roaming agent:

1. **Plan** (model): list evaluation criteria and sub-questions.
2. **Research** (workers, parallel): for each product, search and read official docs; extract facts *with source URLs* into a fixed schema.
3. **Verify** (code + model): drop facts with no source; flag contradictions.
4. **Synthesise** (model): comparison table and recommendation, stating assumptions and uncertainty.
5. **Evaluate** (offline): rubric — are claims sourced? criteria covered? recommendation consistent with the table?

Where is autonomy genuinely needed? Step 2 — what to search for next depends on what was found — so *that* step may be a small agent with a tight step budget and read-only tools. Everything else is deterministic.

This hybrid — **deterministic skeleton, bounded agency inside** — is the most reliable shape for production agents.

> **Exercise:** Build the expense assistant from module 7 into an agent with a plan step, a max of 8 tool calls, a "total by category" tool, and a required final check that the reported total equals the sum of recorded expenses. Log every step. Then try to break it with ambiguous inputs.

# @quiz

? What is the key difference between a workflow and an agent?
- Workflows use no LLM
+ In a workflow your code fixes the control flow; in an agent the model decides the next step at runtime
- Agents are always cheaper
- Workflows cannot use tools
! Choose workflows when the steps are known; agents when they aren't.

? What is the best first step when designing an AI feature?
- Build a multi-agent system
+ Start with the simplest approach (single prompt, then retrieval, then workflow) and add agency only if needed
- Pick the biggest model
- Give the model every tool
! Complexity should be earned by measured need.

? Which guardrails belong in every agent loop?
+ A step limit, a time/cost budget, error handling and tracing of every action
- None; models stop themselves
- Only a longer prompt
- Disabling logging for speed
! Without limits, a stuck agent can loop and spend indefinitely.

? An agent is 95% reliable per step across 10 sequential steps. Roughly how reliable is the whole run?
- 95%
+ About 60%
- 100%
- 10%
! Probabilities multiply: 0.95^10 ≈ 0.60. Verify at each stage.

? Which action should require human approval?
- Reading a public web page
- Summarising a document
+ Sending an email to a customer or deleting production data
- Calculating a sum
! Approval should scale with irreversibility and risk.

? What does MCP provide?
+ A standard protocol for exposing tools and data to AI clients, avoiding bespoke integrations
- A faster GPU
- A new neural architecture
- A prompt template library
! Trusted servers + least privilege + treating results as untrusted input is the safe posture.

? Why can multi-agent designs be worse than a single agent?
- Agents can't talk to each other
+ They use many more tokens and add coordination failures and debugging difficulty
- They are always less accurate
- They cannot run in parallel
! Split only when evals show the benefit outweighs the overhead.
