import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { useMemory, load } from '../src/store.js';
import { seed } from '../src/seed.js';
import { parseRuleBased, parseDate } from '../src/agents/concierge.js';
import * as orchestrator from '../src/agents/orchestrator.js';
import * as split from '../src/agents/split.js';
import * as expense from '../src/agents/expense.js';

process.env.EOS_DISABLE_LLM = '1';
const NOW = new Date('2026-09-22T15:00:00Z');

beforeEach(() => useMemory(seed()));

async function book(who, text, overrides = {}) {
  const { draft } = await orchestrator.plan(text, who, { now: NOW, useLLM: false });
  return orchestrator.createBooking({ ...draft, ...overrides }, who);
}

function approveChain(b) {
  while (b.status === 'pending_approval') {
    const s = b.approvals.find((x) => x.status === 'pending');
    orchestrator.decide(b.id, s.approverId, 'approve');
  }
  return b;
}

test('concierge classifies the six categories', () => {
  const cases = {
    'Client dinner for 4 tonight': 'reservations',
    'Private room for 30 Aug 5': 'pdr',
    'Offsite lunch 120 people': 'catering',
    'Suite at the Warriors game': 'sports',
    'Holiday gifts 40 clients': 'gifting',
    'Team offsite Napa': 'experiences',
  };
  for (const [text, cat] of Object.entries(cases)) assert.equal(parseRuleBased(text, NOW).category, cat, text);
});

test('concierge resolves dates and funding intent', () => {
  assert.equal(parseDate('tonight', NOW), '2026-09-22');
  assert.equal(parseDate('tomorrow', NOW), '2026-09-23');
  assert.equal(parseDate('Aug 5', NOW), '2027-08-05');
  assert.equal(parseRuleBased('client lunch, I will pay and expense it', NOW).funding, 'reimbursable');
  assert.equal(parseRuleBased('dinner with my family, split it', NOW).funding, 'shared');
  assert.equal(parseRuleBased('drinks with friends', NOW).groupType, 'friends');
  assert.equal(parseRuleBased('concert tickets on my own dime, personal', NOW).funding, 'personal');
});

test('small corporate booking is auto-approved and confirmed', async () => {
  const b = await book('u-maya', 'Client dinner for 2 tomorrow', { amount: 180 });
  assert.equal(b.approvals.length, 0);
  assert.equal(b.status, 'confirmed');
  assert.ok(b.confirmation);
});

test('approval chain escalates by amount, cap and compliance', async () => {
  const mid = await book('u-maya', 'Client dinner for 4 tonight');
  assert.deepEqual(mid.approvals.map((s) => s.key), ['manager']);
  assert.equal(mid.approvals[0].approverId, 'u-raj');

  const gifts = await book('u-maya', 'Holiday gifts for 40 clients Dec 1');
  assert.deepEqual(gifts.approvals.map((s) => s.key), ['manager', 'dept_head', 'compliance']);

  const big = await book('u-leo', 'Team offsite in Napa for 30 on Oct 20');
  assert.ok(big.approvals.some((s) => s.key === 'finance'), 'over $10k needs Finance');
});

test('nobody approves their own booking', async () => {
  const b = await book('u-elena', 'Suite at the Warriors game for 12 clients Nov 4');
  assert.ok(b.approvals.every((s) => s.approverId !== 'u-elena'));
});

test('only the current approver can decide, and rejection stops the chain', async () => {
  const b = await book('u-maya', 'Holiday gifts for 40 clients Dec 1');
  assert.throws(() => orchestrator.decide(b.id, 'u-elena', 'approve'), /Waiting on Raj/);
  orchestrator.decide(b.id, 'u-raj', 'reject', 'Too many recipients');
  assert.equal(b.status, 'rejected');
});

test('over-budget corporate spend requires Finance', async () => {
  load().departments.find((d) => d.id === 'product').quarterlyBudget = 500;
  const b = await book('u-leo', 'Team drinks for 6 Friday');
  assert.equal(b.budget.status, 'over');
  assert.ok(b.approvals.some((s) => s.key === 'finance'));
});

