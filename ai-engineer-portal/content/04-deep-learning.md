---
title: Deep Learning & Transformers
summary: Neurons, backpropagation, tokenisation, embeddings, attention and the transformer — the machinery inside every modern LLM.
time: 4.5 hours
level: Intermediate
outcomes:
  - Explain what a neural network is and how gradient descent trains it
  - Train a small network in PyTorch
  - Explain tokenisation and embeddings, and why they matter in practice
  - Describe self-attention and the transformer at an intuitive level
---

# Neural networks from the ground up

## One artificial neuron

A neuron takes numbers in, multiplies each by a **weight**, adds them with a **bias**, and passes the total through an **activation function**.

```diagram
 x1 ──w1──┐
 x2 ──w2──┼─► Σ (w·x) + b ─► activation ─► output
 x3 ──w3──┘
```

```python run
import math

def neuron(inputs, weights, bias):
    total = sum(x * w for x, w in zip(inputs, weights)) + bias
    return max(0.0, total)          # ReLU activation: negatives become 0

print(neuron([1.0, 2.0, 3.0], [0.2, -0.1, 0.4], bias=0.1))   # 1.3
```

> **Expected output:**
> ```text
> 1.3000000000000003
> ```

That is 1.3 — the `…0003` is normal floating-point rounding, because computers store decimals in binary. You will see this often; it is not a bug.

## Why activation functions matter

Without them, stacking layers is just one big linear function, no matter how deep. A non-linearity between layers lets networks bend and curve to fit complex patterns.

| Activation | Shape | Used for |
| --- | --- | --- |
| **ReLU** | 0 for negatives, identity for positives | Default in hidden layers |
| **GELU / SiLU** | Smooth ReLU-like | Common in transformers |
| **Sigmoid** | Squashes to 0–1 | Binary probability |
| **Softmax** | Turns a vector into probabilities | Output layer for classification and next-token prediction |

## Layers and depth

A **layer** is many neurons side by side. A **network** stacks layers: input → hidden layers → output. "Deep" learning just means many hidden layers. Each layer builds on the previous: in an image network, early layers detect edges, middle layers shapes, late layers objects. Nobody programs these features; they emerge from training.

```diagram
 input layer      hidden layers                  output layer
   ○ ──┐         ○ ─ ○ ─ ○
   ○ ──┼──►      ○ ─ ○ ─ ○ ──►                    ○  (probabilities)
   ○ ──┘         ○ ─ ○ ─ ○
```

## The universal approximation idea

A big enough network with non-linear activations can approximate almost any function. The practical question is never "can it?" but "can we find the weights with the data and compute we have?" — which is the training problem.

# How networks learn

## Loss: one number for "how wrong"

- **Mean squared error** for numbers.
- **Cross-entropy** for classes and next-token prediction: it is small when the model gave high probability to the correct answer and large when it was confidently wrong.

## Gradient descent

Imagine standing on a foggy hillside wanting to reach the valley. You cannot see far, but you can feel which way is downhill. So you step that way, then check again.

```diagram
 loss
  │ \
  │  \   ← slope (gradient) tells us which way is down
  │   \__
  │      \__      ●  step size = learning rate
  │         \__/
  └────────────────  weight value
```

For every weight, the **gradient** says how the loss changes when that weight changes. The update rule is:

```text
weight = weight − learning_rate × gradient
```

- **Learning rate too high** → you overshoot and the loss bounces or explodes.
- **Learning rate too low** → training crawls.

## Backpropagation

Calculating gradients for millions of weights sounds impossible. **Backpropagation** does it efficiently using the chain rule: it works backward from the loss, passing blame to each layer in turn. Frameworks like PyTorch do this automatically (*autograd*) — you only define the forward pass.

## Train a neuron yourself (NumPy, runs in the page)

Before using a framework, see the whole loop with nothing hidden. This single neuron learns to tell "pass" from "fail" using hours studied and hours slept. Every line maps onto the steps above.

