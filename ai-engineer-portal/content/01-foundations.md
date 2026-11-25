---
title: Foundations
summary: What AI, machine learning and LLMs actually are — the mental models and vocabulary everything else builds on.
time: 2.5 hours
level: Beginner
outcomes:
  - Explain the difference between AI, machine learning, deep learning and generative AI
  - Describe how a model learns from data, and the difference between training and inference
  - Read AI news and documentation without getting lost in jargon
  - Describe what an AI engineer does and where you are headed in this course
---

# What is AI, really?

Artificial intelligence is a broad label for software that performs tasks we normally associate with human intelligence: recognising images, understanding language, making decisions, planning. The label has been stretched over seventy years, so it helps to see the nested layers.

```diagram
┌──────────────────────────────────────────────────────────┐
│ Artificial Intelligence   (any "intelligent" software)    │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Machine Learning   (learns patterns from data)      │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │ Deep Learning   (many-layer neural networks)  │  │  │
│  │  │  ┌────────────────────────────────────────┐  │  │  │
│  │  │  │ Generative AI / LLMs  (create new       │  │  │  │
│  │  │  │ text, images, code, audio)              │  │  │  │
│  │  │  └────────────────────────────────────────┘  │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

## Two ways to build "intelligent" software

1. **Rules (classic programming).** A human writes explicit logic: *if the email contains "free money", mark it as spam.* Predictable, but it breaks the moment reality is messier than the rules.
2. **Learning (machine learning).** You show the computer thousands of examples (spam and not-spam) and it works out its own patterns. It handles messiness well, but it is probabilistic: sometimes it is wrong, and you have to measure how often.

> **Key idea:** Modern AI is mostly *pattern learning from data*, not hand-written rules. That is why testing, data quality and evaluation matter so much — you cannot read a model's "source code" to see what it will do.

## A very short history

| Era | What happened |
| --- | --- |
| 1950s | The field is named. Early programs play checkers and prove theorems. |
| 1960s–80s | Rule-based "expert systems". Hype, then the first "AI winters" when promises were not met. |
| 1990s–2000s | Statistical machine learning takes over: spam filters, recommendations, search ranking. |
| 2012 | Deep neural networks win image-recognition contests by a wide margin; GPUs make big networks practical. |
| 2017 | The **transformer** architecture is published ("Attention Is All You Need"). |
| 2018–2022 | Scaling transformers on huge text datasets yields GPT-style language models; ChatGPT (late 2022) brings them to the public. |
| 2023–now | Models gain tools, vision, long context and reasoning; the focus shifts from "can it talk?" to "can we build reliable systems on it?" |

## Narrow AI versus general AI

Every AI system you can use today is **narrow**: very capable across many tasks, but not a general mind. **AGI** (artificial general intelligence) usually means a system that can learn and perform any intellectual task a human can. Whether, when and how we get there is debated; we cover it in the final module. For an engineer, the practical question is always: *what can this system reliably do today, and how do I prove it?*

> **Try it:** Pick three apps you use daily. For each, decide: is it rules, classic ML, or generative AI? (A calculator is rules. A photo app's face grouping is ML. A chat assistant is generative AI.)

> **Solution:**
> Some typical answers:
>
> - **Calculator, alarm clock, spreadsheet formulas** — rules. Exact, predictable, written by a programmer.
> - **Email spam filter, "recommended for you" lists, face grouping in photos, bank fraud alerts** — classic machine learning. They learned patterns from millions of examples and make a prediction or ranking.
> - **Chat assistants, "help me write" buttons, AI image generators, live caption translation** — generative AI. They *produce new content*.
>
> Many apps mix all three: a banking app uses rules for your balance, ML for fraud scoring, and generative AI for its help chat. Spotting which part is which is exactly the judgement you will build in this course.

# How machines learn

Learning in ML means **adjusting numbers until the outputs get better**. That is the whole trick; everything else is detail about which numbers, which data and how to adjust them.

## The core loop

```diagram
 data (examples) ──► model (lots of adjustable numbers) ──► prediction
                              ▲                                 │
                              │                                 ▼
                      adjust numbers  ◄── loss (how wrong was it?)
