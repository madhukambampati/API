---
title: Python & Math Essentials
summary: Python from absolute zero, the command line, Git and web APIs, plus the handful of math ideas AI is built on — with code you can run right in the page.
time: 8 hours
level: Beginner
outcomes:
  - Install Python on Windows, macOS or Linux, run a script, and fix the common setup errors
  - Write programs with variables, lists, dictionaries, loops, functions and error handling
  - Read and write files and JSON, and call a web API safely
  - Use vectors, dot products, probability, softmax and logarithms with confidence
  - Explore a table of data with NumPy and pandas
---

# Setting up your toolbox

You need four things: **Python** (the language), a **terminal** (to type commands), a **code editor** (to write code) and **Git** (to save versions). This lesson gets all four working. Budget about an hour the first time — that is normal.

> **Tip:** Want to start right now without installing anything? Every code box in this course marked **"runs in your browser"** has a **Run** button. Python runs inside the web page, so you can do the first lessons with no setup at all and install later.

## What a terminal is

A terminal is a window where you type commands instead of clicking. You type a command, press Enter, and it prints a result.

- **Windows:** press the Windows key, type `PowerShell`, open **Windows PowerShell**.
- **macOS:** press Cmd+Space, type `Terminal`, press Enter.
- **Linux:** press Ctrl+Alt+T, or find **Terminal** in your apps.

In this course, a box labelled `bash` holds commands to type into this window. Type them one line at a time.

## Step 1 — install Python

**Windows**

1. Go to python.org → Downloads → download the latest **Python 3** installer for Windows.
2. Run it. On the first screen, tick **"Add python.exe to PATH"** — this matters — then click **Install Now**.
3. Close and reopen PowerShell.

**macOS**

1. Go to python.org → Downloads → download the latest **Python 3** installer for macOS and run it.
2. Close and reopen Terminal.

**Linux (Ubuntu/Debian)**

```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv
```

## Step 2 — check it works

```bash
python3 --version
```

> **Expected output:**
> ```text
> Python 3.12.4
> ```

Your numbers may differ; anything starting with `Python 3.10` or higher is fine. On Windows the command is usually `python` (or `py`) instead of `python3`.

## Step 3 — your first program

1. Install **VS Code** (free) from code.visualstudio.com and open it.
2. Create a folder called `ai-course` and open it in VS Code (File → Open Folder).
3. Create a file named `hello.py` containing:

```python run
name = "world"
print("Hello,", name)
print("2 + 3 =", 2 + 3)
```

4. In the terminal, go to that folder and run it:

```bash
cd ai-course
python3 hello.py
```

> **Expected output:**
> ```text
> Hello, world
> 2 + 3 = 5
> ```

You just wrote and ran a program. Every later lesson is a bigger version of this.

## Step 4 — a virtual environment per project

Libraries are add-ons you install with `pip`. A **virtual environment** gives each project its own private set of libraries so projects never break each other.

```bash
python3 -m venv .venv             # create it (once per project)
source .venv/bin/activate         # macOS/Linux — turn it on
.venv\Scripts\Activate.ps1        # Windows PowerShell — turn it on
pip install numpy pandas          # install libraries into it
pip freeze > requirements.txt     # record exactly what you installed
```

When it is active your prompt starts with `(.venv)`. Type `deactivate` to turn it off.

## Fixing the common setup errors

| You see | Cause | Fix |
| --- | --- | --- |
| `python3: command not found` (Windows) | Windows names it differently | Use `python` or `py` instead |
| `'python' is not recognized…` | PATH box was not ticked | Re-run the installer → Modify → tick "Add to PATH" |
| `…Activate.ps1 cannot be loaded because running scripts is disabled` | PowerShell policy | Run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, answer Y |
| `ModuleNotFoundError: No module named 'numpy'` | Library not installed, or venv not active | Activate the venv, then `pip install numpy` |
| `pip: command not found` | pip not on PATH | Use `python3 -m pip install …` |

## Secrets: keep API keys out of code

Later you will use API keys (passwords for AI services). Never write them into a file you share. Put them in an environment variable:

```bash
export ANTHROPIC_API_KEY="your-key-here"      # macOS/Linux
$env:ANTHROPIC_API_KEY="your-key-here"        # Windows PowerShell
```

Add `.venv/` and `.env` to a file called `.gitignore` so Git never uploads them.

> **Exercise:** Create `about_me.py` that prints your name, your age in 10 years (computed with `+`), and your favourite food. Run it from the terminal.

