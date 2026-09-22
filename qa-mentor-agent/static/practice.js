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
  {
    category: "Performance Testing",
    question: "What's the difference between load testing and stress testing?",
    options: [
      "They are the same thing",
      "Load testing checks expected traffic; stress testing pushes beyond capacity to find the breaking point",
      "Load testing only applies to databases",
      "Stress testing is always done in production",
    ],
    correct: 1,
    explanation:
      "Load testing verifies behavior under expected/peak load, while stress testing intentionally exceeds capacity to see how and where the system fails.",
  },
  {
    category: "Performance Testing",
    question: "In performance test results, what does the 'p95 latency' mean?",
    options: [
      "The latency exactly 95 users experienced",
      "95% of requests completed at or below this response time",
      "The test ran for 95 seconds",
      "95% of requests failed",
    ],
    correct: 1,
    explanation:
      "p95 (95th percentile) means 95% of requests were as fast or faster than this value — percentiles give a much better picture than averages, which hide outliers.",
  },
  {
    category: "Performance Testing",
    question: "What is 'soak testing' used to uncover?",
    options: [
      "Typos in the UI",
      "Memory leaks and gradual degradation under sustained load over time",
      "Browser compatibility issues",
      "Whether the app works offline",
    ],
    correct: 1,
    explanation:
      "Soak (endurance) testing runs a system under load for an extended period to catch issues like memory leaks that only show up over time.",
  },
  {
    category: "Security Testing",
    question: "What does 'broken access control' (an OWASP Top 10 category) refer to?",
    options: [
      "The app crashes on invalid input",
      "Users can access resources or actions they shouldn't be authorized for",
      "The website loads slowly",
      "Passwords are too short",
    ],
    correct: 1,
    explanation:
      "Broken access control means the system fails to properly restrict what authenticated users are allowed to view or do — e.g. one user viewing another user's private data by changing an ID in the URL.",
  },
  {
    category: "Security Testing",
    question: "What is SQL injection?",
    options: [
      "A performance optimization technique",
      "Inserting malicious SQL through user input to manipulate or access the database",
      "A way to speed up database queries",
      "A type of database backup",
    ],
    correct: 1,
    explanation:
      "SQL injection exploits unsanitized user input that's concatenated directly into SQL queries, letting an attacker read, modify, or delete data they shouldn't have access to.",
  },
  {
    category: "Security Testing",
    question: "What does BOLA (Broken Object Level Authorization) mean for APIs?",
    options: [
      "The API returns malformed JSON",
      "A user can access another user's object/resource just by changing an ID in the request",
      "The API is missing documentation",
      "The API doesn't support pagination",
    ],
    correct: 1,
    explanation:
      "BOLA happens when an API checks that a user is authenticated but not that they actually own the specific resource being requested — e.g. GET /orders/1234 returning someone else's order.",
  },
  {
    category: "Security Testing",
    question: "What is the purpose of a tool like OWASP ZAP or Burp Suite in security testing?",
    options: [
      "Generating test data",
      "Intercepting, inspecting, and manipulating HTTP requests/responses to probe for vulnerabilities",
      "Writing unit tests",
      "Managing test case documentation",
    ],
    correct: 1,
    explanation:
      "These are web proxy tools that sit between your browser and the app, letting you see and modify raw requests — essential for manual security testing and automated scanning.",
  },
  {
    category: "Mobile Testing",
    question: "What is 'device fragmentation' in mobile testing?",
    options: [
      "A phone's screen physically cracking",
      "The wide variety of devices, OS versions, and screen sizes an app must support",
      "Splitting an app into microservices",
      "A type of memory leak",
    ],
    correct: 1,
    explanation:
      "Device fragmentation refers to the huge number of device models, screen sizes, and OS versions in the real world, which is why mobile testing often uses device labs or cloud device farms.",
  },
  {
    category: "Mobile Testing",
    question: "What is Appium primarily used for?",
    options: [
      "Designing app UI mockups",
      "Automating tests for native, hybrid, and mobile web apps on iOS and Android",
      "Publishing apps to the App Store",
      "Writing backend APIs",
    ],
    correct: 1,
    explanation:
      "Appium is an open-source automation framework for mobile apps, using the WebDriver protocol to drive iOS and Android apps similarly to how Selenium drives browsers.",
  },
  {
    category: "Mobile Testing",
    question: "Why test how an app handles an incoming phone call or notification interruption?",
    options: [
      "It's not important for mobile testing",
      "Interruptions can crash the app or corrupt its state if not handled properly, which is unique to mobile",
      "Only iOS apps need this test",
      "It only matters for tablets",
    ],
    correct: 1,
    explanation:
      "Mobile apps can be interrupted by calls, notifications, low battery warnings, or app switching — testing these interruptions catches state-management bugs that desktop/web apps don't face.",
  },
  {
    category: "DevOps for QA",
    question: "In a CI/CD pipeline, what is a 'quality gate'?",
    options: [
      "A physical security checkpoint",
      "An automated checkpoint that blocks a deployment if tests or quality metrics don't pass",
      "A manual sign-off required from the CEO",
      "A firewall rule",
    ],
    correct: 1,
    explanation:
      "A quality gate is a pipeline stage that automatically stops a release from progressing if criteria like test pass rate, coverage, or security scan results aren't met.",
  },
  {
    category: "DevOps for QA",
    question: "What is the main benefit of running tests inside a Docker container?",
    options: [
      "Tests run faster no matter what",
      "A consistent, reproducible environment regardless of the host machine",
      "It removes the need for test data",
      "It automatically fixes flaky tests",
    ],
    correct: 1,
    explanation:
      "Containers package the exact OS, dependencies, and configuration the tests need, avoiding 'works on my machine' issues across different environments.",
  },
  {
    category: "DevOps for QA",
    question: "What does 'shift-left' mean in a CI/CD context?",
    options: [
      "Moving your team to a different time zone",
      "Moving testing activities earlier in the development/pipeline process",
      "Only testing left-aligned UI elements",
      "Running tests only at the end of the sprint",
    ],
    correct: 1,
    explanation:
      "Shift-left means catching issues as early as possible — e.g. running unit tests and linters on every commit rather than waiting for a dedicated QA phase at the end.",
  },
  {
    category: "DevOps for QA",
    question: "What is a canary release?",
    options: [
      "A release that only happens on weekends",
      "Rolling out a new version to a small subset of users/traffic before a full rollout",
      "A type of automated test",
      "A release with no testing at all",
    ],
    correct: 1,
    explanation:
      "Canary releases gradually expose a new version to a small percentage of real traffic, so problems can be caught and rolled back before affecting everyone.",
  },
  {
    category: "Automation",
    question: "What is the main advantage of data-driven testing?",
    options: [
      "It removes the need for assertions",
      "The same test logic runs against multiple sets of input/expected data without duplicating code",
      "It only works with SQL databases",
      "It guarantees 100% code coverage",
    ],
    correct: 1,
    explanation:
      "Data-driven testing separates test logic from test data, so you can run the same test scenario (e.g. login) against many different input combinations by just adding more data rows.",
  },
  {
    category: "Automation",
    question: "Why is thread-safety important when running automated tests in parallel?",
    options: [
      "It isn't important, parallel tests are always safe",
      "Shared state between parallel tests can cause one test to corrupt or interfere with another",
      "Parallel execution automatically fixes shared state",
      "It only matters for performance tests",
    ],
    correct: 1,
    explanation:
      "If tests share mutable state (a static variable, a shared test account, a shared file) running them in parallel can cause race conditions and flaky, hard-to-diagnose failures.",
  },
  {
    category: "Automation",
    question: "What is a 'mock' used for in automated testing?",
    options: [
      "Making fun of bad code",
      "Replacing a real dependency (API, database) with a controllable fake for isolated testing",
      "Generating UI screenshots",
      "Formatting test reports",
    ],
    correct: 1,
    explanation:
      "Mocking lets you isolate the component under test from real, possibly slow or unreliable, external dependencies by substituting a fake with predictable behavior.",
  },
  {
    category: "AI-QA",
    question: "Why can't you always use exact string matching to test an LLM's response?",
    options: [
      "Exact matching is always fine for LLMs",
      "LLMs can phrase a correct answer many different valid ways, so exact match is often too strict",
      "LLMs never produce text output",
      "String comparison is technically impossible in most languages",
    ],
    correct: 1,
    explanation:
      "Because LLM outputs are naturally variable in phrasing, testing usually relies on semantic similarity, rubric scoring, or LLM-as-judge rather than requiring an exact string match.",
  },
  {
    category: "AI-QA",
    question: "What is 'red-teaming' in the context of AI-QA?",
    options: [
      "Testing only with a team wearing red shirts",
      "Deliberately trying to make an AI system produce harmful, biased, or unsafe outputs to find weaknesses",
      "A performance testing technique",
      "A code review process for backend APIs",
    ],
    correct: 1,
    explanation:
      "Red-teaming means adversarially probing an AI system — trying prompts designed to elicit unsafe, biased, or policy-violating outputs — to find and fix weaknesses before real users do.",
  },
  {
    category: "AI-QA",
    question: "What's a key risk of relying only on an LLM to judge another LLM's output (LLM-as-judge)?",
    options: [
      "It's always 100% accurate and needs no validation",
      "The judge model can have its own biases or blind spots, so its scores should be validated against human judgment",
      "It's technically impossible to implement",
      "It only works for math problems",
    ],
    correct: 1,
    explanation:
      "LLM-as-judge is useful for scaling evaluation, but the judge model isn't infallible — its scoring should be spot-checked against human review to confirm it's actually measuring what you care about.",
  },
  {
    category: "SDET Fundamentals",
    question: "What is the 'test pyramid' recommending?",
    options: [
      "Writing only end-to-end UI tests",
      "More unit tests at the base, fewer integration tests, and even fewer slow end-to-end/UI tests at the top",
      "Testing only in production",
      "Equal numbers of every test type",
    ],
    correct: 1,
    explanation:
      "The test pyramid favors many fast, cheap unit tests as the foundation, a moderate number of integration tests, and a small number of slower, more brittle end-to-end tests at the top.",
  },
  {
    category: "SDET Fundamentals",
    question: "What is the Page Object Model's main benefit for framework maintainability?",
    options: [
      "It makes tests run faster",
      "UI locators live in one place per page, so a UI change requires updating one class instead of every test",
      "It removes the need for assertions",
      "It automatically generates test cases",
    ],
    correct: 1,
    explanation:
      "By centralizing each page's locators and actions in a dedicated class, a UI change only requires updating that one Page Object rather than hunting through every test file.",
  },
  {
    category: "SQL for Testers",
    question: "What does an INNER JOIN return?",
    options: [
      "All rows from both tables regardless of a match",
      "Only rows where there is a matching value in both tables",
      "Only rows from the left table",
      "A random sample of rows",
    ],
    correct: 1,
    explanation:
      "An INNER JOIN returns only the rows where the join condition matches in both tables — non-matching rows from either side are excluded.",
  },
  {
    category: "SQL for Testers",
    question: "As a tester, why would you run a direct SQL query instead of only checking the UI?",
    options: [
      "SQL is always faster to write than a UI check",
      "To verify the underlying data actually changed correctly, independent of how the UI displays it",
      "SQL queries replace the need for any UI testing",
      "It's required by every test framework",
    ],
    correct: 1,
    explanation:
      "The UI can sometimes mask a data problem (e.g. caching, formatting). Querying the database directly confirms the actual state of the data, which is a valuable independent verification.",
  },
  {
    category: "Career",
    question: "In a QA/SDET job interview, why is quantifying your resume impact (e.g. '% coverage increased') valuable?",
    options: [
      "It's not valuable, interviewers ignore numbers",
      "It gives concrete evidence of impact rather than a vague list of responsibilities",
      "It's only useful for management roles",
      "It replaces the need to explain your approach",
    ],
    correct: 1,
    explanation:
      "Concrete, quantified outcomes ('reduced regression time from 3 days to 4 hours') are far more persuasive to interviewers than a general statement like 'responsible for testing' — they show measurable impact.",
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
