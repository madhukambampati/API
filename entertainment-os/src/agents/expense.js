// Expense agent: builds expense reports for personally-paid bookings and routes
// them to Finance, HR or Benefits depending on purpose.
import { inr } from '../money.js';
import { load, nextId, person, log } from '../store.js';
import { POLICY } from '../seed.js';
import { reportChain } from './policy.js';

const round = (n) => Math.round(n * 100) / 100;

export function reportableBookings(ownerId) {
  const d = load();
  const claimed = new Set(d.reports.filter((r) => r.status !== 'rejected').flatMap((r) => r.bookingIds));
  return d.bookings.filter((b) => b.bookedBy === ownerId && b.funding === 'reimbursable' && b.status === 'confirmed' && !claimed.has(b.id));
}

export function createReport({ ownerId, bookingIds, purpose, submit = false, notes = '' }) {
  const d = load();
  const eligible = new Map(reportableBookings(ownerId).map((b) => [b.id, b]));
  const items = bookingIds.map((id) => {
    const b = eligible.get(id);
    if (!b) throw new Error(`Booking ${id} is not a confirmed, unclaimed reimbursable booking of this person`);
    return b;
  });
  if (!items.length) throw new Error('Pick at least one booking to claim');
  const reportPurpose = purpose || items[0].purpose || 'business';
  const lines = items.map((b) => ({
    bookingId: b.id,
    date: b.date,
    vendor: b.vendor,
    category: b.categoryLabel,
    description: b.title,
    attendees: b.partySize,
    amount: b.amount,
    receipt: `receipt-${b.id}.pdf`,
  }));
  const total = round(lines.reduce((s, l) => s + l.amount, 0));
  const warnings = [];
  let claimable = total;
  if (reportPurpose === 'wellbeing') {
    const bal = person(ownerId).stipendBalance ?? 0;
    if (total > bal) {
      claimable = bal;
      warnings.push(`Allowance balance is ${inr(bal)}; ${inr(round(total - bal))} will not be reimbursed.`);
    }
  }
  const report = {
    id: nextId('report', 'ER'),
    ownerId,
    purpose: reportPurpose,
    purposeLabel: (POLICY.expenseRouting[reportPurpose] || POLICY.expenseRouting.business).label,
    bookingIds: items.map((b) => b.id),
    lines,
    total,
    claimable,
    notes,
    warnings,
    status: 'draft',
    routeTo: null,
    approvals: [],
    createdAt: new Date().toISOString(),
    submittedAt: null,
    trace: [{ at: new Date().toISOString(), agent: 'Expense agent', message: `Drafted report with ${lines.length} line(s) totalling ${inr(total)}; receipts attached.` }],
  };
  d.reports.unshift(report);
  log('Expense agent', `Drafted ${report.id} for ${person(ownerId).name} — ${inr(total)}.`, report.id);
  if (submit) submitReport(report.id, ownerId);
  return report;
}

export function submitReport(reportId, actorId) {
  const r = load().reports.find((x) => x.id === reportId);
  if (!r) throw new Error('Report not found');
  if (r.ownerId !== actorId) throw new Error('Only the owner can submit this report');
  if (r.status !== 'draft') throw new Error(`Report is already ${r.status}`);
  const { steps, routeTo } = reportChain(r);
  r.approvals = steps;
  r.routeTo = routeTo;
  r.status = 'submitted';
  r.submittedAt = new Date().toISOString();
  r.trace.push({ at: r.submittedAt, agent: 'Policy agent', message: `Routed to ${routeTo}: ${steps.map((s) => `${s.role} (${person(s.approverId).name})`).join(' → ')}.` });
  log('Expense agent', `${person(actorId).name} submitted ${r.id} (${inr(r.total)}) → ${routeTo}.`, r.id);
  return r;
}

export function markReimbursed(r) {
  r.status = 'reimbursed';
  const owner = person(r.ownerId);
  if (r.purpose === 'wellbeing') owner.stipendBalance = round((owner.stipendBalance ?? 0) - r.claimable);
  r.reimbursedAt = new Date().toISOString();
  r.trace.push({ at: r.reimbursedAt, agent: 'Expense agent', message: `Reimbursed ${inr(r.claimable)} to ${owner.name} via next payroll.` });
  log('Expense agent', `${r.id} reimbursed — ${inr(r.claimable)} to ${owner.name}.`, r.id);
}