```python run
import numpy as np

rng = np.random.default_rng(0)
# 200 students: [hours studied, hours slept]; pass if 2*study + sleep > 14 (with noise)
X = rng.uniform(0, 8, size=(200, 2))
y = ((2 * X[:, 0] + X[:, 1] + rng.normal(0, 1.5, 200)) > 14).astype(float)

w = np.zeros(2)          # weights start at zero: the model knows nothing
b = 0.0
lr = 0.05                # learning rate

def predict(X):
    return 1 / (1 + np.exp(-(X @ w + b)))      # sigmoid gives a probability 0..1

for epoch in range(2001):
    p = predict(X)                                             # 1. forward pass
    loss = -np.mean(y * np.log(p + 1e-9) + (1 - y) * np.log(1 - p + 1e-9))   # 2. loss
    grad_w = X.T @ (p - y) / len(y)                            # 3. gradients
    grad_b = np.mean(p - y)
    w -= lr * grad_w                                           # 4. step downhill
    b -= lr * grad_b
    if epoch % 500 == 0:
        acc = np.mean((p > 0.5) == y)
        print(f"epoch {epoch:4}  loss {loss:.3f}  accuracy {acc:.2f}")

print("learned weights:", w.round(2), "bias:", round(b, 2))
print("P(pass | 6h study, 7h sleep) =", round(float(predict(np.array([[6, 7]]))[0]), 2))
print("P(pass | 2h study, 8h sleep) =", round(float(predict(np.array([[2, 8]]))[0]), 2))
```

> **Expected output:**
> ```text
> epoch    0  loss 0.693  accuracy 0.56
> epoch  500  loss 0.425  accuracy 0.87
> epoch 1000  loss 0.345  accuracy 0.91
> epoch 1500  loss 0.304  accuracy 0.93
> epoch 2000  loss 0.278  accuracy 0.94
> learned weights: [0.84 0.36] bias: -5.47
> P(pass | 6h study, 7h sleep) = 0.9
> P(pass | 2h study, 8h sleep) = 0.3
> ```

Watch the loss fall and the accuracy rise as the weights move. The learned weight on "study" ends up larger than on "sleep" — the model *discovered* that studying matters more, because that is how the data was generated. Nobody wrote that rule.

> **Exercise:** Change `lr` to `2.0`, then to `0.0005`, and run each. What happens, and why?

> **Solution:**
> - **`0.0005` (too small):** after 2,000 epochs the loss has only fallen from 0.693 to about 0.63 and accuracy is stuck near 0.67. The steps are so tiny that training crawls.
> - **`2.0` (too big):** the loss drops quickly at first, then stalls around 0.38, clearly worse than the 0.28 you get with `0.05`. Each step overshoots the bottom of the valley, so it keeps jumping past the best weights instead of settling into them. In larger networks a rate that is too high often makes the loss blow up to `nan`.
>
> This is why the learning rate is usually the first setting people tune.

## Batches, epochs, optimisers

- **Batch** — a small group of examples used for one update (e.g. 32). Faster and noisier than using all data.
- **Epoch** — one full pass through the training data.
- **Optimiser** — the update strategy. **SGD** is the basic one; **Adam/AdamW** adapts step sizes per weight and is the usual default.

## A tiny network in PyTorch

PyTorch is too large to run inside a web page, so run this one on your computer (`pip install torch`). It does exactly what the NumPy example did — the framework just computes the gradients for you.

Install with `pip install torch`. This learns the XOR function — something a single neuron cannot do:

```python
import torch
from torch import nn

X = torch.tensor([[0., 0.], [0., 1.], [1., 0.], [1., 1.]])
y = torch.tensor([[0.], [1.], [1.], [0.]])

model = nn.Sequential(
    nn.Linear(2, 8),    # 2 inputs → 8 hidden neurons
    nn.ReLU(),
    nn.Linear(8, 1),
    nn.Sigmoid(),       # output between 0 and 1
)
loss_fn = nn.BCELoss()
opt = torch.optim.Adam(model.parameters(), lr=0.05)

for epoch in range(500):
    pred = model(X)                 # forward pass
    loss = loss_fn(pred, y)         # how wrong?
    opt.zero_grad()                 # clear old gradients
    loss.backward()                 # backpropagation
    opt.step()                      # update weights
    if epoch % 100 == 0:
        print(epoch, round(loss.item(), 4))

print(model(X).detach().round())    # → [[0.], [1.], [1.], [0.]]
```

Every deep-learning training loop, up to GPT-scale, is this loop: **forward → loss → zero_grad → backward → step**.

## Why GPUs?

Forward and backward passes are mostly huge matrix multiplications — thousands of independent multiply-adds. GPUs have thousands of simple cores built for exactly this. That is why AI scaled when GPUs arrived, and why "compute" and "GPU hours" dominate AI economics.

> **Key idea:** Training = repeatedly (1) predict, (2) measure error, (3) nudge every weight slightly downhill. LLMs are this exact idea at enormous scale.

