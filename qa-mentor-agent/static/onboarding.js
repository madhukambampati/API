document.addEventListener("DOMContentLoaded", () => {
  const existing = getOnboarding();
  if (existing) {
    const roleEl = document.getElementById("onboarding-role");
    const expEl = document.getElementById("onboarding-experience");
    const hoursEl = document.getElementById("onboarding-hours");
    const goalEl = document.getElementById("onboarding-goal");
    if (roleEl && existing.role !== undefined) roleEl.value = existing.role;
    if (expEl && existing.experience) expEl.value = existing.experience;
    if (hoursEl && existing.hours) hoursEl.value = existing.hours;
    if (goalEl && existing.goal) goalEl.value = existing.goal;
  }

  const form = document.getElementById("onboarding-form");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    setOnboarding({
      role: document.getElementById("onboarding-role").value,
      experience: document.getElementById("onboarding-experience").value,
      hours: document.getElementById("onboarding-hours").value,
      goal: document.getElementById("onboarding-goal").value,
    });
    showToast("Saved — personalizing your Home page");
    window.location.href = "/";
  });
});
