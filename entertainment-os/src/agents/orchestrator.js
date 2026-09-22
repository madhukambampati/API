// Orchestrator: runs every booking through the agent pipeline
//   Concierge → Budget → Policy → (Approvals) → Booking → Split / Expense
// and applies approval decisions for bookings and expense reports.
import { load, save, nextId, person, log } from '../store.js';
import { CATEGORIES } from '../seed.js';
import * as concierge from './concierge.js';
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
  // Preview what the downstream agents will do before the user commits.
  const budgetResult = budget.check(draft);
  const chain = policy.approvalChain(draft, budgetResult);
  return {
    draft,
    budget: budgetResult,
    approvals: chain.steps.map((s) => ({ ...s, approverName: person(s.approverId).name })),
    policyNotes: chain.reasons,
  };
}

export function createBooking(input, actorId) {
  const d = load();
  const requester = person(actorId);
  if (!requester?.employee) throw new Error('Only employees can create bookings');
  if (!CATEGORIES[input.category]) throw new Error(`Unknown category ${input.category}`);
  const amount = Math.round(Number(input.amount) * 100) / 100;
  if (!(amount > 0)) throw new Error('Amount must be positive');

  const draft = {
    ...input,
    amount,
    partySize: Math.max(1, Number(input.partySize) || 1),
    requestedBy: actorId,
    attendees: input.attendees?.length ? input.attendees : [actorId],
  };
  if (draft.funding === 'shared') {
    const group = d.groups.find((g) => g.id === draft.groupId);
    if (!group || !group.members.includes(actorId)) throw new Error('Shared bookings need a group you belong to');
    draft.attendees = input.splitMembers?.length ? input.splitMembers : group.members;
  }

  const b = {
    id: nextId('booking', 'BK'),
    category: draft.category,
    categoryLabel: CATEGORIES[draft.category].label,
    title: draft.title,
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
    split: draft.funding === 'shared' ? { method: input.splitMethod || 'equal', weights: input.splitWeights || {} } : null,
    status: 'pending_approval',
    approvals: [],
    budget: null,
    confirmation: null,
    createdAt: now(),
    trace: [],
  };
  d.bookings.unshift(b);
  trace(b, 'Concierge agent', `${requester.name} requested "${b.title}" — ${b.vendor}, ${b.partySize} guest(s), $${amount.toLocaleString()}, ${b.date}.`);
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
  trace(b, 'Booking agent', `Confirmed with ${b.vendor} — confirmation ${b.confirmation}. Calendar invites sent to ${b.attendees.length} attendee(s).`);
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
    trace(b, 'Split agent', `Added to group ledger (${e.id}); each share: ${e.shares.map((s) => `${person(s.personId).name} $${s.amount}`).join(', ')}.`);
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
  const d = load();
  d.groupExpenses = d.groupExpenses.filter((e) => e.bookingId !== id);
  trace(b, 'Booking agent', `${person(actorId).name} cancelled the booking; vendor notified and any group split removed.`);
  save();
  return b;
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
