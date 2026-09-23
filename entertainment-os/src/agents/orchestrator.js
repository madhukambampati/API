// Orchestrator: runs every booking through the agent pipeline
//   Concierge → Budget → Policy → (Approvals) → Booking → Split / Expense
// and applies approval decisions for bookings and expense reports.
import { inr } from '../money.js';
import { load, save, nextId, person, log } from '../store.js';
import { CATEGORIES } from '../seed.js';
import * as concierge from './concierge.js';
import { normaliseLocation, locationLabel } from '../locations.js';
import { vendors } from '../catalog.js';
import * as budget from './budget.js';
import * as policy from './policy.js';
import * as split from './split.js';
import * as expense from './expense.js';

const now = () => new Date().toISOString();

function trace(b, agent, message) {
  b.trace.push({ at: now(), agent, message });
  log(agent, message, b.id);
}

export async function plan(text, requesterId, opts) {
  const draft = await concierge.plan(text, requesterId, opts);
  return { draft, ...review(draft) };
}

// What the Budget and Policy agents will decide, without committing anything.
function review(draft) {
  const budgetResult = budget.check(draft);
  const chain = policy.approvalChain(draft, budgetResult);
  return {
    budget: budgetResult,
    approvals: chain.steps.map((s) => ({ ...s, approverName: person(s.approverId).name })),
    policyNotes: chain.reasons,
  };
}

// Preview a draft built in the UI (e.g. seats picked on the seat map).
export function preview(input, actorId) {
  const draft = normaliseDraft(input, actorId);
  return { draft, ...review(draft) };
}

function normaliseDraft(input, actorId) {
  const d = load();
  const requester = person(actorId);
  if (!requester?.employee) throw new Error('Only employees can create bookings');
  let draft = { ...input, requestedBy: actorId, location: normaliseLocation(input.location || requester.home) };
  if (draft.details) draft = concierge.verifyTickets(draft);
  if (!CATEGORIES[draft.category]) throw new Error(`Unknown category ${draft.category}`);
  draft.partySize = Math.max(1, Number(draft.partySize) || 1);
  if (draft.vendorId) {
    // Venue picked from the catalog: price it server-side.
    const v = vendors(draft.category, draft.location).find((x) => x.id === draft.vendorId);
    if (!v) throw new Error('That venue is not available in this city');
    draft.vendor = v.vendor;
    draft.amount = v.perPerson * draft.partySize;
  }
  draft.amount = Math.round(Number(draft.amount) * 100) / 100;
  if (!(draft.amount > 0)) throw new Error('Amount must be positive');
  if (!draft.date || !/^\d{4}-\d{2}-\d{2}$/.test(draft.date)) throw new Error('Pick a valid date');
  draft.attendees = input.attendees?.length ? input.attendees : [actorId];
  if (draft.funding === 'shared') {
    const group = d.groups.find((g) => g.id === draft.groupId);
    if (!group || !group.members.includes(actorId)) throw new Error('Shared bookings need a group you belong to');
    draft.attendees = input.splitMembers?.length ? input.splitMembers : group.members;
  } else {
    draft.groupId = null;
    draft.attendees = [actorId];
  }
  return draft;
}

export function createBooking(input, actorId, { payment = null } = {}) {
  const d = load();
  const requester = person(actorId);
  const draft = normaliseDraft(input, actorId);
  const amount = draft.amount;

  const b = {
    id: nextId('booking', 'BK'),
    category: draft.category,
    categoryLabel: CATEGORIES[draft.category].label,
    title: draft.title,
    request: typeof input.request === 'string' ? input.request.slice(0, 300) : null,
    vendor: draft.vendor,
    date: draft.date,
    partySize: draft.partySize,
    amount,
    funding: draft.funding,
    purpose: draft.purpose || (draft.funding === 'corporate' ? 'business' : 'personal'),
    clientFacing: Boolean(draft.clientFacing),
    bookedBy: actorId,
    costCenterDept: draft.funding === 'corporate' ? requester.dept : null,
    groupId: draft.groupId || null,
    attendees: draft.attendees,
    location: draft.location,
    details: draft.details || null,
    split: draft.funding === 'shared' ? { method: input.splitMethod || 'equal', weights: input.splitWeights || {} } : null,
    status: 'pending_approval',
    approvals: [],
    budget: null,
    confirmation: null,
    createdAt: now(),
    trace: [],
  };
  d.bookings.unshift(b);
  if (payment) {
    b.payment = payment;
    trace(b, 'Payment agent', `${payment.label} — ${inr(payment.amount)} ${payment.status} (ref ${payment.ref}).${payment.demo ? ' Demo payment: no real money moved.' : ''}`);
  }
  if (b.details?.kind === 'movie') {
    // Hold the seats straight away so nobody else can pick them.
    d.seatBookings[b.details.showKey] = [...(d.seatBookings[b.details.showKey] || []), ...b.details.seats];
  }
  trace(b, 'Concierge agent', `${requester.name} requested "${b.title}" — ${b.vendor}, ${locationLabel(b.location)}, ${b.partySize} guest(s), ${inr(amount)}, ${b.date}.`);
  for (const r of input.reasoning || []) b.trace.push({ at: now(), agent: 'Concierge agent', message: r });

  b.budget = budget.check(draft, { excludeId: b.id });
  trace(b, 'Budget agent', b.budget.notes.join(' '));

  const chain = policy.approvalChain(draft, b.budget);
  b.approvals = chain.steps;
  trace(b, 'Policy agent', chain.reasons.join(' '));

  if (chain.autoApproved) {
    b.status = 'approved';
    confirm(b);
  } else {
    const first = b.approvals[0];
    trace(b, 'Approval agent', `Notified ${person(first.approverId).name} (${first.role}) for approval.`);
  }
  save();
  return b;
}

