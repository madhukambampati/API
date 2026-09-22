document.addEventListener("DOMContentLoaded", () => {
  const stages = document.querySelectorAll(".pipeline-stage");
  if (stages.length) {
    let current = 0;
    stages[0].classList.add("active");
    setInterval(() => {
      stages[current].classList.remove("active");
      current = (current + 1) % stages.length;
      stages[current].classList.add("active");
    }, 900);
  }

  const captionEl = document.getElementById("locator-caption");
  if (captionEl) {
    const examples = [
      "By.id(\"submit\") — fastest and most stable when available",
      "By.cssSelector(\"[data-testid='submit']\") — great for test-specific hooks",
      "By.xpath(\"//button[text()='Submit']\") — flexible but more brittle",
    ];
    let i = 0;
    setInterval(() => {
      i = (i + 1) % examples.length;
      captionEl.textContent = examples[i];
    }, 2800);
  }
});
