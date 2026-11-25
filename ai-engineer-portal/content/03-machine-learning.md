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

### See it happen

A decision tree can grow as deep as it likes. Watch training accuracy climb to 100% while test accuracy stops improving — the gap is overfitting. (Click **Run**; scikit-learn loads in your browser the first time.)

```python run
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

X, y = make_classification(n_samples=600, n_features=20, n_informative=5,
                           flip_y=0.1, random_state=0)       # 10% noisy labels
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=0)

print("depth  train  test")
for depth in [1, 2, 4, 8, 16, None]:
    tree = DecisionTreeClassifier(max_depth=depth, random_state=0).fit(X_tr, y_tr)
    print(f"{str(depth):>5}  {tree.score(X_tr, y_tr):.2f}   {tree.score(X_te, y_te):.2f}")
```

> **Expected output:**
> ```text
> depth  train  test
>     1  0.81   0.77
>     2  0.85   0.79
>     4  0.87   0.79
>     8  0.96   0.77
>    16  1.00   0.73
>  None  1.00   0.73
> ```

Read the table: shallow trees **underfit** (both scores low); very deep trees **memorise** the training data (train 1.00) including the noisy labels, and test accuracy falls back. The best model is somewhere in the middle — and you can only find it by looking at data the model did not train on.

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

### Worked example

A fraud model checks 10 transactions. 1 means fraud.

```python run
from sklearn.metrics import confusion_matrix, precision_score, recall_score, accuracy_score

actual    = [0, 0, 1, 0, 1, 0, 0, 1, 0, 0]
predicted = [0, 1, 1, 0, 0, 0, 0, 1, 0, 0]

tn, fp, fn, tp = confusion_matrix(actual, predicted).ravel()
print(f"TP={tp} FP={fp} FN={fn} TN={tn}")
print("precision", round(precision_score(actual, predicted), 2))   # 2 / (2 + 1)
print("recall   ", round(recall_score(actual, predicted), 2))      # 2 / (2 + 1)
print("accuracy ", accuracy_score(actual, predicted))              # 8 / 10
```

> **Expected output:**
> ```text
> TP=2 FP=1 FN=1 TN=6
> precision 0.67
> recall    0.67
> accuracy  0.8
> ```

It caught 2 of the 3 frauds (recall 0.67) and 1 of its 3 alarms was false (precision 0.67), yet accuracy looks like a healthy 80%. Now try the useless model `predicted = [0] * 10`: accuracy 0.7, recall 0.

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

```python run
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

> **Expected output:**
> ```text
> accuracy: 0.9
>               precision    recall  f1-score   support
>
>            0       1.00      1.00      1.00        10
>            1       0.82      0.90      0.86        10
>            2       0.89      0.80      0.84        10
>
>     accuracy                           0.90        30
>    macro avg       0.90      0.90      0.90        30
> weighted avg       0.90      0.90      0.90        30
> ```

The rows `0`, `1`, `2` are the three iris species. **Support** is how many test examples each class had.

Notice the shape: **split → fit → predict → score**. It is the same for nearly every scikit-learn model.

## Pipelines prevent leakage

Put preprocessing and the model in one `Pipeline` so scaling is learned from training data only:

```python run
from sklearn.datasets import load_iris
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score

X, y = load_iris(return_X_y=True)
clf = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
scores = cross_val_score(clf, X, y, cv=5)       # 5-fold cross-validation
print(scores.round(3))
print(f"mean {scores.mean():.3f} ± {scores.std():.3f}")
```

> **Expected output:**
> ```text
> [0.967 1.    0.933 0.9   1.   ]
> mean 0.960 ± 0.039
> ```

**Cross-validation** repeats train/validate across several splits, giving a more trustworthy estimate than one lucky split.

## Text classification, the classic way

```python run
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

> **Expected output:**
> ```text
> ['billing' 'bug']
> ```

This tiny model turns words into numbers (TF-IDF) and learns which words indicate which class. Hold that thought: LLM-based classification (module 7) does the same job with far less labelled data — but classic ML like this is still faster, cheaper and easier to evaluate when you *do* have labelled data.

> **Exercise:** Extend the ticket CSV from module 2 to 60 rows across 3 categories. Train a TF-IDF classifier, report precision and recall per category, and read the five most misclassified tickets. What do the mistakes have in common?