> **Solution:**
> ```python run
> name = "Ada"
> age = 30
> food = "dosa"
> print("My name is", name)
> print("In 10 years I will be", age + 10)
> print("My favourite food is", food)
> ```

# Python basics: values, variables and collections

A program is a list of instructions that run top to bottom. Click **Run** on each box below, then change something and run it again — that is the fastest way to learn.

## Values and variables

A **variable** is a name that points at a value. `=` means "store this value under this name", not "equals".

```python run
name = "Ada"          # text is a "string" (str) — always in quotes
age = 36              # a whole number (int)
height = 1.68         # a decimal number (float)
is_engineer = True    # True or False (bool)

print(name, age, height, is_engineer)
print(type(age), type(height))
```

> **Expected output:**
> ```text
> Ada 36 1.68 True
> <class 'int'> <class 'float'>
> ```

Anything after `#` is a **comment** — notes for humans that Python ignores.

## Arithmetic and f-strings

```python run
price = 120
quantity = 3
total = price * quantity
print(total)                 # 360
print(total / 7)             # division always gives a float
print(total // 7, total % 7) # whole-number division and remainder
print(2 ** 10)               # power

print(f"{quantity} items cost ${total}, about ${total / 7:.2f} per day")
```

> **Expected output:**
> ```text
> 360
> 51.42857142857143
> 51 3
> 1024
> 3 items cost $360, about $51.43 per day
> ```

An **f-string** (`f"..."`) lets you put variables inside `{}` in text. `:.2f` means "show 2 decimal places".

## Strings

```python run
text = "  Machine Learning is fun  "
clean = text.strip()                # remove spaces at both ends
print(clean)
print(clean.lower())
print(clean.split())                # break into a list of words
print(len(clean), "characters")
print("Learning" in clean)          # is this text inside?
```

> **Expected output:**
> ```text
> Machine Learning is fun
> machine learning is fun
> ['Machine', 'Learning', 'is', 'fun']
> 23 characters
> True
> ```

## Lists: ordered collections

A **list** holds many values in order. Positions (**indexes**) start at **0**.

```python run
scores = [72, 88, 95, 60]
print(scores[0])        # first item
print(scores[-1])       # last item
scores.append(81)       # add to the end
print(scores, len(scores))
print(sorted(scores))   # a sorted copy
print(sum(scores) / len(scores))   # the average
print(scores[1:3])      # a "slice": positions 1 and 2
```

> **Expected output:**
> ```text
> 72
> 60
> [72, 88, 95, 60, 81] 5
> [60, 72, 81, 88, 95]
> 79.2
> [88, 95]
> ```

## Dictionaries: look things up by name

A **dict** stores **key → value** pairs, like a real dictionary stores word → meaning. JSON data from AI APIs arrives as dicts, so you will use these constantly.

```python run
person = {"name": "Ada", "skills": ["math", "code"], "years": 5}

print(person["name"])
print(person["skills"][1])
person["years"] = 6                        # change a value
person["city"] = "London"                  # add a new key
print(person.get("email", "no email"))     # safe lookup with a default
print(list(person.keys()))
```

> **Expected output:**
> ```text
> Ada
> code
> no email
> ['name', 'skills', 'years', 'city']
> ```

> **Common mistake:** `person["email"]` crashes with `KeyError` when the key is missing. Use `person.get("email")` when a key might not be there.

> **Exercise:** Make a dict `prices = {"apple": 0.5, "bread": 2.25, "milk": 1.1}`. Print the price of bread, add `"eggs": 3.0`, then print the total cost of everything using `sum(prices.values())`.

> **Solution:**
> ```python run
> prices = {"apple": 0.5, "bread": 2.25, "milk": 1.1}
> print(prices["bread"])
> prices["eggs"] = 3.0
> print(round(sum(prices.values()), 2))
> ```
>
> This prints `2.25` and then `6.85`. `round(…, 2)` hides tiny floating-point noise.

# Python: decisions, loops and functions

## Decisions with if / elif / else

Indentation (4 spaces) shows which lines belong to which block. Python cares about it.

```python run
temperature = 31

if temperature > 30:
    print("Hot — drink water")
elif temperature > 15:
    print("Pleasant")
else:
    print("Cold — take a jacket")
```

> **Expected output:**
> ```text
> Hot — drink water
> ```

Comparisons: `==` equal, `!=` not equal, `<`, `>`, `<=`, `>=`. Combine with `and`, `or`, `not`.

