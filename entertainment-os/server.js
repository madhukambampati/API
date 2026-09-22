// Entertainment OS — zero-dependency HTTP server (Node 18+).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load, save, person } from './src/store.js';
import { CATEGORIES, FUNDING, POLICY } from './src/seed.js';
import * as orchestrator from './src/agents/orchestrator.js';
import * as expense from './src/agents/expense.js';
import * as split from './src/agents/split.js';
import * as insights from './src/insights.js';
import { loadDemo } from './src/demo.js';
import { llmEnabled } from './src/llm.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(here, 'public');
const PORT = Number(process.env.PORT) || 4600;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' };

function send(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 1e6) throw new Error('Body too large');
  }
  return raw ? JSON.parse(raw) : {};
}

// The demo has no login: the UI sends the acting user in the x-user header.
function actor(req) {
  const id = req.headers['x-user'];
  const p = id && person(id);
  if (!p || !p.employee) throw Object.assign(new Error('Pick an employee to act as'), { status: 401 });
  return id;
}

function state(actorId) {
  const d = load();
  return {
    meta: { ...d.meta, llm: llmEnabled() },
    me: person(actorId),
    categories: CATEGORIES,
    funding: FUNDING,
    policy: POLICY,
    people: d.people,
    departments: insights.budgets(),
    bookings: d.bookings,
    reports: d.reports,
    groups: insights.groups(),
    spend: insights.spendByPerson(),
    byCategory: insights.byCategory(),
    kpis: insights.kpis(),
    inbox: orchestrator.pendingFor(actorId),
    claimable: expense.reportableBookings(actorId),
    activity: d.activity.slice(0, 80),
  };
}

const routes = [
  ['GET', /^\/api\/state$/, (req) => state(actor(req))],
  ['POST', /^\/api\/agent\/plan$/, async (req, body) => orchestrator.plan(String(body.text || ''), actor(req))],
  ['POST', /^\/api\/bookings$/, (req, body) => orchestrator.createBooking(body, actor(req))],
  ['POST', /^\/api\/bookings\/([\w-]+)\/cancel$/, (req, body, m) => orchestrator.cancelBooking(m[1], actor(req))],
  ['POST', /^\/api\/decisions\/([\w-]+)$/, (req, body, m) => orchestrator.decide(m[1], actor(req), body.decision, body.note)],
  [
    'POST',
    /^\/api\/reports$/,
    (req, body) => {
      const r = expense.createReport({ ownerId: actor(req), bookingIds: body.bookingIds || [], purpose: body.purpose, notes: body.notes, submit: Boolean(body.submit) });
      save();
      return r;
    },
  ],
  [
    'POST',
    /^\/api\/reports\/([\w-]+)\/submit$/,
    (req, body, m) => {
      const r = expense.submitReport(m[1], actor(req));
      save();
      return r;
    },
  ],
  [
    'POST',
    /^\/api\/groups$/,
    (req, body) => {
      const me = actor(req);
      const d = load();
      if (!body.name || !['family', 'friends'].includes(body.type)) throw new Error('Group needs a name and type family|friends');
      const members = [...new Set([me, ...(body.members || [])])].filter((m) => person(m));
      const g = { id: `g-${Date.now().toString(36)}`, name: body.name, type: body.type, members };
      d.groups.push(g);
      save();
      return g;
    },
  ],
  [
    'POST',
    /^\/api\/groups\/([\w-]+)\/expenses$/,
    (req, body, m) => {
      actor(req);
      const e = split.addExpense({ groupId: m[1], paidBy: body.paidBy, amount: Number(body.amount), description: body.description || 'Shared expense', method: body.method, weights: body.weights, members: body.members });
      save();
      return e;
    },
  ],
  [
    'POST',
    /^\/api\/groups\/([\w-]+)\/settle$/,
    (req, body, m) => {
      actor(req);
      const s = split.settle({ groupId: m[1], from: body.from, to: body.to, amount: Number(body.amount) });
      save();
      return s;
    },
  ],
  ['POST', /^\/api\/demo$/, async () => (await loadDemo(), { ok: true })],
];

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname.startsWith('/api/')) {
    const route = routes.find(([method, re]) => method === req.method && re.test(url.pathname));
    if (!route) return send(res, 404, { error: 'Not found' });
    try {
      const body = req.method === 'POST' ? await readBody(req) : {};
      const result = await route[2](req, body, url.pathname.match(route[1]));
      return send(res, 200, result);
    } catch (err) {
      return send(res, err.status || 400, { error: err.message });
    }
  }
  const file = path.normalize(path.join(PUBLIC, url.pathname === '/' ? 'index.html' : url.pathname));
  if (!file.startsWith(PUBLIC) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404);
    return res.end('Not found');
  }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

if (!load().bookings.length) await loadDemo();

server.listen(PORT, () => {
  console.log(`Entertainment OS running on http://localhost:${PORT}  (Claude intake: ${llmEnabled() ? 'on' : 'off — rule engine'})`);
});
