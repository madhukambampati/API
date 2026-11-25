---
title: Python & Math Essentials
summary: Just enough Python, command-line, Git, HTTP/JSON and math intuition to build and understand AI systems — taught from scratch.
time: 4 hours
level: Beginner
outcomes:
  - Set up a clean Python environment and run scripts and notebooks
  - Write functions, loops, classes and work with lists, dicts and files
  - Call a web API and parse JSON
  - Use vectors, dot products, probability and logarithms with confidence
---

# Setting up your toolbox

You need four things: Python, a terminal, a code editor, and Git. Everything else is installed per project.

## Install and verify

1. Install **Python 3.11 or newer** from the official Python website (or your OS package manager).
2. Install a code editor — VS Code is a popular free choice.
3. Install **Git**.
4. Open a terminal and check:

```bash
python3 --version
git --version
```

## Virtual environments — always use one

A virtual environment gives each project its own isolated set of libraries so projects never break each other.

```bash
mkdir my-ai-project && cd my-ai-project
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install requests numpy
pip freeze > requirements.txt     # record exactly what you installed
```

> **Tip:** Add `.venv/` and any `.env` file to `.gitignore`. Never commit secrets such as API keys.

## Secrets and environment variables

API keys must stay out of your code. Put them in environment variables:

```bash
export ANTHROPIC_API_KEY="your-key-here"     # macOS/Linux, current terminal only
```

```python
import os
key = os.environ["ANTHROPIC_API_KEY"]        # raises KeyError if missing — good, fail loudly
```

## Notebooks

Jupyter notebooks mix code, output and notes — ideal for exploration. Install with `pip install jupyter`, run `jupyter notebook`. Use notebooks to explore, then move stable code into `.py` files.

# Python in one sitting

If you have programmed before, skim. If not, type every example. Python reads almost like English.

## Values and variables

```python
name = "Ada"               # str
age = 36                   # int
height = 1.68              # float
is_engineer = True         # bool
nothing = None             # "no value"

print(f"{name} is {age} years old")   # f-strings: put variables inside {}
```

## Collections

```python
nums = [3, 1, 4, 1, 5]               # list: ordered, changeable
nums.append(9)
print(nums[0], nums[-1], len(nums))  # 3 9 6

person = {"name": "Ada", "skills": ["math", "code"]}   # dict: key → value
print(person["name"])
print(person.get("email", "unknown"))                  # safe lookup with default

unique = set(nums)                   # set: no duplicates
pair = (1, 2)                        # tuple: fixed
```

## Control flow

```python
for n in nums:
    if n % 2 == 0:
        print(n, "even")
    elif n > 4:
        print(n, "big odd")
    else:
        print(n, "small odd")

squares = [n * n for n in nums if n > 1]    # list comprehension — you'll see these everywhere
```

## Functions

```python
def average(values: list[float]) -> float:
    """Return the mean of a non-empty list."""
    if not values:
        raise ValueError("values must not be empty")
    return sum(values) / len(values)

print(average([2, 4, 9]))   # 5.0
```

Type hints (`list[float]`, `-> float`) are optional but make AI code far easier to read and debug.

## Errors

```python
try:
    value = int("not a number")
except ValueError as err:
    print("Could not convert:", err)
```

AI systems fail in messy ways (network errors, invalid model output). Handling exceptions deliberately is a core skill; module 11 builds on it.

## Classes (lightly)

```python
class Counter:
    def __init__(self):
        self.count = 0

    def add(self, n=1):
        self.count += n
        return self.count

c = Counter()
c.add(); c.add(5)
print(c.count)   # 6
```

## Files and JSON

```python
import json

data = {"model": "demo", "scores": [0.9, 0.8]}
with open("result.json", "w") as f:
    json.dump(data, f, indent=2)

with open("result.json") as f:
    loaded = json.load(f)
print(loaded["scores"][0])
```

> **Exercise:** Write a function `word_counts(text)` returning a dict of how many times each lowercase word appears. Test it on a paragraph. (Hint: `text.lower().split()` and `dict.get`.)

