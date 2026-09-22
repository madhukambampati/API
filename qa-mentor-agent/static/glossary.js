const GLOSSARY_TERMS = [
  ["Acceptance Testing", "Formal testing to confirm a system meets business requirements, usually the last phase before release."],
  ["Agile Testing", "A testing approach embedded throughout iterative, agile development cycles rather than done at the end."],
  ["AI-QA", "The discipline of testing AI/LLM-powered features, including handling non-deterministic outputs and evaluating quality."],
  ["Alpha Testing", "Internal testing done by the development/QA team before releasing to external users."],
  ["API", "Application Programming Interface — a contract that lets software components communicate, commonly tested directly (not just via UI)."],
  ["Automation Framework", "A structured set of guidelines, tools, and libraries (e.g. Page Object Model) used to build automated tests consistently."],
  ["Beta Testing", "Testing done by real end users in a near-production environment before general release."],
  ["Black Box Testing", "Testing based only on inputs and expected outputs, without knowledge of internal code."],
  ["Boundary Value Analysis", "A test design technique that targets the edges of valid input ranges, where bugs commonly cluster."],
  ["Bug", "A flaw in software that causes it to behave in an unintended way."],
  ["Bug Life Cycle", "The stages a defect moves through: New → Assigned → Open → Fixed → Retest → Closed (or Reopened)."],
  ["Build Verification Test (BVT)", "A quick set of tests run on a new build to confirm it's stable enough for further testing (see also Smoke Testing)."],
  ["CI/CD", "Continuous Integration / Continuous Delivery — automatically building, testing, and deploying code on every change."],
  ["Code Coverage", "A metric showing how much of the source code is exercised by tests, e.g. line or branch coverage."],
  ["Continuous Testing", "Running automated tests at every stage of the CI/CD pipeline to get fast feedback."],
  ["Cross-Browser Testing", "Verifying an application works correctly across different browsers and versions."],
  ["Decision Table Testing", "A test design technique that maps combinations of conditions to expected actions/outcomes."],
  ["Defect", "Synonym for bug — a deviation from expected behavior."],
  ["Defect Density", "The number of confirmed defects per unit size of software (e.g. per 1,000 lines of code)."],
  ["Defect Leakage", "Bugs that escape one test phase and are found in a later phase (or production)."],
  ["Docker", "A containerization platform used to package apps (and test environments) so they run consistently anywhere."],
  ["Dry Run", "A test run without actually executing side effects, used to verify a process before doing it for real."],
  ["Embedding (AI)", "A numeric vector representation of text/data used by AI systems to capture semantic meaning."],
  ["End-to-End Testing", "Testing a complete user workflow from start to finish across all integrated components."],
  ["Equivalence Partitioning", "A test design technique that groups inputs into classes expected to behave the same way, testing one representative per class."],
  ["Exploratory Testing", "Simultaneous learning, test design, and execution — unscripted testing guided by the tester's judgment."],
  ["False Negative", "A test that passes when it should have failed — a real bug goes undetected."],
  ["False Positive", "A test that fails when the software is actually working correctly — usually a flaky or badly written test."],
  ["Flaky Test", "A test that passes and fails intermittently with no underlying code change, usually from timing or environment issues."],
  ["Functional Testing", "Testing that the software does what it's supposed to do, based on requirements."],
  ["Fuzz Testing", "Feeding random/invalid/unexpected data into a system to find crashes or security issues."],
  ["Golden Dataset (AI-QA)", "A curated, stable set of inputs with known-good expected outputs, used to detect regressions in an AI feature."],
  ["Gray Box Testing", "Testing with partial knowledge of internal implementation, blending black box and white box approaches."],
  ["Hallucination (AI)", "When an AI model generates confident but false or fabricated information."],
  ["Headless Browser", "A browser that runs without a visible UI, commonly used to speed up automated test execution."],
  ["Integration Testing", "Testing how multiple components or services work together."],
  ["JSON", "JavaScript Object Notation — a lightweight, widely used data format for APIs."],
  ["JWT (JSON Web Token)", "A compact, signed token format commonly used for authentication/authorization in APIs."],
  ["Load Testing", "Testing how a system performs under an expected (or above-expected) number of concurrent users/requests."],
  ["Localization Testing", "Verifying an app works correctly for a specific locale — language, currency, date formats, etc."],
  ["LLM (Large Language Model)", "A machine learning model trained on large amounts of text, used to generate or understand natural language."],
  ["LLM-as-Judge", "Using a separate LLM call to score/evaluate another model's output against a rubric."],
  ["Mocking", "Replacing a real dependency (API, database) with a fake, controllable stand-in for testing."],
  ["Monkey Testing", "Feeding random inputs/actions into an app to see if it crashes, without a specific test plan."],
  ["Mutation Testing", "Deliberately introducing small code changes (mutants) to check whether the test suite catches them."],
  ["Negative Testing", "Testing with invalid, unexpected, or malformed input to confirm the system handles it gracefully."],
  ["Non-Functional Testing", "Testing qualities like performance, security, usability, and reliability rather than specific features."],
  ["Page Object Model (POM)", "A design pattern that separates page structure/locators from test logic for maintainable automation."],
  ["Pair Testing", "Two people (e.g. a developer and tester) testing together in real time, combining perspectives."],
  ["Performance Testing", "An umbrella term for load, stress, soak, and spike testing — how a system behaves under various conditions."],
  ["Pipeline", "An automated sequence of steps (build, test, deploy) that code passes through in CI/CD."],
  ["Positive Testing", "Testing with valid input to confirm the system behaves as expected under normal conditions."],
  ["Priority (Bug)", "How soon a bug should be fixed, based on business urgency (distinct from severity)."],
  ["Prompt Engineering", "Designing and refining inputs to an LLM to reliably get the desired output."],
  ["Regression Testing", "Re-running tests to confirm that recent changes haven't broken existing functionality."],
  ["Requirements Traceability Matrix (RTM)", "A document mapping requirements to their corresponding test cases, to ensure full coverage."],
  ["REST", "Representational State Transfer — an architectural style for designing web APIs over HTTP."],
  ["Risk-Based Testing", "Prioritizing testing effort based on the likelihood and impact of potential failures."],
  ["Sanity Testing", "A quick, narrow check that a specific bug fix or feature works, without a full regression pass."],
  ["Security Testing", "Testing to uncover vulnerabilities like injection, broken auth, or data exposure."],
  ["Severity (Bug)", "How badly a bug affects the system technically (distinct from priority)."],
  ["Shift-Left Testing", "Moving testing earlier in the development process, rather than only at the end."],
  ["Smoke Testing", "A quick set of tests confirming the most critical functionality works before deeper testing begins."],
  ["SOAP", "Simple Object Access Protocol — an older, XML-based protocol for web services (less common than REST today)."],
  ["Soak Testing", "Running a system under sustained load for an extended period to catch memory leaks or degradation."],
  ["Spike Testing", "Testing how a system handles a sudden, sharp increase in load."],
  ["SDET", "Software Development Engineer in Test — an engineer who builds test automation and tooling, blending dev and QA skills."],
  ["Stress Testing", "Pushing a system beyond normal capacity to find its breaking point."],
  ["Stub", "A minimal, hard-coded stand-in for a dependency, used to isolate the component under test."],
  ["System Testing", "Testing the complete, integrated system against overall requirements."],
  ["Test Case", "A documented set of steps, inputs, and expected results used to verify a specific behavior."],
  ["Test Data", "The input data used to execute a test case."],
  ["Test-Driven Development (TDD)", "Writing a failing test before writing the code that makes it pass."],
  ["Test Plan", "A document describing the scope, approach, resources, and schedule of testing activities."],
  ["Test Pyramid", "A model suggesting more unit tests, fewer integration tests, and even fewer end-to-end/UI tests."],
  ["Test Script", "An automated implementation of a test case."],
  ["Token (AI)", "A chunk of text (roughly a word or part of a word) that an LLM processes as its basic unit of input/output."],
  ["Unit Testing", "Testing the smallest testable parts of code (functions/methods) in isolation."],
  ["Usability Testing", "Testing how easy and intuitive a system is for real users to use."],
  ["UAT (User Acceptance Testing)", "Testing performed by end users/clients to confirm the system meets their needs before go-live."],
  ["Volume Testing", "Testing how a system handles a large volume of data."],
  ["Waterfall Model", "A linear, sequential development model where testing happens as a distinct phase after development."],
  ["White Box Testing", "Testing with full knowledge of internal code structure and logic."],
  ["XPath", "A query language for selecting elements/nodes in an XML/HTML document, widely used for UI locators."],
  ["YAML", "A human-readable data format commonly used for configuration files, including CI/CD pipelines."],
];