test('split shares always add up to the total', () => {
  const members = ['a', 'b', 'c'];
  const eq = split.computeShares(100, members, 'equal');
  assert.equal(eq.reduce((s, x) => s + Math.round(x.amount * 100), 0), 10000);
  assert.deepEqual(eq.map((x) => x.amount).sort(), [33.33, 33.33, 33.34]);
  const sh = split.computeShares(90, members, 'shares', { a: 1, b: 1, c: 1 });
  assert.deepEqual(sh.map((x) => x.amount), [30, 30, 30]);
  const pct = split.computeShares(200, members, 'percent', { a: 50, b: 25, c: 25 });
  assert.deepEqual(pct.map((x) => x.amount), [100, 50, 50]);
  assert.throws(() => split.computeShares(100, members, 'exact', { a: 10, b: 10, c: 10 }), /add up/);
  assert.throws(() => split.computeShares(100, members, 'percent', { a: 10 }), /100%/);
});

test('shared booking lands in the group ledger and settles to zero', async () => {
  const b = await book('u-maya', 'Giants game tickets with friends for 4 Sunday, split');
  assert.equal(b.funding, 'shared');
  assert.equal(b.status, 'confirmed');
  const bal = split.balances('g-friends');
  assert.equal(bal['u-maya'], 540);
  const transfers = split.simplify('g-friends');
  assert.equal(transfers.length, 3);
  for (const t of transfers) split.settle({ groupId: 'g-friends', ...t });
  assert.ok(Object.values(split.balances('g-friends')).every((v) => v === 0));
});

test('reimbursable booking → expense report → Manager → Finance → reimbursed', async () => {
  const b = await book('u-maya', 'Client lunch for 2 tomorrow, I will pay and expense it');
  assert.equal(b.status, 'confirmed');
  assert.deepEqual(expense.reportableBookings('u-maya').map((x) => x.id), [b.id]);
  const r = expense.createReport({ ownerId: 'u-maya', bookingIds: [b.id], submit: true });
  assert.equal(r.routeTo, 'Finance');
  assert.deepEqual(r.approvals.map((s) => s.approverId), ['u-raj', 'u-sam']);
  orchestrator.decide(r.id, 'u-raj', 'approve');
  orchestrator.decide(r.id, 'u-sam', 'approve');
  assert.equal(r.status, 'reimbursed');
  assert.equal(expense.reportableBookings('u-maya').length, 0, 'cannot claim twice');
});

test('wellbeing report goes to Benefits and draws down the stipend', async () => {
  const b = await book('u-leo', 'Alcatraz tour for 1 Oct 5, wellbeing stipend, reimburse me');
  const r = expense.createReport({ ownerId: 'u-leo', bookingIds: [b.id], submit: true });
  assert.equal(r.routeTo, 'Benefits');
  assert.equal(r.approvals.length, 1);
  orchestrator.decide(r.id, 'u-omar', 'approve');
  assert.equal(load().people.find((p) => p.id === 'u-leo').stipendBalance, 1200 - 65);
});

test('team morale expense report routes to HR', async () => {
  const b = await book('u-leo', 'Team drinks for 3 Friday, I will pay and expense it');
  const r = expense.createReport({ ownerId: 'u-leo', bookingIds: [b.id], purpose: 'morale', submit: true });
  assert.equal(r.routeTo, 'HR');
  assert.deepEqual(r.approvals.map((s) => s.approverId), ['u-ana', 'u-kim']);
});

test('cancelling a shared booking removes it from the ledger', async () => {
  const b = await book('u-maya', 'Dinner with my family Saturday, split');
  assert.equal(load().groupExpenses.length, 1);
  orchestrator.cancelBooking(b.id, 'u-maya');
  assert.equal(load().groupExpenses.length, 0);
  assert.equal(b.status, 'cancelled');
});
