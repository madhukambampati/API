const chatEl = document.getElementById("chat");
const formEl = document.getElementById("chat-form");
const inputEl = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const emptyStateEl = document.getElementById("empty-state");
const modeSelect = document.getElementById("mentor-mode-select");

const history = [];

const MODE_CONTENT = {
  sdet: {
    subtitle: "Ask anything about QA, SDET, or AI-QA.",
    placeholder: "Ask about test design, Selenium, Playwright, API testing, AI-QA...",
    prompts: [
      { icon: "🧭", label: "Selenium waits explained", prompt: "What's the difference between explicit and implicit waits in Selenium?" },
      { icon: "🗺️", label: "Manual → SDET roadmap", prompt: "Give me a 6-month roadmap to go from manual tester to SDET." },
      { icon: "🌐", label: "API testing basics", prompt: "Walk me through testing a REST API with Postman, step by step." },
      { icon: "🤖", label: "What is AI-QA?", prompt: "What is AI-QA, and how is testing an LLM feature different from testing normal software?" },
    ],
  },
  developer: {
    subtitle: "Ask anything about frontend, backend, or full-stack development.",
    placeholder: "Ask about APIs, databases, frameworks, debugging...",
    prompts: [
      { icon: "🧩", label: "Dependency injection explained", prompt: "Explain dependency injection with a simple example." },
      { icon: "🔧", label: "Build a REST API", prompt: "Walk me through building a REST API with authentication, step by step." },
      { icon: "🖥️", label: "Frontend vs. backend", prompt: "What's the difference between frontend and backend development?" },
      { icon: "🐞", label: "Debug this code", prompt: "How do I approach debugging a piece of code that's behaving unexpectedly?" },
    ],
  },
  devops: {
    subtitle: "Ask anything about CI/CD, containers, infrastructure, or incident response.",
    placeholder: "Ask about Docker, Kubernetes, Terraform, CI/CD pipelines...",
    prompts: [
      { icon: "🐳", label: "Docker vs. Kubernetes", prompt: "What's the difference between Docker and Kubernetes, and when do I need each?" },
      { icon: "🔄", label: "Build a CI/CD pipeline", prompt: "Walk me through building a CI/CD pipeline that tests and deploys on every push." },
      { icon: "📊", label: "What are SLOs?", prompt: "Explain SLIs, SLOs, and error budgets with a simple example." },
      { icon: "🚨", label: "Debug a production incident", prompt: "How would I approach debugging a service with rising latency in production?" },
    ],
  },
  career: {
    subtitle: "Ask anything about career growth, resumes, interviews, or role transitions.",
    placeholder: "Ask about resumes, interview prep, career transitions...",
    prompts: [
      { icon: "📄", label: "Improve my resume", prompt: "What makes a strong tech resume stand out?" },
      { icon: "🎯", label: "Prep for an interview", prompt: "Give me common interview questions for a QA/SDET role with strong sample answers." },
      { icon: "🔀", label: "Switch career tracks", prompt: "How do I transition from manual QA into a developer role?" },
      { icon: "💬", label: "Negotiate an offer", prompt: "What's a good approach to negotiating a job offer?" },
    ],
  },
};

function applyModeContent(mode) {
  const content = MODE_CONTENT[mode] || MODE_CONTENT.sdet;

  const subtitleEl = document.getElementById("chat-subtitle");
  if (subtitleEl) subtitleEl.textContent = content.subtitle;

  if (inputEl) inputEl.placeholder = content.placeholder;

  const pillsEl = document.getElementById("hero-pills");
  if (pillsEl) {
    pillsEl.innerHTML = content.prompts
      .map((p) => `<button type="button" class="hero-pill" data-prompt="${p.prompt.replace(/"/g, "&quot;")}">${p.icon} ${p.label}</button>`)
      .join("");
    pillsEl.querySelectorAll(".hero-pill").forEach((chip) => {
      chip.addEventListener("click", () => {
        inputEl.value = chip.dataset.prompt;
        formEl.requestSubmit();
      });
    });
  }
}

const MENTOR_MODE_KEY = "qa-mentor-chat-mode";
if (modeSelect) {
  const savedMode = safeGet(MENTOR_MODE_KEY, null);
  if (savedMode && [...modeSelect.options].some((o) => o.value === savedMode)) {
    modeSelect.value = savedMode;
  }
  applyModeContent(modeSelect.value);
  modeSelect.addEventListener("change", () => {
    safeSet(MENTOR_MODE_KEY, modeSelect.value);
    applyModeContent(modeSelect.value);
  });
} else {
  applyModeContent("sdet");
}