## Loops: repeat work

```python run
tickets = ["refund my order", "app crashes", "charged twice", "login fails"]

for t in tickets:
    if "charge" in t or "refund" in t:
        print("billing ->", t)
    else:
        print("support ->", t)

count = 0
while count < 3:
    count += 1           # same as count = count + 1
print("counted to", count)
```

> **Expected output:**
> ```text
> billing -> refund my order
> support -> app crashes
> billing -> charged twice
> support -> login fails
> counted to 3
> ```

`for` loops over every item in a collection; `while` repeats as long as a condition is true.

## List comprehensions — compact loops

You will see this shape everywhere in AI code:

```python run
nums = [3, 1, 4, 1, 5, 9, 2, 6]
squares = [n * n for n in nums]
evens = [n for n in nums if n % 2 == 0]
print(squares)
print(evens)
```

> **Expected output:**
> ```text
> [9, 1, 16, 1, 25, 81, 4, 36]
> [4, 2, 6]
> ```

## Functions: name a piece of work

A **function** packages steps so you can reuse them. `def` defines it; `return` sends a result back.

```python run
def average(values: list[float]) -> float:
    """Return the mean of a non-empty list."""
    if not values:
        raise ValueError("values must not be empty")
    return sum(values) / len(values)

def grade(score: float) -> str:
    if score >= 90:
        return "A"
    if score >= 75:
        return "B"
    return "C"

marks = [72, 88, 95]
avg = average(marks)
print(round(avg, 1), grade(avg))
print([grade(m) for m in marks])
```

> **Expected output:**
> ```text
> 85.0 B
> ['C', 'B', 'A']
> ```

The `: list[float]` and `-> float` parts are **type hints** — optional labels that make code easier to read. The text in triple quotes is a **docstring** describing the function.

> **Exercise:** Write `word_counts(text)` that returns a dict counting how often each lowercase word appears. Test it on `"the cat and the hat and the bat"`.

> **Solution:**
> ```python run
> def word_counts(text):
>     counts = {}
>     for word in text.lower().split():
>         counts[word] = counts.get(word, 0) + 1
>     return counts
>
> print(word_counts("the cat and the hat and the bat"))
> ```
>
> Output: `{'the': 3, 'cat': 1, 'and': 2, 'hat': 1, 'bat': 1}`. The key trick is `counts.get(word, 0) + 1`: start at 0 the first time a word is seen.

> **Exercise:** Write `classify(ticket)` that returns `"billing"` if the text contains "refund", "charge" or "invoice", `"bug"` if it contains "crash" or "error", otherwise `"other"`. Run it on three tickets of your own.

> **Solution:**
> ```python run
> def classify(ticket):
>     t = ticket.lower()
>     if any(w in t for w in ["refund", "charge", "invoice"]):
>         return "billing"
>     if any(w in t for w in ["crash", "error"]):
>         return "bug"
>     return "other"
>
> for t in ["Invoice is wrong", "App CRASHES on start", "How do I change my name?"]:
>     print(t, "->", classify(t))
> ```
>
> Notice this is a *rule-based* classifier. In module 3 you will build one that *learns* its rules from data, and in module 7 one that uses an LLM.

# Python: errors, files, JSON and classes

## Handling errors

When something goes wrong Python raises an **exception**. Unhandled, it stops the program. `try`/`except` lets you handle it.

```python run
for raw in ["42", "3.5", "hello"]:
    try:
        value = int(raw)
        print("integer:", value)
    except ValueError as err:
        print("could not convert", repr(raw), "->", err)
```

> **Expected output:**
> ```text
> integer: 42
> could not convert '3.5' -> invalid literal for int() with base 10: '3.5'
> could not convert 'hello' -> invalid literal for int() with base 10: 'hello'
> ```

**Reading an error message:** read the *last* line first — it names the error type and the reason. The lines above it show where it happened.

AI systems fail in messy ways (network timeouts, invalid model output), so handling errors on purpose is a core skill. Module 11 builds on it.

## Files and JSON

**JSON** is the text format nearly every web API (including every AI API) uses. In Python it maps directly to dicts and lists.

```python run
import json

result = {"model": "demo", "scores": [0.9, 0.8], "passed": True}

with open("result.json", "w") as f:       # "w" = write
    json.dump(result, f, indent=2)

with open("result.json") as f:            # default = read
    loaded = json.load(f)

print(loaded["scores"][0], loaded["passed"])
print(json.dumps(loaded))                 # dict -> JSON text
data = json.loads('{"city": "Pune", "temp": 31}')   # JSON text -> dict
print(data["city"], data["temp"] + 1)
```

