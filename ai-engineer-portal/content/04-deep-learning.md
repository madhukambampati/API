---
title: Deep Learning & Transformers
summary: Neurons, backpropagation, tokenisation, embeddings, attention and the transformer — the machinery inside every modern LLM.
time: 4.5 hours
level: Intermediate
icon: 🧠
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

```python
import math

def neuron(inputs, weights, bias):
    total = sum(x * w for x, w in zip(inputs, weights)) + bias
    return max(0.0, total)          # ReLU activation: negatives become 0

print(neuron([1.0, 2.0, 3.0], [0.2, -0.1, 0.4], bias=0.1))   # 1.3
```

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

## Batches, epochs, optimisers

- **Batch** — a small group of examples used for one update (e.g. 32). Faster and noisier than using all data.
- **Epoch** — one full pass through the training data.
- **Optimiser** — the update strategy. **SGD** is the basic one; **Adam/AdamW** adapts step sizes per weight and is the usual default.

## A tiny network in PyTorch

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
- Randomly searches for good weights
+ Adjusts weights step by step in the direction that reduces the loss
- Deletes neurons that are wrong
- Increases the learning rate over time
! The gradient shows which way loss decreases; each step moves weights that way.

? Why do neural networks need non-linear activation functions?
- To make training slower
+ Without them, stacked layers collapse into a single linear function and can't model complex patterns
- To reduce memory
- Only the output layer needs them
! Non-linearity gives depth its power.

? In a PyTorch training loop, what does `loss.backward()` do?
- Runs inference
+ Computes gradients of the loss with respect to the weights (backpropagation)
- Updates the weights
- Saves the model
! `backward()` computes gradients; `opt.step()` then applies the update.

? Why do LLMs sometimes miscount letters in a word?
- They can't read English
+ They process tokens (sub-word chunks), not individual characters
- Their vocabulary is tiny
- Letters are removed during training
! Tokenisation hides character-level structure from the model.

? What problem does self-attention solve?
+ Letting each token directly use relevant information from other tokens in the sequence, in parallel
- Reducing the vocabulary size
- Storing the model on disk
- Converting images to text
! Attention lets every position weigh every other position, regardless of distance.

? What is the KV cache used for?
- Storing user passwords
+ Reusing the keys and values of already-processed tokens so generation doesn't recompute them
- Compressing the training data
- Choosing the temperature
! It makes each new token cheap to compute, at the cost of GPU memory that grows with context length.

? A decoder-only LLM is trained to…
- Classify images
+ Predict the next token at each position, attending only to earlier tokens
- Translate between two fixed languages only
- Cluster documents
! Next-token prediction with a causal mask is the core objective.
