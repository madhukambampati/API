const QUESTIONS = [
  {
    category: "Manual Testing",
    question: "What is the main difference between severity and priority in bug tracking?",
    options: [
      "Severity measures business urgency; priority measures technical impact",
      "Severity measures technical impact; priority measures business urgency/order of fixing",
      "They are the same thing, just different words",
      "Severity only applies to automated tests",
    ],
    correct: 1,
    explanation:
      "Severity = how badly the bug affects the system (technical impact). Priority = how soon it should be fixed (business urgency). A low-severity typo on the homepage could still be high priority.",
  },
  {
    category: "Manual Testing",
    question: "Which testing technique picks test values at the edges of valid input ranges?",
    options: ["Equivalence partitioning", "Boundary value analysis", "Decision table testing", "Exploratory testing"],
    correct: 1,
    explanation:
      "Boundary value analysis targets the edges of input ranges (e.g. min, min+1, max-1, max) since bugs cluster around boundaries.",
  },
  {
    category: "Test Design",
    question: "A field accepts ages 18-60. Which set best tests equivalence partitioning?",
    options: ["17, 18, 60, 61", "18, 40, 60", "17, 40, 61", "-1, 0, 999"],
    correct: 1,
    explanation:
      "Equivalence partitioning picks one representative from each valid/invalid class. 18, 40, 60 covers the valid partition; boundary analysis would add 17/61 separately.",
  },
  {
    category: "Automation",
    question: "In Selenium, what's the main risk of using Thread.sleep() instead of explicit waits?",
    options: [
      "It makes tests run faster",
      "It wastes time when the element loads early, and can still fail if it loads late",
      "It's not supported in modern Selenium",
      "It only works with Chrome",
    ],
    correct: 1,
    explanation:
      "Thread.sleep() is a fixed wait — it always waits the full duration even if the element is ready sooner, and still fails if the element takes longer than the sleep.",
  },
  {
    category: "Automation",
    question: "What is the Page Object Model (POM) mainly used for?",
    options: [
      "Speeding up the browser",
      "Separating page structure/locators from test logic for maintainability",
      "Replacing the need for assertions",
      "Running tests in parallel automatically",
    ],
    correct: 1,
    explanation:
      "POM encapsulates each page's elements and actions in a class, so if the UI changes, you update one class instead of every test that touches that page.",
  },
  {
    category: "Automation",
    question: "In Playwright, what does 'auto-waiting' mean?",
    options: [
      "You must manually add sleep() before every action",
      "Playwright automatically waits for elements to be actionable before interacting with them",
      "Tests wait for the entire page to be idle for 30 seconds",
      "It only waits for network requests, never the DOM",
    ],
    correct: 1,
    explanation:
      "Playwright automatically waits for elements to be visible, stable, and enabled before clicking/typing, reducing flaky tests without manual waits.",
  },
  {
    category: "API Testing",
    question: "Which HTTP status code range generally indicates a client error?",
    options: ["2xx", "3xx", "4xx", "5xx"],
    correct: 2,
    explanation: "4xx = client errors (e.g. 400 Bad Request, 404 Not Found). 5xx = server errors, 2xx = success, 3xx = redirection.",
  },
  {
    category: "API Testing",
    question: "What's the key difference between PUT and PATCH in a REST API?",
    options: [
      "PUT is for reading, PATCH is for writing",
      "PUT replaces the whole resource, PATCH applies a partial update",
      "They are identical in every API",
      "PATCH can only be used with XML",
    ],
    correct: 1,
    explanation:
      "PUT typically replaces the entire resource representation, while PATCH applies a partial modification to it.",
  },
  {
    category: "API Testing",
    question: "When testing an API, why check the response schema, not just the status code?",
    options: [
      "Schema checks are slower, so they should be skipped",
      "A 200 response can still return the wrong or malformed data structure",
      "Status codes always guarantee correct data",
      "Schema validation replaces the need for a status code check",
    ],
    correct: 1,
    explanation:
      "A request can return 200 OK while the body is missing fields, has wrong types, or is otherwise malformed — schema validation catches that.",
  },
  {
    category: "SQL for Testers",
    question: "Which SQL clause would you use to find users with no orders, using a LEFT JOIN?",
    options: [
      "WHERE orders.id IS NOT NULL",
      "WHERE orders.id IS NULL",
      "WHERE orders.id = 0",
      "GROUP BY orders.id",
    ],
    correct: 1,
    explanation:
      "A LEFT JOIN keeps all rows from the left table; unmatched rows have NULL in the right table's columns, so WHERE orders.id IS NULL finds users with no matching order.",
  },
  {
    category: "AI-QA",
    question: "Why is testing an LLM-powered feature different from testing typical deterministic software?",
    options: [
      "LLMs always give the exact same output for the same input, just like normal functions",
      "LLM outputs can vary between runs, so tests often need similarity/quality scoring instead of exact-match assertions",
      "LLM features don't need any testing since the model is pre-trained",
      "You can only test LLMs manually, automation is impossible",
    ],
    correct: 1,
    explanation:
      "LLM outputs are often non-deterministic, so testing relies on techniques like semantic similarity checks, rubric-based scoring, or LLM-as-judge rather than strict equality.",
  },
  {
    category: "AI-QA",
    question: "What is 'LLM-as-judge' in AI-QA?",
    options: [
      "Using a human judge to write all the test cases",
      "Using another LLM call to evaluate/score the quality of a model's output against criteria",
      "A legal term unrelated to testing",
      "A way to speed up model training",
    ],
    correct: 1,
    explanation:
      "LLM-as-judge uses a separate model (or the same model in a judging role) to score outputs against a rubric — useful when outputs are too varied for exact-match checks.",
  },
  {
    category: "AI-QA",
    question: "What is a 'golden dataset' used for in AI-QA?",
    options: [
      "Storing production secrets",
      "A curated set of inputs with known-good expected outputs, used to catch regressions",
      "A dataset only used for training, never testing",
      "A dataset of user passwords for security testing",
    ],
    correct: 1,
    explanation:
      "A golden dataset is a stable, curated benchmark of inputs and expected/acceptable outputs used to detect regressions as a model or prompt changes over time.",
  },
  {
    category: "SDET Fundamentals",
    question: "What does 'flaky test' mean?",
    options: [
      "A test that always fails",
      "A test that passes and fails intermittently without code changes",
      "A test written in a scripting language",
      "A test that only runs on Fridays",
    ],
    correct: 1,
    explanation:
      "A flaky test gives inconsistent results (pass/fail) across runs with no underlying code change — usually caused by timing issues, shared state, or environment instability.",
  },
];