> **Expected output:**
> ```text
> 0.9 True
> {"model": "demo", "scores": [0.9, 0.8], "passed": true}
> Pune 32
> ```

`with open(...)` closes the file for you automatically. Note JSON writes `true` where Python writes `True`.

## Classes (lightly)

A **class** bundles data and the functions that work on it. You will mostly *use* classes from libraries (for example `client.messages.create(...)`), so recognising the pattern is enough for now.

```python run
class Counter:
    def __init__(self):          # runs when you create one
        self.count = 0

    def add(self, n=1):          # n defaults to 1
        self.count += n
        return self.count

c = Counter()
c.add()
c.add(5)
print(c.count)
```

> **Expected output:**
> ```text
> 6
> ```

## Async, briefly

Calling an AI model waits on the network. `async`/`await` lets a program do other work while it waits, which matters when sending many requests. You only need to recognise `async def` and `await` for now; module 7 uses them.

> **Exercise:** Write a function `save_scores(scores, path)` that saves a list of numbers to a JSON file, and `load_scores(path)` that reads it back. Then make `load_scores` return an empty list (instead of crashing) when the file does not exist. Hint: catch `FileNotFoundError`.

> **Solution:**
> ```python run
> import json
>
> def save_scores(scores, path):
>     with open(path, "w") as f:
>         json.dump(scores, f)
>
> def load_scores(path):
>     try:
>         with open(path) as f:
>             return json.load(f)
>     except FileNotFoundError:
>         return []
>
> save_scores([3, 7, 9], "scores.json")
> print(load_scores("scores.json"))
> print(load_scores("missing.json"))
> ```
>
> Output: `[3, 7, 9]` then `[]`.

# Command line, Git and web APIs

## The terminal in 8 commands

```bash
pwd              # where am I?
ls               # list files (Windows PowerShell also accepts ls)
cd folder        # enter a folder (cd .. goes up one level)
mkdir name       # make a folder
cat file.txt     # print a file (PowerShell: type file.txt)
cp a b           # copy
mv a b           # move or rename
rm file          # delete (careful — there is no recycle bin)
```

## Git: save points for your work

Git records versions of your files so you can go back, see what changed, and share code on GitHub.

```bash
git init                                 # start tracking this folder (once)
git add .                                # stage all changes
git commit -m "First working chatbot"    # save a snapshot with a message
git status                               # what changed since the last commit?
git log --oneline                        # list of snapshots
```

Commit small and often. Create a free GitHub account, make a repository, and follow GitHub's "push an existing repository" instructions to back up your work. Your GitHub becomes your portfolio.

## What an API is

An **API** lets programs talk to each other. Every AI model is used through a **web API**: your code sends an HTTP request containing JSON; the server replies with JSON.

```diagram
 your code ──► HTTPS request (method, URL, headers, JSON body) ──► server
 your code ◄── HTTP response (status code, JSON body)           ◄── server
```

- **Method**: `GET` reads data, `POST` sends data.
- **Headers**: extra information — most importantly your API key.
- **Body**: the JSON you send.
- **Status code**: `200` OK · `400` your request is wrong · `401/403` key problem · `429` too many requests (slow down) · `500+` server problem (retry later).

## Calling an API from Python

Install with `pip install requests`, then run this on your computer (it needs the internet, so it does not run in the page):

```python
import requests

resp = requests.get(
    "https://api.github.com/repos/python/cpython",
    headers={"Accept": "application/vnd.github+json"},
    timeout=10,                    # always set a timeout
)
resp.raise_for_status()            # raise an error on 4xx/5xx
repo = resp.json()                 # JSON body -> Python dict
print(repo["full_name"], "has", repo["stargazers_count"], "stars")
```

> **Expected output:**
> ```text
> python/cpython has 70000 stars
> ```
>
> (The star count will differ — it changes daily.)

> **Warning:** Never skip `timeout`. A request without one can hang forever and freeze your program.

## Retrying with backoff

Services fail temporarily. The standard fix is to wait a little longer after each failure ("exponential backoff"). This runnable version simulates a flaky service so you can watch it work:

