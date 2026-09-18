function renderBookmarks() {
  const listEl = document.getElementById("bookmarks-list");
  const bookmarks = safeGet(BOOKMARKS_KEY, []);
  listEl.innerHTML = "";

  if (bookmarks.length === 0) {
    listEl.innerHTML = '<div class="empty-hint">No bookmarks yet. Save a reply from Chat with the ⭐ button.</div>';
    return;
  }

  bookmarks.forEach((item, index) => {
    const el = document.createElement("div");
    el.className = "list-item";
    el.innerHTML = `
      <div class="list-item-head">
        <p class="list-item-q">${item.question}</p>
        <span class="list-item-time">${formatRelativeTime(item.ts)}</span>
      </div>
      <p class="list-item-a">${item.answer}</p>
      <div class="list-item-actions">
        <button type="button" class="mini-btn" data-action="ask">Ask again</button>
        <button type="button" class="mini-btn danger" data-action="remove">Remove</button>
      </div>
    `;
    el.querySelector('[data-action="ask"]').addEventListener("click", () => {
      window.location.href = `/chat?q=${encodeURIComponent(item.question)}`;
    });
    el.querySelector('[data-action="remove"]').addEventListener("click", () => {
      const updated = safeGet(BOOKMARKS_KEY, []);
      updated.splice(index, 1);
      safeSet(BOOKMARKS_KEY, updated);
      renderBookmarks();
    });
    listEl.appendChild(el);
  });
}

document.addEventListener("DOMContentLoaded", renderBookmarks);
