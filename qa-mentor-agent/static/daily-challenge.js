const DAILY_QUESTIONS = [
  {
    question: "What is the main difference between severity and priority in bug tracking?",
    options: [
      "Severity measures business urgency; priority measures technical impact",
      "Severity measures technical impact; priority measures business urgency/order of fixing",
      "They are the same thing, just different words",
      "Severity only applies to automated tests",
    ],
    correct: 1,
    explanation: "Severity = technical impact. Priority = how soon it should be fixed (business urgency).",
  },
  {
    question: "In Selenium, what's the main risk of using Thread.sleep() instead of explicit waits?",
    options: [
      "It makes tests run faster",
      "It wastes time when the element loads early, and can still fail if it loads late",
      "It's not supported in modern Selenium",
      "It only works with Chrome",
    ],
    correct: 1,
    explanation: "Thread.sleep() always waits the full duration, and still fails if the element takes longer than that.",
  },
  {
    question: "Which HTTP status code range generally indicates a client error?",
    options: ["2xx", "3xx", "4xx", "5xx"],
    correct: 2,
    explanation: "4xx = client errors (e.g. 400, 404). 5xx = server errors, 2xx = success, 3xx = redirection.",
  },
  {
    question: "Why is testing an LLM-powered feature different from testing typical deterministic software?",
    options: [
      "LLMs always give the exact same output for the same input",
      "LLM outputs can vary between runs, so tests often need similarity/quality scoring instead of exact-match assertions",
      "LLM features don't need any testing",
      "You can only test LLMs manually",
    ],
    correct: 1,
    explanation: "Non-deterministic outputs mean testing often relies on semantic similarity or LLM-as-judge rather than exact match.",
  },
  {
    question: "What does 'flaky test' mean?",
    options: [
      "A test that always fails",
      "A test that passes and fails intermittently without code changes",
      "A test written in a scripting language",
      "A test that only runs on Fridays",
    ],
    correct: 1,
    explanation: "Flaky tests give inconsistent results with no underlying code change — usually timing or environment issues.",
  },
  {
    question: "What's the difference between load testing and stress testing?",
    options: [
      "They are the same thing",
      "Load testing checks expected traffic; stress testing pushes beyond capacity to find the breaking point",
      "Load testing only applies to databases",
      "Stress testing is always done in production",
    ],
    correct: 1,
    explanation: "Load = expected traffic. Stress = intentionally exceeding capacity to find the breaking point.",
  },
  {
    question: "What does 'broken access control' refer to?",
    options: [
      "The app crashes on invalid input",
      "Users can access resources or actions they shouldn't be authorized for",
      "The website loads slowly",
      "Passwords are too short",
    ],
    correct: 1,
    explanation: "It means the system fails to properly restrict what authenticated users are allowed to view or do.",
  },
  {
    question: "What is the Page Object Model (POM) mainly used for?",
    options: [
      "Speeding up the browser",
      "Separating page structure/locators from test logic for maintainability",
      "Replacing the need for assertions",
      "Running tests in parallel automatically",
    ],
    correct: 1,
    explanation: "POM centralizes each page's locators/actions in a class, so UI changes require one update, not many.",
  },
  {
    question: "What is a 'golden dataset' used for in AI-QA?",
    options: [
      "Storing production secrets",
      "A curated set of inputs with known-good expected outputs, used to catch regressions",
      "A dataset only used for training, never testing",
      "A dataset of user passwords for security testing",
    ],
    correct: 1,
    explanation: "A stable, curated benchmark used to detect regressions as a model or prompt changes over time.",
  },
  {
    question: "In Playwright, what does 'auto-waiting' mean?",
    options: [
      "You must manually add sleep() before every action",
      "Playwright automatically waits for elements to be actionable before interacting with them",
      "Tests wait for the entire page to be idle for 30 seconds",
      "It only waits for network requests",
    ],
    correct: 1,
    explanation: "Playwright waits for elements to be visible, stable, and enabled before acting — reducing flakiness.",
  },
  {
    question: "What's the key difference between PUT and PATCH in a REST API?",
    options: [
      "PUT is for reading, PATCH is for writing",
      "PUT replaces the whole resource, PATCH applies a partial update",
      "They are identical in every API",
      "PATCH can only be used with XML",
    ],
    correct: 1,
    explanation: "PUT typically replaces the entire resource; PATCH applies a partial modification.",
  },
  {
    question: "What is 'LLM-as-judge' in AI-QA?",
    options: [
      "Using a human judge to write all the test cases",
      "Using another LLM call to evaluate/score the quality of a model's output against criteria",
      "A legal term unrelated to testing",
      "A way to speed up model training",
    ],
    correct: 1,
    explanation: "A separate model (or the same one in a judging role) scores outputs against a rubric.",
  },
  {
    question: "What is the test pyramid recommending?",
    options: [
      "Writing only end-to-end UI tests",
      "More unit tests at the base, fewer integration tests, and even fewer slow end-to-end tests at the top",
      "Testing only in production",
      "Equal numbers of every test type",
    ],
    correct: 1,
    explanation: "Many fast unit tests, a moderate number of integration tests, and few slow end-to-end tests.",
  },
  {
    question: "What does an INNER JOIN return?",
    options: [
      "All rows from both tables regardless of a match",
      "Only rows where there is a matching value in both tables",
      "Only rows from the left table",
      "A random sample of rows",
    ],
    correct: 1,
    explanation: "An INNER JOIN returns only rows where the join condition matches in both tables.",
  },
];

function getDailyIndex() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  return dayOfYear % DAILY_QUESTIONS.length;
}

function renderStreak() {
  const streak = getStreak();
  const pill = document.getElementById("streak-pill");
  if (pill) pill.textContent = `🔥 ${streak.count} day${streak.count === 1 ? "" : "s"} streak`;
}

function renderDailyAnswered(question, selectedIndex) {
  const optionsEl = document.getElementById("daily-options");
  const explanationEl = document.getElementById("daily-explanation");

  optionsEl.innerHTML = "";
  question.options.forEach((optionText, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "quiz-option";
    btn.textContent = optionText;
    btn.disabled = true;
    if (i === question.correct) btn.classList.add("correct");
    else if (i === selectedIndex) btn.classList.add("incorrect");
    optionsEl.appendChild(btn);
  });

  explanationEl.textContent = question.explanation;
  explanationEl.classList.add("show");
}

document.addEventListener("DOMContentLoaded", () => {
  const dailyState = safeGet("qa-mentor-daily-state", null);
  const today = todayStr();
  const index = getDailyIndex();
  const question = DAILY_QUESTIONS[index];

  document.getElementById("daily-question-text").textContent = question.question;
  renderStreak();

  if (dailyState && dailyState.date === today) {
    renderDailyAnswered(question, dailyState.selected);
    return;
  }

  const optionsEl = document.getElementById("daily-options");
  question.options.forEach((optionText, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "quiz-option";
    btn.textContent = optionText;
    btn.addEventListener("click", () => {
      const correct = i === question.correct;
      safeSet("qa-mentor-daily-state", { date: today, selected: i, correct });
      markDailyChallengeDone();
      renderDailyAnswered(question, i);
      renderStreak();
      showToast(correct ? "Correct! Streak updated 🔥" : "Not quite — see the explanation below");
    });
    optionsEl.appendChild(btn);
  });
});