const GIT_COMMANDS = [
  ["git init", "Initialize a new Git repository in the current folder."],
  ["git clone <url>", "Copy a remote repository to your local machine."],
  ["git status", "Show changed/staged/untracked files."],
  ["git add <file>", "Stage a file's changes for the next commit."],
  ['git commit -m "msg"', "Save staged changes as a new commit."],
  ["git push", "Upload local commits to the remote repository."],
  ["git pull", "Fetch and merge changes from the remote repository."],
  ["git branch", "List local branches."],
  ["git checkout -b <branch>", "Create and switch to a new branch."],
  ["git merge <branch>", "Merge another branch into the current one."],
  ["git log", "Show commit history."],
  ["git diff", "Show unstaged changes line by line."],
  ["git stash", "Temporarily shelve uncommitted changes."],
  ["git reset --hard", "Discard all local changes back to the last commit (destructive)."],
  ["git rebase <branch>", "Reapply commits on top of another base branch."],
  ["git remote -v", "List configured remote repositories."],
];

const HTTP_CODES = [
  ["200", "OK", "Request succeeded."],
  ["201", "Created", "A new resource was successfully created."],
  ["204", "No Content", "Success, but no response body."],
  ["301", "Moved Permanently", "Resource has a new permanent URL."],
  ["304", "Not Modified", "Cached version is still valid."],
  ["400", "Bad Request", "The request is malformed or invalid."],
  ["401", "Unauthorized", "Authentication is required or has failed."],
  ["403", "Forbidden", "Authenticated, but not allowed to access this resource."],
  ["404", "Not Found", "The resource doesn't exist."],
  ["405", "Method Not Allowed", "The HTTP method isn't supported for this endpoint."],
  ["409", "Conflict", "The request conflicts with the current state of the resource."],
  ["422", "Unprocessable Entity", "The request is well-formed but semantically invalid."],
  ["429", "Too Many Requests", "Rate limit exceeded."],
  ["500", "Internal Server Error", "A generic server-side failure."],
  ["502", "Bad Gateway", "An upstream server returned an invalid response."],
  ["503", "Service Unavailable", "The server is temporarily unable to handle the request."],
  ["504", "Gateway Timeout", "An upstream server took too long to respond."],
];

