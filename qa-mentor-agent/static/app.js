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

  const bubble = document.createElement("div");
  bubble.className = `bubble ${role}`;
  bubble.textContent = text;

  row.append(...(isAssistant ? [avatar, bubble] : [bubble, avatar]));
  chatEl.appendChild(row);
  chatEl.scrollTop = chatEl.scrollHeight;
  return bubble;
}

formEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = inputEl.value.trim();
  if (!text) return;

  inputEl.value = "";
  inputEl.style.height = "auto";
  sendBtn.disabled = true;

  if (emptyStateEl) emptyStateEl.remove();

  appendMessage("user", text);
  history.push({ role: "user", content: text });

  const pending = appendMessage("assistant pending", "");
  pending.innerHTML =
    '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';

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
  } catch (err) {
    pending.textContent = `Error: ${err.message}`;
    pending.classList.remove("pending");
  } finally {
    sendBtn.disabled = false;
    inputEl.focus();
  }
});
