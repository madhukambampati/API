---
title: AGI Frontiers & Your Career
summary: Where capabilities are heading, the open questions, how to stay current — and a practical plan to become hireable as an AI engineer.
time: 3 hours
level: Intermediate
icon: 🚀
outcomes:
  - Describe current frontier capabilities and honest limits without hype or doom
  - Explain AGI, scaling, reasoning, world models and alignment debates in plain terms
  - Build a durable learning system for a fast-moving field
  - Plan a portfolio, résumé and interview preparation for AI engineering roles
---

# Where capabilities are today

> **Warning:** This lesson describes the *shape* of the frontier, not specific model names or scores — those are out of date within months. For specifics, consult primary sources (Resources page).

## What frontier models do well

- Fluent writing, summarising, translation and explanation across domains.
- Coding: generating, explaining, debugging and refactoring — increasingly across whole repositories with tools and tests.
- Maths and science reasoning with extended "thinking".
- Reading documents, charts, screenshots and interfaces (multimodal).
- Operating tools and software through APIs — and sometimes through the screen, with a mouse and keyboard.
- Working on tasks that stretch over many steps and minutes-to-hours, with supervision.

## What they still do poorly

- **Reliability**: brilliant and brittle at once ("jagged" capabilities) — impressive on hard problems, surprising failures on easy ones.
- **Long-horizon autonomy**: errors compound; drifting from goals; weak self-verification.
- **Calibration**: confidence doesn't track correctness well.
- **Continual learning**: they don't learn from experience after training; memory is bolted on.
- **Grounded understanding** of the physical world, causality and novel situations.
- **Robustness to adversaries**: jailbreaks and prompt injection persist.
- **Real-world action under uncertainty** with real stakes.

## The practical frontier for engineers

> **Key idea:** The binding constraint is shifting from *"can the model do it?"* to *"can we specify the task, give it the right context and tools, verify the result, and keep it safe and affordable?"* That is exactly the skill set this course teaches.

Practical trends to watch (and build for):

- **Agents that do real work** — coding, research, operations, customer support — with verification and approvals.
- **Longer context and better memory.**
- **Computer use and browser agents.**
- **Cheaper, faster, smaller models** — capability per dollar keeps improving.
- **Standard protocols** (MCP and others) for tools and agent-to-agent communication.
- **Multimodal and realtime** voice and video.
- **Evals and observability as first-class engineering practice.**
- **On-device and open models.**

# What is AGI? The open questions

## Definitions

**AGI (artificial general intelligence)** has no single agreed definition. Common versions:

- A system that can perform **any intellectual task a human can**.
- A system that matches or exceeds **skilled humans at most economically valuable work**.
- Levels-based views that grade systems by *breadth* and *depth* of capability, treating "general" as a spectrum rather than a switch.

Because definitions differ, statements like "AGI by year X" are often talking past each other. Ask: *AGI by which definition, measured how?*

## The big debates (in plain language)

| Question | One view | Another view |
| --- | --- | --- |
| **Will scaling alone get us there?** | More data, compute and better training keep producing new abilities | Scaling hits limits; new ideas (memory, planning, world models, learning efficiency) are needed |
| **Do LLMs "understand"?** | They build useful internal models of the world from text | They are sophisticated pattern matchers without grounding |
| **Is reasoning real?** | Chain-of-thought and RL produce genuine multi-step problem solving | It is learned procedure-following that fails off-distribution |
| **How fast is progress?** | Rapid and possibly accelerating, e.g. via AI-assisted AI research | Gradual, bottlenecked by data, energy, hardware, evaluation and real-world deployment |
| **Do we need embodiment/world models?** | Text isn't enough for physical common sense | Multimodal training may be sufficient |
| **How should we handle risk?** | Serious catastrophic risks warrant strong precautions now | Present harms matter more; speculation distracts |

Reasonable people disagree — including experts. Be wary of anyone who is certain, in either direction.

## Capabilities and measurement

