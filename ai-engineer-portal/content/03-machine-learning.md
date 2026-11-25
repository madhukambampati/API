---
title: Machine Learning Essentials
summary: Classic ML done properly — the workflow, data splits, overfitting, metrics and a first real model with scikit-learn.
time: 4 hours
level: Beginner
outcomes:
  - Walk through the end-to-end ML workflow and name each stage
  - Split data correctly and explain overfitting, underfitting and data leakage
  - Choose and interpret metrics like accuracy, precision, recall and F1
  - Train, evaluate and improve a model with scikit-learn
---

# The ML workflow

Every machine-learning project, from a spam filter to a frontier LLM, follows the same loop.

```diagram
 1. Frame the problem ─► 2. Collect & clean data ─► 3. Split data
        ▲                                                   │
        │                                                   ▼
 7. Monitor & improve ◄─ 6. Deploy ◄─ 5. Evaluate ◄─ 4. Train a model
```

## 1. Frame the problem

State precisely what you predict and why it matters. "Use AI for support" is not a problem. "Predict the category of an incoming ticket so it routes to the right team, with at least 90% accuracy" is.

Common problem types:

- **Classification** — pick a category (spam / not spam).
- **Regression** — predict a number (house price).
- **Clustering** — group similar items without labels.
- **Ranking / recommendation** — order items by relevance.
- **Generation** — produce new content (text, images).

## 2. Data matters more than models

> **Key idea:** "Garbage in, garbage out." Better data usually beats a fancier model. Time spent cleaning, labelling and understanding data is rarely wasted.

Questions to ask of any dataset: Is it **representative** of real use? Is it **labelled correctly**? Is it **balanced** (what if 99% of examples are one class)? Does it contain **personal or sensitive information**? Is there **bias** in who or what is represented?

## 3–5. Split, train, evaluate

We cover splitting next. After evaluating, you iterate: improve data, change features, try another model.

## 6–7. Deploy and monitor

A model is not "done" when training ends. Real-world data drifts over time — customers change, language evolves — so accuracy decays unless you watch it. Modules 10–13 return to this.

# Data splits, overfitting and leakage

## Train / validation / test

Never judge a model on the data it learned from. Split once, up front:

| Split | Typical share | Purpose |
| --- | --- | --- |
| **Train** | 70–80% | The model learns from this |
| **Validation** | 10–15% | You tune choices (settings, model type) against this |
| **Test** | 10–15% | Touch **once**, at the very end, for an honest final score |

If you keep tuning against the test set, it quietly turns into training data and your score becomes optimistic fiction.

## Overfitting and underfitting

```diagram
 error
  │  validation error
  │\                    ____/‾‾  ← gets worse: overfitting
  │ \__            ___/
  │    \__     ___/
  │       \___/    training error keeps falling
  └──────────────────────────────  model complexity / training time
     underfit     sweet spot    overfit
```

- **Underfitting**: both training and validation error are high. The model is too simple, or training too short.
- **Overfitting**: training error is low, validation error is high. The model memorised noise.

Remedies for overfitting: more (and more varied) data, a simpler model, **regularisation**, **early stopping**, **dropout** (in neural nets).

## Data leakage — the silent killer

Leakage means information from the answer slips into the inputs, so your score looks wonderful and then collapses in production.

- A feature that is only known *after* the outcome (e.g. "refund issued" when predicting if a ticket will need a refund).
- The same customer appearing in both train and test sets.
- Cleaning or scaling computed on all the data *before* splitting.
- For time-based data, shuffling instead of training on the past and testing on the future.

> **Warning:** If a result looks too good to be true, suspect leakage first. The same trap exists for LLM evals when test questions appear in training data or in your prompt examples.

# Metrics: measuring what matters

## Accuracy is not enough

If 99% of transactions are legitimate, a model that always says "legitimate" is 99% accurate and catches zero fraud. Use the **confusion matrix**:

| | Predicted positive | Predicted negative |
| --- | --- | --- |
| **Actually positive** | True positive (TP) | False negative (FN) |
| **Actually negative** | False positive (FP) | True negative (TN) |

- **Precision** = TP / (TP + FP) — *when it says yes, how often is it right?*
- **Recall** = TP / (TP + FN) — *of all real positives, how many did it find?*
- **F1** = harmonic mean of precision and recall — one balanced number.
- **Accuracy** = (TP + TN) / total.

## Choosing by cost of mistakes

| Scenario | Cares most about |
| --- | --- |
| Cancer screening | **Recall** — missing a case is catastrophic; false alarms get re-checked |
| Spam filter | **Precision** — blocking a real email is worse than letting spam through |
| Content moderation | A balance, plus human review of borderline cases |

## Regression metrics

- **MAE** (mean absolute error) — average size of the miss, in the original units.
- **RMSE** — like MAE but punishes large errors more.
- **R²** — fraction of variation explained (1 = perfect, 0 = no better than guessing the mean).

