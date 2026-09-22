function selectAvatar(avatar) {
  document.querySelectorAll(".avatar-option").forEach((btn) => {
    btn.classList.toggle("selected", btn.dataset.avatar === avatar);
  });
}

function selectThemeOption(theme) {
  document.querySelectorAll(".theme-option").forEach((el) => {
    const isSelected = el.dataset.theme === theme;
    el.classList.toggle("selected", isSelected);
    el.setAttribute("aria-pressed", String(isSelected));
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
    const nameInput = document.getElementById("profile-name-input");
    const name = nameInput.value.trim();
    if (!name) {
      showToast("Enter a display name first.");
      nameInput.focus();
      return;
    }
    const avatar = document.querySelector(".avatar-option.selected")?.dataset.avatar || "🙂";
    setProfile({ name, avatar });
    showToast("Profile saved");
  });

  const currentTheme = localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
  selectThemeOption(currentTheme);
  document.querySelectorAll(".theme-option").forEach((el) => {
    const activate = () => {
      try {
        localStorage.setItem(THEME_KEY, el.dataset.theme);
      } catch (e) {}
      applyTheme();
      selectThemeOption(el.dataset.theme);
    };
    el.addEventListener("click", activate);
    el.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
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
        ? "✅ Chat service is configured and ready."
        : "❌ Chat service isn't configured yet. Contact the site administrator.";
    })
    .catch(() => {
      document.getElementById("api-status-text").textContent = "Could not check API status.";
    });
});
