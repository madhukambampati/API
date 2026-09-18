function selectAvatar(avatar) {
  document.querySelectorAll(".avatar-option").forEach((btn) => {
    btn.classList.toggle("selected", btn.dataset.avatar === avatar);
  });
}

function selectThemeOption(theme) {
  document.querySelectorAll(".theme-option").forEach((el) => {
    el.classList.toggle("selected", el.dataset.theme === theme);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const profile = getProfile();
  document.getElementById("profile-name-input").value = profile.name || "You";
  selectAvatar(profile.avatar || "🙂");

  document.querySelectorAll(".avatar-option").forEach((btn) => {
    btn.addEventListener("click", () => selectAvatar(btn.dataset.avatar));
  });

  document.getElementById("save-profile-btn").addEventListener("click", () => {
    const name = document.getElementById("profile-name-input").value.trim() || "You";
    const avatar = document.querySelector(".avatar-option.selected")?.dataset.avatar || "🙂";
    setProfile({ name, avatar });
    showToast("Profile saved");
  });

  const currentTheme = localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
  selectThemeOption(currentTheme);
  document.querySelectorAll(".theme-option").forEach((el) => {
    el.addEventListener("click", () => {
      try {
        localStorage.setItem(THEME_KEY, el.dataset.theme);
      } catch (e) {}
      applyTheme();
      selectThemeOption(el.dataset.theme);
    });
  });

  document.getElementById("settings-upgrade-btn").addEventListener("click", () => {
    showToast("Pro plan is a demo placeholder — no real billing is wired up in this POC.");
  });

  fetch("/api/status")
    .then((res) => res.json())
    .then((data) => {
      const el = document.getElementById("api-status-text");
      el.textContent = data.api_key_configured
        ? "✅ Configured — Chat is ready to use."
        : "❌ Not configured — set ANTHROPIC_API_KEY in your .env file and restart the server.";
    })
    .catch(() => {
      document.getElementById("api-status-text").textContent = "Could not check API status.";
    });
});