```python run
import random, time

random.seed(3)

def flaky_service():
    if random.random() < 0.6:            # fails 60% of the time
        raise ConnectionError("temporary failure")
    return {"status": "ok"}

def call_with_retry(fn, tries=5):
    for attempt in range(tries):
        try:
            return fn()
        except ConnectionError as err:
            wait = 0.1 * 2 ** attempt     # 0.1s, 0.2s, 0.4s, ...
            print(f"attempt {attempt + 1} failed ({err}); waiting {wait:.1f}s")
            time.sleep(wait)
    raise RuntimeError("gave up after retries")

print(call_with_retry(flaky_service))
```

> **Expected output:**
> ```text
> attempt 1 failed (temporary failure); waiting 0.1s
> attempt 2 failed (temporary failure); waiting 0.2s
> attempt 3 failed (temporary failure); waiting 0.4s
> {'status': 'ok'}
> ```

Real code waits seconds rather than tenths of a second, and only retries errors that can succeed later (429, 5xx, network) — never a `400`, which will fail every time.

# Math for AI, part 1: vectors and matrices

You do not need a math degree. You need intuition for a few ideas, and you can check every one of them by running code.

## Vectors: lists of numbers with meaning

A **vector** is a list of numbers. Picture `[3, 4]` as an arrow from the origin to the point (3, 4). In AI, an **embedding** is a vector with hundreds or thousands of numbers that represents the *meaning* of a word, sentence or image. Similar meanings get vectors pointing in similar directions.

```diagram
   y
   4 ┤        ● (3,4)        length = √(3² + 4²) = 5
   3 ┤      ╱
   2 ┤    ╱
   1 ┤  ╱
   0 ┼──────────── x
     0  1  2  3
```

## Length (norm)

The **length** of a vector comes from Pythagoras: square each number, add them, take the square root.

## Dot product

Multiply matching positions and add them up. The dot product is large when two vectors point the same way, zero when they are at right angles, and negative when they point opposite ways.

```text
[1, 2, 3] · [4, 5, 6] = 1×4 + 2×5 + 3×6 = 4 + 10 + 18 = 32
```

## Cosine similarity — the key idea for search

Divide the dot product by both lengths, and you get a number from −1 to 1 that measures **direction only**. This is exactly how semantic search and RAG (module 8) decide which documents are "similar" to a question.

```python run
import math

def dot(a, b):
    return sum(x * y for x, y in zip(a, b))

def norm(a):
    return math.sqrt(dot(a, a))

def cosine(a, b):
    return dot(a, b) / (norm(a) * norm(b))

print(norm([3, 4]))                     # 5.0
print(dot([1, 2, 3], [4, 5, 6]))        # 32
print(cosine([1, 0], [1, 0]))           # same direction
print(cosine([1, 0], [0, 1]))           # unrelated (90 degrees)
print(cosine([1, 0], [-1, 0]))          # opposite
print(round(cosine([2, 4], [1, 2]), 3)) # same direction, different length
```

> **Expected output:**
> ```text
> 5.0
> 32
> 1.0
> 0.0
> -1.0
> 1.0
> ```

The last line matters: `[2, 4]` is twice as long as `[1, 2]`, but cosine is still 1.0 because they point the same way. Cosine ignores length and compares meaning-direction.

## A toy "meaning" example

Imagine 3-number embeddings where the positions roughly mean *[animal, vehicle, food]*:

```python run
import math

def cosine(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    return dot / (math.sqrt(sum(x * x for x in a)) * math.sqrt(sum(y * y for y in b)))

words = {
    "cat":   [0.9, 0.0, 0.1],
    "dog":   [0.8, 0.1, 0.1],
    "truck": [0.0, 0.9, 0.1],
    "pizza": [0.1, 0.0, 0.9],
}
query = words["cat"]
ranked = sorted(words, key=lambda w: cosine(query, words[w]), reverse=True)
for w in ranked:
    print(f"{w:6} {cosine(query, words[w]):.3f}")
```

> **Expected output:**
> ```text
> cat    1.000
> dog    0.992
> pizza  0.220
> truck  0.012
> ```

That ranking is semantic search in miniature. Real embedding models learn these numbers from data, across hundreds of dimensions.

## Matrices: grids of numbers

A **matrix** is a grid of numbers. Multiplying a matrix by a vector produces a new vector — each output number is a dot product of one matrix row with the input. **A neural-network layer is essentially this operation** (plus a small twist you will meet in module 4). GPUs exist because they can do millions of these at once.

