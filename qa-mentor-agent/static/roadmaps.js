document.addEventListener("DOMContentLoaded", () => {
  logTopicView("roadmaps");

  document.querySelectorAll(".stage-card-head").forEach((head) => {
    head.addEventListener("click", () => {
      head.parentElement.classList.toggle("open");
    });
  });

  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});
