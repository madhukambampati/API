import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { useMemory, load } from '../src/store.js';
import { seed } from '../src/seed.js';
import { parseRuleBased, parseDate } from '../src/agents/concierge.js';
import * as orchestrator from '../src/agents/orchestrator.js';
import * as split from '../src/agents/split.js';
import * as expense from '../src/agents/expense.js';
import { events, seatMap, showtimes, vendors } from '../src/catalog.js';
import { findCityInText, LOCATIONS } from '../src/locations.js';
import { parseAmount, inr } from '../src/money.js';

process.env.EOS_DISABLE_LLM = '1';
const NOW = new Date('2026-09-22T09:00:00Z'); // a Tuesday
const BLR = { country: 'India', state: 'Karnataka', city: 'Bengaluru' };

beforeEach(() => useMemory(seed()));

async function book(who, text, overrides = {}, location) {
  const { draft } = await orchestrator.plan(text, who, { now: NOW, useLLM: false, location });
  return orchestrator.createBooking({ ...draft, ...overrides }, who);
}

function approveChain(b) {
  while (b.status === 'pending_approval') {
    const s = b.approvals.find((x) => x.status === 'pending');
    orchestrator.decide(b.id, s.approverId, 'approve');
  }
  return b;
}

test('locations cover every Indian state and union territory', () => {
  assert.equal(Object.keys(LOCATIONS.India).length, 36);
  assert.deepEqual(findCityInText('dinner in bangalore tomorrow'), BLR);
  assert.equal(findCityInText('movie in Pune')?.state, 'Maharashtra');
});

test('rupee helpers use Indian grouping and understand lakh / k', () => {
  assert.equal(inr(123456), '₹1,23,456');
  assert.equal(parseAmount('budget 2.5 lakh'), 250000);
  assert.equal(parseAmount('under ₹5k'), 5000);
  assert.equal(parseAmount('rs 1,200 per head'), 1200);
});

test('concierge classifies categories, including movies and events', () => {
  const cases = {
    'Client dinner for 4 tonight': 'reservations',
    'Private dining room for 30': 'pdr',
    'Offsite lunch 120 people': 'catering',
    '2 tickets for Orbit 9 IMAX': 'movies',
    'movie with my family Saturday': 'movies',
    'Stand-up comedy this weekend': 'events',
    'T20 match tickets for 4': 'events',
    'Tech conference passes for 3': 'events',
    'Diwali gift hampers for 40 clients': 'gifting',
    'Team offsite retreat': 'experiences',
  };
  for (const [text, cat] of Object.entries(cases)) assert.equal(parseRuleBased(text, NOW).category, cat, text);
});

test('concierge resolves dates and funding intent', () => {
  assert.equal(parseDate('tonight', NOW).date, '2026-09-22');
  assert.equal(parseDate('this weekend', NOW).date, '2026-09-26');
  assert.equal(parseDate('15 Oct', NOW).date, '2026-10-15');
  assert.equal(parseRuleBased('client lunch, I will pay and expense it', NOW).funding, 'reimbursable');
  assert.equal(parseRuleBased('dinner with my family, split it', NOW).funding, 'shared');
  assert.equal(parseRuleBased('concert tonight', NOW).funding, 'personal');
  assert.equal(parseRuleBased('team movie night for 8', NOW).funding, 'corporate');
});

test('movie request picks a show, the requested format and seats together', async () => {
  const b = await book('u-ananya', '3 tickets for Orbit 9 IMAX tomorrow evening', {}, BLR);
  assert.equal(b.category, 'movies');
  assert.equal(b.details.format, 'IMAX');
  assert.equal(b.details.seats.length, 3);
  assert.equal(b.amount, b.details.pricePerSeat * 3);
  assert.equal(new Set(b.details.seats.map((s) => s[0])).size, 1, 'same row');
  assert.equal(b.status, 'confirmed', 'personal money needs no approval');
  // seats are now held
  const map = seatMap(b.details.showKey, load().seatBookings[b.details.showKey]);
  const taken = map.rows.flatMap((r) => r.seats).filter((s) => b.details.seats.includes(s.id));
  assert.ok(taken.every((s) => s.sold));
});

