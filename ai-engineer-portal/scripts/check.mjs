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
// Quizzes must not be guessable from option length: the correct answer's
// length rank (longest, 2nd, 3rd, shortest) should be spread out.
const rank = [0, 0, 0, 0];
let total = 0;
for (const m of C.modules) for (const q of m.quiz) {
  total++;
  const L = q.options.map(o => o.length), right = L[q.answer];
  rank[Math.min(3, L.filter(x => x > right).length)]++;
  if (right > 1.6 * Math.max(...L.filter((_, i) => i !== q.answer))) errors.push(`${m.id}: correct option is far longer than every distractor — "${q.q}"`);
  if (q.options.length < 3) errors.push(`${m.id}: needs at least 3 options — "${q.q}"`);
}
const pct = rank.map(n => Math.round(100 * n / total));
console.log(`Correct option length rank — longest ${pct[0]}%, 2nd ${pct[1]}%, 3rd ${pct[2]}%, shortest ${pct[3]}%`);
if (pct.some(p => p > 45)) errors.push(`quizzes are guessable: one length position holds more than 45% of correct answers (${pct.join('/')})`);
if (errors.length) { console.error('\n' + errors.join('\n')); process.exit(1); }
console.log('Content checks passed.');