## Async, briefly

Calling an LLM waits on the network. `async`/`await` lets a program do other work while it waits — useful when you send many requests at once. You can ignore it until module 7; just recognise the syntax `async def` / `await`.

# Command line, Git and HTTP APIs

## The terminal in 8 commands

```bash
pwd              # where am I?
ls               # list files
cd folder        # enter a folder (cd .. goes up)
mkdir name       # make a folder
cat file.txt     # print a file
cp a b           # copy
mv a b           # move or rename
rm file          # delete (careful — no recycle bin)
```

## Git: save points for your work

```bash
git init
git add .
git commit -m "First working chatbot"
git status
git log --oneline
```

Commit small and often. Use branches (`git switch -c experiment`) when trying risky changes. Push to GitHub to back up your work and build a public portfolio.

## What an API is

An **API** is a way for programs to talk to each other. Nearly every AI model is used through a **web API**: your code sends an HTTP request with JSON; the server sends back JSON.

```diagram
 your code ──► HTTPS request (method, URL, headers, JSON body) ──► server
 your code ◄── HTTP response (status code, JSON body)           ◄── server
```

Key pieces:

- **Method**: `GET` (read) or `POST` (send data).
- **Headers**: metadata — most importantly authentication (your API key).
- **Body**: the JSON you send.
- **Status code**: `200` OK, `400` bad request (your fault), `401/403` auth problem, `429` rate-limited (slow down), `500+` server problem (retry later).

## Calling an API with Python

```python
import requests

resp = requests.get(
    "https://api.github.com/repos/python/cpython",
    headers={"Accept": "application/vnd.github+json"},
    timeout=10,                    # always set a timeout
)
resp.raise_for_status()            # raise on 4xx/5xx
repo = resp.json()
print(repo["name"], repo["stargazers_count"])
```

> **Warning:** Never skip `timeout`. A request with no timeout can hang forever and freeze your program.

## Retries with backoff (a preview of harness engineering)

```python
import time, requests

def get_with_retry(url, tries=4):
    for attempt in range(tries):
        try:
            r = requests.get(url, timeout=10)
            if r.status_code == 429 or r.status_code >= 500:
                raise requests.RequestException(f"retryable status {r.status_code}")
            r.raise_for_status()
            return r.json()
        except requests.RequestException:
            if attempt == tries - 1:
                raise
            time.sleep(2 ** attempt)     # wait 1s, 2s, 4s…
```

# Math you actually need

You do not need a maths degree. You need *intuition* for five ideas.

## 1. Vectors: lists of numbers as points or arrows

A vector is a list like `[0.2, -1.3, 0.7]`. Embeddings are vectors with hundreds or thousands of numbers. Two vectors that point in similar directions represent similar things.

## 2. Dot product and cosine similarity

```python
import math

def dot(a, b):
    return sum(x * y for x, y in zip(a, b))

def norm(a):
    return math.sqrt(dot(a, a))

def cosine(a, b):
    return dot(a, b) / (norm(a) * norm(b))

print(cosine([1, 0], [1, 0]))    # 1.0   same direction
print(cosine([1, 0], [0, 1]))    # 0.0   unrelated
print(cosine([1, 0], [-1, 0]))   # -1.0  opposite
```

