const SEARCH_SYNONYMS = {
  e2e: "end to end",
  api: "application programming interface",
  ci: "continuous integration",
  cd: "continuous deployment continuous delivery",
  sdet: "software development engineer in test",
  oop: "object oriented programming",
  bva: "boundary value analysis",
  ep: "equivalence partitioning",
  llm: "large language model",
  ai: "artificial intelligence",
  qa: "quality assurance testing",
  ui: "user interface",
  ux: "user experience",
  sql: "structured query language database",
  rest: "representational state transfer api",
  jwt: "json web token",
};

function levenshtein(a, b) {
  if (a === b) return 0;
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;
  const dp = Array.from({ length: al + 1 }, () => new Array(bl + 1).fill(0));
  for (let i = 0; i <= al; i++) dp[i][0] = i;
  for (let j = 0; j <= bl; j++) dp[0][j] = j;
  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[al][bl];
}

function fuzzyIncludes(haystack, word) {
  if (haystack.includes(word)) return true;
  if (word.length < 4) return false;
  const maxDist = word.length > 7 ? 2 : 1;
  return haystack.split(/\s+/).some((hw) => Math.abs(hw.length - word.length) <= maxDist && levenshtein(hw, word) <= maxDist);
}

const REVERSE_SYNONYMS = {};
Object.entries(SEARCH_SYNONYMS).forEach(([acronym, phrase]) => {
  phrase.split(" ").forEach((w) => {
    if (!REVERSE_SYNONYMS[w]) REVERSE_SYNONYMS[w] = [];
    REVERSE_SYNONYMS[w].push(acronym);
  });
});

function wordMatches(haystack, word) {
  if (!word) return true;
  const candidates = new Set([word]);
  if (SEARCH_SYNONYMS[word]) SEARCH_SYNONYMS[word].split(" ").forEach((w) => candidates.add(w));
  if (REVERSE_SYNONYMS[word]) REVERSE_SYNONYMS[word].forEach((w) => candidates.add(w));
  return [...candidates].some((c) => fuzzyIncludes(haystack, c));
}

window.filterTopics = function (query) {
  const q = query.trim().toLowerCase();
  const words = q.split(/\s+/).filter(Boolean);
  let visibleCount = 0;
  document.querySelectorAll("#topic-grid .topic-card").forEach((card) => {
    const haystack = card.dataset.title || "";
    const match = !q || haystack.includes(q) || words.every((w) => wordMatches(haystack, w));
    card.classList.toggle("hidden", !match);
    if (match) visibleCount += 1;
  });

  const emptyHint = document.getElementById("topic-empty-hint");
  const grid = document.getElementById("topic-grid");
  if (emptyHint && grid) {
    emptyHint.style.display = visibleCount === 0 ? "block" : "none";
    grid.style.display = visibleCount === 0 ? "none" : "grid";
  }
};

function goToChat(question) {
  window.location.href = `/chat?q=${encodeURIComponent(question)}`;
}

const GOAL_TIPS = {
  fundamentals: "Start with the Roadmap section for a step-by-step path.",
  certification: "Check the Certifications section for what to study.",
  interview: "Check the Interview topics section to start prepping.",
  "career-change": "Check the Transition paths section for how others made this jump.",
};

function renderOnboardingState() {
  const promptCard = document.getElementById("onboarding-prompt-card");
  const recCard = document.getElementById("recommended-card");
  if (!promptCard || !recCard) return;

  const data = getOnboarding();
  if (!data) {
    promptCard.style.display = "";
    recCard.style.display = "none";
    return;
  }

  promptCard.style.display = "none";
  recCard.style.display = "";

  const titles = window.ROLE_TITLES || {};
  const titleEl = document.getElementById("recommended-title");
  const bodyEl = document.getElementById("recommended-body");
  const linkEl = document.getElementById("recommended-link");

  if (data.role && titles[data.role]) {
    titleEl.textContent = titles[data.role];
    linkEl.href = `/careers/${data.role}`;
    const tip = GOAL_TIPS[data.goal] || "";
    bodyEl.textContent = `Based on your goals, this is where to start. ${tip}`;
  } else {
    titleEl.textContent = "Explore the Career Explorer";
    linkEl.href = "/careers";
    bodyEl.textContent = "You said you're not sure yet — browse all TechOrbit roles to find your fit.";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderOnboardingState();

  const params = new URLSearchParams(window.location.search);
  if (params.get("q")) window.filterTopics(params.get("q"));

  const quickAskForm = document.getElementById("quick-ask-form");
  const quickAskInput = document.getElementById("quick-ask-input");
  if (quickAskForm) {
    quickAskForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const text = quickAskInput.value.trim();
      if (text) {
        goToChat(text);
      } else {
        showToast("Enter a question first.");
        quickAskInput.focus();
      }
    });
    quickAskInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        quickAskForm.requestSubmit();
      }
    });
  }

  document.querySelectorAll(".quick-chip").forEach((chip) => {
    chip.addEventListener("click", () => goToChat(chip.dataset.q));
  });
});