```python run
import numpy as np

x = np.array([1.0, 2.0])          # input vector
W = np.array([[0.5, -1.0],        # weight matrix: 2 rows x 2 columns
              [0.25, 0.75]])

print(W @ x)                      # @ means matrix multiplication
print(W.shape)
# Row 1: 0.5*1 + (-1.0)*2 = -1.5
# Row 2: 0.25*1 + 0.75*2  =  1.75
```

> **Expected output:**
> ```text
> [-1.5   1.75]
> (2, 2)
> ```

> **Exercise:** By hand, compute the dot product of `[2, 0, 1]` and `[1, 3, 4]`, and the cosine similarity of `[1, 1]` and `[1, 0]`. Then check both with code.

> **Solution:**
> Dot product: 2×1 + 0×3 + 1×4 = **6**. Cosine: dot = 1, lengths √2 and 1, so 1/√2 ≈ **0.707** (a 45° angle).
>
> ```python run
> import math
> print(sum(a * b for a, b in zip([2, 0, 1], [1, 3, 4])))
> print(round(1 / (math.sqrt(2) * 1), 3))
> ```

# Math for AI, part 2: probability, softmax and change

## Probability

A **probability** is a number from 0 (impossible) to 1 (certain). A **distribution** gives a probability to every possible outcome, and they add up to 1.

An LLM's whole job is producing a distribution: given the text so far, a probability for **every possible next token**. It then **samples** — picks randomly, weighted by those probabilities.

```python run
import random
from collections import Counter

random.seed(0)
next_token = {"Paris": 0.80, "Lyon": 0.12, "the": 0.08}

picks = random.choices(list(next_token), weights=next_token.values(), k=1000)
print(Counter(picks))
```

> **Expected output:**
> ```text
> Counter({'Paris': 810, 'Lyon': 112, 'the': 78})
> ```

Sampling 1,000 times gives counts close to 80% / 12% / 8%. This is why the same prompt can give different answers — the model is drawing from a distribution.

Two more terms you will see:

- **Conditional probability** P(A | B): the chance of A *given that* B happened. An LLM computes P(next token | all previous tokens).
- **Expected value**: the average result if you repeated something many times — used in cost estimates ("expected cost per request").

## Softmax: turning scores into probabilities

A model first produces raw scores called **logits** (any numbers, even negative). **Softmax** turns them into probabilities: raise *e* to each score, then divide by the total so they sum to 1. **Temperature** divides the scores first: low temperature sharpens the distribution, high temperature flattens it.

```python run
import math

def softmax(scores, temperature=1.0):
    exps = [math.exp(s / temperature) for s in scores]
    total = sum(exps)
    return [round(e / total, 3) for e in exps]

logits = [2.0, 1.0, 0.1]
print(softmax(logits))                    # normal
print(softmax(logits, temperature=0.2))   # sharp: top choice dominates
print(softmax(logits, temperature=5.0))   # flat: choices even out
```

> **Expected output:**
> ```text
> [0.659, 0.242, 0.099]
> [0.993, 0.007, 0.0]
> [0.4, 0.327, 0.273]
> ```

