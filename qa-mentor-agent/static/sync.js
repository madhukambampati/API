const SYNC_KEYS = [
  "qa-mentor-profile",
  "qa-mentor-theme",
  "qa-mentor-history",
  "qa-mentor-bookmarks",
  "qa-mentor-practice-stats",
  "qa-mentor-topics-viewed",
  "qa-mentor-coding-attempted",
  "qa-mentor-streak",
  "qa-mentor-onboarding",
  "qa-mentor-chat-mode",
];

function collectSyncPayload() {
  const payload = {};
  SYNC_KEYS.forEach((key) => {
    const value = localStorage.getItem(key);
    if (value !== null) payload[key] = value;
  });
  return payload;
}

function applySyncPayload(data) {
  if (!data) return;
  Object.keys(data).forEach((key) => {
    if (SYNC_KEYS.includes(key) && typeof data[key] === "string") {
      try {
        localStorage.setItem(key, data[key]);
      } catch (e) {}
    }
  });
}

let pushTimer = null;
function pushSyncData() {
  fetch("/api/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(collectSyncPayload()),
  }).catch(() => {});
}

window.notifyLocalDataChanged = function () {
  if (!window.ACCOUNT_LOGGED_IN) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(pushSyncData, 1500);
};

async function pullSyncDataOnLogin() {
  try {
    const res = await fetch("/api/sync");
    if (!res.ok) return;
    const body = await res.json();
    applySyncPayload(body.data);
    if (typeof applyTheme === "function") applyTheme();
    if (typeof applyProfile === "function") applyProfile();
    const url = new URL(window.location.href);
    url.searchParams.delete("just_logged_in");
    window.history.replaceState({}, "", url);
    const statusEl = document.getElementById("sync-status-text");
    if (statusEl) statusEl.textContent = "Synced just now.";
  } catch (e) {
    /* offline or server unreachable, local data stays as-is */
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (!window.ACCOUNT_LOGGED_IN) return;
  const params = new URLSearchParams(window.location.search);
  if (params.get("just_logged_in")) {
    pullSyncDataOnLogin();
  }
});