```

1. **Model** — a function with many adjustable numbers called **parameters** (or weights).
2. **Prediction** — feed an example in, get an output.
3. **Loss** — a single number measuring how wrong the prediction was.
4. **Update** — nudge parameters in the direction that reduces the loss (this is *gradient descent*, covered in module 4).
5. Repeat across millions of examples.

## Training versus inference

- **Training** — the expensive phase where parameters are learned. Needs lots of data and compute. Done once (or periodically) by model builders.
- **Inference** — using the finished model to make predictions. This is what happens every time you call an API. Parameters are frozen.

As an AI *engineer* you will almost always work at the inference side: choosing models, giving them the right inputs, and building systems around them. You rarely train from scratch — but you must understand training to understand model behaviour.

## Three learning styles

| Style | Data | Example |
| --- | --- | --- |
| **Supervised** | Inputs *with* correct answers (labels) | Emails labelled spam/not-spam → classify new email |
| **Unsupervised** | Inputs only, no labels | Group customers by behaviour; find anomalies |
| **Reinforcement** | A reward signal after actions | A game agent; fine-tuning chat models from human feedback |

Large language models use a clever mix: **self-supervised** learning. The "label" is simply the next word in a sentence, which exists in raw text for free. That is why they could be trained on a huge fraction of the internet.

## Generalisation: the real goal

A model that memorises its training data is useless. The goal is to perform well on **new** data it has never seen. Two failure modes you will meet constantly:

- **Overfitting** — memorises training data, fails on new data.
- **Underfitting** — too simple to capture the pattern at all.

That is why we always hold back some data for testing — more on this in module 3.

# The AI landscape today

AI is not one thing. Knowing the map stops you from using the wrong tool.

## What models can take in and produce

- **Text → text** (LLMs): chat, writing, summarising, coding, extraction, translation.
- **Image → text** (vision-language models): describe, read documents, answer questions about charts.
- **Text → image / video / audio**: generative media models.
- **Speech ↔ text**: transcription and voice synthesis.
- **Embeddings**: turn anything into a list of numbers so similar things sit close together; powers search and recommendations.
- **Classic predictive ML**: tabular data → forecast, risk score, churn probability. Still the right answer for many business problems, and often cheaper and more reliable than an LLM.

Modern frontier models are **multimodal**: one model handles text, images and increasingly audio and video.

## The layers of the ecosystem

```diagram
 Applications        chat assistants, copilots, agents, search, automation
 ─────────────────────────────────────────────────────────────────────────
 Tooling / harness   prompts, retrieval, tools, memory, evals, guardrails   ◄── where AI engineers work
 ─────────────────────────────────────────────────────────────────────────
 Models              closed (via API) and open-weight (download & run)
 ─────────────────────────────────────────────────────────────────────────
 Infrastructure      GPUs/TPUs, cloud, inference servers, vector databases
```

## Closed versus open models

| | Closed / API models | Open-weight models |
| --- | --- | --- |
| Access | Rent through an API | Download and run yourself |
| Strength | Usually the most capable; zero infrastructure | Control, privacy, customisation, predictable cost at scale |
| Weakness | Data leaves your environment; vendor changes | You run the infrastructure; usually a step behind the frontier |

Neither is "better". Module 12 shows how to choose.

> **Warning:** Names, prices and rankings of models change every few months. Learn the *concepts* in this course; for current model names and prices always check the provider's official documentation.

# Core vocabulary

You will see these words constantly. **Don't try to master them now** — read them once so they feel familiar. Each one gets its own lesson later (the module is noted in brackets), and every term is also in the [Glossary](#/glossary).

- **Parameter / weight** — one adjustable number inside a model. Frontier models have billions to trillions. *(module 4)*
- **Token** — the unit of text a model reads and writes: a word, part of a word, or punctuation. "Unbelievable" might be 3 tokens. Roughly 4 characters or ¾ of a word in English. *(module 4)*
- **Context window** — the maximum number of tokens the model can consider at once (prompt + conversation + its own answer). *(module 5)*
- **Prompt** — the input you give a model. *(module 6)*
- **Inference** — running a trained model.
- **Embedding** — a vector (list of numbers) capturing meaning; similar meanings → nearby vectors. *(modules 2 and 4)*
- **Hallucination** — a fluent but false or unsupported output. *(module 5)*
- **Temperature** — a setting controlling randomness of output. *(modules 2 and 5)*
- **RAG** — Retrieval-Augmented Generation: look up relevant documents, then have the model answer using them. *(module 8)*
- **Agent** — an LLM that plans, calls tools and takes multiple steps toward a goal. *(module 9)*
- **Eval** — a systematic test of how well an AI system performs. *(module 10)*
- **Harness** — everything around the model (tools, memory, guardrails, retries, logging) that makes it reliable. *(module 11)*

## The basic LLM flow

```diagram
 your text ─► tokenizer ─► token IDs ─► transformer layers ─► probabilities for next token
                                                                     │
                       append chosen token to the text ◄─────────────┘   (repeat until done)
