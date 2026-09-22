import json
import os
import re
import secrets
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor

import anthropic
from dotenv import load_dotenv
from flask import Flask, Response, abort, jsonify, redirect, render_template, request, session, url_for

from content_data import LESSONS, RADAR_ITEMS, ROLES

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY") or secrets.token_hex(32)

SITE_PASSWORD = os.environ.get("SITE_PASSWORD")

LOGIN_MAX_ATTEMPTS = 5
LOGIN_WINDOW_SECONDS = 5 * 60
_login_attempts = {}


def _client_ip():
    forwarded = request.headers.get("X-Forwarded-For", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.remote_addr or "unknown"


def _is_rate_limited(ip):
    now = time.time()
    attempts = [t for t in _login_attempts.get(ip, []) if now - t < LOGIN_WINDOW_SECONDS]
    _login_attempts[ip] = attempts
    return len(attempts) >= LOGIN_MAX_ATTEMPTS


def _record_failed_attempt(ip):
    _login_attempts.setdefault(ip, []).append(time.time())

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


def _clean_release_notes(text, limit=220):
    if not text:
        return ""
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"^#{1,6}\s*", "", text, flags=re.MULTILINE)
    text = text.replace("**", "").replace("__", "").replace("`", "")
    text = re.sub(r"\s+", " ", text).strip()

    # Some releases (e.g. Cypress) have no real notes, just a bare link to a
    # hosted changelog page. Once URLs are stripped, if what's left is a
    # short label like "Changelog:" rather than an actual summary, there's
    # nothing worth showing - return empty so the UI falls back to a clean
    # "No release notes provided" message instead of a raw URL.
    remainder = re.sub(r"https?://\S+", "", text).strip(" :.-")
    if len(remainder) < 12:
        return ""

    if len(text) > limit:
        text = text[:limit].rsplit(" ", 1)[0] + "…"
    return text


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
        "notes": _clean_release_notes(data.get("body") or ""),
    }


def get_tech_news(force=False):
    now = time.time()
    is_fresh = _tech_news_cache["items"] and (now - _tech_news_cache["fetched_at"] < TECH_NEWS_TTL_SECONDS)
    if not force and is_fresh:
        return _tech_news_cache

    def _fetch_one(entry):
        display_name, repo, icon = entry
        try:
            release = _fetch_latest_release(repo)
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, ValueError):
            return None
        return {"name": display_name, "icon": icon, "repo": repo, **release}

    with ThreadPoolExecutor(max_workers=len(TECH_NEWS_REPOS)) as pool:
        results = pool.map(_fetch_one, TECH_NEWS_REPOS)
    items = [item for item in results if item]

    if items:
        items.sort(key=lambda item: item.get("published_at") or "", reverse=True)
        _tech_news_cache["items"] = items
        _tech_news_cache["fetched_at"] = now

    return _tech_news_cache

API_KEY = os.environ.get("ANTHROPIC_API_KEY")
client = anthropic.Anthropic(api_key=API_KEY) if API_KEY else None
MODEL = os.environ.get("CLAUDE_MODEL", "claude-sonnet-5")
MAX_TOKENS = int(os.environ.get("MAX_TOKENS", "1024"))

SYSTEM_PROMPT = """You are the TechOrbit AI mentor — a learning companion for TechOrbit, \
a platform whose promise is "every role, every skill, one learning universe" \
for people learning technology careers, from complete beginners to experienced \
practitioners.

TechOrbit's deepest, most complete curriculum today is QA, test automation, and \
AI-QA: manual testing fundamentals, test case & test plan design, API testing \
(Postman/REST Assured), automation frameworks (Selenium, Playwright, Cypress), \
BDD (Cucumber), performance testing (JMeter, k6), CI/CD for test pipelines, SQL \
for testers, Java/Python/JavaScript for automation, and AI-QA topics like testing \
LLM-based features, prompt evaluation, and AI test data generation. Lean on that \
material first when a learner's question touches it.

You can also help with other tech careers — software development, DevOps/SRE, \
cloud, data, security, and more — using your general knowledge. Be upfront when a \
topic falls outside TechOrbit's curated content today rather than implying every \
answer is backed by a matching lesson on the platform.

Your job is to help people LEARN, not just get answers. For every topic you cover:
- Explain concepts clearly with simple, real-world examples.
- When asked for code, give working, well-commented snippets in the language the \
learner is using (default to Java + Selenium or Python + Playwright for QA/SDET \
topics if unspecified).
- Offer to quiz the learner or give a small practice exercise after explaining a \
concept, but don't force it.
- If a question is ambiguous, ask a brief clarifying question before diving in.
- Keep answers focused and practical. Prefer bullet points and short examples over \
long essays.
- Be encouraging and patient — this is a learning tool, not an exam.
"""

