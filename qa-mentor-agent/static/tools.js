const FIRST_NAMES = ["Aiden", "Maya", "Liam", "Sofia", "Noah", "Ava", "Ethan", "Riya", "Lucas", "Zara"];
const LAST_NAMES = ["Patel", "Johnson", "Garcia", "Kim", "Smith", "Nguyen", "Brown", "Rossi", "Khan", "Müller"];
const DOMAINS = ["example.com", "testmail.dev", "mailinator.com", "qamentor.io"];
const STREETS = ["Maple St", "Oak Ave", "Sunset Blvd", "Elm Dr", "Cedar Ln"];
const CITIES = ["Austin", "Denver", "Seattle", "Toronto", "Berlin", "Hyderabad"];

function randomOf(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function generateFakeUser() {
  const first = randomOf(FIRST_NAMES);
  const last = randomOf(LAST_NAMES);
  const username = `${first}.${last}${Math.floor(Math.random() * 90 + 10)}`.toLowerCase();
  return {
    "Full name": `${first} ${last}`,
    Username: username,
    Email: `${username}@${randomOf(DOMAINS)}`,
    Phone: `+1-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(
      Math.random() * 9000 + 1000
    )}`,
    Address: `${Math.floor(Math.random() * 9000 + 100)} ${randomOf(STREETS)}, ${randomOf(CITIES)}`,
    "Test password": `Qa${Math.floor(Math.random() * 90000 + 10000)}!`,
  };
}

function renderFakeUser() {
  const container = document.getElementById("fake-data-output");
  const data = generateFakeUser();
  container.innerHTML = "";
  Object.entries(data).forEach(([label, value]) => {
    const row = document.createElement("div");
    row.className = "fake-field";
    row.innerHTML = `<span>${label}</span><span class="field-value">${value}</span>`;
    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "copy-btn";
    copyBtn.textContent = "Copy";
    copyBtn.addEventListener("click", () => {
      navigator.clipboard?.writeText(value).then(() => showToast(`Copied ${label}`));
    });
    row.appendChild(copyBtn);
    container.appendChild(row);
  });
}

function testRegex() {
  const output = document.getElementById("regex-output");
  const patternStr = document.getElementById("regex-pattern").value.trim();
  const input = document.getElementById("regex-input").value;
  output.style.display = "block";
  output.classList.remove("error");

  if (!patternStr) {
    output.classList.add("error");
    output.textContent = "Enter a pattern first.";
    return;
  }

  let regex;
  try {
    regex = new RegExp(patternStr, "g");
  } catch (err) {
    output.classList.add("error");
    output.textContent = `Invalid regex: ${err.message}`;
    return;
  }

  const lines = input.split("\n").filter((l) => l.length > 0);
  if (lines.length === 0) {
    output.textContent = "Enter at least one test string.";
    return;
  }

  const results = lines.map((line) => {
    const matches = [...line.matchAll(new RegExp(patternStr, "g"))].map((m) => m[0]);
    return matches.length
      ? `✅ "${line}" — matched: ${matches.join(", ")}`
      : `❌ "${line}" — no match`;
  });
  output.textContent = results.join("\n");
}

function formatJson() {
  const output = document.getElementById("json-output");
  const input = document.getElementById("json-input").value;
  output.style.display = "block";
  try {
    const parsed = JSON.parse(input);
    output.classList.remove("error");
    output.textContent = JSON.stringify(parsed, null, 2);
  } catch (err) {
    output.classList.add("error");
    output.textContent = `Invalid JSON: ${err.message}`;
  }
}

function minifyJson() {
  const output = document.getElementById("json-output");
  const input = document.getElementById("json-input").value;
  output.style.display = "block";
  try {
    const parsed = JSON.parse(input);
    output.classList.remove("error");
    output.textContent = JSON.stringify(parsed);
  } catch (err) {
    output.classList.add("error");
    output.textContent = `Invalid JSON: ${err.message}`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  logTopicView("tools");
  renderFakeUser();
  document.getElementById("generate-data-btn").addEventListener("click", renderFakeUser);
  document.getElementById("regex-test-btn").addEventListener("click", testRegex);
  document.getElementById("json-format-btn").addEventListener("click", formatJson);
  document.getElementById("json-minify-btn").addEventListener("click", minifyJson);
});