> **Solution:**
> Here is a compact version with 30 tickets you can run right here. Your own 60-ticket CSV works the same way with `pd.read_csv`.
>
> ```python run
> from sklearn.feature_extraction.text import TfidfVectorizer
> from sklearn.linear_model import LogisticRegression
> from sklearn.pipeline import make_pipeline
> from sklearn.model_selection import train_test_split
> from sklearn.metrics import classification_report
>
> billing = ["refund my order", "charged twice", "invoice is wrong", "cancel my subscription",
>            "billing address update", "payment failed", "need a receipt", "card was declined",
>            "price is higher than shown", "remove the late fee"]
> bug = ["app crashes on login", "error 500 on checkout", "button does nothing", "page will not load",
>        "crash when saving", "images are broken", "search returns nothing", "app freezes",
>        "login loop error", "export gives a blank file"]
> other = ["change my username", "how do I invite a teammate", "where is the dark mode",
>          "delete my account", "do you have an api", "is there a mobile app", "update my email",
>          "request a feature", "who do I contact for sales", "how do I reset my password"]
> texts = billing + bug + other
> labels = ["billing"] * 10 + ["bug"] * 10 + ["other"] * 10
>
> X_tr, X_te, y_tr, y_te = train_test_split(texts, labels, test_size=0.4,
>                                           random_state=1, stratify=labels)
> clf = make_pipeline(TfidfVectorizer(), LogisticRegression(max_iter=1000)).fit(X_tr, y_tr)
> pred = clf.predict(X_te)
> print(classification_report(y_te, pred, zero_division=0))
> for text, want, got in zip(X_te, y_te, pred):
>     if want != got:
>         print(f"WRONG  {text!r}: expected {want}, got {got}")
> ```
>
> Expected output (the first part is the report; accuracy is only **0.58**):
>
> ```text
> WRONG  'request a feature': expected other, got bug
> WRONG  'charged twice': expected billing, got bug
> WRONG  'where is the dark mode': expected other, got billing
> WRONG  'card was declined': expected billing, got bug
> WRONG  'payment failed': expected billing, got bug
> ```
>
> **What the mistakes have in common:** each wrong ticket shares no words with the training tickets of its own class. "card was declined" and "payment failed" are obviously billing to a human, but no billing ticket in the training split used "card", "declined", "payment" or "failed", so the model falls back to a guess. TF-IDF only matches exact words; it has no idea that "declined" relates to "refund". Two fixes: much more varied training data (this is why 18 training examples is far too few), or a representation that understands meaning — embeddings (module 4) and LLMs (module 7).

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

? Why keep a test set that you only use at the very end?
- It makes training noticeably faster
+ It gives an honest score on data the model never influenced
- scikit-learn refuses to train without one
- It quietly increases the amount of data available for training the model
! If you tune against the test set, it leaks into your choices and the score becomes optimistic.

? Training accuracy is 99% and validation accuracy is 70%. What is the most likely problem?
- Underfitting
+ Overfitting
- Data imbalance
- A slow learning rate
! A large train/validation gap means the model memorised training data rather than learning the pattern.

? Fraud is 1% of transactions. A model that always says "not fraud" scores 99% accuracy. What does that show?
- The model is excellent and ready to ship
+ Accuracy hides rare-class failures
- Fraud detection is impossible with data this imbalanced, so stop
- The test set must be too small to trust
! It catches zero fraud. On imbalanced data, look at precision and recall for the rare class.

? For cancer screening, which mistake is worst, and so which metric matters most?
- False alarms, so precision matters most
+ Missed cases, so recall matters most
- Slow predictions, so latency matters most
- Large models, so parameter count matters most
! Missing a real case is far costlier than a false alarm that gets re-checked, so recall comes first.

? A churn model uses the column "account_closed_date" as an input. What is wrong?
- Dates cannot be used as model features
+ It is only known after the outcome, so it leaks the answer
- The column should first be scaled to between 0 and 1 for the model
- Nothing; more columns always improve accuracy
! A feature that exists only after the event leaks the label. Offline scores look great; production fails.

? Your new model scores 81%. Why also check a simple baseline?
+ To see whether 81% is actually better than a trivial guess
- Because baselines are always more accurate than models
- Because scikit-learn requires a baseline before predicting
- To make the model train with fewer examples
! If always predicting the majority class scores 80%, your 81% model adds almost nothing.

? A decision tree gets deeper. Training accuracy hits 100% while test accuracy falls. What should you do?
- Keep the deepest tree; it scores highest
+ Choose the depth where test (or validation) accuracy peaks
- Remove the test set, since it disagrees with training
- Add more depth until test accuracy also reaches 100%
! The best model is the one that generalises — where validation performance is highest, not training.