MENTOR_MODES = {
    "sdet": {
        "label": "🧪 QA / SDET Mentor",
        "focus": (
            "Mode: QA / SDET Mentor. Focus on manual testing, test design, API "
            "testing, Selenium/Playwright/Cypress automation, CI/CD for test "
            "pipelines, and AI-QA evaluation. Default code examples to Java + "
            "Selenium or Python + Playwright unless the learner says otherwise."
        ),
    },
    "developer": {
        "label": "💻 Developer Mentor",
        "focus": (
            "Mode: Developer Mentor. Focus on software development: frontend, "
            "backend, and full-stack engineering, APIs, databases, system design "
            "fundamentals, and code review practices. Default code examples to "
            "JavaScript/TypeScript or Python unless the learner says otherwise."
        ),
    },
    "devops": {
        "label": "🚀 DevOps Mentor",
        "focus": (
            "Mode: DevOps Mentor. Focus on CI/CD, containers, Kubernetes, "
            "infrastructure as code, monitoring/observability, and incident "
            "response. Default examples to Bash, Terraform, or GitHub Actions "
            "unless the learner says otherwise."
        ),
    },
    "career": {
        "label": "🎯 Career Coach",
        "focus": (
            "Mode: Career Coach. Focus on role selection, resumes, interview "
            "prep, and career transitions rather than deep technical "
            "explanations, unless the learner explicitly asks for technical depth."
        ),
    },
}
DEFAULT_MENTOR_MODE = "sdet"


PUBLIC_PATHS = {"/login", "/robots.txt", "/favicon.ico"}


@app.before_request
def require_login():
    if not SITE_PASSWORD:
        return None
    if request.path.startswith("/static/") or request.path in PUBLIC_PATHS:
        return None
    if not session.get("authenticated"):
        return redirect(url_for("login"))
    return None


@app.route("/login", methods=["GET", "POST"])
def login():
    error = None
    if request.method == "POST":
        ip = _client_ip()
        password = request.form.get("password")
        if _is_rate_limited(ip):
            error = "Too many attempts. Please wait a few minutes and try again."
        elif not password:
            error = "Password is required."
        elif password == SITE_PASSWORD:
            session["authenticated"] = True
            return redirect(url_for("home"))
        else:
            _record_failed_attempt(ip)
            error = "Incorrect password."
    return render_template("login.html", error=error)


@app.route("/logout")
def logout():
    session.pop("authenticated", None)
    return redirect(url_for("login"))


@app.route("/robots.txt")
def robots_txt():
    return Response("User-agent: *\nDisallow: /\n", mimetype="text/plain")


@app.route("/favicon.ico")
def favicon_ico():
    return app.send_static_file("favicon.svg")


@app.context_processor
def inject_auth_flags():
    return {"login_enabled": bool(SITE_PASSWORD)}


@app.context_processor
def inject_switcher_roles():
    return {"switcher_roles": list(ROLES.values())}


@app.route("/")
def home():
    return render_template("home.html", active="home", roles=_load_all_roles())


@app.route("/onboarding")
def onboarding():
    return render_template(
        "onboarding.html",
        active="",
        academy_label="Getting Started — personalize your plan",
        roles=_load_all_roles(),
    )


@app.route("/chat")
def chat_page():
    return render_template(
        "chat.html",
        active="chat",
        mentor_modes=MENTOR_MODES,
        default_mentor_mode=DEFAULT_MENTOR_MODE,
        academy_label="AI Mentor Chat — cross-role assistant",
    )


@app.route("/roadmaps")
def roadmaps():
    return render_template("roadmaps.html", active="roadmaps")


@app.route("/practice")
def practice():
    return render_template("practice.html", active="practice")


@app.route("/tech-news")
def tech_news():
    return render_template("tech_news.html", active="tech-news")


RADAR_CATEGORIES = ["Adopt", "Trial", "Assess", "Watch", "Declining", "Emerging"]


