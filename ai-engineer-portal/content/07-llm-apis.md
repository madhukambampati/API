---
title: Building with LLM APIs
summary: Call models from code — messages, streaming, structured output, tool use, multimodal inputs, cost control and a complete chatbot.
time: 4 hours
level: Intermediate
outcomes:
  - Make a model API call, handle errors, and keep a multi-turn conversation
  - Stream responses and control cost with limits and token counting
  - Get validated structured output from a model
  - Implement tool (function) calling with the full request/result loop
---

# Your first API call

The code in this module uses Anthropic's Python SDK, but every major provider follows the same ideas (messages in, message out, optional tools). Learn the concept once and translate the syntax in minutes.

## Setup

```bash
pip install anthropic pydantic
export ANTHROPIC_API_KEY="your-key-here"     # from your provider's console
```

> **Warning:** Model names change over time. The examples use a `MODEL` constant — check your provider's documentation for current model IDs and update it in one place.

## Hello, model

```python
import anthropic

MODEL = "claude-sonnet-5-5"            # update from the provider docs when needed
client = anthropic.Anthropic()          # reads ANTHROPIC_API_KEY from the environment

response = client.messages.create(
    model=MODEL,
    max_tokens=500,                      # always cap output
    system="You are a concise, friendly tutor.",
    messages=[{"role": "user", "content": "Explain gradient descent in two sentences."}],
)

print(response.content[0].text)
print(response.usage.input_tokens, response.usage.output_tokens)   # what you're billed for
print(response.stop_reason)              # "end_turn", "max_tokens", "tool_use", …
```

Check `stop_reason`: `max_tokens` means the answer was **cut off** — raise the limit or shorten the task.

## A multi-turn chat loop

The API is stateless, so *you* store the history and re-send it:

```python
history = []

def chat(user_text):
    history.append({"role": "user", "content": user_text})
    resp = client.messages.create(
        model=MODEL, max_tokens=800,
        system="You are a patient AI tutor.",
        messages=history,
    )
    reply = resp.content[0].text
    history.append({"role": "assistant", "content": reply})
    return reply

while True:
    text = input("you> ")
    if text.strip().lower() in {"quit", "exit"}:
        break
    print("ai>", chat(text))
```

As the history grows, cost grows. Real apps **truncate or summarise** old turns (module 11).

## Errors you must handle

```python
import anthropic, time

def ask(prompt, retries=4):
    for attempt in range(retries):
        try:
            r = client.messages.create(model=MODEL, max_tokens=500,
                                       messages=[{"role": "user", "content": prompt}])
            return r.content[0].text
        except (anthropic.RateLimitError, anthropic.APIConnectionError, anthropic.InternalServerError):
            time.sleep(2 ** attempt)          # transient: back off and retry
        except anthropic.BadRequestError:
            raise                              # your request is wrong: retrying won't help
    raise RuntimeError("model unavailable after retries")
```

The official SDKs already retry some failures automatically; know what yours does, and add a timeout.

# Streaming, cost and speed

## Streaming

A long answer can take many seconds. **Streaming** delivers tokens as they are generated so users see output immediately — the single biggest perceived-latency win.

```python
with client.messages.stream(
    model=MODEL, max_tokens=800,
    messages=[{"role": "user", "content": "Write a short poem about transformers."}],
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

## Controlling cost

| Lever | How |
| --- | --- |
| **Cap output** | Set `max_tokens`; ask for brevity |
| **Shrink input** | Trim history, retrieve only relevant chunks, remove boilerplate |
| **Right-size the model** | Use a small model for easy steps (routing) |
| **Prompt caching** | Many providers discount re-used prompt prefixes (long system prompt, big document) |
| **Batch APIs** | Non-urgent bulk jobs are often much cheaper when run asynchronously |
| **Cache answers** | Same question twice → store the result yourself |
| **Stop early** | Use stop sequences and concise formats |

## Estimating before you spend

```python
# Many SDKs can count tokens for a request without running it.
count = client.messages.count_tokens(
    model=MODEL,
    messages=[{"role": "user", "content": "Summarise the attached policy…"}],
)
print(count.input_tokens)
```

Multiply by your provider's per-million-token price. A back-of-envelope estimate (requests/day × tokens × price) before launch prevents unpleasant surprises. Log token usage on *every* call from day one.

## Concurrency

When you must process many items, send requests in parallel with a limit, respecting rate limits:

```python
import asyncio
import anthropic

