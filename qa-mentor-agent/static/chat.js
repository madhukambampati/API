const chatEl = document.getElementById("chat");
const formEl = document.getElementById("chat-form");
const inputEl = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const emptyStateEl = document.getElementById("empty-state");

const history = [];

document.querySelectorAll(".suggestion-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    inputEl.value = chip.dataset.prompt;
    formEl.requestSubmit();
  });
});

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
      body: JSON.stringify({ messages: history }),
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
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");
  if (q) {
    inputEl.value = q;
    sendMessage(q);
    window.history.replaceState({}, "", "/chat");
  }
});