function setGreeting() {
  const greetingEl = document.getElementById("greeting-text");
  if (!greetingEl) return;
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  const profile = getProfile();
  const name = profile.name && profile.name !== "You" ? profile.name : "there";
  greetingEl.textContent = `Good ${timeOfDay}, ${name}`;
}

function setupVoiceInput() {
  const micBtn = document.getElementById("mic-btn");
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!micBtn || !SpeechRecognition) return;

  micBtn.style.display = "flex";
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  let listening = false;
  let baseText = "";

  recognition.addEventListener("result", (event) => {
    let transcript = "";
    for (let i = 0; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    inputEl.value = baseText ? `${baseText} ${transcript}`.trim() : transcript;
    inputEl.dispatchEvent(new Event("input"));
  });

  recognition.addEventListener("end", () => {
    listening = false;
    micBtn.classList.remove("listening");
  });

  recognition.addEventListener("error", () => {
    listening = false;
    micBtn.classList.remove("listening");
    showToast("Couldn't access the microphone.");
  });

  function startListening() {
    if (listening) return;
    baseText = inputEl.value.trim();
    listening = true;
    micBtn.classList.add("listening");
    try {
      recognition.start();
    } catch (err) {
      /* already started */
    }
  }

  function stopListening() {
    if (!listening) return;
    recognition.stop();
  }

  micBtn.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    startListening();
  });
  micBtn.addEventListener("pointerup", stopListening);
  micBtn.addEventListener("pointerleave", stopListening);
  micBtn.addEventListener("pointercancel", stopListening);
}

inputEl.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    formEl.requestSubmit();
  }
});

inputEl.addEventListener("input", () => {
  inputEl.style.height = "auto";
  inputEl.style.height = `${Math.min(inputEl.scrollHeight, 140)}px`;
});

function appendMessage(role, text) {
  const isAssistant = role.startsWith("assistant");

  const row = document.createElement("div");
  row.className = `msg-row ${isAssistant ? "assistant" : "user"}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = isAssistant ? "\u{1F9EA}" : "\u{1F642}";

  const wrap = document.createElement("div");
  wrap.className = "bubble-wrap";

  const bubble = document.createElement("div");
  bubble.className = `bubble ${role}`;
  bubble.textContent = text;
  wrap.appendChild(bubble);

  row.append(...(isAssistant ? [avatar, wrap] : [wrap, avatar]));
  chatEl.appendChild(row);
  chatEl.scrollTop = chatEl.scrollHeight;
  return { bubble, wrap };
}

function addBookmarkButton(wrap, question, getAnswer) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "bookmark-btn";
  btn.textContent = "☆ Bookmark";
  btn.addEventListener("click", () => {
    addBookmark(question, getAnswer());
    btn.textContent = "★ Bookmarked";
    btn.classList.add("saved");
    btn.disabled = true;
    showToast("Saved to Bookmarks");
  });
  wrap.appendChild(btn);
}

async function sendMessage(text) {
  if (!text) return;

  inputEl.value = "";
  inputEl.style.height = "auto";

  if (emptyStateEl) emptyStateEl.remove();

  appendMessage("user", text);
  history.push({ role: "user", content: text });
  logHistory(text);

  const { bubble: pending, wrap } = appendMessage("assistant pending", "");
  pending.innerHTML =
    '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';

  sendBtn.disabled = true;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history, mode: modeSelect ? modeSelect.value : undefined }),
    });
    const data = await res.json();

    if (!res.ok) {
      pending.textContent = `Error: ${data.error || res.statusText}`;
      pending.classList.remove("pending");
      return;
    }

    pending.textContent = data.reply;
    pending.classList.remove("pending");
    history.push({ role: "assistant", content: data.reply });
    addBookmarkButton(wrap, text, () => data.reply);
  } catch (err) {
    pending.textContent = `Error: ${err.message}`;
    pending.classList.remove("pending");
  } finally {
    sendBtn.disabled = false;
    inputEl.focus();
  }
}

formEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = inputEl.value.trim();
  await sendMessage(text);
});

document.addEventListener("DOMContentLoaded", () => {
  setGreeting();
  setupVoiceInput();

  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");
  if (q) {
    inputEl.value = q;
    sendMessage(q);
    window.history.replaceState({}, "", "/chat");
  }
});