@app.route("/radar")
def tech_radar():
    grouped = {cat: [i for i in RADAR_ITEMS if i["category"] == cat] for cat in RADAR_CATEGORIES}
    role_titles = {slug: role["title"] for slug, role in ROLES.items()}
    return render_template(
        "tech_radar.html",
        grouped=grouped,
        categories=RADAR_CATEGORIES,
        role_titles=role_titles,
        active="radar",
        academy_label="Technology Radar — cross-role trends",
    )


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


def _load_all_roles():
    return list(ROLES.values())


PLANNED_ROLES = []


@app.route("/careers")
def careers_index():
    return render_template(
        "careers_index.html",
        roles=_load_all_roles(),
        planned_roles=PLANNED_ROLES,
        active="careers-explorer",
        academy_label="Career Explorer — browsing all TechOrbit roles",
    )


@app.route("/careers/<slug>")
def role_detail(slug):
    role = ROLES.get(slug)
    if role is None:
        abort(404)
    return render_template(
        "role_detail.html",
        role=role,
        active="careers-explorer",
        academy_label="Career Explorer — browsing all TechOrbit roles",
    )


@app.route("/careers/<role_slug>/projects/<project_id>")
def project_detail(role_slug, project_id):
    role = ROLES.get(role_slug)
    if role is None:
        abort(404)
    project = next((p for p in role.get("projects", []) if p.get("id") == project_id), None)
    if project is None:
        abort(404)
    return render_template(
        "project_detail.html",
        role=role,
        project=project,
        active="careers-explorer",
        academy_label="Career Explorer — browsing all TechOrbit roles",
    )


@app.route("/lessons/<slug>")
def lesson_detail(slug):
    lesson = LESSONS.get(slug)
    if lesson is None:
        abort(404)
    return render_template(
        "lesson_detail.html",
        lesson=lesson,
        active="",
        academy_label="Career Explorer — browsing all TechOrbit roles",
    )


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


def _slugify(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


app.jinja_env.filters["slugify"] = _slugify


@app.route("/api/search")
def api_search():
    q = (request.args.get("q") or "").strip().lower()
    if not q:
        return jsonify({"results": []})

    results = []

    for slug, role in ROLES.items():
        haystack = " ".join(
            [
                role.get("title", ""),
                role.get("definition", ""),
                " ".join(role.get("common_tools", [])),
                " ".join(role.get("recommended_languages", [])),
            ]
        ).lower()
        if q in haystack:
            results.append(
                {
                    "type": "Role",
                    "icon": "🧭",
                    "title": role["title"],
                    "snippet": role.get("definition", ""),
                    "url": url_for("role_detail", slug=slug),
                }
            )

    for item in RADAR_ITEMS:
        haystack = " ".join(
            [item.get("name", ""), item.get("what_it_is", ""), item.get("why_it_matters", "")]
        ).lower()
        if q in haystack:
            results.append(
                {
                    "type": "Tech Radar",
                    "icon": "🛰️",
                    "title": item["name"],
                    "snippet": item.get("what_it_is", ""),
                    "url": url_for("tech_radar") + "#radar-" + _slugify(item["name"]),
                }
            )

    return jsonify({"results": results[:20]})


VALID_CHAT_ROLES = {"user", "assistant"}


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(force=True, silent=True) or {}
    messages = data.get("messages")

    if not isinstance(messages, list) or not messages:
        return jsonify({"error": "messages must be a non-empty list"}), 400

    for msg in messages:
        content_ok = isinstance(msg, dict) and isinstance(msg.get("content"), str) and msg.get("content").strip()
        role_ok = isinstance(msg, dict) and msg.get("role") in VALID_CHAT_ROLES
        if not (content_ok and role_ok):
            return jsonify(
                {"error": "Each message must have a valid role ('user' or 'assistant') and non-empty content."}
            ), 400

    if client is None:
        return jsonify({"error": "Chat isn't configured yet. Contact the site administrator."}), 500

    mode = data.get("mode")
    mode_config = MENTOR_MODES.get(mode, MENTOR_MODES[DEFAULT_MENTOR_MODE])
    system_prompt = SYSTEM_PROMPT + "\n\n" + mode_config["focus"]

    try:
        response = client.messages.create(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            system=system_prompt,
            messages=messages,
        )
    except anthropic.APIError as exc:
        app.logger.error("Anthropic API error: %s", exc)
        return jsonify({"error": "The AI service is temporarily unavailable. Please try again."}), 502

    reply_text = "".join(
        block.text for block in response.content if block.type == "text"
    )
    return jsonify({"reply": reply_text})


@app.errorhandler(404)
def not_found(_error):
    return render_template("404.html"), 404


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)
