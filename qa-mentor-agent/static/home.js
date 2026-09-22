window.filterTopics = function (query) {
  const q = query.trim().toLowerCase();
  let visibleCount = 0;
  document.querySelectorAll("#topic-grid .topic-card").forEach((card) => {
    const haystack = card.dataset.title || "";
    const match = !q || haystack.includes(q);
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

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("q")) window.filterTopics(params.get("q"));

  const quickAskForm = document.getElementById("quick-ask-form");
  const quickAskInput = document.getElementById("quick-ask-input");
  if (quickAskForm) {
    quickAskForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const text = quickAskInput.value.trim();
      if (text) goToChat(text);
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
