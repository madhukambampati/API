document.addEventListener("DOMContentLoaded", () => {
  const history = safeGet(HISTORY_KEY, []);
  const bookmarks = safeGet(BOOKMARKS_KEY, []);
  const topics = safeGet(TOPICS_KEY, []);
  const practice = safeGet(PRACTICE_KEY, { attempted: 0, correct: 0 });

  document.getElementById("stat-chat-count").textContent = history.length;
  document.getElementById("stat-practice-count").textContent = practice.attempted;
  document.getElementById("stat-topics-count").textContent = topics.length;
  document.getElementById("stat-bookmarks-count").textContent = bookmarks.length;

  const accuracy = practice.attempted ? Math.round((practice.correct / practice.attempted) * 100) : 0;
  document.getElementById("stat-accuracy").textContent = `${accuracy}%`;
  document.getElementById("accuracy-bar").style.width = `${accuracy}%`;
});