```

An LLM produces its answer **one token at a time**, each time predicting a probability distribution over what comes next and picking from it. Everything impressive — and everything unreliable — about LLMs flows from this simple mechanism.

# Your path: what an AI engineer does

An **AI engineer** builds products and systems *using* models rather than inventing new model architectures. That is different from a research scientist (who creates new methods) and an ML engineer (who trains and deploys custom models), though the roles overlap.

## A typical week

- Turn a vague business problem ("support is slow") into a measurable AI task.
- Choose a model and write prompts; add retrieval or tools where needed.
- Build **evals** so you know whether a change made things better or worse.
- Add guardrails, logging, cost controls and fallbacks so it survives production.
- Watch real usage, find failures, improve.

## Skills this course builds, in order

1. **Mental models** (this module) → 2. **Python & math** → 3. **ML basics** → 4. **Deep learning & transformers** → 5. **LLMs** → 6. **Prompting** → 7. **APIs & tool use** → 8. **RAG** → 9. **Agents** → 10. **Evals** → 11. **Harness engineering** → 12. **Fine-tuning & open models** → 13. **Production, safety & ethics** → 14. **Frontiers & career**.

## How to study

- **Type the code.** Do not just read it. Run every example and change something.
- **Do the projects.** They are on the [Projects](#/projects) page — each one maps to modules you have finished.
- **Take the quizzes seriously.** Wrong answers explain themselves; that is where learning happens.
- **Keep a notes file** of "things that surprised me". It becomes your interview material.

> **Tip:** The one habit that separates good AI engineers from average ones: *they measure.* Whenever you change a prompt or a pipeline, ask "better according to what?" Module 10 is built around that question.

# @quiz

? Which statement best describes machine learning?
- Programmers write an explicit rule for every situation
+ Software that learns patterns from example data
- A database that stores an answer for every question
- Any program that runs on a fast graphics card
! ML adjusts a model's parameters from data. Hand-written rules are classic programming.

? You call a model through an API and get an answer. Which phase is that?
- Training, because the model learns from you
+ Inference, because the frozen model makes a prediction
- Fine-tuning, because your prompt changes the weights
- Pre-training, because it reads text from the internet
! Weights do not change when you use a model. Using a trained model is inference.

? How does an LLM produce its answer?
- It retrieves the closest complete answer from a database
+ It predicts one token at a time, each based on what came before
- It runs a grammar rule for every sentence pattern it knows
- It finds the training document most similar to your question and copies it
! Generation repeats: predict a probability for every next token, pick one, append it, repeat.

? A model scores 99% on its training data but 70% on new data. What happened?
- It underfit because the model was too simple
+ It overfit by memorising the training examples
- The new data must contain a labelling mistake
- It needs a bigger GPU to reach 99% on new data
! A big gap between training and new-data performance is the classic sign of overfitting.

? A team says "let's use AI for support". What should an AI engineer do first?
- Pick the largest available model and connect it straight to the help desk
+ Define a measurable goal first
- Train a new neural network architecture from scratch
- Collect every document the company has ever written
! Defining a measurable task comes first; without it you cannot tell whether anything works.

? Which app feature is most likely generative AI rather than classic machine learning?
- A bank flagging a payment as possible fraud
- A shop ranking products you are likely to buy next
+ An email app drafting a reply to a message for you
- A photo app grouping pictures by the faces in them
! Generative AI produces new content (a drafted reply). Fraud scores, rankings and grouping are predictions.