function renderQuestion(index) {
  const q = QUESTIONS[index];
  const card = document.createElement("div");
  card.className = "quiz-card";

  const tag = document.createElement("span");
  tag.className = "quiz-tag";
  tag.textContent = q.category;
  card.appendChild(tag);

  const question = document.createElement("p");
  question.className = "quiz-question";
  question.textContent = `${index + 1}. ${q.question}`;
  card.appendChild(question);

  const optionsWrap = document.createElement("div");
  optionsWrap.className = "quiz-options";

  const explanation = document.createElement("div");
  explanation.className = "quiz-explanation";
  explanation.textContent = q.explanation;

  q.options.forEach((optionText, optionIndex) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "quiz-option";
    btn.textContent = optionText;
    btn.addEventListener("click", () => {
      const buttons = optionsWrap.querySelectorAll(".quiz-option");
      buttons.forEach((b) => (b.disabled = true));

      const correct = optionIndex === q.correct;
      btn.classList.add(correct ? "correct" : "incorrect");
      if (!correct) buttons[q.correct].classList.add("correct");

      explanation.classList.add("show");
      recordPracticeAnswer(correct);
      updateProgressUI();
    });
    optionsWrap.appendChild(btn);
  });

  card.appendChild(optionsWrap);
  card.appendChild(explanation);
  return card;
}

function updateProgressUI() {
  const stats = safeGet(PRACTICE_KEY, { attempted: 0, correct: 0 });
  document.getElementById("quiz-progress-text").textContent = `${stats.attempted} answered all-time (cumulative)`;
  document.getElementById("quiz-score-pill").textContent = `Score: ${stats.correct}/${stats.attempted}`;
}

document.addEventListener("DOMContentLoaded", () => {
  logTopicView("practice");
  const root = document.getElementById("quiz-root");
  QUESTIONS.forEach((_, index) => root.appendChild(renderQuestion(index)));
  updateProgressUI();

  document.getElementById("reset-practice-btn").addEventListener("click", () => {
    if (!confirm("Reset your cumulative practice score shown on the Progress page?")) return;
    safeSet(PRACTICE_KEY, { attempted: 0, correct: 0 });
    updateProgressUI();
    showToast("Practice stats reset");
  });
});