test('a sold seat cannot be booked twice and prices come from the server', async () => {
  const date = '2026-09-25';
  const show = showtimes('m-orbit-9', date, BLR)[0].shows[0];
  const free = seatMap(show.key).rows.flatMap((r) => r.seats).find((s) => !s.sold).id;
  const draft = { category: 'movies', funding: 'personal', purpose: 'personal', location: BLR, amount: 1, details: { kind: 'movie', showKey: show.key, seats: [free] } };
  const b = orchestrator.createBooking(draft, 'u-ananya');
  assert.equal(b.amount, show.price, 'client amount ignored');
  assert.throws(() => orchestrator.createBooking(draft, 'u-arjun'), /just taken/);
  orchestrator.cancelBooking(b.id, 'u-ananya');
  assert.doesNotThrow(() => orchestrator.createBooking(draft, 'u-arjun'), 'seat released on cancel');
});

test('events near you are location-specific and bookable by tier', async () => {
  const blr = events(BLR, { now: NOW });
  const pune = events({ country: 'India', state: 'Maharashtra', city: 'Pune' }, { now: NOW });
  assert.ok(blr.length > 5);
  assert.ok(blr.every((e) => e.title.includes('Bengaluru') || e.venue.includes('Bengaluru')));
  assert.notDeepEqual(blr.map((e) => e.id), pune.map((e) => e.id));
  const ev = blr[0];
  const b = orchestrator.createBooking({ category: 'events', funding: 'personal', purpose: 'personal', location: BLR, details: { kind: 'event', eventId: ev.id, tier: ev.tiers[0].name, qty: 3 } }, 'u-ananya');
  assert.equal(b.amount, ev.tiers[0].price * 3);
});

test('custom "Other" locations still get venues, movies and events', () => {
  const other = { country: 'Nepal', state: 'Bagmati', city: 'Kathmandu' };
  assert.ok(vendors('reservations', other).length);
  assert.ok(showtimes('m-orbit-9', '2026-09-25', other).length);
  assert.ok(events(other, { now: NOW }).length);
});

test('small corporate booking is auto-approved and confirmed', async () => {
  const b = await book('u-arjun', 'Team movie night for 8 — Pushpaka Rising Friday evening');
  assert.equal(b.funding, 'corporate');
  assert.ok(b.amount <= 20000);
  assert.equal(b.status, 'confirmed');
});

test('approval chain escalates by amount, cap and compliance', async () => {
  const mid = await book('u-ananya', 'Client dinner for 6 tonight', {}, BLR);
  assert.deepEqual(mid.approvals.map((s) => s.key), ['manager']);
  assert.equal(mid.approvals[0].approverId, 'u-rahul');

  const gifts = await book('u-ananya', 'Diwali gift hampers for 60 clients on 20 Oct', {}, BLR);
  assert.deepEqual(gifts.approvals.map((s) => s.key), ['manager', 'dept_head', 'compliance']);

  const big = await book('u-arjun', 'Team offsite retreat for 40 on 24 Oct', {}, BLR);
  assert.ok(big.approvals.some((s) => s.key === 'finance'), 'over ₹8 lakh needs Finance');
});

test('nobody approves their own booking', async () => {
  const b = await book('u-priya', 'Corporate box at the T20 night for 10 clients', {}, BLR);
  assert.ok(b.approvals.every((s) => s.approverId !== 'u-priya'));
});

test('only the current approver can decide, and rejection stops the chain', async () => {
  const b = await book('u-ananya', 'Diwali gift hampers for 60 clients on 20 Oct', {}, BLR);
  assert.throws(() => orchestrator.decide(b.id, 'u-priya', 'approve'), /Waiting on Rahul/);
  orchestrator.decide(b.id, 'u-rahul', 'reject', 'Too many recipients');
  assert.equal(b.status, 'rejected');
});

