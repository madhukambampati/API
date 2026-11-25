---
title: RAG
summary: Retrieval-Augmented Generation end to end — embeddings, chunking, vector search, reranking, generation, failure modes and fixes.
time: 4.5 hours
level: Intermediate
outcomes:
  - Explain why RAG exists and when to choose it over long context or fine-tuning
  - Build a working RAG pipeline: chunk, embed, store, retrieve, generate
  - Improve retrieval with hybrid search, reranking and query rewriting
  - Diagnose RAG failures by separating retrieval problems from generation problems
---

# Why RAG?

An LLM knows only what was in its training data, which is old, generic and does not include **your** documents. You have three ways to give it knowledge:

| Approach | Best for | Weakness |
| --- | --- | --- |
| **Put it all in the prompt** (long context) | Small corpora, one-off analysis | Cost and latency scale with size; quality drops with huge inputs |
| **Fine-tune** | Teaching *style, format, behaviour* | Poor at injecting facts; expensive to update; can't cite sources |
| **RAG** | Large or changing knowledge; need citations; access control | More moving parts to build and evaluate |

**RAG = look up relevant passages, then ask the model to answer using them.**

```diagram
 OFFLINE (indexing)
 documents ─► split into chunks ─► embed each chunk ─► store in vector index

 ONLINE (each question)
 question ─► embed ─► search index ─► top-k chunks ─► prompt = chunks + question ─► LLM ─► answer + citations
```

Why it works well: knowledge is **updatable** (re-index a file), **attributable** (point to the source), **permissionable** (only retrieve what this user may see), and **cheaper** than stuffing everything in context.

> **Key idea:** RAG converts "does the model know it?" into "can we *find* it?" Most RAG quality problems are *retrieval* problems, not model problems.

# Building blocks: chunking, embeddings, vector search

## Loading and cleaning

Real documents are PDFs, HTML, slides and wikis. Extract clean text and **keep metadata** (title, URL, page, section, date, permissions). Remove navigation menus, repeated headers and boilerplate — they pollute retrieval. Garbage in, garbage out applies doubly here.

## Chunking

You embed and retrieve **chunks**, not whole documents. Chunk size is a core trade-off.

| Too small | Too large |
| --- | --- |
| Loses context ("it" without its subject) | Dilutes the meaning; retrieves noise; wastes tokens |