aclient = anthropic.AsyncAnthropic()
sem = asyncio.Semaphore(5)                 # at most 5 in flight

async def classify(text):
    async with sem:
        r = await aclient.messages.create(
            model=MODEL, max_tokens=20,
            messages=[{"role": "user", "content": f"One word: positive or negative?\n{text}"}],
        )
        return r.content[0].text.strip()

async def main(texts):
    return await asyncio.gather(*(classify(t) for t in texts))

print(asyncio.run(main(["Loved it", "Terrible service", "Okay I guess"])))
```

# Structured output

Your code needs data, not prose. Three levels of reliability, weakest to strongest:

1. **Ask nicely** for JSON in the prompt (works often, fails sometimes).
2. **Validate and retry** in your code.
3. **Force a schema** via tool/function definitions or a provider's structured-output feature.

## Validate with Pydantic and retry once

```python
import json
from pydantic import BaseModel, ValidationError
from typing import Literal

class Ticket(BaseModel):
    category: Literal["billing", "bug", "other"]
    urgency: int            # 1 (low) – 5 (high)
    summary: str

PROMPT = """Classify the support ticket inside <ticket> tags.
Return ONLY JSON: {{"category": "billing"|"bug"|"other", "urgency": 1-5, "summary": "<=15 words"}}
<ticket>{ticket}</ticket>"""

def classify(ticket_text: str) -> Ticket:
    prompt = PROMPT.format(ticket=ticket_text)
    for attempt in range(2):
        r = client.messages.create(model=MODEL, max_tokens=200,
                                   messages=[{"role": "user", "content": prompt}])
        raw = r.content[0].text
        try:
            return Ticket.model_validate(json.loads(raw))
        except (json.JSONDecodeError, ValidationError) as e:
            prompt += f"\n\nYour previous reply was invalid ({e}). Return valid JSON only."
    raise ValueError("model could not produce valid output")

print(classify("I was charged twice and the app keeps crashing, please fix ASAP"))
```

## Schema enforcement through a tool

Defining a "tool" whose input schema is your output shape makes the model fill in the structure; you read it from the tool call.

```python
tool = {
    "name": "record_ticket",
    "description": "Record the classification of a support ticket.",
    "input_schema": {
        "type": "object",
        "properties": {
            "category": {"type": "string", "enum": ["billing", "bug", "other"]},
            "urgency": {"type": "integer", "minimum": 1, "maximum": 5},
            "summary": {"type": "string"},
        },
        "required": ["category", "urgency", "summary"],
    },
}

r = client.messages.create(
    model=MODEL, max_tokens=300, tools=[tool],
    tool_choice={"type": "tool", "name": "record_ticket"},      # force this tool
    messages=[{"role": "user", "content": "Ticket: charged twice, app crashes. Urgent!"}],
)
data = next(b.input for b in r.content if b.type == "tool_use")
print(data)     # a dict that matches the schema
```

Always **validate in code anyway**: schemas guarantee shape, not truth.

# Tool use (function calling)

Tools let a model act: query a database, call an API, run code. The model never runs anything itself — it *requests* a call; **your code executes it** and returns the result.

```diagram
 you ──► model: "What's the weather in Paris?"  + tool definitions
 model ──► "call get_weather(city='Paris')"        (stop_reason = tool_use)
 you run get_weather("Paris") → "18°C, cloudy"
 you ──► model: tool_result "18°C, cloudy"
 model ──► "It's 18°C and cloudy in Paris."        (stop_reason = end_turn)
```

## A complete tool loop

```python
import json

def get_weather(city: str) -> str:
    fake = {"paris": "18°C, cloudy", "delhi": "34°C, sunny"}
    return fake.get(city.lower(), "unknown city")

