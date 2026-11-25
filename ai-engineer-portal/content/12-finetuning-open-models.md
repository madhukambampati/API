---
title: Fine-tuning & Open Models
summary: When to fine-tune (and when not to), LoRA, running open-weight models locally, quantisation and serving — plus multimodal and speech basics.
time: 3.5 hours
level: Advanced
outcomes:
  - Decide between prompting, RAG and fine-tuning with a clear decision rule
  - Explain LoRA and how to prepare a fine-tuning dataset
  - Run an open-weight model locally and call it like an API
  - Understand quantisation, serving options and the open-vs-closed trade-off
---

# Prompt, RAG or fine-tune?

Fine-tuning is overused as a first reflex. Climb this ladder **in order** and stop when your eval passes:

```diagram
 1. Better prompt + examples        ← hours, free, reversible
 2. Add RAG / tools                 ← days; fixes missing KNOWLEDGE
 3. Better model / reasoning budget ← minutes; fixes missing CAPABILITY
 4. Fine-tune                       ← weeks; fixes consistent BEHAVIOUR / STYLE / COST
 5. Train from scratch              ← almost never (research labs and huge companies)
```

## What fine-tuning is good for

- **Consistent style, tone or format** that prompts struggle to hold.
- **Domain vocabulary and conventions** (legal, medical coding).
- **Narrow tasks at scale**: a small tuned model can match a big model's quality on one task at a fraction of cost and latency.
- **Teaching tool-use patterns** or a house workflow.
- **Distillation**: train a small model on the outputs of a large one.

## What it is poor at

- **Injecting facts.** Models tune poorly on new knowledge, can't cite sources, and the facts go stale — use RAG.
- **Fixing a model that is simply too weak** for the task.
- **Anything you haven't measured.** Without an eval you can't tell if tuning helped.

## Decision rule

> **Key idea:** *RAG gives the model **knowledge**; fine-tuning gives it **habits**.* Missing information → retrieve it. Wrong behaviour that prompts can't fix, or cost/latency that must drop → fine-tune.

# How fine-tuning works

## Full fine-tuning versus parameter-efficient methods

Full fine-tuning updates every weight: needs lots of GPU memory and produces a full-size copy. **Parameter-efficient fine-tuning (PEFT)** freezes the base model and trains a tiny add-on.

### LoRA (Low-Rank Adaptation)

Instead of changing a giant weight matrix **W**, LoRA learns two small matrices **A** and **B** whose product is the *change* to apply:

```diagram
  W' = W  +  B · A
  (frozen)   └─┬─┘   small matrices, e.g. rank 8–64
            trained: often <1% of the parameters
```

- Far less memory and compute; can fit a multi-billion-parameter model on one GPU.
- The adapter is a small file; swap adapters for different tasks on the same base model.
- **QLoRA** combines LoRA with a 4-bit quantised base model for even lower memory.

## The data is the work

Typical format — conversations with the ideal assistant reply:

```json
{"messages": [
  {"role": "system", "content": "You are Acme's support assistant."},
  {"role": "user", "content": "My invoice shows a duplicate charge."},
  {"role": "assistant", "content": "I'm sorry about that. I've flagged the duplicate and a refund will arrive in 5-7 business days. Is there anything else I can help with?"}
]}
```

Guidelines:

- **Quality over quantity.** A few hundred to a few thousand *excellent*, consistent examples beat tens of thousands of messy ones.
- **Match the real distribution** of inputs, including edge cases and refusals.
- **Consistency**: if examples contradict each other, the model learns the confusion.
- **Hold out** a validation and test set; never train on your eval data.
- **Remove personal and sensitive data**; check licensing and terms for any data and any teacher model outputs.

## Training with Hugging Face (sketch)

```bash
pip install transformers peft trl datasets accelerate bitsandbytes
```

```python
from datasets import load_dataset
from peft import LoraConfig
from trl import SFTConfig, SFTTrainer

dataset = load_dataset("json", data_files="train.jsonl", split="train")

peft_config = LoraConfig(r=16, lora_alpha=32, lora_dropout=0.05,
                         target_modules="all-linear", task_type="CAUSAL_LM")

trainer = SFTTrainer(
    model="your-open-base-model-id",              # pick an open-weight model you have the licence and GPU for
    train_dataset=dataset,
    peft_config=peft_config,
    args=SFTConfig(output_dir="out", num_train_epochs=2, per_device_train_batch_size=2,
                   learning_rate=2e-4, logging_steps=10),
)
trainer.train()
trainer.save_model("out/adapter")
```

Library APIs evolve; treat this as the *shape* of the workflow and follow the current docs for exact arguments.

## The tuning loop

1. Write the eval and measure the **untuned** baseline (with the best prompt).
2. Build the dataset; train a first version.
3. Run the eval; compare. Check for **regressions** on general ability (catastrophic forgetting) and safety behaviours.
4. Inspect failures; improve data (not just hyper-parameters); repeat.
5. Deploy behind a flag; monitor; keep the base-model + prompt path as fallback.

## Beyond supervised tuning

- **Preference tuning (DPO)**: train on pairs of preferred vs rejected answers.
- **Reinforcement learning** with verifiable rewards (tests pass, answer matches) for reasoning skills.
- Some hosted providers offer managed fine-tuning; you upload data, they train.

# Open-weight models and running them yourself

**Open-weight** models publish their weights so you can run and adapt them. Check each model's **licence** (some restrict commercial use or scale), and that "open weights" is not the same as fully open source (training data and code may not be released).

## Why choose open models