# Tokens and embeddings

Neural networks only understand numbers, so text must be converted. This happens in two steps.

## Step 1: tokenisation

A **tokenizer** splits text into tokens and maps each to an integer ID from a fixed vocabulary (typically 30k–200k entries). Common algorithms (BPE and relatives) build the vocabulary by repeatedly merging the most frequent character pairs, so common words become one token and rare words split into pieces.

```text
"Tokenization is fun!"  →  ["Token", "ization", " is", " fun", "!"]  →  [3404, 2065, 318, 1257, 0]
```

(IDs are illustrative; every model family has its own tokenizer.)

Practical consequences you will hit as an engineer:

- **Cost and limits are in tokens**, not words. English ≈ 4 characters/token; code, numbers and non-English languages often use more tokens per character.
- **Models do not see letters.** That is why they can stumble on "count the r's in strawberry" or on exact spelling and arithmetic digit by digit.
- **Whitespace and formatting consume tokens.** Huge JSON or padded text wastes budget.
- **Different models, different tokenizers.** Always use the provider's own token counter for accurate numbers.

## Step 2: embeddings

Each token ID is looked up in a learned table to get its **embedding**: a vector of, say, 4,096 numbers. These vectors are trained so that tokens used in similar contexts end up near each other.

```diagram
        "king" ●
                        ● "queen"
   "man" ●
                  ● "woman"          (directions encode relationships:
                                      king − man + woman ≈ queen)
 "banana" ●                    far away from the royalty cluster
```

The embedding table is the model's first layer. Deeper layers then transform these vectors into representations that depend on **context** — the word "bank" ends up with different vectors in "river bank" and "bank account".

## Sentence and document embeddings

Separate **embedding models** map a whole sentence or document to one vector, trained so that texts with similar meaning are close (high cosine similarity). They power semantic search and RAG (module 8):

```text
"How do I reset my password?"    ≈  "I forgot my login credentials"   → high similarity
"How do I reset my password?"    vs "Best pizza in Naples"            → low similarity
```

## Positions

Word order matters, but the core transformer operation has no sense of order on its own. So models add **positional information** (e.g. rotary embeddings, RoPE) to each token so "dog bites man" differs from "man bites dog".

# Attention and the transformer

Before 2017, language models read text sequentially (RNNs/LSTMs), which was slow and forgot distant words. The **transformer** replaced that with **attention**, letting every token look directly at every other token in parallel.

## Self-attention intuition

Consider: *"The animal didn't cross the street because **it** was too tired."* What does "it" refer to? Attention lets the representation of "it" pull in information from "animal" and ignore "street".

Mechanically, each token produces three vectors:

- **Query (Q)** — "what am I looking for?"
- **Key (K)** — "what do I contain?"
- **Value (V)** — "what information do I pass along if chosen?"

```diagram
 attention(Q, K, V) = softmax( Q·Kᵀ / √d ) · V
                               └───┬───┘
                    how relevant is each token to me? (weights sum to 1)
```

Each token compares its query with all keys (dot products), softmax turns scores into weights, and the output is a weighted blend of the values.

### Attention with real numbers

Here are three made-up 4-number token vectors for "the cat sat". Watch each token compute how much to attend to every other token (each row of weights sums to 1).

```python run
import numpy as np

np.set_printoptions(precision=2, suppress=True)
tokens = ["the", "cat", "sat"]
x = np.array([[0.1, 0.0, 0.2, 0.1],     # "the"
              [0.9, 0.8, 0.1, 0.3],     # "cat"
              [0.7, 0.9, 0.2, 0.4]])    # "sat"

rng = np.random.default_rng(1)
Wq, Wk, Wv = (rng.normal(0, 1, (4, 4)) for _ in range(3))   # learned in a real model
Q, K, V = x @ Wq, x @ Wk, x @ Wv

scores = Q @ K.T / np.sqrt(4)                          # how relevant is each token to each other?
weights = np.exp(scores) / np.exp(scores).sum(axis=1, keepdims=True)   # softmax per row
output = weights @ V                                   # blend the values

print("attention weights (row = the token doing the looking):")
for name, row in zip(tokens, weights):
    print(f"{name:>4}", row)
print("output shape:", output.shape)
```

> **Expected output:**
> ```text
> attention weights (row = the token doing the looking):
>  the [0.34 0.33 0.33]
>  cat [0.4  0.34 0.26]
>  sat [0.4  0.34 0.26]
> output shape: (3, 4)
> ```

