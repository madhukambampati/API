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

# @quiz

? What problem does RAG primarily solve?
- Making the model faster
+ Giving the model access to specific, up-to-date or private knowledge at question time
- Reducing the model's size
- Training the model from scratch
! RAG retrieves relevant passages and supplies them as context.

? Why are chunks usually overlapped slightly?
- To increase storage costs
+ So sentences or ideas that straddle a boundary are not cut in half and lost
- Because vector databases require it
- To remove duplicates
! Overlap preserves continuity across chunk boundaries.

? Why combine keyword (BM25) and vector search?
- Vector search is deprecated
+ Embeddings capture meaning but may miss exact terms (IDs, names, error codes), which keyword search handles
- It's cheaper than either alone
- It removes the need for an LLM
! Hybrid search covers both semantic and lexical matching.

? A RAG answer is wrong and the correct passage was NOT among the retrieved chunks. Where is the failure?
- The generation prompt
+ Retrieval
- The temperature
- The user interface
! Fix chunking, embeddings, hybrid search, reranking or query rewriting.

? What does a reranker do?
+ Re-scores a larger candidate set by reading query and passage together, keeping the most relevant few
- Re-embeds documents nightly
- Rewrites the user's question
- Compresses the vector index
! Rerankers add precision after a fast recall-oriented first pass.

? How should you restrict which documents a user can see through RAG?
- Ask the model not to reveal restricted content
+ Filter by permissions in the retrieval step, before anything reaches the model
- Hide them in the system prompt
- Rely on the temperature
! Enforce access control in code; the model can't be trusted as the gatekeeper.

? Which instruction most reduces unsupported answers in RAG?
- "Be creative."
+ "Answer only from the sources; if they don't contain the answer, say you don't know."
- "Answer quickly."
- "Use at least 500 words."
! Grounding plus an abstain option are the key prompt elements.