- **Privacy and control** — data never leaves your infrastructure.
- **Customisation** — fine-tune freely.
- **Cost at scale** — predictable, can be lower for steady heavy workloads.
- **Offline / edge** — laptops, phones, air-gapped environments.
- **No vendor surprises** — models don't change under you.

## Why not

- You run the infrastructure, GPUs, scaling and updates.
- Usually a step behind the frontier closed models on hardest tasks.
- You own the safety layer and the evals.

## Run a model locally in minutes

The easiest route is a local runner such as **Ollama** or **llama.cpp**-based tools:

```bash
# install Ollama from its official site, then:
ollama pull llama3.2          # downloads a small open model (name may differ over time)
ollama run llama3.2           # interactive chat in the terminal
```

Local runners also expose an **OpenAI-compatible HTTP API**, so existing code works with a base URL change:

```python
from openai import OpenAI

local = OpenAI(base_url="http://localhost:11434/v1", api_key="not-needed")
r = local.chat.completions.create(
    model="llama3.2",
    messages=[{"role": "user", "content": "Explain RAG in one sentence."}],
)
print(r.choices[0].message.content)
```

## Hugging Face in a few lines

```python
from transformers import pipeline

gen = pipeline("text-generation", model="a-small-open-model-id", device_map="auto")
print(gen("Machine learning is", max_new_tokens=40)[0]["generated_text"])
```

The **Hugging Face Hub** hosts hundreds of thousands of models, datasets and demos; learn to read a *model card* (what it is, licence, intended use, limits, benchmarks).

## Hardware rules of thumb

Memory needed ≈ **parameters × bytes per parameter** (+ overhead for the KV cache):

| Model size | 16-bit (2 bytes) | 4-bit (~0.5 byte) |
| --- | --- | --- |
| 7–8 B parameters | ~16 GB | ~4–5 GB |
| 13–14 B | ~28 GB | ~8 GB |
| 70 B | ~140 GB | ~40 GB |

# Quantisation, serving and multimodal basics

## Quantisation

Store weights with fewer bits (8, 4…) instead of 16. Models shrink 2–4×, run faster, and lose a little quality — often an acceptable trade. Formats: GGUF (llama.cpp/Ollama), GPTQ, AWQ, bitsandbytes. **Test quantised models on your eval** — degradation varies by task.

## Serving at scale

| Option | Use when |
| --- | --- |
| **Hosted API from the provider** | You want zero ops |
| **Managed open-model hosting** (inference providers, cloud platforms) | Open model without running GPUs |
| **Self-hosted inference server** (e.g. vLLM, TGI) | Steady heavy load, privacy, control |
| **Local runner** (Ollama, llama.cpp) | Dev, prototypes, single-user, edge |

Key serving ideas: **batching** many requests per GPU pass, **continuous batching**, **KV-cache** management, **paged attention**, **speculative decoding** (a small model drafts, a big one verifies). You rarely implement these; you choose a server that does.

## Choosing between open and closed

```diagram
 Need the strongest reasoning, fastest time to market, no infra?   → closed API
 Strict data residency / offline / very high steady volume?        → open-weight, self-hosted
 Narrow task, huge scale, tight latency/cost?                      → fine-tuned small (often open) model
 Unsure?                                                           → start closed, build evals, revisit
```

Because your **eval suite** is model-agnostic, you can swap in an open model and know within an hour whether it is good enough. This is the main practical payoff of module 10.

## Multimodal and speech basics

- **Vision**: pass images to a vision-language model for OCR, chart reading, UI screenshots, inspection. Ask specific questions; verify numbers.
- **Document AI**: PDFs → either extract text (fast, cheap) or send page images to a multimodal model (handles tables/layout).
- **Speech-to-text**: models such as Whisper-style transcribers turn audio into text; add speaker labels and timestamps if needed.
- **Text-to-speech**: neural voices for assistants and narration. Consider consent and disclosure when synthesising voices.
- **Image/video generation**: diffusion models. Mind licensing, watermarking/provenance and misuse policies.
- **Realtime voice agents**: streaming speech in, model, speech out — latency is the engineering challenge.

> **Exercise:** Install a local runner, pull a small open model, and run your module 10 eval set against it and a hosted model. Produce a table of accuracy, latency and (estimated) cost per 1,000 requests. Write three sentences recommending which to use for which situation.

# @quiz

? What is the best summary of RAG versus fine-tuning?
- Fine-tuning is always better
+ RAG supplies knowledge at question time; fine-tuning changes behaviour, style or efficiency
- RAG changes model weights
- They are identical
! Use RAG for facts that change or need citations; fine-tune for habits.

? Which should you try first when a model gives inconsistent output format?
+ A clearer prompt with examples and a schema; fine-tune only if evals show prompting can't reach the bar
- Training from scratch
- A bigger GPU
- Removing the system prompt
! Climb the ladder from cheapest to most expensive.

? What does LoRA do?
- Retrains every weight of the model
+ Trains small low-rank matrices added to a frozen base model, using a fraction of the memory
- Deletes layers
- Compresses the dataset
! Adapters are small, swappable and cheap to train.

? Which matters most for fine-tuning data?
- Sheer volume
+ Quality, consistency and match to the real input distribution
- Using only easy examples
- Including your test set
! A few hundred excellent examples often beat thousands of noisy ones.

? Roughly how much memory does an 8B-parameter model need at 4-bit quantisation?
- 0.5 GB
+ About 4–5 GB
- 160 GB
- 1 TB
! Parameters × ~0.5 bytes, plus overhead.

? What is a key advantage of running an open-weight model yourself?
- It is always more capable than every closed model
+ Control and privacy — data stays in your infrastructure and the model never changes unexpectedly
- It needs no hardware
- It never makes mistakes
! The trade-off is that you operate infrastructure and safety yourself.