Benchmarks saturate quickly; new ones keep being created. Be sceptical of single numbers. Prefer evidence of **real-world task performance**, human-expert comparisons, and independent evaluations.

## Alignment and safety research (conceptually)

**Alignment** is making AI systems reliably do what people intend and value — including when they are very capable. Active areas:

- **Training for helpfulness, honesty and harmlessness** (RLHF, constitutional approaches, preference learning).
- **Interpretability**: understanding what is happening inside models.
- **Scalable oversight**: supervising systems that may exceed our ability to judge each output.
- **Robustness and red-teaming**: finding failures before deployment.
- **Evaluations for dangerous capabilities** (cyber, bio, autonomy) and responsible scaling policies.
- **Control and monitoring** of agents; sandboxing; human oversight.
- **Governance**: standards, audits, regulation, international coordination.

You don't need to resolve these debates to act well: **build verifiable, bounded, observable systems with humans accountable for consequential decisions.**

## Societal impact

Expect large effects on work (tasks change before jobs vanish; roles shift towards specifying, supervising and verifying AI), education, creative fields, information ecosystems and security. Engineers influence outcomes through what they choose to build and how carefully they build it.

# Staying current without drowning

AI news is a firehose of hype. Build a system.

## A durable knowledge stack

| Layer | Changes | Invest |
| --- | --- | --- |
| **Fundamentals** (maths, ML, transformers, evaluation, software engineering) | Years | Deeply — compounding returns |
| **Patterns** (RAG, agents, evals, harnesses, safety) | Months | Regularly |
| **Tools & frameworks** | Weeks | Just in time, lightly coupled |
| **Model names, prices, leaderboards** | Days | Look up when needed; never memorise |

## Habits

- **Read primary sources**: provider docs and changelogs, research papers (start with abstracts and figures), engineering blogs from teams who ship.
- **Build every week**: reproduce a paper idea, try a new model on your own eval, ship a tiny tool.
- **Maintain a personal eval set** for your own domain — the fastest way to judge any new model in minutes.
- **Keep notes** of what you tried, measured and concluded.
- **Teach**: write up what you learn; explaining exposes gaps.
- **Follow a few high-signal people and sources**, not hundreds.
- **Apply a hype filter**: Who benefits from this claim? Is there a reproducible demo? What does it fail at? Where's the eval?

## How to read a paper

1. Abstract and figures → is it relevant?
2. Introduction → what problem and what claim?
3. Method (skim) → what exactly is new?
4. Experiments → compared against what baselines, on what data, with what caveats?
5. Limitations → what *didn't* work?

# Your career: becoming an AI engineer

## The roles

| Role | Focus |
| --- | --- |
| **AI / LLM application engineer** | Build products on models: prompting, RAG, agents, evals, harness |
| **ML engineer** | Train, tune and deploy models; data pipelines; MLOps |
| **Data scientist / analyst** | Analysis, experimentation, classic ML, insights |
| **Research engineer / scientist** | New methods, training at scale; usually advanced degrees or strong research record |
| **AI product manager** | Define problems, evals and success for AI products |
| **AI safety / trust engineer** | Red-teaming, evaluation, policy, guardrails |

This course targets the first row and gives you the base for the rest.

## What employers look for

1. **Solid software engineering** — Python, APIs, testing, Git, debugging, system design. (AI engineering is engineering first.)
2. **Evidence you can ship AI that works**: projects with **evals** and honest results.
3. **Judgement**: knowing when *not* to use an LLM, spotting failure modes, thinking about cost, safety and users.
4. **Communication**: explaining trade-offs clearly to non-experts.
5. **Learning velocity**: a visible track record of picking up new tools quickly.

## Build a portfolio that proves it