You can feel this interactively in the [Playground](#/playground).

## Logarithms

`log` answers "what power do I need?": log₁₀(1000) = 3 because 10³ = 1000. In AI we use them because probabilities of long sequences get astronomically small — multiplying 500 probabilities of 0.1 gives 10⁻⁵⁰⁰, which a computer rounds to 0. Adding their logs instead keeps the numbers sane. Training losses like **cross-entropy** are built on `-log(probability of the right answer)`:

```python run
import math
for p in [0.99, 0.5, 0.1, 0.01]:
    print(f"model gave the right answer probability {p:<4} -> loss {-math.log(p):.2f}")
```

> **Expected output:**
> ```text
> model gave the right answer probability 0.99 -> loss 0.01
> model gave the right answer probability 0.5  -> loss 0.69
> model gave the right answer probability 0.1  -> loss 2.30
> model gave the right answer probability 0.01 -> loss 4.61
> ```

Confident and right → tiny loss. Confident and wrong → big loss. Training pushes the loss down.

## Derivatives: "which way is downhill?"

A **derivative** tells you how much an output changes when you nudge an input — the **slope**. Training uses slopes to decide which way to nudge each weight. You never compute these by hand (libraries do it), but here is the idea in numbers. Take the "loss" `(w - 3)²`, which is smallest at w = 3:

```python run
def loss(w):
    return (w - 3) ** 2

def slope(w, h=1e-6):
    return (loss(w + h) - loss(w)) / h     # how much loss changes per tiny step

w = 0.0
for step in range(6):
    print(f"w = {w:.3f}   loss = {loss(w):.3f}   slope = {slope(w):.2f}")
    w = w - 0.3 * slope(w)                 # step downhill (learning rate 0.3)
```

> **Expected output:**
> ```text
> w = 0.000   loss = 9.000   slope = -6.00
> w = 1.800   loss = 1.440   slope = -2.40
> w = 2.520   loss = 0.230   slope = -0.96
> w = 2.808   loss = 0.037   slope = -0.38
> w = 2.923   loss = 0.006   slope = -0.15
> w = 2.969   loss = 0.001   slope = -0.06
> ```

`w` walks toward 3 and the loss shrinks. That loop — measure the slope, step downhill — is **gradient descent**, the engine of all neural-network training (module 4).

## Statistics you will use

- **Mean** — the average. **Median** — the middle value; not thrown off by a few extreme values (useful for response times).
- **Standard deviation** — how spread out values are.
- **Percentiles** — "p95 latency is 2 s" means 95% of requests finished within 2 seconds. Users feel the slow tail, not the average.
- **Sample size** — 20 test cases give noisy conclusions; remember this in the evals module.

```python run
import statistics as st

latency_ms = [120, 135, 128, 140, 131, 2900, 126, 133, 129, 138]
print("mean  ", round(st.mean(latency_ms)))
print("median", st.median(latency_ms))
print("stdev ", round(st.stdev(latency_ms)))
```

> **Expected output:**
> ```text
> mean   408
> median 132.0
> stdev  876
> ```

One slow request drags the mean to 408 ms while the median stays at 132 ms. That is why latency is reported with medians and percentiles.

> **Exercise:** Using the `softmax` function above, find the temperature at which the top choice of `[2.0, 1.0, 0.1]` has *about* 50% probability. Try a few values.

> **Solution:**
> At **temperature 2.0** the top choice is almost exactly 50% (0.659 at 1.0, 0.543 at 1.6, 0.502 at 2.0, 0.494 at 2.1).
>
> ```python run
> import math
> def softmax(scores, t):
>     e = [math.exp(s / t) for s in scores]
>     return [x / sum(e) for x in e]
> for t in [1.0, 1.6, 2.0, 2.1]:
>     print(t, round(softmax([2.0, 1.0, 0.1], t)[0], 3))
> ```

# NumPy and pandas for data

Almost all AI work involves arrays of numbers (**NumPy**) and tables (**pandas**). Both run in the page — click Run (the first run downloads them, so it takes a few seconds longer).

## NumPy: fast arrays

A NumPy **array** is like a list, but maths applies to every element at once, and it is much faster.

```python run
import numpy as np

a = np.array([1, 2, 3, 4])
print(a * 2)                 # every element doubled — no loop needed
print(a.mean(), a.std())     # average and spread

m = np.arange(12).reshape(3, 4)   # numbers 0..11 as 3 rows x 4 columns
print(m)
print(m.shape)               # (rows, columns)
print(m[1, 2])               # row 1, column 2 (counting from 0)
print(m[:, 0])               # every row, column 0
```

> **Expected output:**
> ```text
> [2 4 6 8]
> 2.5 1.118033988749895
> [[ 0  1  2  3]
>  [ 4  5  6  7]
>  [ 8  9 10 11]]
> (3, 4)
> 6
> [0 4 8]
> ```

`shape` is the first thing to check when AI code misbehaves — most bugs are arrays of the wrong shape.

## pandas: tables (DataFrames)

A pandas **DataFrame** is a table with named columns, like a spreadsheet you control with code.

```python run
import pandas as pd

df = pd.DataFrame({
    "ticket":   ["A1", "A2", "A3", "A4", "A5"],
    "category": ["billing", "bug", "billing", "other", "bug"],
    "minutes":  [12, 45, 8, 30, 61],
})

print(df)
print()
print(df[df["minutes"] > 20])                        # filter rows
print()
print(df.groupby("category")["minutes"].mean())      # average per category
print()
print(df["category"].value_counts())                 # how many of each
```

> **Expected output:**
> ```text
>   ticket category  minutes
> 0     A1  billing       12
> 1     A2      bug       45
> 2     A3  billing        8
> 3     A4    other       30
> 4     A5      bug       61
>
>   ticket category  minutes
> 1     A2      bug       45
> 3     A4    other       30
> 4     A5      bug       61
>
> category
> billing    10.0
> bug        53.0
> other      30.0
> Name: minutes, dtype: float64
>
> category
> billing    2
> bug        2
> other      1
> Name: count, dtype: int64
> ```

How to read it:

- The left-most column (0, 1, 2…) is the **index** — row labels pandas adds.
- `df["minutes"] > 20` makes a True/False value per row; `df[...]` keeps only the True rows.
- `groupby("category")` splits rows into groups, then `.mean()` averages each group.

## Saving and loading CSV

**CSV** (comma-separated values) is the most common file format for tabular data.

```python run
import pandas as pd

df = pd.DataFrame({"category": ["billing", "bug"], "minutes": [12, 45]})
df.to_csv("tickets.csv", index=False)      # write
back = pd.read_csv("tickets.csv")          # read
print(back)
print(open("tickets.csv").read())          # what the file looks like inside
```

> **Expected output:**
> ```text
>   category  minutes
> 0  billing       12
> 1      bug       45
> category,minutes
> billing,12
> bug,45
> ```

> **Exercise:** Create a DataFrame of at least 10 made-up support tickets with columns `text`, `category` and `minutes`. Find (1) the category with the longest average time, and (2) the single slowest ticket. Keep this dataset — later modules reuse it.

> **Solution:**
> ```python run
> import pandas as pd
>
> df = pd.DataFrame({
>     "text": ["refund please", "app crashes", "charged twice", "login error",
>              "change my email", "invoice wrong", "crash on save", "cancel plan",
>              "error 500", "where is my order"],
>     "category": ["billing", "bug", "billing", "bug", "other",
>                  "billing", "bug", "billing", "bug", "other"],
>     "minutes": [12, 45, 8, 50, 5, 15, 70, 10, 40, 20],
> })
>
> avg = df.groupby("category")["minutes"].mean()
> print(avg)
> print("slowest category:", avg.idxmax())
> print("slowest ticket:", df.loc[df["minutes"].idxmax(), "text"])
> ```
>
> `idxmax()` returns the label of the largest value — the category name for the grouped result, and the row index for the column.

# @quiz

? You run `python3 --version` on Windows and get "command not found". What is the most likely fix?
- Reinstall Windows completely, then install Python again from scratch
- Python cannot run on Windows; switch to a Linux machine
+ Try `python` or `py`; Windows names it differently
- Install Git first, because Python depends on it to start
! On Windows the command is usually `python` or `py`. If neither works, re-run the installer and tick "Add to PATH".

? What does `scores[-1]` return for `scores = [72, 88, 95, 60]`?
+ 60, the last item
- 72, the first item
- An error, because indexes cannot be negative
- 59, the last item minus one
! Negative indexes count from the end: -1 is the last item.

? Why use `person.get("email", "none")` instead of `person["email"]`?
- `.get` is much faster when the dictionary has thousands of keys in it
+ It returns a default instead of crashing when the key is missing
- `person["email"]` only works for numbers
- `.get` also adds the key to the dictionary
! Square brackets raise KeyError for a missing key; `.get` returns your default.

? An API returns HTTP status 429. What should your code do?
- Treat it as success and read the body
- Give up immediately; the service is gone for good
- Re-send the same request immediately, in a tight loop
+ Wait and retry with increasing delays (backoff)
! 429 means "too many requests". Backing off and retrying is the standard response; hammering makes it worse.

? Two embeddings are [2, 4] and [1, 2]. What is their cosine similarity?
- 0.5, because one vector is exactly half the length of the other one
+ 1.0, as they point the same way
- 0.0, because the vectors have different lengths
- 2.0, because the first is twice the second
! Cosine measures direction only. Scaling a vector does not change its direction.

? What does lowering the temperature in softmax do?
- Makes all options equally likely
- Adds new options to the distribution
+ Concentrates probability on the highest-scoring option
- Lowers every probability a little so that they sum to less than 1
! Dividing scores by a small temperature exaggerates differences, so the top option dominates.

? Response times are [120, 130, 125, 3000] ms. Which number best describes a typical request?
- The mean, about 844 ms
+ The median, about 128 ms
- The maximum, 3000 ms
- The minimum, 120 ms
! One extreme value distorts the mean; the median reflects the typical request. Report percentiles for the slow tail.

? What does `df.groupby("category")["minutes"].mean()` compute?
- The mean of every column in the whole table
- The number of rows in each category
+ The average minutes within each category
- The category with the highest total minutes
! groupby splits rows by category; `.mean()` then averages `minutes` inside each group.
