function renderHistory() {
  const listEl = document.getElementById("history-list");
  const history = safeGet(HISTORY_KEY, []);
  listEl.innerHTML = "";

  if (history.length === 0) {
    listEl.innerHTML = '<div class="empty-hint">No questions yet — ask something in Chat to see it here.</div>';
    return;
  }

  history.forEach((item) => {
    const el = document.createElement("div");
    el.className = "list-item";
    el.innerHTML = `
      <div class="list-item-head">
        <p class="list-item-q">${item.question}</p>
        <span class="list-item-time">${formatRelativeTime(item.ts)}</span>
      </div>
      <div class="list-item-actions">
        <button type="button" class="mini-btn" data-action="ask">Ask again</button>
      </div>
    `;
    el.querySelector('[data-action="ask"]').addEventListener("click", () => {
      window.location.href = `/chat?q=${encodeURIComponent(item.question)}`;
    });
    listEl.appendChild(el);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderHistory();
  document.getElementById("clear-history-btn").addEventListener("click", () => {
    if (!confirm("Clear all chat history?")) return;
    safeSet(HISTORY_KEY, []);
    renderHistory();
    showToast("History cleared");
  });
});
