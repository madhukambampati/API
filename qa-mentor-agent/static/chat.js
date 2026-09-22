const chatEl = document.getElementById("chat");
const formEl = document.getElementById("chat-form");
const inputEl = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const emptyStateEl = document.getElementById("empty-state");
const modeSelect = document.getElementById("mentor-mode-select");

const history = [];

const MENTOR_MODE_KEY = "qa-mentor-chat-mode";
if (modeSelect) {
  const savedMode = safeGet(MENTOR_MODE_KEY, null);
  if (savedMode && [...modeSelect.options].some((o) => o.value === savedMode)) {
    modeSelect.value = savedMode;
  }
  modeSelect.addEventListener("change", () => {
    safeSet(MENTOR_MODE_KEY, modeSelect.value);
  });
}

document.querySelectorAll(".hero-pill").forEach((chip) => {
  chip.addEventListener("click", () => {
    inputEl.value = chip.dataset.prompt;
    formEl.requestSubmit();
  });
});

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
