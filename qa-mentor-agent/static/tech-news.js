function newsRelativeTime(unixSeconds) {
  if (!unixSeconds) return "";
  return formatRelativeTime(unixSeconds * 1000);
}

function renderNewsItems(items) {
  const grid = document.getElementById("news-grid");
  grid.innerHTML = "";

  if (!items || items.length === 0) {
    grid.innerHTML =
      '<div class="empty-hint">Couldn\'t load live tech news right now (no internet, or the source is temporarily unreachable). Try refreshing in a moment.</div>';
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("a");
    card.className = "resource-card";
    card.href = item.url;
    card.target = "_blank";
    card.rel = "noopener";
    const title = (item.title || "").replace(/</g, "&lt;");
    card.innerHTML = `
      <span class="resource-type">${item.domain}</span>
      <h3>${title}</h3>
      <p class="settings-note" style="margin-top: 8px;">
        ▲ ${item.points ?? 0} points · ${item.comments ?? 0} comments · ${newsRelativeTime(item.time)}
        · <a href="${item.discussion_url}" target="_blank" rel="noopener" onclick="event.stopPropagation()">Discussion →</a>
      </p>
    `;
    grid.appendChild(card);
  });
}

async function loadTechNews(force) {
  const grid = document.getElementById("news-grid");
  const updatedText = document.getElementById("news-updated-text");
  grid.innerHTML = '<div class="empty-hint">Loading the latest releases...</div>';

  try {
    const res = await fetch(`/api/tech-news${force ? "?refresh=1" : ""}`);
    const data = await res.json();
    renderNewsItems(data.items);
    updatedText.textContent = data.fetched_at
      ? `Last updated ${formatRelativeTime(data.fetched_at * 1000)}`
      : "Not yet fetched — click Refresh, or check your internet connection.";
  } catch (err) {
    renderNewsItems([]);
    updatedText.textContent = "Couldn't reach the server.";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  logTopicView("tech-news");
  loadTechNews(false);

  document.getElementById("refresh-news-btn").addEventListener("click", () => {
    loadTechNews(true);
  });
});