Cosine similarity is the standard way to compare embeddings. You can try it live in the [Playground](#/playground).

## 3. Matrices and matrix multiplication

A matrix is a grid of numbers. A neural network layer is basically "multiply the input vector by a matrix, then add something." GPUs exist because they do millions of these multiplications in parallel. With NumPy:

```python
import numpy as np

x = np.array([1.0, 2.0])               # input vector
W = np.array([[0.5, -1.0],             # weight matrix (2×2)
              [0.25, 0.75]])
print(W @ x)                           # [-1.5  1.75]
```

## 4. Probability

Models output **probabilities**: numbers between 0 and 1 that sum to 1 across the options. Key ideas:

- **Distribution** — a probability for each possible outcome (e.g. every possible next token).
- **Sampling** — picking an outcome randomly according to those probabilities. Temperature changes how "flat" the distribution is.
- **Expected value** — the average outcome if you repeated something many times.
- **Conditional probability** — P(A | B): the chance of A *given* B. An LLM computes P(next token | all previous tokens).

## 5. Logarithms and the softmax function

Probabilities of long sequences become tiny, so we work with their **logarithms** (sums instead of products). The **softmax** function converts raw scores ("logits") into probabilities:

```python
import math

def softmax(scores, temperature=1.0):
    exps = [math.exp(s / temperature) for s in scores]
    total = sum(exps)
    return [e / total for e in exps]

print(softmax([2.0, 1.0, 0.1]))                    # ≈ [0.66, 0.24, 0.10]
print(softmax([2.0, 1.0, 0.1], temperature=0.2))   # sharper: top option dominates
```

## Derivatives, in one paragraph

A derivative tells you **how much the output changes if you nudge an input** — the slope. Training moves each weight a little in the direction that lowers the loss. You will not compute derivatives by hand; libraries do it automatically. You only need the picture: *walking downhill on an error landscape.*

## Statistics worth knowing

- **Mean / median** — typical value; median is robust to outliers (useful for latency).
- **Variance / standard deviation** — how spread out values are.
- **Percentiles** — "p95 latency" means 95% of requests were faster than this.
- **Sample size** — small test sets give noisy conclusions. Remember this in the evals module.

# NumPy and pandas for data

Most AI work involves arrays and tables.

## NumPy: fast arrays

```python
import numpy as np

a = np.array([1, 2, 3, 4])
print(a * 2, a.mean(), a.std())        # element-wise maths
m = np.arange(12).reshape(3, 4)        # a 3×4 matrix
print(m.shape, m[1, 2], m[:, 0])       # shape, one element, first column
```

## pandas: tables

```python
import pandas as pd

df = pd.DataFrame({
    "ticket": ["A1", "A2", "A3", "A4"],
    "category": ["billing", "bug", "billing", "other"],
    "minutes": [12, 45, 8, 30],
})
print(df.describe())                                   # quick statistics
print(df[df["minutes"] > 10])                          # filter rows
print(df.groupby("category")["minutes"].mean())        # average per category
df.to_csv("tickets.csv", index=False)
```

> **Exercise:** Create a CSV of 20 made-up support tickets. Load it with pandas, find the category with the longest average resolution time, and print it. You will reuse this dataset in later modules.

# @quiz

? Why should every Python project use a virtual environment?
- It makes code run faster
+ It isolates the project's libraries so projects don't conflict
- It is required to use the internet
- It encrypts your code
! A virtual environment gives each project its own dependency set.

? Where should an API key live?
- Hard-coded in the source file
- In a public GitHub README
+ In an environment variable or secrets manager, never committed to Git
- In the browser URL
! Secrets in source control leak. Read them from the environment.

? An API returns HTTP status 429. What does it usually mean and what should you do?
- The server crashed permanently; give up
+ You're being rate-limited; wait and retry with backoff
- Your JSON is valid; continue immediately
- The page doesn't exist
! 429 means too many requests. Exponential backoff is the standard remedy.

? Cosine similarity of 1.0 between two embeddings means…
- The vectors are opposite
- They are unrelated
+ They point in exactly the same direction (maximally similar)
- They have the same length
! Cosine measures direction, not magnitude. 1 = same, 0 = unrelated, −1 = opposite.

? What does softmax do?
- Sorts a list of numbers
+ Turns raw scores into probabilities that sum to 1
- Removes the largest score
- Computes the average
! Softmax is how models turn logits into a probability distribution over tokens.

? In "p95 latency = 2s", what is being said?
- The average request takes 2 seconds
+ 95% of requests finish in 2 seconds or less
- 5% of requests take exactly 2 seconds
- The fastest request took 2 seconds
! Percentiles describe the tail, which is what users actually feel.
