const CHALLENGES = [
  {
    id: "fix-locator",
    title: "Fix the Flaky Locator",
    difficulty: "Beginner",
    category: "Selenium",
    prompt:
      "This Selenium locator is brittle: `driver.findElement(By.xpath(\"/html/body/div[3]/div/div[2]/form/div[1]/input\"))`. Rewrite it using a more robust locator strategy (id, data-testid, or a relative XPath/CSS selector), and explain why your version is more resilient to UI changes.",
    starter: "// Your improved locator + a short explanation:\n",
  },
  {
    id: "playwright-login",
    title: "Playwright Login Flow",
    difficulty: "Beginner",
    category: "Playwright",
    prompt:
      "Write a Playwright script (JS or Python) that navigates to a login page, fills in a username and password, clicks Submit, and asserts that a 'Welcome' message becomes visible. Rely on Playwright's built-in auto-waiting rather than manual sleeps.",
    starter: "// Your Playwright script:\n",
  },
  {
    id: "api-assertions",
    title: "API Test with Assertions",
    difficulty: "Beginner",
    category: "API Testing",
    prompt:
      "Using Python's `requests` library, write a test that GETs `/api/users/1`, asserts the status code is 200, and asserts the JSON response contains `id`, `name`, and `email` fields.",
    starter: "import requests\n\ndef test_get_user():\n    # your code here\n    pass\n",
  },
  {
    id: "page-object",
    title: "Page Object Model",
    difficulty: "Intermediate",
    category: "Automation Framework",
    prompt:
      "Write a Page Object class (Java or Python) for a login page. It should encapsulate the username/password locators and expose a `login(username, password)` method that a test can call.",
    starter: "// Your Page Object class:\n",
  },
  {
    id: "data-driven",
    title: "Data-Driven Test",
    difficulty: "Intermediate",
    category: "Automation Framework",
    prompt:
      "Write a parametrized test (pytest's @pytest.mark.parametrize, or TestNG's @DataProvider) that runs the same login test against 3 different username/password combinations.",
    starter: "// Your parametrized test:\n",
  },
  {
    id: "json-diff",
    title: "JSON Equality Ignoring Key Order",
    difficulty: "Intermediate",
    category: "API Testing",
    prompt:
      "Write a function in any language that takes two JSON objects and returns true if they are equal, ignoring the order of keys (but not ignoring array order). Handle nested objects.",
    starter: "function jsonEquals(a, b) {\n  // your code here\n}\n",
  },
  {
    id: "retry-wrapper",
    title: "Retry Logic for a Flaky Step",
    difficulty: "Intermediate",
    category: "Automation Framework",
    prompt:
      "Write a reusable retry wrapper/decorator (any language) that re-runs a given test step up to 3 times, with a short delay between attempts, before finally failing. It should log each attempt.",
    starter: "// Your retry wrapper:\n",
  },
  {
    id: "sql-verification",
    title: "SQL Verification Query",
    difficulty: "Intermediate",
    category: "SQL",
    prompt:
      "Write a SQL query to find all users who registered in the last 7 days but have never placed an order. Assume tables `users(id, created_at)` and `orders(id, user_id, created_at)`.",
    starter: "-- Your SQL query:\n",
  },
  {
    id: "llm-eval",
    title: "LLM Output Scoring Function",
    difficulty: "Advanced",
    category: "AI-QA",
    prompt:
      "Write a Python function that compares an LLM's response to a 'golden' expected answer using a simple similarity measure (e.g. token overlap or a string-similarity library), and returns a pass/fail flag if the score is below a given threshold. Briefly note its limitations.",
    starter: "def evaluate_response(actual, expected, threshold=0.7):\n    # your code here\n    pass\n",
  },
  {
    id: "ci-step",
    title: "CI Pipeline Step",
    difficulty: "Advanced",
    category: "DevOps",
    prompt:
      "Write a GitHub Actions workflow step (YAML) that installs dependencies, runs a test suite (e.g. `pytest` or `npm test`), and uploads the test report as an artifact if the tests fail.",
    starter: "# Your GitHub Actions step(s):\n",
  },
];

function renderChallenge(challenge) {
  const card = document.createElement("div");
  card.className = "quiz-card";

  card.innerHTML = `
    <span class="quiz-tag">${challenge.category} · ${challenge.difficulty}</span>
    <p class="quiz-question">${challenge.title}</p>
    <p style="color: var(--text-dim); font-size: 0.88rem; margin: 0 0 14px; line-height: 1.5;">${challenge.prompt}</p>
    <textarea class="challenge-code" rows="7" spellcheck="false">${challenge.starter}</textarea>
    <div class="tool-row">
      <button type="button" class="tool-btn challenge-feedback-btn">Get AI Feedback</button>
    </div>
    <div class="tool-output challenge-feedback-output" style="display:none;" aria-live="polite"></div>
  `;

  const codeEl = card.querySelector(".challenge-code");
  const btn = card.querySelector(".challenge-feedback-btn");
  const outputEl = card.querySelector(".challenge-feedback-output");

  btn.addEventListener("click", async () => {
    const code = codeEl.value.trim();
    if (!code) {
      showToast("Write something first.");
      return;
    }

    btn.disabled = true;
    btn.textContent = "Reviewing...";
    outputEl.style.display = "block";
    outputEl.classList.remove("error");
    outputEl.textContent = "Thinking...";

    const message = `Review my solution to this coding challenge. Be concise: note if it's correct, call out edge cases or bugs, and suggest one improvement if relevant.\n\nChallenge: ${challenge.title}\n${challenge.prompt}\n\nMy solution:\n${code}`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: message }] }),
      });
      const data = await res.json();

      if (!res.ok) {
        outputEl.classList.add("error");
        outputEl.textContent = `Error: ${data.error || res.statusText}`;
        return;
      }

      outputEl.textContent = data.reply;
      logCodingAttempt(challenge.id);
    } catch (err) {
      outputEl.classList.add("error");
      outputEl.textContent = `Error: ${err.message}`;
    } finally {
      btn.disabled = false;
      btn.textContent = "Get AI Feedback";
    }
  });

  return card;
}

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("coding-root");
  if (root) CHALLENGES.forEach((c) => root.appendChild(renderChallenge(c)));

  const tabs = document.querySelectorAll("#practice-tabs .filter-chip");
  const quizTab = document.getElementById("quiz-tab");
  const codingTab = document.getElementById("coding-tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      quizTab.style.display = tab.dataset.tab === "quiz-tab" ? "block" : "none";
      codingTab.style.display = tab.dataset.tab === "coding-tab" ? "block" : "none";
    });
  });
});