## A baseline first

Always compare with a dumb baseline (predict the majority class, or the average). If your fancy model barely beats it, you have learned something valuable.

> **Key idea:** A metric is a *choice about what you value*. Pick it before you build, and tie it to a real-world outcome. The same discipline drives LLM evals in module 10.

# Your first model with scikit-learn

scikit-learn is the standard library for classic ML. Install: `pip install scikit-learn pandas`.

## Classify iris flowers

```python
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

X, y = load_iris(return_X_y=True)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y   # stratify keeps class proportions
)

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)                 # TRAINING

pred = model.predict(X_test)                # INFERENCE on unseen data
print("accuracy:", accuracy_score(y_test, pred))
print(classification_report(y_test, pred))
```

Notice the shape: **split → fit → predict → score**. It is the same for nearly every scikit-learn model.

## Pipelines prevent leakage

Put preprocessing and the model in one `Pipeline` so scaling is learned from training data only:

```python
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score

clf = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
scores = cross_val_score(clf, X, y, cv=5)       # 5-fold cross-validation
print(scores.mean(), scores.std())
```

**Cross-validation** repeats train/validate across several splits, giving a more trustworthy estimate than one lucky split.

## Text classification, the classic way

```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline

texts = ["refund my order", "app crashes on login", "charge twice on card",
         "button does nothing", "invoice is wrong", "error 500 on checkout"]
labels = ["billing", "bug", "billing", "bug", "billing", "bug"]

clf = make_pipeline(TfidfVectorizer(), LogisticRegression())
clf.fit(texts, labels)
print(clf.predict(["I was billed incorrectly", "page shows an error"]))
```

This tiny model turns words into numbers (TF-IDF) and learns which words indicate which class. Hold that thought: LLM-based classification (module 7) does the same job with far less labelled data — but classic ML like this is still faster, cheaper and easier to evaluate when you *do* have labelled data.

> **Exercise:** Extend the ticket CSV from module 2 to 60 rows across 3 categories. Train a TF-IDF classifier, report precision and recall per category, and read the five most misclassified tickets. What do the mistakes have in common?

# Algorithms at a glance and when to use them

You do not need to memorise internals. Know what each is *for*.

| Algorithm | Good for | Notes |
| --- | --- | --- |
| **Linear / logistic regression** | Simple, interpretable baselines | Fast; always try first |
| **Decision trees / random forests** | Tabular data, mixed features | Strong, robust, little tuning |
| **Gradient boosting (XGBoost, LightGBM)** | Best-in-class on tabular data | Often wins competitions |
| **k-nearest neighbours** | Similarity lookups | Idea behind vector search |
| **k-means** | Clustering | You choose k |
| **PCA / t-SNE / UMAP** | Compress or visualise high-dimensional data | Great for plotting embeddings |
| **Neural networks** | Images, audio, language — unstructured data | Next module |

## Features

A **feature** is an input column the model sees. **Feature engineering** — creating helpful inputs like "day of week" or "words per message" — mattered enormously in classic ML. Deep learning learns features automatically, which is its great advantage on text, images and audio.

## When NOT to use an LLM

LLMs are tempting hammers. Prefer classic ML or plain code when:

- You have lots of labelled, tabular data (fraud scoring, demand forecasts).
- The decision must be fast, cheap and deterministic.
- A regular expression or rule solves it completely.

Use LLMs when the input is messy language or images, labelled data is scarce, or the task needs flexible reasoning. Good engineers pick the simplest tool that meets the metric.

# @quiz

? Why keep a separate test set that you only use at the very end?
- To make the model train faster
+ To get an honest estimate of performance on unseen data
- Because validation data is not allowed
- To increase the training set size
! Tuning on the test set contaminates it. A final untouched test gives a trustworthy score.

? A model has 99% training accuracy but 70% validation accuracy. What is the likely problem?
- Underfitting
+ Overfitting
- The metric is wrong
- Too little compute
! A large gap between train and validation performance signals overfitting.

? Fraud occurs in 1% of transactions. A model that always predicts "not fraud" has 99% accuracy. What does this show?
- The model is excellent
+ Accuracy is misleading on imbalanced data; look at precision and recall
- Fraud is impossible to detect
- The test set is too small
! You need metrics that reflect the minority class.

? Which metric is most important when a missed positive is very costly (e.g. disease screening)?
- Precision
+ Recall
- Training accuracy
- Parameter count
! Recall measures how many real positives you found.

? What is data leakage?
- Losing data from a database
+ Information about the answer slipping into the model's inputs, inflating results
- Sending data to the cloud
- Deleting duplicates
! Leakage makes offline scores look great and production performance poor.

? Why use a baseline model?
- It is required by scikit-learn
+ It tells you whether a complex model is actually adding value
- It reduces overfitting automatically
- It is always the most accurate
! A trivial baseline gives you a floor to beat; otherwise you can't tell progress from noise.