test('over-budget corporate spend requires Finance', async () => {
  load().departments.find((d) => d.id === 'product').quarterlyBudget = 5000;
  const b = await book('u-arjun', 'Team dinner for 6 Friday', {}, BLR);
  assert.equal(b.budget.status, 'over');
  assert.ok(b.approvals.some((s) => s.key === 'finance'));
});

test('split shares always add up to the total', () => {
  const members = ['a', 'b', 'c'];
  const eq = split.computeShares(100, members, 'equal');
  assert.equal(eq.reduce((s, x) => s + Math.round(x.amount * 100), 0), 10000);
  assert.deepEqual(eq.map((x) => x.amount).sort(), [33.33, 33.33, 33.34]);
  assert.deepEqual(split.computeShares(900, members, 'shares', { a: 1, b: 1, c: 1 }).map((x) => x.amount), [300, 300, 300]);
  assert.deepEqual(split.computeShares(2000, members, 'percent', { a: 50, b: 25, c: 25 }).map((x) => x.amount), [1000, 500, 500]);
  assert.throws(() => split.computeShares(100, members, 'exact', { a: 10, b: 10, c: 10 }), /add up/);
  assert.throws(() => split.computeShares(100, members, 'percent', { a: 10 }), /100%/);
});

test('shared movie lands in the family ledger and settles to zero', async () => {
  const b = await book('u-ananya', 'Kaveri Diaries movie with my family Saturday evening', {}, BLR);
  assert.equal(b.funding, 'shared');
  assert.equal(b.details.seats.length, 3);
  const bal = split.balances('g-family');
  assert.equal(bal['u-ananya'], Math.round((b.amount * 2) / 3 * 100) / 100);
  for (const t of split.simplify('g-family')) split.settle({ groupId: 'g-family', ...t });
  assert.ok(Object.values(split.balances('g-family')).every((v) => v === 0));
});

test('reimbursable booking → expense report → Manager → Finance → reimbursed', async () => {
  const b = await book('u-ananya', 'Client lunch for 2 tomorrow, I will pay and expense it', {}, BLR);
  assert.equal(b.status, 'confirmed');
  const r = expense.createReport({ ownerId: 'u-ananya', bookingIds: [b.id], submit: true });
  assert.equal(r.routeTo, 'Finance');
  assert.deepEqual(r.approvals.map((s) => s.approverId), ['u-rahul', 'u-vikram']);
  orchestrator.decide(r.id, 'u-rahul', 'approve');
  orchestrator.decide(r.id, 'u-vikram', 'approve');
  assert.equal(r.status, 'reimbursed');
  assert.equal(expense.reportableBookings('u-ananya').length, 0, 'cannot claim twice');
});

test('wellbeing report goes to Benefits and draws down the allowance', async () => {
  const b = await book('u-arjun', 'Cooking class on my wellbeing allowance, reimburse me, for 1 on 5 Oct', {}, BLR);
  const r = expense.createReport({ ownerId: 'u-arjun', bookingIds: [b.id], submit: true });
  assert.equal(r.routeTo, 'Benefits');
  orchestrator.decide(r.id, 'u-farhan', 'approve');
  assert.equal(load().people.find((p) => p.id === 'u-arjun').stipendBalance, 60000 - b.amount);
});

test('team morale expense report routes to HR', async () => {
  const b = await book('u-arjun', 'Team drinks for 3 Friday, I will pay and expense it', {}, BLR);
  const r = expense.createReport({ ownerId: 'u-arjun', bookingIds: [b.id], purpose: 'morale', submit: true });
  assert.equal(r.routeTo, 'HR');
  assert.deepEqual(r.approvals.map((s) => s.approverId), ['u-kavya', 'u-neha']);
});

test('venue prices come from the catalog when a venue is picked', () => {
  const v = vendors('reservations', BLR)[0];
  const b = orchestrator.createBooking({ category: 'reservations', vendorId: v.id, partySize: 2, amount: 1, date: '2026-09-30', funding: 'personal', location: BLR, title: 'Dinner' }, 'u-ananya');
  assert.equal(b.amount, v.perPerson * 2);
});