Complete the projects on the [Projects](#/projects) page and publish them on GitHub. For each project, write a README with:

- **The problem** and who it's for.
- **The architecture** (a diagram).
- **The eval**: dataset, metrics, baseline vs final numbers.
- **Failure analysis**: what still goes wrong and why.
- **Cost and latency** figures.
- **How to run it** in five minutes.

A project with a real eval table is worth ten with a flashy demo.

## Résumé and profile

- Lead with *outcomes and measurements*: "Raised answer accuracy from 62% to 88% on a 120-question eval by adding hybrid retrieval and reranking; cut cost per query 40% via caching."
- List skills you can demonstrate; link repos.
- Avoid buzzword soup; specificity signals credibility.
- Keep a short public write-up per project.

## Interview preparation

**Coding and fundamentals**: Python fluency, data structures, writing a small API client, parsing JSON, handling errors. Practise explaining your code aloud.

**AI concepts you should be able to explain clearly:** tokens and context; how LLMs are trained; temperature; embeddings and cosine similarity; the transformer in two minutes; RAG and its failure modes; hallucination and mitigations; agents vs workflows; fine-tuning vs RAG vs prompting; evaluation methods and LLM-as-judge pitfalls; prompt injection; cost and latency optimisation.

**System design prompts** (practise whiteboarding):

- "Design a customer-support assistant over our documentation."
- "Design a coding agent that fixes failing tests safely."
- "How would you evaluate and monitor an LLM feature in production?"
- "Reduce this feature's cost by 70% without hurting quality."

Structure answers: **clarify requirements → baseline → architecture → evals → failure modes and safety → cost/latency → rollout and monitoring → trade-offs.** That structure is the course in a sentence.

**Behavioural**: prepare stories about debugging a hard failure, changing your mind after measuring, and handling an ethical or safety concern.

## A 90-day plan after this course

| Days | Goal |
| --- | --- |
| 1–30 | Finish all projects; publish them with README and eval tables |
| 31–60 | Build one original project solving a real problem for real users (even five of them); write it up publicly |
| 61–90 | Contribute to an open-source AI tool; practise system-design interviews; apply, and iterate based on feedback |

## Parting principles

1. **Measure, don't guess.**
2. **Start simple; add complexity only when evidence demands it.**
3. **Verify; never trust fluent output.**
4. **Least privilege; limit blast radius.**
5. **Keep humans accountable for what matters.**
6. **Stay curious and keep building.**

You now have the full path — from "what is AI?" to designing, evaluating, securing and shipping AI systems. The rest is practice. Take the final quiz, finish the projects, and claim your certificate.

# @quiz

? Which is the best description of the "frontier" challenge for AI engineers today?
- Models cannot produce text
+ Specifying tasks, providing context and tools, verifying results and keeping systems safe and affordable
- Finding a bigger GPU
- Memorising model names
! The skills of context, evaluation and harness engineering are the durable ones.

? Why is "AGI by year X" often unhelpful as a claim?
+ There is no single agreed definition, so people measure different things
- AGI is already agreed to exist
- Years are inaccurate
- Models can't be dated
! Ask: by which definition and measured how?

? What is a good way to judge a brand-new model quickly?
- Read social-media hype
+ Run it on your own eval set for your domain
- Check its parameter count only
- Ask it if it is good
! A personal eval makes comparison fast and objective.

? Which layer of knowledge should you invest in most deeply because it lasts?
- Model names and prices
+ Fundamentals: software engineering, ML, evaluation, transformers
- The newest framework syntax
- Leaderboard positions
! Fundamentals compound; tools change monthly.

? What makes an AI portfolio project most convincing to employers?
- A flashy demo with no measurements
+ A clear problem, architecture, eval results vs a baseline, failure analysis and cost figures
- Using the biggest model
- A long README with buzzwords
! Evidence of measured results shows engineering judgement.

? Which answer structure suits an AI system-design interview?
+ Clarify requirements → baseline → architecture → evals → failure modes and safety → cost/latency → rollout and monitoring
- Start with the biggest model and stop
- Only discuss prompts
- Skip evaluation
! It mirrors the whole course: measure, secure, operate.
