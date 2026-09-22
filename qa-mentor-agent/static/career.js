const INTERVIEW_PROMPTS = {
  manual:
    "Act as a QA interviewer conducting a mock interview for a Manual Tester role. Ask me one interview question at a time (test case design, bug reporting, SDLC/STLC, testing types). Wait for my answer, then give brief feedback on it before asking the next question. Start with your first question now.",
  sdet:
    "Act as a technical interviewer conducting a mock SDET/Automation Engineer interview. Ask me one question at a time, mixing automation concepts (Selenium/Playwright, frameworks, Page Object Model) with a short coding question. Wait for my answer, then give brief feedback before asking the next question. Start with your first question now.",
  aiqa:
    "Act as an interviewer conducting a mock AI-QA interview. Ask me one question at a time about testing LLM-powered features, evaluation strategies, prompt/output quality, and handling non-determinism. Wait for my answer, then give brief feedback before asking the next question. Start with your first question now.",
};

const CHECKLIST_KEY = "qa-mentor-career-checklist";

function loadChecklistState() {
  return safeGet(CHECKLIST_KEY, {});
}

function applyChecklistState() {
  const state = loadChecklistState();
  document.querySelectorAll(".check-item").forEach((item) => {
    const id = item.dataset.id;
    const checkbox = item.querySelector("input[type='checkbox']");
    checkbox.checked = !!state[id];
    item.classList.toggle("checked", !!state[id]);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  logTopicView("career");
  applyChecklistState();

  document.querySelectorAll(".check-item input[type='checkbox']").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const item = checkbox.closest(".check-item");
      const state = loadChecklistState();
      state[item.dataset.id] = checkbox.checked;
      safeSet(CHECKLIST_KEY, state);
      item.classList.toggle("checked", checkbox.checked);
    });
  });

  document.querySelectorAll(".interview-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const prompt = INTERVIEW_PROMPTS[btn.dataset.track];
      window.location.href = `/chat?q=${encodeURIComponent(prompt)}`;
    });
  });
});