// Booking agent: place the reservation and fan out to Split / Expense agents.
function confirm(b) {
  b.status = 'confirmed';
  b.confirmation = `${b.category.slice(0, 3).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const what = b.details?.kind === 'movie' ? ` ${b.date} ${b.details.time}, seats ${b.details.seats.join(', ')} — m-tickets sent` : b.details?.kind === 'event' ? ` ${b.details.qty} × ${b.details.tier} e-tickets sent` : ' Calendar invites sent';
  trace(b, 'Booking agent', `Confirmed with ${b.vendor} — confirmation ${b.confirmation}.${what} to ${b.attendees.length} attendee(s).`);
  if (b.funding === 'shared') {
    const e = split.addExpense({
      groupId: b.groupId,
      paidBy: b.bookedBy,
      amount: b.amount,
      description: b.title,
      method: b.split.method,
      weights: b.split.weights,
      members: b.attendees,
      date: b.date,
      bookingId: b.id,
    });
    trace(b, 'Split agent', `Added to group ledger (${e.id}); each share: ${e.shares.map((s) => `${person(s.personId).name} ${inr(s.amount)}`).join(', ')}.`);
  }
  if (b.funding === 'reimbursable') {
    trace(b, 'Expense agent', 'Paid personally — receipt captured. Ready to claim on an expense report.');
  }
  if (b.funding === 'corporate') {
    trace(b, 'Budget agent', `Charged to ${b.budget.pot.name}.`);
  }
}

function applyDecision(item, kind, actorId, decision, note) {
  if (!['approve', 'reject'].includes(decision)) throw new Error('Decision must be approve or reject');
  const stepIdx = item.approvals.findIndex((s) => s.status === 'pending');
  if (stepIdx < 0) throw new Error(`Nothing awaiting approval on ${item.id}`);
  const step = item.approvals[stepIdx];
  if (step.approverId !== actorId) throw new Error(`Waiting on ${person(step.approverId).name} (${step.role}), not you`);
  step.status = decision === 'approve' ? 'approved' : 'rejected';
  step.decidedAt = now();
  step.note = note || '';
  const msg = `${person(actorId).name} (${step.role}) ${step.status} ${item.id}${note ? ` — "${note}"` : ''}.`;
  item.trace.push({ at: now(), agent: 'Approval agent', message: msg });
  log('Approval agent', msg, item.id);
  if (decision === 'reject') {
    item.status = 'rejected';
    if (kind === 'booking') releaseSeats(item);
    return;
  }
  const next = item.approvals[stepIdx + 1];
  if (next) {
    const m = `Routed to ${person(next.approverId).name} (${next.role}).`;
    item.trace.push({ at: now(), agent: 'Approval agent', message: m });
    log('Approval agent', `${item.id}: ${m}`, item.id);
    return;
  }
  if (kind === 'booking') {
    item.status = 'approved';
    confirm(item);
  } else {
    item.status = 'approved';
    expense.markReimbursed(item);
  }
}

export function decide(id, actorId, decision, note) {
  const d = load();
  const booking = d.bookings.find((b) => b.id === id);
  if (booking) {
    if (booking.status !== 'pending_approval') throw new Error(`Booking is ${booking.status}`);
    applyDecision(booking, 'booking', actorId, decision, note);
  } else {
    const report = d.reports.find((r) => r.id === id);
    if (!report) throw new Error(`No booking or report ${id}`);
    if (report.status !== 'submitted') throw new Error(`Report is ${report.status}`);
    applyDecision(report, 'report', actorId, decision, note);
  }
  save();
  return booking || d.reports.find((r) => r.id === id);
}

export function cancelBooking(id, actorId) {
  const b = load().bookings.find((x) => x.id === id);
  if (!b) throw new Error('Booking not found');
  if (b.bookedBy !== actorId) throw new Error('Only the person who booked can cancel');
  if (['cancelled', 'rejected'].includes(b.status)) throw new Error(`Booking is already ${b.status}`);
  const claimed = load().reports.some((r) => r.status !== 'rejected' && r.bookingIds.includes(id));
  if (claimed) throw new Error('Booking is on an expense report — withdraw the report first');
  b.status = 'cancelled';
  releaseSeats(b);
  const d = load();
  d.groupExpenses = d.groupExpenses.filter((e) => e.bookingId !== id);
  trace(b, 'Booking agent', `${person(actorId).name} cancelled the booking; vendor notified and any group split removed.`);
  save();
  return b;
}

function releaseSeats(b) {
  if (b.details?.kind !== 'movie') return;
  const d = load();
  const held = d.seatBookings[b.details.showKey] || [];
  d.seatBookings[b.details.showKey] = held.filter((x) => !b.details.seats.includes(x));
}

export function pendingFor(actorId) {
  const d = load();
  const waiting = (item) => item.approvals.find((s) => s.status === 'pending')?.approverId === actorId;
  return {
    // Approvers see today's budget position, not the snapshot from booking time.
    bookings: d.bookings
      .filter((b) => b.status === 'pending_approval' && waiting(b))
      .map((b) => ({ ...b, budget: budget.check({ ...b, requestedBy: b.bookedBy }, { excludeId: b.id }) })),
    reports: d.reports.filter((r) => r.status === 'submitted' && waiting(r)),
  };
}