In a trained model the matrices `Wq`, `Wk` and `Wv` are learned, so the weights become meaningful (e.g. "sat" attends strongly to "cat", its subject). Here they are random, so only the *mechanics* are real — which is the point. A **causal mask** (used in LLMs) would also set every weight above the diagonal to 0, so no token can look at tokens after it.

## Multi-head attention

Instead of one attention pattern, the model runs many **heads** in parallel. One head may track grammar, another coreference, another nearby words. Their outputs are combined.

## The transformer block

```diagram
 input vectors
      │
      ▼
 ┌─────────────────────────┐
 │ Self-attention (heads)  │  ← tokens exchange information
 │ + residual + LayerNorm  │
 ├─────────────────────────┤
 │ Feed-forward network    │  ← per-token processing ("thinking")
 │ + residual + LayerNorm  │
 └─────────────────────────┘
      │   (repeat dozens of times)
      ▼
 output vectors
```

- **Residual connections** (adding the input back) keep gradients healthy in very deep stacks.
- **Feed-forward layers** hold much of the model's stored knowledge.
- A large model stacks dozens to 100+ of these blocks.

## Decoder-only: how LLMs generate

GPT-style LLMs are **decoder-only** transformers with a **causal mask**: each token may attend only to *earlier* tokens, never future ones. Training objective: at every position, predict the next token.

```diagram
 "The cat sat on the"  ──►  [transformer × N]  ──►  probability over vocabulary
                                                     mat 41% · sofa 17% · floor 9% …
```

Generation then loops: sample a token, append it, run again.

## KV cache: why generation is fast

Re-computing attention over the whole prompt for each new token would be wasteful. Models cache the keys and values of past tokens (**KV cache**) and only compute the new token. This is also why long contexts use lots of GPU memory — and why **prompt caching** (module 11) can make repeated prompts cheaper and faster.

## Why transformers won

- **Parallel training** across all positions — scales to huge data and GPUs.
- **Direct long-range connections** — any token can attend to any other.
- **Scaling laws** — performance improves smoothly and predictably as you grow parameters, data and compute.

## Cost of attention

Attention compares every token with every other: compute grows roughly with the **square** of context length. This is why very long contexts are expensive and why research on efficient attention, sparse patterns and caching is intense.

> **Key idea:** A transformer is a stack of (attention + feed-forward) blocks. Attention moves information *between* tokens; feed-forward layers process *within* each token. Scale that up, train it to predict the next token, and you get an LLM.

# @quiz

? What does gradient descent do?
- Tries thousands of random weight settings and keeps whichever one works best
+ Nudges each weight in the direction that lowers the loss
- Removes the neurons that make mistakes
- Raises the learning rate every epoch
! The gradient says which way the loss goes down; each step moves the weights that way.

? Why do neural networks need non-linear activation functions?
- They make training slower, but the final model ends up more accurate
+ Layers would collapse into one
- They reduce the memory a network needs
- Only the output layer ever needs one
! Non-linearity is what lets depth model curved, complex patterns.

? In a PyTorch training loop, what does `loss.backward()` do?
- Updates every weight in the model using the learning rate you set
+ Computes the gradient of the loss for every weight
- Runs the model forward on a new batch
- Saves the model's weights to disk
! `backward()` computes gradients (backpropagation); `optimizer.step()` then applies the update.

? Your loss barely moves after many epochs. Which change is most likely to help?
- Lower the learning rate further
+ Increase the learning rate a little
- Delete the loss function
- Remove the activation functions
! A tiny learning rate makes steps too small to make progress. Too large a rate overshoots instead.

? Why might an LLM miscount the letters in "strawberry"?
- Its vocabulary has fewer than 100 entries
+ It sees sub-word tokens, not individual letters
- Letters are stripped out of words during training to save memory
- It only reads the first half of each word
! Tokenisation hides character-level detail, so letter counting is surprisingly hard for LLMs.

? In self-attention, what does the softmax over Q·K scores produce?
- The final next-token prediction
+ How much each token uses the others
- A list of the tokens in alphabetical order
- The embedding table that the model's first layer looks words up in
! The scores become weights that sum to 1; the output is a weighted blend of the value vectors.

? Why does a very long context use a lot of GPU memory during generation?
- The tokenizer stores every token as an image
+ The KV cache keeps keys and values for every earlier token
- The model reloads all of its weights from disk for every new token
- Long prompts force the model into training mode
! Caching past keys and values makes each new token cheap, but the cache grows with context length.