const CLI_COMMANDS = [
  ["ls", "List files in the current directory."],
  ["cd <dir>", "Change directory."],
  ["pwd", "Print the current working directory."],
  ["mkdir <dir>", "Create a new directory."],
  ["rm <file>", "Delete a file."],
  ["rm -rf <dir>", "Delete a directory and its contents, recursively (destructive)."],
  ["cp <src> <dest>", "Copy a file or directory."],
  ["mv <src> <dest>", "Move or rename a file."],
  ["cat <file>", "Print a file's contents."],
  ["grep <pattern> <file>", "Search for text matching a pattern in a file."],
  ["find <path> -name <pattern>", "Search for files by name."],
  ["chmod +x <file>", "Make a file executable."],
  ["ps aux", "List running processes."],
  ["kill <pid>", "Terminate a process by its ID."],
  ["curl <url>", "Make an HTTP request from the command line."],
  ["tail -f <file>", "Follow a file's new output in real time (e.g. a log file)."],
];

function renderGlossaryList(filter) {
  const listEl = document.getElementById("glossary-list");
  const q = (filter || "").trim().toLowerCase();
  const filtered = GLOSSARY_TERMS.filter(
    ([term, def]) => !q || term.toLowerCase().includes(q) || def.toLowerCase().includes(q)
  );

  listEl.innerHTML = filtered.length
    ? filtered
        .map(
          ([term, def]) =>
            `<div class="glossary-item"><h4>${term}</h4><p>${def}</p></div>`
        )
        .join("")
    : '<div class="empty-hint">No terms match your search.</div>';
}

function renderTable(bodyId, rows) {
  document.getElementById(bodyId).innerHTML = rows
    .map((cells) => `<tr>${cells.map((c) => `<td>${c}</td>`).join("")}</tr>`)
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  logTopicView("glossary");

  renderGlossaryList("");
  renderTable("git-table-body", GIT_COMMANDS);
  renderTable(
    "http-table-body",
    HTTP_CODES.map(([code, name, meaning]) => [code, name, meaning])
  );
  renderTable("cli-table-body", CLI_COMMANDS);

  document.getElementById("glossary-search").addEventListener("input", (e) => {
    renderGlossaryList(e.target.value);
  });

  const tabs = document.querySelectorAll("#ref-tabs .filter-chip");
  const panels = document.querySelectorAll(".ref-panel");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      panels.forEach((panel) => {
        panel.style.display = panel.id === tab.dataset.tab ? "block" : "none";
      });
    });
  });
});
