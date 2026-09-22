import json
import os
import time
import urllib.error
import urllib.request

import anthropic
from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request

load_dotenv()

app = Flask(__name__)

TECH_NEWS_REPOS = [
    ("Selenium", "SeleniumHQ/selenium", "🧪"),
    ("Playwright", "microsoft/playwright", "🎭"),
    ("Cypress", "cypress-io/cypress", "🌲"),
    ("k6", "grafana/k6", "⚡"),
    ("Newman (Postman CLI)", "postmanlabs/newman", "📮"),
    ("Anthropic Python SDK", "anthropics/anthropic-sdk-python", "🤖"),
    ("OpenAI Python SDK", "openai/openai-python", "🧠"),
    ("LangChain", "langchain-ai/langchain", "🔗"),
]
TECH_NEWS_TTL_SECONDS = 24 * 60 * 60
_tech_news_cache = {"fetched_at": 0, "items": []}


def _fetch_latest_release(owner_repo):
    url = f"https://api.github.com/repos/{owner_repo}/releases/latest"
    req = urllib.request.Request(
        url,
        headers={"Accept": "application/vnd.github+json", "User-Agent": "sdet-mentor-app"},
    )
    with urllib.request.urlopen(req, timeout=6) as resp:
        data = json.loads(resp.read().decode())
    return {
        "tag": data.get("tag_name"),
        "title": data.get("name") or data.get("tag_name"),
        "published_at": data.get("published_at"),
        "url": data.get("html_url"),
        "notes": (data.get("body") or "").strip()[:400],
    }


def get_tech_news(force=False):
    now = time.time()
    is_fresh = _tech_news_cache["items"] and (now - _tech_news_cache["fetched_at"] < TECH_NEWS_TTL_SECONDS)
    if not force and is_fresh:
        return _tech_news_cache

    items = []
    for display_name, repo, icon in TECH_NEWS_REPOS:
        try:
            release = _fetch_latest_release(repo)
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, ValueError):
            continue
        items.append({"name": display_name, "icon": icon, "repo": repo, **release})

    if items:
        items.sort(key=lambda item: item.get("published_at") or "", reverse=True)
        _tech_news_cache["items"] = items
        _tech_news_cache["fetched_at"] = now

    return _tech_news_cache

API_KEY = os.environ.get("ANTHROPIC_API_KEY")
client = anthropic.Anthropic(api_key=API_KEY) if API_KEY else None
MODEL = os.environ.get("CLAUDE_MODEL", "claude-sonnet-5")
MAX_TOKENS = int(os.environ.get("MAX_TOKENS", "1024"))

SYSTEM_PROMPT = """You are SDET Mentor, an AI learning companion for QA Engineers, \
SDETs, and AI-QA practitioners of all levels (freshers to experienced).

Your job is to help people LEARN, not just get answers. For every topic you cover:
- Explain concepts clearly with simple, real-world testing examples.
- Cover the areas QA/SDET learners care about: manual testing fundamentals, test \
case & test plan design, API testing (Postman/REST Assured), automation frameworks \
(Selenium, Playwright, Cypress), BDD (Cucumber), performance testing (JMeter, \
k6), CI/CD for test pipelines, SQL for testers, Java/Python/JavaScript for \
automation, and AI-QA topics like testing LLM-based features, prompt evaluation, \
and AI test data generation.
- When asked for code, give working, well-commented snippets in the language the \
learner is using (default to Java + Selenium or Python + Playwright if unspecified).
- Offer to quiz the learner or give a small practice exercise after explaining a \
concept, but don't force it.
- If a question is ambiguous, ask a brief clarifying question before diving in.
- Keep answers focused and practical. Prefer bullet points and short examples over \
long essays.
- Be encouraging and patient — this is a learning tool, not an exam.
"""


@app.route("/")
def home():
    return render_template("home.html", active="home")


@app.route("/chat")
def chat_page():
    return render_template("chat.html", active="chat")


@app.route("/roadmaps")
def roadmaps():
    return render_template("roadmaps.html", active="roadmaps")


@app.route("/practice")
def practice():
    return render_template("practice.html", active="practice")


@app.route("/tech-news")
def tech_news():
    return render_template("tech_news.html", active="tech-news")


@app.route("/api/tech-news")
def api_tech_news():
    force = request.args.get("refresh") == "1"
    cache = get_tech_news(force=force)
    return jsonify({"items": cache["items"], "fetched_at": cache["fetched_at"]})


@app.route("/resources")
def resources():
    return render_template("resources.html", active="resources")


@app.route("/glossary")
def glossary():
    return render_template("glossary.html", active="glossary")


@app.route("/career")
def career():
    return render_template("career.html", active="career")


@app.route("/tools")
def tools_page():
    return render_template("tools.html", active="tools")


@app.route("/progress")
def progress_page():
    return render_template("progress.html", active="progress")


@app.route("/bookmarks")
def bookmarks():
    return render_template("bookmarks.html", active="bookmarks")


@app.route("/history")
def history_page():
    return render_template("history.html", active="history")


@app.route("/settings")
def settings():
    return render_template("settings.html", active="settings")


@app.route("/api/status")
def api_status():
    return jsonify({"api_key_configured": client is not None})


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(force=True, silent=True) or {}
    messages = data.get("messages")

    if not isinstance(messages, list) or not messages:
        return jsonify({"error": "messages must be a non-empty list"}), 400

    if client is None:
        return jsonify({"error": "ANTHROPIC_API_KEY is not configured on the server"}), 500

    try:
        response = client.messages.create(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            system=SYSTEM_PROMPT,
            messages=messages,
        )
    except anthropic.APIError as exc:
        return jsonify({"error": str(exc)}), 502

    reply_text = "".join(
        block.text for block in response.content if block.type == "text"
    )
    return jsonify({"reply": reply_text})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)