Good defaults: **200–500 tokens per chunk with 10–20% overlap**, splitting on natural boundaries (headings, paragraphs, sentences) rather than at arbitrary character counts. Better still: **structure-aware chunking** (keep a section together with its heading) and storing the heading path as metadata. See it in action in the [Playground](#/playground).

```python
def chunk_text(text: str, size: int = 800, overlap: int = 150) -> list[str]:
    """Simple character-based chunker with overlap. Good enough to learn with."""
    chunks, start = [], 0
    while start < len(text):
        chunks.append(text[start:start + size])
        if start + size >= len(text):
            break
        start += size - overlap
    return chunks
```

## Embeddings

An **embedding model** converts text to a vector so semantically similar text lands nearby. Choices: hosted embedding APIs, or open models you run locally (e.g. via `sentence-transformers`). Rules:

- Use the **same model** for documents and queries.
- Embedding dimensions vary (e.g. 384–3072); larger is not automatically better.
- If you change the model, you must **re-embed everything**.

## Vector search

Given the query vector, find the nearest chunk vectors by cosine similarity. For thousands of chunks, brute force is fine; for millions, use an **approximate nearest neighbour (ANN)** index (HNSW is the common one) in a vector database — FAISS, pgvector (Postgres), Chroma, Qdrant, Weaviate, Pinecone, or your search engine's vector features.

## A complete minimal RAG in Python

```bash
pip install sentence-transformers numpy anthropic
```

```python
import numpy as np
import anthropic
from sentence_transformers import SentenceTransformer

embedder = SentenceTransformer("all-MiniLM-L6-v2")      # small, free, runs on CPU
client = anthropic.Anthropic()
MODEL = "claude-sonnet-5-5"

docs = {
    "refunds.md":  "Customers can request a refund within 30 days of purchase. Refunds go to the original payment method in 5-7 business days.",
    "shipping.md": "Standard shipping takes 3-5 business days within the US. Express shipping takes 1-2 days and costs $15.",
    "privacy.md":  "We never sell personal data. You can request deletion of your account data by emailing privacy@acme.example.",
}

# --- INDEX ---
chunks = [(name, text) for name, text in docs.items()]     # tiny docs: one chunk each
vectors = embedder.encode([t for _, t in chunks], normalize_embeddings=True)

# --- RETRIEVE ---
def retrieve(question: str, k: int = 2):
    q = embedder.encode([question], normalize_embeddings=True)[0]
    scores = vectors @ q                                    # cosine similarity (vectors are normalised)
    top = np.argsort(-scores)[:k]
    return [(chunks[i][0], chunks[i][1], float(scores[i])) for i in top]

# --- GENERATE ---
def answer(question: str) -> str:
    hits = retrieve(question)
    context = "\n\n".join(f"[{name}]\n{text}" for name, text, _ in hits)
    prompt = f"""Answer the question using ONLY the sources below.
Cite the source file name in square brackets after each claim.
If the sources do not contain the answer, say "I don't know based on the provided documents."

<sources>
{context}
</sources>

Question: {question}"""
    r = client.messages.create(model=MODEL, max_tokens=400,
                               messages=[{"role": "user", "content": prompt}])
    return r.content[0].text

print(answer("How long do I have to return something?"))
print(answer("Do you ship to Mars?"))      # should say it doesn't know
```

Notice the two decisive prompt choices: **"ONLY the sources"** and **permission to say "I don't know"**.

### Try the retrieval half right here

The code above needs an embedding model and an API key, so it runs on your computer. The *retrieval* half — the part that decides which text the model gets to see — you can run in the page. This version uses TF-IDF word matching instead of embeddings, chunks a small policy document, and returns the best chunks for each question:

```python run
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

handbook = """Refunds. Customers can request a refund within 30 days of purchase.
Refunds go to the original payment method within 5-7 business days.
Shipping. Standard shipping takes 3-5 business days in the US.
Express shipping takes 1-2 days and costs $15.
Privacy. We never sell personal data.
You can ask us to delete your account data by emailing privacy@acme.example.
Support hours. Our team answers chat from 9am to 6pm, Monday to Friday."""

chunks = [line.strip() for line in handbook.split("\n") if line.strip()]   # one sentence per chunk
vec = TfidfVectorizer(stop_words="english").fit(chunks)
chunk_vectors = vec.transform(chunks)

def retrieve(question, k=2):
    scores = cosine_similarity(vec.transform([question]), chunk_vectors)[0]
    best = scores.argsort()[::-1][:k]
    return [(round(float(scores[i]), 2), chunks[i]) for i in best]

for q in ["How long does a refund take?",
          "How much is express shipping?",
          "Can you delete my data?",
          "Do you ship to Mars?"]:
    print(q)
    for score, text in retrieve(q):
        print(f"   {score:.2f}  {text}")
```

> **Expected output:**
> ```text
> How long does a refund take?
>    0.41  Refunds. Customers can request a refund within 30 days of purchase.
>    0.00  You can ask us to delete your account data by emailing privacy@acme.example.
> How much is express shipping?
>    0.60  Express shipping takes 1-2 days and costs $15.
>    0.45  Shipping. Standard shipping takes 3-5 business days in the US.
> Can you delete my data?
>    0.48  You can ask us to delete your account data by emailing privacy@acme.example.
>    0.29  Privacy. We never sell personal data.
> Do you ship to Mars?
>    0.00  Support hours. Our team answers chat from 9am to 6pm, Monday to Friday.
>    0.00  You can ask us to delete your account data by emailing privacy@acme.example.
> ```

Read the output carefully — it shows three real retrieval failures, the same ones you will meet in production:

1. **Question 1 misses its answer.** The sentence that actually answers it ("Refunds go to … within 5-7 business days") is not retrieved, because TF-IDF treats "refund" and "refunds" as different words. The top hit is about the refund *window*, a different question. A model given these chunks would answer the wrong question unless it is allowed to say "I don't know".
2. **Questions 2 and 3 work** — they share exact words with the right sentences.
3. **"Do you ship to Mars?" scores 0.00 for everything** ("ship" ≠ "shipping"), yet retrieval still returns two chunks. Retrieval *always* returns its top k, relevant or not.

Now edit the questions and run again:

- Change question 1 to `"How long do refunds take?"` — the right sentence comes back first (score 0.38).
- Change question 4 to `"Do you offer shipping to Mars?"` — it now matches the shipping policy with a confident-looking **0.71**, even though nothing in the handbook mentions Mars. A high score means "similar words", not "contains the answer".

The lessons: exact word matching misses variants (embeddings, stemming and hybrid search fix this), similarity scores are not proof of relevance, and the generation prompt must always permit "I don't know". Many systems also drop chunks below a score threshold.

# Better retrieval

Naive RAG (embed → top-k → answer) gets you a demo. These upgrades get you a product.

## Hybrid search

Embeddings capture meaning but can miss exact tokens like product codes, error messages, names or acronyms. Keyword search (BM25) is the reverse. **Combine both** and merge rankings (e.g. Reciprocal Rank Fusion). This is among the most reliable single improvements.

```python
def rrf(rank_lists, k=60):
    """Reciprocal Rank Fusion: merge several ranked lists of doc ids."""
    scores = {}
    for ranking in rank_lists:
        for pos, doc_id in enumerate(ranking):
            scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + pos + 1)
    return sorted(scores, key=scores.get, reverse=True)
```

## Reranking

Retrieve generously (say top 30) with the fast embedding search, then use a **reranker** — a model that reads query and passage *together* and scores relevance much more accurately — to keep the best 5. Slower per item but applied to few items. Cross-encoder rerankers and LLM-based reranking both work.

```diagram
 query ─► [vector + keyword search] ─► 30 candidates ─► [reranker] ─► best 5 ─► LLM
          fast, recall-oriented                          slow, precision-oriented
```

## Query transformation

User questions are short, vague and conversational. Improve them before searching:

- **Rewrite** into a standalone query ("what about for kids?" → "child pricing for the Acme museum").
- **Expand** into several phrasings and merge results.
- **HyDE**: have the model write a hypothetical answer, then embed *that*.
- **Decompose** multi-part questions into sub-questions, retrieve for each.

## Metadata filters and routing

Filter by product, date, language, or the user's permissions *before* searching. Route questions to different indexes (HR docs vs. engineering docs) when the corpus is varied.

## Contextual and hierarchical chunks

- Prepend each chunk with a one-line description of where it comes from ("From the 2024 Refund Policy, section 3: Exceptions…") before embedding — this restores context a chunk lost when it was cut out.
- **Small-to-big**: search on small chunks, then hand the model the surrounding larger section.

## How much to retrieve?

More chunks improve recall but add noise and cost. Start with top 5–8 after reranking, and let your **evals** decide.

> **Tip:** Always log, for each query: the question, the retrieved chunk IDs and scores, the final prompt, and the answer. You cannot fix what you cannot inspect.

# Failure modes and how to fix them

Debug RAG by splitting the system in two. **First ask: did the right chunk reach the model?** If no → retrieval problem. If yes but the answer is wrong → generation problem.

```diagram
 Wrong answer?
   ├─ Was the answer in the retrieved chunks?
   │     ├─ NO  → RETRIEVAL failure   (fix chunking, embeddings, hybrid, rerank, query rewrite)
   │     └─ YES → GENERATION failure  (fix prompt, ordering, model, context size)
   └─ Was the answer in the knowledge base at all?
         └─ NO → CONTENT gap          (add the document, or make the model say "I don't know")
```

| Symptom | Likely cause | Fixes |
| --- | --- | --- |
| Right doc exists but isn't retrieved | Bad chunking; vocabulary mismatch; weak embeddings | Chunk by structure; hybrid search; query expansion; better embedding model |
| Retrieved chunks are on-topic but miss the detail | Chunks too big/small; answer split across chunks | Tune size/overlap; small-to-big; contextual headers |
| Exact IDs, codes or names not found | Pure semantic search | Add keyword (BM25) search |
| Answer mixes up similar documents | Several near-duplicates retrieved | Metadata filters; dedupe; rerank; version tagging |
| Model ignores the context and uses memory | Weak instruction; irrelevant context | "Use ONLY the sources"; fewer, better chunks |
| Model answers although context lacks the answer | No abstain option | Explicit "I don't know" rule + eval cases that require it |
| Answer is outdated | Stale index | Incremental re-indexing; store dates and prefer newest |
| Multi-hop questions fail | Single retrieval pass | Decompose into steps; agentic retrieval (module 9) |
| Missing facts in tables/figures | Poor PDF extraction | Better parsers/OCR; convert tables to text; multimodal models |
| Slow or expensive | Too many chunks; big model everywhere | Rerank to fewer; cache; smaller model for simple queries |

## Security and permissions

Retrieve **only what the asking user is allowed to see** — enforce this with metadata filters *at query time*, never by asking the model to hide things. And remember that retrieved text can contain **prompt injection** ("ignore previous instructions…"); treat it as untrusted data (module 13).

## When to graduate beyond classic RAG

- **Agentic RAG**: the model decides what to search, reads results, and searches again (module 9).
- **Knowledge graphs / GraphRAG** for relationship-heavy questions.
- **Long-context + caching** when the corpus is small enough to include whole.
- **Fine-tuning** on top of RAG for style or domain vocabulary.

> **Exercise:** Take 10 pages of any documentation. Build the pipeline above. Write 15 questions with known answers (plus 3 unanswerable ones). For each, record: was the right chunk retrieved? was the answer correct? Fix the biggest failure bucket and re-measure. You have just done RAG evaluation (module 10).

> **Solution:**
> There is no single right answer — your documents differ — but here is the measuring part, which is the same for everyone. Record, for each question, which chunk *should* be found; then compute **recall@k** (did it appear in the top k?):
>
> ```python run
> # For each question: the id of the chunk that contains the answer, and what retrieval returned.
> results = [
>     {"q": "refund window?",      "gold": "c3", "retrieved": ["c3", "c9", "c1"]},
>     {"q": "express price?",      "gold": "c7", "retrieved": ["c2", "c7", "c4"]},
>     {"q": "delete my data?",     "gold": "c5", "retrieved": ["c8", "c1", "c2"]},
>     {"q": "support hours?",      "gold": "c6", "retrieved": ["c6", "c5", "c3"]},
> ]
>
> def recall_at(k):
>     hits = [r["gold"] in r["retrieved"][:k] for r in results]
>     return sum(hits) / len(hits)
>
> for k in (1, 3):
>     print(f"recall@{k} = {recall_at(k):.2f}")
> for r in results:
>     if r["gold"] not in r["retrieved"][:3]:
>         print("RETRIEVAL MISS:", r["q"], "-> fix chunking, keywords or query rewriting")
> ```
>
> This prints recall@1 = 0.50, recall@3 = 0.75 and one retrieval miss. A good write-up then has a small table: *question · right chunk retrieved? · answer correct? · failure type (retrieval / generation / content gap)*. Count the failure types, fix the biggest bucket (often chunking or missing keyword search), and show the before/after numbers.

# @quiz

? What problem does RAG mainly solve?
- Making the model generate text faster
+ Giving the model your current or private knowledge
- Shrinking the model so that it can run on a phone without an internet connection
- Training a new model from scratch cheaply
! RAG retrieves relevant passages at question time and supplies them as context.

? Why are chunks usually overlapped slightly?
- Vector databases reject chunks without overlap
+ So ideas that span a boundary are not cut in half
- Overlap lowers the cost of embedding
- It removes duplicate documents automatically
! Overlap keeps sentences that straddle a boundary intact in at least one chunk.

? Users search for error code "E-4031" and retrieval misses it. What helps most?
- Raising the generation temperature
+ Adding keyword (BM25) search alongside vector search
- Making every chunk much larger
- Switching to a bigger language model with a longer context window
! Embeddings capture meaning but can miss exact strings; hybrid search covers both.

? A RAG answer is wrong, and the correct passage was not in the retrieved chunks. Where is the failure?
- In the generation prompt
+ In retrieval
- In the model's temperature
- In the user interface
! If the right text never reached the model, fix chunking, search or query rewriting first.

? What does a reranker add?
+ It re-scores candidates, keeps the best
- It rewrites each user question into several shorter, simpler questions first
- It re-embeds the whole document collection every night
- It compresses the vector index so searches run faster
! Fast search finds candidates (recall); the reranker reads query and passage together (precision).

? How should you stop users seeing documents they are not allowed to read?
- Tell the model not to mention restricted content
+ Filter by the user's permissions during retrieval
- Hide the restricted text inside the system prompt
- Lower the temperature for restricted users
! Access control belongs in code, before anything reaches the model.

? Retrieval returns chunks with similarity 0.71 for a question about shipping to Mars. What does that tell you?
- The documents definitely answer the question
+ The words are similar; it does not prove the answer is there
- The embedding model is broken and must be replaced
- The score means there is a 71% chance that the retrieved answer is correct
! Similarity measures word or meaning overlap, not whether the chunk contains the answer.
