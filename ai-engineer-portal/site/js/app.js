/* AI Engineer Path — client app. Hash-routed, no dependencies, works from file://. */
(function () {
  'use strict';
  const C = window.COURSE;
  const $ = (s, r = document) => r.querySelector(s);
  const main = $('#main');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- progress (localStorage, always optional) ---------- */
  const KEY = 'aiep-progress-v1';
  let P = { done: {}, quiz: {}, name: '', last: null };
  try { P = Object.assign(P, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* storage unavailable */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) { /* ignore */ } };
  const PASS = 0.7;
  const lessonKey = (m, l) => m.id + '/' + l.id;
  const isDone = (m, l) => !!P.done[lessonKey(m, l)];
  const quizPassed = m => (P.quiz[m.id] || 0) >= PASS;
  const modProgress = m => {
    const total = m.lessons.length + 1;
    return (m.lessons.filter(l => isDone(m, l)).length + (quizPassed(m) ? 1 : 0)) / total;
  };
  const totalItems = C.modules.reduce((n, m) => n + m.lessons.length + 1, 0);
  const overall = () => C.modules.reduce((n, m) => n + modProgress(m) * (m.lessons.length + 1), 0) / totalItems;
  const allDone = () => C.modules.every(m => modProgress(m) === 1);
  const findMod = id => C.modules.find(m => m.id === id);
  const flat = [];
  C.modules.forEach(m => { m.lessons.forEach(l => flat.push({ m, l })); flat.push({ m, quiz: true }); });
  const href = it => it.quiz ? `#/m/${it.m.id}/quiz` : `#/m/${it.m.id}/${it.l.id}`;
  const nextUndone = () => flat.find(it => it.quiz ? !quizPassed(it.m) : !isDone(it.m, it.l));

  /* ---------- theme / menu ---------- */
  $('#theme-btn').onclick = () => {
    const t = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('aiep-theme', t); } catch (e) { /* ignore */ }
  };
  const setMenu = open => { document.body.classList.toggle('menu-open', open); $('#menu-btn').setAttribute('aria-expanded', open); };
  $('#menu-btn').onclick = () => setMenu(!document.body.classList.contains('menu-open'));
  $('#scrim').onclick = () => setMenu(false);

  /* ---------- sidebar ---------- */
  function renderSidebar(route) {
    $('#sidebar').innerHTML = C.modules.map(m => {
      const open = route.mod === m.id ? ' open' : '';
      const pct = Math.round(modProgress(m) * 100);
      return `<details${open}><summary><span class="n">${m.n}</span><span>${esc(m.title)}</span><span class="pct">${pct}%</span></summary><ul>` +
        `<li><a href="#/m/${m.id}" class="${route.mod === m.id && !route.lesson ? 'on' : ''}"><span class="dot"></span>Overview</a></li>` +
        m.lessons.map(l => `<li><a href="#/m/${m.id}/${l.id}" class="${route.mod === m.id && route.lesson === l.id ? 'on' : ''}"><span class="dot">${isDone(m, l) ? '✓' : ''}</span>${esc(l.title)}</a></li>`).join('') +
        `<li><a href="#/m/${m.id}/quiz" class="${route.mod === m.id && route.lesson === 'quiz' ? 'on' : ''}"><span class="dot">${quizPassed(m) ? '✓' : ''}</span>Module quiz</a></li></ul></details>`;
    }).join('') + `<div class="side-foot"><a href="#/certificate">Certificate</a><button type="button" id="backup">Back up progress</button><label class="linkish">Restore progress<input type="file" id="restore" accept="application/json" hidden></label><small>Progress lives in this browser only. Back it up to move devices.</small></div>`;
    $('#backup').onclick = () => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify(P, null, 2)], { type: 'application/json' }));
      a.download = 'ai-engineer-path-progress.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    };
    $('#restore').onchange = e => {
      const f = e.target.files[0]; if (!f) return;
      f.text().then(t => {
        const d = JSON.parse(t);
        if (!d || typeof d.done !== 'object' || typeof d.quiz !== 'object') throw new Error('not a progress file');
        P = Object.assign({ done: {}, quiz: {}, name: '', last: null }, { done: d.done, quiz: d.quiz, name: String(d.name || ''), last: d.last || null });
        save(); route(); alert('Progress restored.');
      }).catch(() => alert('That file is not a valid AI Engineer Path progress backup.'));
    };
    const on = $('#sidebar a.on');
    if (on) on.scrollIntoView({ block: 'nearest' });
  }
  function renderTop() {
    const p = Math.round(overall() * 100);
    $('#top-progress').innerHTML = `<div class="bar"><i style="width:${p}%"></i></div><span>${p}%</span>`;
  }

  /* ---------- views ---------- */
  const footer = '<footer class="site">AI Engineer Path — a free, self-contained curriculum. Your progress is saved in this browser only.</footer>';
  const lessonTotal = C.modules.reduce((n, m) => n + m.lessons.length, 0);
  const hours = Math.round(C.modules.reduce((n, m) => n + (parseFloat(m.time) || 0), 0));   // study time incl. exercises and projects, from module estimates
  const readHours = Math.round(C.modules.reduce((n, m) => n + m.lessons.reduce((a, l) => a + l.mins, 0), 0) / 6) / 10;   // reading time only

  function viewHome() {
    const next = nextUndone();
    const started = Object.keys(P.done).length || Object.keys(P.quiz).length;
    const cont = next && started
      ? `<div class="continue"><div><small>Continue where you left off</small><br><b>${next.quiz ? 'Quiz: ' : ''}${esc(next.m.title)}${next.quiz ? '' : ' → ' + esc(next.l.title)}</b></div><a class="btn" href="${href(next)}">Resume</a></div>` : '';
    const phases = [
      ['Phase 1 · Foundations', 'Modules 1–4', 'Understand AI, learn the Python and math you need, build ML intuition, and see how neural networks and transformers work.'],
      ['Phase 2 · Build with LLMs', 'Modules 5–8', 'Use language models well: prompting, APIs, structured output, tool use, embeddings and retrieval-augmented generation.'],
      ['Phase 3 · Agents & Reliability', 'Modules 9–11', 'Build agents, measure them with evals, and wrap them in the harness that makes them dependable.'],
      ['Phase 4 · Ship & Grow', 'Modules 12–14', 'Fine-tune and run open models, deploy safely and responsibly, and plan your career in a fast-moving field.']
    ];
    main.innerHTML = `<div class="wrap">
      <section class="hero"><h1>Learn AI from <span>zero</span> to <span>production</span></h1>
      <p>One complete curriculum — foundations, machine learning, LLMs, RAG, agents, evals, harness engineering, safety and career. Everything you need to go from beginner to job-ready is here, in order, with runnable code, exercises with solutions and projects. The Resources page is optional reading for going deeper.</p>
      <div class="cta"><a class="btn" href="${href(next || flat[0])}">${started ? 'Continue learning' : 'Start learning'}</a><a class="btn ghost" href="#/m/${C.modules[0].id}">View curriculum</a></div></section>
      ${cont}
      <div class="stats"><div class="stat"><b>${C.modules.length}</b><span>modules</span></div><div class="stat"><b>${lessonTotal}</b><span>lessons</span></div><div class="stat"><b>~${readHours}h</b><span>of reading</span></div><div class="stat"><b>~${hours}h</b><span>total with exercises &amp; projects</span></div><div class="stat"><b>${C.projects.length}</b><span>hands-on projects</span></div><div class="stat"><b>${C.glossary.length}</b><span>glossary terms</span></div></div>
      <h2 class="section-title">The roadmap</h2><p class="section-sub">Follow it in order, or jump to what you need. Each module ends with a quiz; 70% marks it complete.</p>
      <div class="phases">${phases.map(p => `<div class="phase"><h3>${p[0]}</h3><p><b>${p[1]}</b><br>${p[2]}</p></div>`).join('')}</div>
      <h2 class="section-title">All modules</h2><p class="section-sub">Prerequisites: none. Curiosity and a computer are enough — the course teaches the Python you need.</p>
      <div class="grid">${C.modules.map(m => `<a class="card" href="#/m/${m.id}"><h3>${m.n}. ${esc(m.title)}</h3><p>${esc(m.summary)}</p><div class="bar"><i style="width:${Math.round(modProgress(m) * 100)}%"></i></div><div class="row"><span class="tag ${m.level}">${m.level}</span><span>${m.lessons.length} lessons · ${esc(m.time)} with practice</span></div></a>`).join('')}</div>
      <h2 class="section-title">How this portal works</h2>
      <div class="grid">
        <div class="card"><h3>Read &amp; run</h3><p>Lessons are short and concrete, with code you can copy and run. Mark each one complete as you go.</p></div>
        <div class="card"><h3>Check yourself</h3><p>Every module ends with a quiz that explains the right answer, not just the score.</p></div>
        <div class="card"><h3>Build things</h3><p>${C.projects.length} projects take you from a first chatbot to a capstone agent, with an eval suite.</p></div>
        <div class="card"><h3>Play</h3><p>The <a href="#/playground">Playground</a> lets you feel temperature, token cost, similarity and chunking directly.</p></div>
        <div class="card"><h3>Look things up</h3><p>Press <code>/</code> to search every lesson and the glossary instantly.</p></div>
        <div class="card"><h3>Finish</h3><p>Complete everything to unlock a printable <a href="#/certificate">completion certificate</a>.</p></div>
      </div>${footer}</div>`;
  }

  function viewModule(m) {
    main.innerHTML = `<div class="wrap" style="max-width:820px"><div class="crumbs"><a href="#/">Home</a> / Module ${m.n}</div>
      <div class="mod-head"><span class="big">${m.n}</span><div><h1>${esc(m.title)}</h1><span class="tag ${m.level}">${m.level}</span> <span class="tag" title="Reading plus exercises">${esc(m.time)} incl. practice</span></div></div>
      <p style="color:var(--muted);margin:.8rem 0">${esc(m.summary)}</p>
      <div class="bar"><i style="width:${Math.round(modProgress(m) * 100)}%"></i></div>
      <h2 class="section-title" style="font-size:1.2rem">After this module you can</h2><ul class="outcomes article" style="padding-left:1.3rem">${m.outcomes.map(o => `<li>${esc(o)}</li>`).join('')}</ul>
      <h2 class="section-title" style="font-size:1.2rem">Lessons</h2>
      <ul class="lesson-list">${m.lessons.map((l, i) => `<li><a href="#/m/${m.id}/${l.id}"><span class="dot">${isDone(m, l) ? '✓' : i + 1}</span>${esc(l.title)}<small>${l.mins} min</small></a></li>`).join('')}
      <li><a href="#/m/${m.id}/quiz"><span class="dot">${quizPassed(m) ? '✓' : '?'}</span>Module quiz (${m.quiz.length} questions)<small>${P.quiz[m.id] != null ? Math.round(P.quiz[m.id] * 100) + '% best' : ''}</small></a></li></ul>${footer}</div>`;
  }

  function neighbors(it) {
    const i = flat.findIndex(x => x.m === it.m && (it.quiz ? x.quiz : x.l === it.l));
    return { prev: flat[i - 1], next: flat[i + 1] };
  }
  const label = it => it ? (it.quiz ? `${it.m.title}: quiz` : it.l.title) : '';

  function viewLesson(m, l) {
    const it = { m, l }, { prev, next } = neighbors(it), done = isDone(m, l);
    main.innerHTML = `<div class="lesson-grid"><article class="article"><div class="crumbs"><a href="#/">Home</a> / <a href="#/m/${m.id}">${m.n}. ${esc(m.title)}</a></div>
      <h1>${esc(l.title)}</h1><div class="meta">${l.mins} min read (plus exercises) · Lesson ${m.lessons.indexOf(l) + 1} of ${m.lessons.length}</div>${l.html}
      <div class="lesson-foot">${prev ? `<a class="btn ghost" href="${href(prev)}">← ${esc(label(prev))}</a>` : ''}<span class="spacer"></span>
      <button id="complete" class="btn ${done ? 'done' : 'ghost'}" type="button">${done ? '✓ Completed' : 'Mark complete'}</button>
      ${next ? `<a id="next" class="btn" href="${href(next)}">${esc(label(next))} →</a>` : ''}</div>${footer}</article>
      <nav class="toc" aria-label="On this page"><h4>On this page</h4>${l.toc.map(t => `<a href="#/m/${m.id}/${l.id}" data-id="${t.id}">${esc(t.text)}</a>`).join('')}</nav></div>`;
    $('#complete').onclick = () => { P.done[lessonKey(m, l)] = !P.done[lessonKey(m, l)]; if (!P.done[lessonKey(m, l)]) delete P.done[lessonKey(m, l)]; save(); renderChrome(); viewLesson(m, l); };
    const nx = $('#next');
    if (nx) nx.addEventListener('click', () => { if (!isDone(m, l)) { P.done[lessonKey(m, l)] = true; save(); } });
    main.querySelectorAll('.toc a').forEach(a => a.onclick = e => { e.preventDefault(); const t = document.getElementById(a.dataset.id); if (t) t.scrollIntoView({ behavior: 'smooth' }); });
    P.last = lessonKey(m, l); save();
  }

  function viewQuiz(m) {
    const prevBest = P.quiz[m.id];
    // Shuffle option order on every attempt so answer position can't be guessed.
    const order = m.quiz.map(q => {
      const idx = q.options.map((_, i) => i);
      for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
      return idx;
    });
    main.innerHTML = `<div class="wrap" style="max-width:780px"><div class="crumbs"><a href="#/">Home</a> / <a href="#/m/${m.id}">${m.n}. ${esc(m.title)}</a> / Quiz</div>
      <h1>Quiz: ${esc(m.title)}</h1><p class="meta">${m.quiz.length} questions · answer every question · score ${Math.round(PASS * 100)}% or more to pass${prevBest != null ? ` · your best: ${Math.round(prevBest * 100)}%` : ''}</p>
      <form id="quiz">${m.quiz.map((q, i) => `<div class="q" data-i="${i}"><h3>${i + 1}. ${esc(q.q)}</h3>${order[i].map(j => `<label class="opt"><input type="radio" name="q${i}" value="${j}"><span>${esc(q.options[j])}</span></label>`).join('')}<div class="why" hidden></div></div>`).join('')}
      <div class="lesson-foot"><button class="btn" type="submit">Check answers</button><a class="btn ghost" href="#/m/${m.id}">Back to module</a></div><div id="result"></div></form>${footer}</div>`;
    $('#quiz').onsubmit = e => {
      e.preventDefault();
      const missing = m.quiz.map((_, i) => i).filter(i => !main.querySelector(`.q[data-i="${i}"] input:checked`));
      main.querySelectorAll('.q').forEach(b => b.classList.toggle('missing', missing.includes(+b.dataset.i)));
      if (missing.length) {
        $('#result').innerHTML = `<p class="score fail">Answer every question before checking — ${missing.length} still unanswered (question ${missing.map(i => i + 1).join(', ')}).</p>`;
        main.querySelector(`.q[data-i="${missing[0]}"]`).scrollIntoView({ block: 'center' });
        return;
      }
      let right = 0;
      m.quiz.forEach((q, i) => {
        const box = main.querySelector(`.q[data-i="${i}"]`);
        const chosen = box.querySelector('input:checked');
        const c = chosen ? +chosen.value : -1;
        if (c === q.answer) right++;
        box.querySelectorAll('.opt').forEach(o => { const v = +o.querySelector('input').value; o.classList.toggle('right', v === q.answer); o.classList.toggle('wrong', v === c && c !== q.answer); o.querySelector('input').disabled = true; });
        const why = box.querySelector('.why');
        why.hidden = false;
        why.textContent = (c === q.answer ? '✓ Correct. ' : c === -1 ? 'Unanswered. ' : '✗ Not quite. ') + q.why;
      });
      const score = right / m.quiz.length, pass = score >= PASS;
      if (score > (P.quiz[m.id] || 0)) { P.quiz[m.id] = score; save(); }
      renderChrome();
      const nx = flat[flat.findIndex(x => x.m === m && x.quiz) + 1];
      const left = m.lessons.filter(l => !isDone(m, l)).length;
      const verdict = !pass ? `You need ${Math.ceil(PASS * m.quiz.length)} to pass. Read the explanations above, review the lessons and try again.`
        : left ? `Quiz passed. Finish the ${left} remaining lesson${left > 1 ? 's' : ''} to complete this module.` : 'Quiz passed — module complete.';
      $('#result').innerHTML = `<div class="score ${pass ? 'pass' : 'fail'}">${right}/${m.quiz.length} — ${verdict}</div>
        <button class="btn ghost" type="button" id="retry">Retry with new order</button> <a class="btn ghost" href="#/m/${m.id}">Back to lessons</a>
        ${pass ? (nx ? `<a class="btn" href="${href(nx)}">Next: ${esc(nx.m.title)} →</a>` : `<a class="btn" href="#/certificate">Get your certificate →</a>`) : ''}`;
      $('#retry').onclick = () => { viewQuiz(m); window.scrollTo({ top: 0, behavior: 'instant' }); };
      $('#result').scrollIntoView({ block: 'center' });
    };
  }

  function viewGlossary() {
    main.innerHTML = `<div class="wrap" style="max-width:820px"><h1>Glossary</h1><p class="section-sub">${C.glossary.length} terms you will meet in AI engineering.</p>
      <input class="filter" id="gf" type="search" placeholder="Filter terms…" aria-label="Filter glossary"><dl class="gloss" id="gl"></dl>${footer}</div>`;
    const draw = q => {
      q = q.toLowerCase();
      $('#gl').innerHTML = C.glossary.filter(g => !q || g.term.toLowerCase().includes(q) || g.def.toLowerCase().includes(q)).map(g => `<dt>${esc(g.term)}</dt><dd>${g.def}</dd>`).join('') || '<p>No matching terms.</p>';
    };
    draw(''); $('#gf').oninput = e => draw(e.target.value);
  }

  function viewResources() {
    main.innerHTML = `<div class="wrap" style="max-width:820px"><h1>Resources</h1>
      <p class="section-sub">This portal is designed to be complete on its own. These are primary sources and official docs for when you want to go deeper or check what has changed — AI moves fast, and official docs are always the source of truth for model names, prices and limits.</p>
      ${C.resources.map(g => `<section class="res-group"><h2 class="section-title" style="font-size:1.2rem">${esc(g.group)}</h2><ul class="article" style="padding-left:1.2rem">${g.items.map(i => `<li><a href="${esc(i.url)}" target="_blank" rel="noopener noreferrer">${esc(i.title)}</a>${i.note ? ` <span>— ${esc(i.note)}</span>` : ''}</li>`).join('')}</ul></section>`).join('')}${footer}</div>`;
  }

  function viewProjects() {
    main.innerHTML = `<div class="wrap" style="max-width:860px"><h1>Hands-on projects</h1><p class="section-sub">Reading builds understanding; building builds skill. Do these in order. Put them on GitHub — they are your portfolio.</p>
      ${C.projects.map((p, i) => `<section class="proj" id="${p.id}"><h2>${i + 1}. ${esc(p.title)}</h2><div class="row"><span class="tag ${p.level}">${esc(p.level || '')}</span><span>⏱ ${esc(p.time || '')}</span><span>Do after: ${esc(p.after || '')}</span></div><div class="article">${p.html}</div></section>`).join('')}${footer}</div>`;
  }

  function viewCertificate() {
    const ok = allDone(), pct = Math.round(overall() * 100);
    main.innerHTML = `<div class="wrap" style="max-width:820px"><h1 class="no-print">Completion certificate</h1>
      ${ok ? `<p class="no-print section-sub">You finished every lesson and passed every quiz. Enter your name and print or save as PDF.</p><input class="filter no-print" id="nm" placeholder="Your name" maxlength="60" value="${esc(P.name || '')}" aria-label="Your name">
      <div class="cert"><h1>Certificate of Completion</h1><p>This certifies that</p><div class="name" id="cname"></div><p>has completed all ${C.modules.length} modules of the<br><b style="color:var(--text)">AI Engineer Path</b><br>covering foundations, machine learning, LLMs, RAG, agents, evals, harness engineering and responsible AI.</p><p style="margin-top:1.5rem" id="cdate"></p></div>
      <p class="no-print"><button class="btn" id="print" type="button">Print / Save as PDF</button></p><p class="no-print" style="color:var(--muted);font-size:.85rem;margin-top:1rem">This is a self-issued certificate of completion for personal motivation. It is not an accredited credential — your projects are the real proof of skill.</p>`
      : `<p class="section-sub">Finish all lessons and pass every quiz to unlock your certificate. You are at <b>${pct}%</b>.</p><div class="bar" style="max-width:400px"><i style="width:${pct}%"></i></div><p style="margin-top:1rem"><a class="btn" href="${href(nextUndone() || flat[0])}">Continue learning</a></p>`}${footer}</div>`;
    if (ok) {
      const upd = () => { $('#cname').textContent = $('#nm').value.trim() || 'Your Name'; P.name = $('#nm').value.trim(); save(); };
      $('#cdate').textContent = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
      $('#nm').oninput = upd; upd();
      $('#print').onclick = () => window.print();
    }
  }

  function view404() {
    main.innerHTML = `<div class="wrap" style="max-width:720px"><h1>Page not found</h1><p class="section-sub" style="margin-top:.6rem">There is no page at <code>${esc(location.hash || '/')}</code>. It may have been renamed, or the link has a typo.</p>
      <p style="display:flex;gap:.8rem;flex-wrap:wrap"><a class="btn" href="#/">Go to home</a><a class="btn ghost" href="#/m/${C.modules[0].id}">Start the course</a></p>
      <p style="margin-top:1rem;color:var(--muted)">Tip: press <code>/</code> to search all lessons.</p>${footer}</div>`;
  }

  /* ---------- playground ---------- */
  function viewPlayground() {
    main.innerHTML = `<div class="wrap" style="max-width:860px"><h1>Playground</h1><p class="section-sub">Small interactive demos of ideas from the course. Everything runs in your browser.</p>
      <section class="play"><h2>1 · Temperature and sampling</h2><p>A model scores every possible next token; temperature reshapes those scores into probabilities. Prompt: <i>“The capital of France is”</i></p>
        <label>Temperature: <b id="t-val">1.0</b></label><input type="range" id="temp" min="0.05" max="3" step="0.05" value="1"><div class="bars" id="t-bars"></div>
        <p style="margin-top:.6rem;font-size:.88rem">Low temperature → the top token dominates (predictable, repeatable). High temperature → probability spreads out (varied, riskier). See module 5.</p></section>
      <section class="play"><h2>2 · Token &amp; cost estimator</h2><p>Models bill per token. English averages roughly 4 characters per token — this is an estimate; real tokenizers differ by model and language.</p>
        <label>Your prompt text</label><textarea id="tk-text" rows="4">Summarise the following support ticket in two sentences and classify its urgency as low, medium or high.</textarea>
        <div class="two"><div><label>Expected output tokens</label><input type="number" id="tk-out" value="300" min="0"></div><div><label>Requests per day</label><input type="number" id="tk-n" value="1000" min="0"></div>
        <div><label>Input price ($ per 1M tokens) — enter your model's price</label><input type="number" id="tk-pi" value="3" min="0" step="0.01"></div><div><label>Output price ($ per 1M tokens)</label><input type="number" id="tk-po" value="15" min="0" step="0.01"></div></div>
        <div class="pill-row" id="tk-res"></div><p style="font-size:.8rem;color:var(--muted);margin-top:.5rem">Default prices are placeholders. Check your provider's pricing page.</p></section>
      <section class="play"><h2>3 · Cosine similarity</h2><p>Embeddings turn text into vectors; similarity search compares their direction. Enter vectors as comma-separated numbers.</p>
        <div class="two"><div><label>Vector A</label><input type="text" id="cs-a" value="0.9, 0.1, 0.3"></div><div><label>Vector B</label><input type="text" id="cs-b" value="0.8, 0.2, 0.4"></div></div><div class="pill-row" id="cs-res"></div>
        <p style="font-size:.88rem;margin-top:.6rem">1 = same direction (very similar meaning), 0 = unrelated, −1 = opposite. Try <code>1,0</code> and <code>0,1</code>.</p></section>
      <section class="play"><h2>4 · Chunking visualiser (for RAG)</h2><p>Split text into overlapping chunks before embedding. Overlap (highlighted) protects sentences that straddle a boundary.</p>
        <label>Text</label><textarea id="ch-text" rows="4">Retrieval-augmented generation looks up relevant documents and gives them to the model as context. Good chunking matters: chunks that are too small lose meaning, and chunks that are too large dilute the signal and waste tokens. Overlap keeps ideas from being cut in half.</textarea>
        <div class="two"><div><label>Chunk size (characters)</label><input type="number" id="ch-size" value="120" min="20"></div><div><label>Overlap (characters)</label><input type="number" id="ch-ov" value="30" min="0"></div></div><p id="ch-warn" class="warn-text" role="status"></p><div class="chunks" id="ch-out"></div></section>${footer}</div>`;

    const logits = [['" Paris"', 6.0], ['" Lyon"', 3.4], ['" the"', 3.0], ['" a"', 2.0], ['" Berlin"', 1.2]];
    const temp = $('#temp');
    const drawT = () => {
      const t = +temp.value; $('#t-val').textContent = t.toFixed(2);
      const ex = logits.map(l => Math.exp(l[1] / t)), s = ex.reduce((a, b) => a + b, 0);
      $('#t-bars').innerHTML = logits.map((l, i) => { const p = ex[i] / s; return `<div class="brow"><span>${esc(l[0])}</span><div class="bar"><i style="width:${(p * 100).toFixed(1)}%"></i></div><span>${(p * 100).toFixed(1)}%</span></div>`; }).join('');
    };
    temp.oninput = drawT; drawT();

    const drawK = () => {
      const chars = $('#tk-text').value.length, tin = Math.ceil(chars / 4), tout = +$('#tk-out').value || 0, n = +$('#tk-n').value || 0;
      const per = (tin * (+$('#tk-pi').value || 0) + tout * (+$('#tk-po').value || 0)) / 1e6;
      $('#tk-res').innerHTML = `<span class="pill">Input ≈ <b>${tin}</b> tokens</span><span class="pill">Per request ≈ <b>$${per.toFixed(5)}</b></span><span class="pill">Per day ≈ <b>$${(per * n).toFixed(2)}</b></span><span class="pill">Per month ≈ <b>$${(per * n * 30).toFixed(2)}</b></span>`;
    };
    ['tk-text', 'tk-out', 'tk-n', 'tk-pi', 'tk-po'].forEach(id => $('#' + id).oninput = drawK); drawK();

    const drawC = () => {
      const parse = s => s.split(',').map(x => parseFloat(x)).filter(x => !isNaN(x));
      const a = parse($('#cs-a').value), b = parse($('#cs-b').value);
      if (!a.length || a.length !== b.length) { $('#cs-res').innerHTML = '<span class="pill">Vectors must be the same length (and not empty).</span>'; return; }
      const dot = a.reduce((s, x, i) => s + x * b[i], 0), na = Math.hypot(...a), nb = Math.hypot(...b);
      $('#cs-res').innerHTML = na && nb ? `<span class="pill">dot = <b>${dot.toFixed(3)}</b></span><span class="pill">|A| = <b>${na.toFixed(3)}</b></span><span class="pill">|B| = <b>${nb.toFixed(3)}</b></span><span class="pill">cosine = <b>${(dot / (na * nb)).toFixed(4)}</b></span>` : '<span class="pill">A zero vector has no direction.</span>';
    };
    $('#cs-a').oninput = $('#cs-b').oninput = drawC; drawC();

    const drawH = () => {
      const t = $('#ch-text').value, size = Math.max(20, +$('#ch-size').value || 20), asked = Math.max(0, +$('#ch-ov').value || 0), maxOv = Math.floor(size / 2), ov = Math.min(asked, maxOv), out = [];
      $('#ch-ov').max = maxOv;
      $('#ch-warn').textContent = asked > maxOv ? `Overlap must be less than the chunk size — at most half of it (${maxOv}) in practice. Using ${maxOv}.` : '';
      for (let s = 0; s < t.length; s += size - ov) { out.push([s, t.slice(s, s + size)]); if (s + size >= t.length) break; }
      $('#ch-out').innerHTML = `<p style="font-size:.85rem;color:var(--muted);margin-top:.6rem">${out.length} chunks</p>` + out.map(([s, c], i) => {
        const o = i ? Math.min(ov, c.length) : 0;
        return `<div class="chunk"><small>chunk ${i + 1} · chars ${s}–${s + c.length}</small><mark>${esc(c.slice(0, o))}</mark>${esc(c.slice(o))}</div>`;
      }).join('');
    };
    ['ch-text', 'ch-size', 'ch-ov'].forEach(id => $('#' + id).oninput = drawH); drawH();
  }

  /* ---------- search ---------- */
  let index = null;
  const buildIndex = () => {
    index = [];
    C.modules.forEach(m => m.lessons.forEach(l => index.push({ t: l.title, sub: `Module ${m.n} · ${m.title}`, url: `#/m/${m.id}/${l.id}`, text: l.html.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ').replace(/\s+/g, ' ') })));
    C.glossary.forEach(g => index.push({ t: g.term, sub: 'Glossary', url: '#/glossary', text: g.def.replace(/<[^>]+>/g, '') }));
  };
  const sInput = $('#search'), sBox = $('#search-results');
  function doSearch() {
    const q = sInput.value.trim().toLowerCase();
    if (q.length < 2) { sBox.hidden = true; return; }
    if (!index) buildIndex();
    const words = q.split(/\s+/);
    const hits = index.map(e => {
      const title = e.t.toLowerCase(), text = e.text.toLowerCase();
      let s = 0;
      for (const w of words) { if (title.includes(w)) s += 10; const i = text.indexOf(w); if (i >= 0) s += 3; else { s = 0; break; } }
      return { e, s, i: text.indexOf(words[0]) };
    }).filter(h => h.s > 0).sort((a, b) => b.s - a.s).slice(0, 8);
    sBox.innerHTML = hits.length ? hits.map(h => {
      const st = Math.max(0, h.i - 40), snip = h.e.text.slice(st, st + 110);
      const re = new RegExp('(' + words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'gi');
      return `<a href="${h.e.url}"><b>${esc(h.e.t)}</b><small>${esc(h.e.sub)}</small><small>${esc(snip).replace(re, '<mark>$1</mark>')}…</small></a>`;
    }).join('') : '<a style="color:var(--muted)">No results</a>';
    sBox.hidden = false;
  }
  sInput.oninput = doSearch;
  sInput.onkeydown = e => {
    if (e.key === 'Escape') { sInput.value = ''; sBox.hidden = true; sInput.blur(); }
    if (e.key === 'Enter') { const a = sBox.querySelector('a[href]'); if (a) { location.hash = a.getAttribute('href'); sInput.value = ''; sBox.hidden = true; sInput.blur(); } }
  };
  sBox.onclick = () => { sInput.value = ''; sBox.hidden = true; };
  document.addEventListener('click', e => { if (!e.target.closest('.search')) sBox.hidden = true; });
  document.addEventListener('keydown', e => {
    const tag = (e.target.tagName || '').toLowerCase();
    if (e.key === '/' && tag !== 'input' && tag !== 'textarea') { e.preventDefault(); sInput.focus(); }
  });

  /* in-browser Python runner (Pyodide, loaded on first use) */
  const PY = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
  let pyReady = null;
  function loadPy() {
    if (!pyReady) {
      pyReady = new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = PY + 'pyodide.js';
        s.onload = () => window.loadPyodide({ indexURL: PY }).then(res, rej);
        s.onerror = () => rej(new Error('Could not download the Python runtime. Check your internet connection and try again.'));
        document.head.appendChild(s);
      });
      pyReady.catch(() => { pyReady = null; });
    }
    return pyReady;
  }
  const original = new WeakMap();
  document.addEventListener('focusin', e => { const c = e.target.closest && e.target.closest('.runnable code'); if (c && !original.has(c)) original.set(c, c.innerHTML); });
  document.addEventListener('input', e => { const c = e.target.closest && e.target.closest('.runnable code'); if (c) c.closest('.code').querySelector('.reset').hidden = false; });
  document.addEventListener('click', async e => {
    const reset = e.target.closest('.reset');
    if (reset) { const c = reset.closest('.code').querySelector('code'); if (original.has(c)) c.innerHTML = original.get(c); reset.hidden = true; return; }
    const b = e.target.closest('.run');
    if (!b) return;
    const box = b.closest('.code'), out = box.querySelector('.out'), code = box.querySelector('code').textContent;
    out.hidden = false; out.classList.remove('err'); b.disabled = true;
    out.textContent = pyReady ? 'Running…' : 'Loading Python into your browser — the first run takes 10–30 seconds…';
    try {
      const py = await loadPy();
      out.textContent = 'Running…';
      await py.loadPackagesFromImports(code);
      let buf = '';
      py.setStdout({ batched: t => { buf += t + '\n'; } });
      py.setStderr({ batched: t => { buf += t + '\n'; } });
      const ns = py.globals.get('dict')();
      await py.runPythonAsync(code, { globals: ns });
      ns.destroy();
      out.textContent = buf.trimEnd() || '(The code ran without printing anything.)';
    } catch (err) {
      const msg = String(err && err.message || err).split('\n');
      const i = msg.findIndex(l => l.includes('File "<exec>"'));
      out.classList.add('err');
      out.textContent = (i >= 0 ? ['Traceback (most recent call last):'].concat(msg.slice(i)) : msg.slice(-6)).join('\n').trim();
    }
    b.disabled = false;
  });

  /* copy buttons (delegated) */
  document.addEventListener('click', e => {
    const b = e.target.closest('.copy');
    if (!b) return;
    const code = b.closest('.code').querySelector('code').textContent;
    const done = () => { b.textContent = 'Copied'; setTimeout(() => b.textContent = 'Copy', 1500); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(done, () => { });
    else { const ta = document.createElement('textarea'); ta.value = code; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (er) { /* ignore */ } ta.remove(); }
  });

  /* ---------- router ---------- */
  function parse() {
    const p = (location.hash.replace(/^#\/?/, '') || '').split('/').filter(Boolean);
    if (p[0] === 'm' && p[1]) return { view: 'm', mod: p[1], lesson: p[2] };
    return { view: p[0] || 'home' };
  }
  let tocObs = null;
  function renderChrome() { renderSidebar(parse()); renderTop(); }
  function route() {
    const r = parse();
    setMenu(false);
    document.querySelectorAll('.top-links a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#/' + r.view));
    if (tocObs) { tocObs.disconnect(); tocObs = null; }
    let title = 'AI Engineer Path';
    if (r.view === 'm') {
      const m = findMod(r.mod);
      if (!m) { view404(); title = 'Page not found'; }
      else if (!r.lesson) { viewModule(m); title = m.title; }
      else if (r.lesson === 'quiz') { viewQuiz(m); title = 'Quiz · ' + m.title; }
      else {
        const l = m.lessons.find(x => x.id === r.lesson);
        if (l) { viewLesson(m, l); title = l.title + ' · ' + m.title; } else { view404(); title = 'Page not found'; }
      }
    }
    if (r.view === 'home') viewHome();
    else if (r.view === 'glossary') { viewGlossary(); title = 'Glossary'; }
    else if (r.view === 'resources') { viewResources(); title = 'Resources'; }
    else if (r.view === 'projects') { viewProjects(); title = 'Projects'; }
    else if (r.view === 'playground') { viewPlayground(); title = 'Playground'; }
    else if (r.view === 'certificate') { viewCertificate(); title = 'Certificate'; }
    else if (r.view !== 'm') { view404(); title = 'Page not found'; }
    document.title = title + (title === 'AI Engineer Path' ? ' — Learn AI from zero to production' : ' — AI Engineer Path');
    renderChrome();
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    main.focus({ preventScroll: true });
    const links = main.querySelectorAll('.toc a');
    if (links.length && 'IntersectionObserver' in window) {
      tocObs = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) links.forEach(a => a.classList.toggle('on', a.dataset.id === en.target.id)); }), { rootMargin: '-10% 0px -80% 0px' });
      main.querySelectorAll('.article h2').forEach(h => tocObs.observe(h));
    }
  }
  window.addEventListener('hashchange', route);
  route();
})();
