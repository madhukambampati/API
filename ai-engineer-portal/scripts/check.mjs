// Content integrity check: npm test  (builds first, then validates links and structure)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
execFileSync('node', [path.join(root, 'scripts/build.mjs')], { stdio: 'inherit' });

const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'site/js/content.js'), 'utf8'), ctx);
const C = ctx.window.COURSE;
const errors = [];
const mods = new Map(C.modules.map(m => [m.id, m]));
const staticRoutes = new Set(['', 'projects', 'playground', 'glossary', 'resources', 'certificate']);

const pages = [
  ...C.modules.flatMap(m => m.lessons.map(l => [`${m.id}/${l.id}`, l.html])),
  ...C.projects.map(p => ['project ' + p.id, p.html]),
  ...C.glossary.map(g => ['glossary ' + g.term, g.def])
];
for (const [where, html] of pages) {
  for (const [, href] of html.matchAll(/href="(#[^"]*)"/g)) {
    const parts = href.replace(/^#\/?/, '').split('/').filter(Boolean);
    const ok = parts[0] === 'm'
      ? mods.has(parts[1]) && (!parts[2] || parts[2] === 'quiz' || mods.get(parts[1]).lessons.some(l => l.id === parts[2]))
      : staticRoutes.has(parts[0] || '');
    if (!ok) errors.push(`${where}: broken link ${href}`);
  }
}
for (const m of C.modules) {
  const ids = new Set();
  for (const l of m.lessons) {
    if (ids.has(l.id)) errors.push(`${m.id}: duplicate lesson id ${l.id}`);
    ids.add(l.id);
    if (l.html.length < 800) errors.push(`${m.id}/${l.id}: lesson suspiciously short`);
    if (/```|\*\*[^*]+\*\*/.test(l.html.replace(/<pre[\s\S]*?<\/pre>/g, ''))) errors.push(`${m.id}/${l.id}: unrendered markdown`);
  }
  if (!m.outcomes.length) errors.push(`${m.id}: no outcomes`);
  for (const q of m.quiz) if (q.answer >= q.options.length || !q.why) errors.push(`${m.id}: bad quiz "${q.q}"`);
}
if (errors.length) { console.error('\n' + errors.join('\n')); process.exit(1); }
console.log('Content checks passed.');