TOOLS = [{
    "name": "get_weather",
    "description": "Get the current weather for a city. Use for any weather question.",
    "input_schema": {
        "type": "object",
        "properties": {"city": {"type": "string", "description": "City name, e.g. 'Paris'"}},
        "required": ["city"],
    },
}]
REGISTRY = {"get_weather": get_weather}

def run(user_text: str) -> str:
    messages = [{"role": "user", "content": user_text}]
    for _ in range(5):                                   # hard cap on loop iterations
        resp = client.messages.create(model=MODEL, max_tokens=500, tools=TOOLS, messages=messages)
        if resp.stop_reason != "tool_use":
            return "".join(b.text for b in resp.content if b.type == "text")

        messages.append({"role": "assistant", "content": resp.content})   # keep the model's turn
        results = []
        for block in resp.content:
            if block.type == "tool_use":
                try:
                    out = REGISTRY[block.name](**block.input)
                    results.append({"type": "tool_result", "tool_use_id": block.id, "content": str(out)})
                except Exception as e:                    # report errors back to the model
                    results.append({"type": "tool_result", "tool_use_id": block.id,
                                    "content": f"Error: {e}", "is_error": True})
        messages.append({"role": "user", "content": results})
    return "Stopped: too many tool steps."

print(run("Should I take a jacket in Paris today?"))
```

## Writing good tools

- **Clear names and descriptions** — the description is the model's only guide. Say *when* to use it.
- **Small, well-typed inputs** with enums where possible.
- **Return concise, useful text** — not 10,000-line dumps (it burns context).
- **Return helpful errors** ("city not found; try a larger nearby city") so the model can recover.
- **Least privilege:** read-only tools by default; require confirmation for anything destructive.
- **Never trust arguments.** Validate them like any user input.

## Multimodal inputs

Models accept images and PDFs in the same `messages` structure (as base64 data or URLs, depending on provider). Typical uses: reading screenshots, charts, invoices, handwritten notes. Ask for the specific fields you want; verify critical numbers.

> **Exercise:** Build a CLI "expense assistant" with two tools — `add_expense(amount, category)` and `total_by_category()` — backed by a list in memory. Let the user type free text such as "I spent 12 on lunch and 40 on a taxi, what's my total?" Log token usage on every call.

> **Solution:**
> Run this on your computer (it calls the API). It reuses the tool loop from this lesson:
>
> ```python
> import anthropic
> from collections import defaultdict
>
> client = anthropic.Anthropic()
> MODEL = "claude-sonnet-5-5"            # check the provider docs for current IDs
> expenses = []                          # in-memory "database"
>
> def add_expense(amount: float, category: str) -> str:
>     if amount <= 0:
>         return "Error: amount must be positive"
>     expenses.append({"amount": amount, "category": category.lower()})
>     return f"Added {amount:.2f} to {category.lower()}"
>
> def total_by_category() -> str:
>     totals = defaultdict(float)
>     for e in expenses:
>         totals[e["category"]] += e["amount"]
>     return str(dict(totals)) if totals else "No expenses yet"
>
> TOOLS = [
>     {"name": "add_expense", "description": "Record one expense. Call once per item the user spent money on.",
>      "input_schema": {"type": "object", "properties": {
>          "amount": {"type": "number", "description": "Amount spent, e.g. 12.5"},
>          "category": {"type": "string", "description": "Short category, e.g. food, transport"}},
>          "required": ["amount", "category"]}},
>     {"name": "total_by_category", "description": "Get the totals spent per category so far.",
>      "input_schema": {"type": "object", "properties": {}}},
> ]
> REGISTRY = {"add_expense": add_expense, "total_by_category": total_by_category}
>
> def run(user_text):
>     messages = [{"role": "user", "content": user_text}]
>     for _ in range(6):
>         r = client.messages.create(model=MODEL, max_tokens=500, tools=TOOLS, messages=messages,
>                                    system="You track expenses. Use the tools; never invent totals.")
>         print(f"  [tokens in={r.usage.input_tokens} out={r.usage.output_tokens}]")
>         if r.stop_reason != "tool_use":
>             return "".join(b.text for b in r.content if b.type == "text")
>         messages.append({"role": "assistant", "content": r.content})
>         results = []
>         for b in r.content:
>             if b.type == "tool_use":
>                 out = REGISTRY[b.name](**b.input)
>                 results.append({"type": "tool_result", "tool_use_id": b.id, "content": out})
>         messages.append({"role": "user", "content": results})
>     return "Stopped: too many steps."
>
> while (text := input("you> ")).lower() not in {"quit", "exit"}:
>     print("ai>", run(text))
> ```
>
> Try "I spent 12 on lunch and 40 on a taxi, what's my total?" — the model should call `add_expense` twice, then `total_by_category`, then answer from the tool result. The system prompt line "never invent totals" plus the tool make the sum come from code, not from the model's arithmetic.

# Capstone: a robust chatbot skeleton

Pulling the lessons together — a small module you can reuse in projects.

```python
import time, logging
import anthropic

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("llm")

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic(timeout=30.0)

