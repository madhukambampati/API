// Builds content/*.md into site/js/content.js (pre-rendered HTML, no runtime dependencies).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { render, slug, stripTags } from './markdown.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = path.join(root, 'content');

function parseFront(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return [{}, src];
  const meta = {};
  let key = null;
  for (const line of m[1].split('\n')) {
    const item = line.match(/^\s+-\s+(.*)$/);
    if (item && key) { meta[key].push(item[1].trim()); continue; }
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) { key = kv[1]; meta[key] = kv[2] === '' ? [] : kv[2].trim(); }
  }
  return [meta, src.slice(m[0].length)];
}

// Split on top-level "# " headings, ignoring those inside code fences.
function splitSections(body) {
  const sections = [];
  let cur = null, fence = false;
  for (const line of body.split('\n')) {
    if (/^```/.test(line)) fence = !fence;
    const h = !fence && line.match(/^# (.+)$/);
    if (h) { cur = { title: h[1].trim(), lines: [] }; sections.push(cur); }
    else if (cur) cur.lines.push(line);
  }
  return sections.map(s => ({ title: s.title, body: s.lines.join('\n').trim() }));
}

function parseQuiz(body) {
  const qs = [];
  let cur = null;
  for (const raw of body.split('\n')) {
    const line = raw.trim();
    if (line.startsWith('? ')) { cur = { q: line.slice(2), options: [], answer: -1, why: '' }; qs.push(cur); }
    else if (cur && line.startsWith('+ ')) { cur.answer = cur.options.length; cur.options.push(line.slice(2)); }
    else if (cur && line.startsWith('- ')) cur.options.push(line.slice(2));
    else if (cur && line.startsWith('! ')) cur.why = line.slice(2);
  }
  for (const q of qs) if (q.answer < 0 || q.options.length < 2) throw new Error('Bad quiz question: ' + q.q);
  return qs;
}

const modules = [];
const files = fs.readdirSync(contentDir).filter(f => /^\d\d-.*\.md$/.test(f)).sort();
for (const f of files) {
  const id = f.replace(/^\d\d-/, '').replace(/\.md$/, '');
  const [meta, body] = parseFront(fs.readFileSync(path.join(contentDir, f), 'utf8'));
  const mod = {
    id, n: modules.length + 1,
    title: meta.title, summary: meta.summary, time: meta.time, level: meta.level || 'Beginner',
    outcomes: meta.outcomes || [], lessons: [], quiz: []
  };
  for (const s of splitSections(body)) {
    if (s.title === '@quiz') { mod.quiz = parseQuiz(s.body); continue; }
    const { html, toc } = render(s.body);
    const words = stripTags(html).split(/\s+/).filter(Boolean).length;
    mod.lessons.push({ id: slug(s.title), title: s.title, html, toc, mins: Math.max(2, Math.round(words / 200)) });
  }
  if (!mod.lessons.length) throw new Error('No lessons in ' + f);
  if (mod.quiz.length < 3) throw new Error('Module needs at least 3 quiz questions: ' + f);
  modules.push(mod);
}

// Glossary: lines of "- **Term** — definition"
const glossary = [];
const gsrc = fs.readFileSync(path.join(contentDir, 'glossary.md'), 'utf8');
for (const line of gsrc.split('\n')) {
  const m = line.match(/^- \*\*(.+?)\*\*\s+[—-]\s+(.*)$/);
  if (m) glossary.push({ term: m[1], def: render(m[2]).html.replace(/^<p>|<\/p>\s*$/g, '') });
}
glossary.sort((a, b) => a.term.localeCompare(b.term, 'en', { sensitivity: 'base' }));

// Projects: "# Title" sections, "@key value" header lines, then markdown body
const projects = [];
const psrc = fs.readFileSync(path.join(contentDir, 'projects.md'), 'utf8');
for (const s of splitSections(psrc)) {
  const meta = {};
  const rest = [];
  for (const line of s.body.split('\n')) {
    const m = !rest.length && line.match(/^@(\w+)\s+(.*)$/);
    if (m) meta[m[1]] = m[2].trim(); else rest.push(line);
  }
  projects.push({ id: slug(s.title), title: s.title, level: meta.level, time: meta.time, after: meta.after, html: render(rest.join('\n').trim()).html });
}

// Resources: "# Group" sections with "- [Title](url) — note"
const resources = [];
const rsrc = fs.readFileSync(path.join(contentDir, 'resources.md'), 'utf8');
for (const s of splitSections(rsrc)) {
  const items = [];
  for (const line of s.body.split('\n')) {
    const m = line.match(/^- \[(.+?)\]\((.+?)\)\s*(?:[—-]\s*(.*))?$/);
    if (m) items.push({ title: m[1], url: m[2], note: m[3] || '' });
  }
  resources.push({ group: s.title, items });
}

const course = { built: new Date().toISOString().slice(0, 10), modules, glossary, projects, resources };
fs.writeFileSync(path.join(root, 'site/js/content.js'), 'window.COURSE=' + JSON.stringify(course) + ';\n');

const lessons = modules.reduce((n, m) => n + m.lessons.length, 0);
const qs = modules.reduce((n, m) => n + m.quiz.length, 0);
console.log(`Built ${modules.length} modules, ${lessons} lessons, ${qs} quiz questions, ${glossary.length} glossary terms, ${projects.length} projects.`);
