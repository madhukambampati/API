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

You will see these words constantly. Skim now; the glossary has the full list and each term is explained properly later.

- **Parameter / weight** — one adjustable number inside a model. Frontier models have billions to trillions.
- **Token** — the unit of text a model reads and writes: a word, part of a word, or punctuation. "Unbelievable" might be 3 tokens. Roughly 4 characters or ¾ of a word in English.
- **Context window** — the maximum number of tokens the model can consider at once (prompt + conversation + its own answer).
- **Prompt** — the input you give a model.
- **Inference** — running a trained model.
- **Embedding** — a vector (list of numbers) capturing meaning; similar meanings → nearby vectors.
- **Hallucination** — a fluent but false or unsupported output.
- **Temperature** — a setting controlling randomness of output.
- **RAG** — Retrieval-Augmented Generation: look up relevant documents, then have the model answer using them.
- **Agent** — an LLM that plans, calls tools and takes multiple steps toward a goal.
- **Eval** — a systematic test of how well an AI system performs.
- **Harness** — everything around the model (tools, memory, guardrails, retries, logging) that makes it reliable.

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
- Humans write explicit if-then rules for every case
+ Software that learns patterns from example data instead of following only hand-written rules
- A database that stores answers to every possible question
- Any program that uses a GPU
! Machine learning adjusts a model's parameters from data. Hand-written rules are classic programming.

? What is the difference between training and inference?
- Training is using the model; inference is building it
+ Training learns the parameters (expensive, done once); inference uses the frozen model to make predictions
- They are the same thing with different names
- Inference only happens on phones
! API calls you make are inference. The model's weights are not changing while you use it.

? An LLM generates text by…
- Looking up the full answer in a database
- Running a rule for every grammar pattern
+ Predicting one token at a time based on the tokens so far
- Copying the nearest training document
! It repeatedly predicts a probability distribution over the next token and picks from it.

? Why do we test models on data they were not trained on?
- To make training faster
+ To check they generalise rather than just memorise (overfit) the training data
- Because test data is always larger
- To reduce the model size
! Performance on unseen data is what matters in real use.

? Which is a typical task for an AI engineer (as opposed to a research scientist)?
- Inventing a new neural network architecture
+ Building reliable products on top of existing models, with retrieval, tools, evals and guardrails
- Manufacturing GPUs
- Labelling every training example by hand
! AI engineers build systems around models; research scientists create new methods.

? A "token" is…
- A paid API credit
+ A chunk of text (word, sub-word or punctuation) that the model reads and writes
- A security password
- A single neuron
! Models see tokens, not characters or words. Context limits and pricing are measured in tokens.
