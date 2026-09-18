const chatEl = document.getElementById("chat");
const formEl = document.getElementById("chat-form");
const inputEl = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");

const history = [];

inputEl.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    formEl.requestSubmit();
  }
});

function appendMessage(role, text) {
  const bubble = document.createElement("div");
  bubble.className = `bubble ${role}`;
  bubble.textContent = text;
  chatEl.appendChild(bubble);
  chatEl.scrollTop = chatEl.scrollHeight;
  return bubble;
}

formEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = inputEl.value.trim();
  if (!text) return;

  inputEl.value = "";
  sendBtn.disabled = true;

  appendMessage("user", text);
  history.push({ role: "user", content: text });

  const pending = appendMessage("assistant pending", "Thinking...");

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
