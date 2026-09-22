document.addEventListener("DOMContentLoaded", () => {
  logTopicView("resources");

  const chips = document.querySelectorAll("#resource-filters .filter-chip");
  const cards = document.querySelectorAll("#resource-grid .resource-card");

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      const filter = chip.dataset.filter;
      cards.forEach((card) => {
        card.classList.toggle("hidden", filter !== "all" && card.dataset.category !== filter);
      });
    });
  });
});
