import os

import anthropic
from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request

load_dotenv()

app = Flask(__name__)

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
MODEL = os.environ.get("CLAUDE_MODEL", "claude-sonnet-5")
MAX_TOKENS = int(os.environ.get("MAX_TOKENS", "1024"))

SYSTEM_PROMPT = """You are QA Mentor, an AI learning companion for QA Engineers, \
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
def index():
    return render_template("index.html")


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(force=True, silent=True) or {}
    messages = data.get("messages")

    if not isinstance(messages, list) or not messages:
        return jsonify({"error": "messages must be a non-empty list"}), 400

    try:
        response = client.messages.create(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            system=SYSTEM_PROMPT,
            messages=messages,
        )
    except anthropic.APIStatusError as exc:
        return jsonify({"error": str(exc)}), 502

    reply_text = "".join(
        block.text for block in response.content if block.type == "text"
    )
    return jsonify({"reply": reply_text})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)
