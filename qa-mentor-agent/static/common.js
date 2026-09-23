const PROFILE_KEY = "qa-mentor-profile";
const THEME_KEY = "qa-mentor-theme";
const HISTORY_KEY = "qa-mentor-history";
const BOOKMARKS_KEY = "qa-mentor-bookmarks";
const PRACTICE_KEY = "qa-mentor-practice-stats";
const TOPICS_KEY = "qa-mentor-topics-viewed";
const CODING_KEY = "qa-mentor-coding-attempted";
const STREAK_KEY = "qa-mentor-streak";
const ONBOARDING_KEY = "qa-mentor-onboarding";

function safeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    /* storage unavailable, ignore */
  }
  if (window.notifyLocalDataChanged) window.notifyLocalDataChanged();
}

function getProfile() {
  return safeGet(PROFILE_KEY, { name: "You", avatar: "🙂" });
}

function setProfile(profile) {
  safeSet(PROFILE_KEY, profile);
  applyProfile();
}

function applyProfile() {
  const profile = getProfile();
  const nameEl = document.getElementById("profile-name");
  const avatarEl = document.getElementById("profile-avatar");
  if (nameEl) nameEl.textContent = profile.name || "You";
  if (avatarEl) avatarEl.textContent = profile.avatar || "🙂";
}

function getOnboarding() {
  return safeGet(ONBOARDING_KEY, null);
}

function setOnboarding(data) {
  safeSet(ONBOARDING_KEY, { ...data, completedAt: Date.now() });
}

function logTopicView(topicId) {
  const seen = safeGet(TOPICS_KEY, []);
  if (!seen.includes(topicId)) {
    seen.push(topicId);
    safeSet(TOPICS_KEY, seen);
  }
}

function logHistory(question) {
  const history = safeGet(HISTORY_KEY, []);
  history.unshift({ question, ts: Date.now() });
  safeSet(HISTORY_KEY, history.slice(0, 50));
}

function addBookmark(question, answer) {
  const bookmarks = safeGet(BOOKMARKS_KEY, []);
  bookmarks.unshift({ question, answer, ts: Date.now() });
  safeSet(BOOKMARKS_KEY, bookmarks);
}

function recordPracticeAnswer(correct) {
  const stats = safeGet(PRACTICE_KEY, { attempted: 0, correct: 0 });
  stats.attempted += 1;
  if (correct) stats.correct += 1;
  safeSet(PRACTICE_KEY, stats);
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getStreak() {
  return safeGet(STREAK_KEY, { lastDate: null, count: 0 });
}

function markDailyChallengeDone() {
  const today = todayStr();
  const streak = getStreak();
  if (streak.lastDate === today) return streak;

  const yesterday = new Date(Date.now() - 86400000);
  const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(
    yesterday.getDate()
  ).padStart(2, "0")}`;

  streak.count = streak.lastDate === yStr ? streak.count + 1 : 1;
  streak.lastDate = today;
  safeSet(STREAK_KEY, streak);
  return streak;
}

function logCodingAttempt(challengeId) {
  const attempted = safeGet(CODING_KEY, []);
  if (!attempted.includes(challengeId)) {
    attempted.push(challengeId);
    safeSet(CODING_KEY, attempted);
  }
}

function formatRelativeTime(ts) {
  const diffMs = Date.now() - ts;
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2600);
}

function applyTheme() {
  const theme = localStorage.getItem(THEME_KEY);
  if (theme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  applyProfile();
  applyTheme();

  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const sidebarEl = document.querySelector(".sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");
  if (mobileMenuBtn && sidebarEl && backdrop) {
    const closeMenu = () => {
      sidebarEl.classList.remove("mobile-open");
      backdrop.classList.remove("show");
    };
    mobileMenuBtn.addEventListener("click", () => {
      sidebarEl.classList.add("mobile-open");
      backdrop.classList.add("show");
    });
    backdrop.addEventListener("click", closeMenu);
    sidebarEl.querySelectorAll(".nav-item").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });
  }

  const SIDEBAR_COLLAPSE_KEY = "techorbit-sidebar-collapsed";
  const collapseBtn = document.getElementById("sidebar-collapse-btn");
  if (collapseBtn) {
    collapseBtn.addEventListener("click", () => {
      const isCollapsed = document.documentElement.getAttribute("data-sidebar") === "collapsed";
      if (isCollapsed) {
        document.documentElement.removeAttribute("data-sidebar");
        collapseBtn.setAttribute("aria-label", "Collapse sidebar");
      } else {
        document.documentElement.setAttribute("data-sidebar", "collapsed");
        collapseBtn.setAttribute("aria-label", "Expand sidebar");
      }
      try {
        localStorage.setItem(SIDEBAR_COLLAPSE_KEY, String(!isCollapsed));
      } catch (e) {}
    });
    if (document.documentElement.getAttribute("data-sidebar") === "collapsed") {
      collapseBtn.setAttribute("aria-label", "Expand sidebar");
    }
  }

  const academySwitcher = document.getElementById("academy-switcher-select");
  if (academySwitcher) {
    academySwitcher.addEventListener("change", () => {
      if (academySwitcher.value) window.location.href = academySwitcher.value;
    });
  }

  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      try {
        localStorage.setItem(THEME_KEY, isLight ? "dark" : "light");
      } catch (e) {}
      if (window.notifyLocalDataChanged) window.notifyLocalDataChanged();
      applyTheme();
    });
  }

  const notifBtn = document.getElementById("notif-btn");
  if (notifBtn) {
    notifBtn.addEventListener("click", () => {
      notifBtn.classList.remove("has-dot");
      showToast("Tip: bookmark a chat reply ⭐ to revisit it later on the Bookmarks page.");
    });
  }

  const profileTrigger = document.getElementById("profile-menu-trigger");
  if (profileTrigger) {
    profileTrigger.addEventListener("click", () => {
      window.location.href = "/settings";
    });
  }

  const upgradeBtn = document.getElementById("upgrade-btn");
  if (upgradeBtn) {
    upgradeBtn.addEventListener("click", () => {
      showToast("Accounts & cross-device sync are on the roadmap, not built yet — nothing to buy here.");
    });
  }

  const searchBox = document.getElementById("topbar-search");
  if (searchBox) {
    const params = new URLSearchParams(window.location.search);
    if (params.get("q")) searchBox.value = params.get("q");

    const updateSearchUrl = (value) => {
      const url = new URL(window.location.href);
      if (value) url.searchParams.set("q", value);
      else url.searchParams.delete("q");
      window.history.replaceState({}, "", url);
    };

    if (window.filterTopics) {
      searchBox.addEventListener("input", () => {
        const value = searchBox.value.trim();
        window.filterTopics(value);
        updateSearchUrl(value);
      });
    }

    searchBox.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      const value = searchBox.value.trim();
      if (window.filterTopics) {
        event.preventDefault();
        window.filterTopics(value);
        updateSearchUrl(value);
      } else if (value) {
        window.location.href = `/?q=${encodeURIComponent(value)}`;
      }
    });
  }
});