SYSTEM = """You are Aria, a support assistant for Acme.
- Answer only from the policy text provided in <policy> tags.
- If the answer is not in the policy, say you don't know and offer to connect a human.
- Be concise: at most 4 sentences."""

POLICY = "Refunds are available within 30 days of purchase with proof of payment."

def call_model(messages, max_tokens=400, retries=3):
    for attempt in range(retries):
        t0 = time.time()
        try:
            r = client.messages.create(model=MODEL, max_tokens=max_tokens,
                                       system=SYSTEM, messages=messages)
            log.info("ok in=%s out=%s %.1fs", r.usage.input_tokens, r.usage.output_tokens, time.time() - t0)
            return r
        except (anthropic.RateLimitError, anthropic.APIConnectionError, anthropic.InternalServerError) as e:
            log.warning("retry %s after %s", attempt + 1, type(e).__name__)
            time.sleep(2 ** attempt)
    raise RuntimeError("LLM unavailable")

def trim(history, keep=10):
    return history[-keep:]                       # naive: keep the last N messages

def answer(history, user_text):
    history.append({"role": "user",
                    "content": f"<policy>{POLICY}</policy>\n\nQuestion: {user_text}"})
    r = call_model(trim(history))
    text = r.content[0].text
    history.append({"role": "assistant", "content": text})
    return text

if __name__ == "__main__":
    h = []
    print(answer(h, "Can I get a refund after 3 weeks?"))
    print(answer(h, "What about shipping to Mars?"))
```

What this skeleton already does right: timeout, retries with backoff, token logging, bounded history, grounding with an "I don't know" rule. What it still lacks — evals, guardrails, retrieval, observability — is the rest of the course.

> **Key idea:** The model call is the *easy* 10% of an AI application. Reliability — validation, retries, limits, logging, testing — is the other 90%.

# @quiz

? A response arrives with `stop_reason = "max_tokens"`. What does it mean?
- The answer finished normally
+ The answer was cut off at your output limit
- Your API key has run out of credit and must be topped up
- The model refused to answer
! Raise `max_tokens` or ask for less; never treat a truncated answer as complete.

? What is the main benefit of streaming responses?
+ Text appears right away
- The model gives more accurate answers
- You are billed for fewer output tokens because they arrive in pieces
- It removes the provider's rate limits
! Streaming cuts perceived latency — the time until something appears.

? In tool use, who actually runs the function?
- The model, on the provider's servers
+ Your code, which then sends the result back
- The user, by clicking a button
- The tokenizer, before the model sees it
! The model only requests a call. Running it — and its safety — is your responsibility.

? What is the most reliable way to get structured output?
- Ask nicely for JSON and trust what comes back
+ Use a schema or tool definition, then validate in code
- Parse the reply with regular expressions only
- Raise the temperature so the model tries harder to match the format
! A schema fixes the shape; validation in code catches everything else.

? Which error should you NOT retry automatically?
- 429, rate limited
- A dropped network connection halfway through
+ 400, malformed request
- 503, the service is busy
! A malformed request fails the same way every time. Fix it instead of retrying.

? Why cap the number of steps in a tool-use loop?
- The API allows at most five calls per minute
+ A model that keeps calling tools could loop forever
- Capping the steps makes each individual answer more accurate and shorter
- Long loops delete the conversation history
! Any loop where a model decides what happens next needs a hard limit.
