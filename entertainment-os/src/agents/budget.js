// Budget agent: checks the right pot of money for the booking's funding type.
import { inr } from '../money.js';
import { load, person, dept } from '../store.js';

const LIVE = ['pending_approval', 'approved', 'confirmed'];
const round = (n) => Math.round(n * 100) / 100;

export function deptCommitted(deptId, excludeId) {
  return round(
    load()
      .bookings.filter((b) => b.funding === 'corporate' && b.costCenterDept === deptId && LIVE.includes(b.status) && b.id !== excludeId)
      .reduce((s, b) => s + b.amount, 0),
  );
}

// What a person has personally spent this month: personal bookings, their share of
// group expenses, and reimbursable bookings still awaiting reimbursement.
export function personalSpend(personId, month) {
  const d = load();
  let total = 0;
  for (const b of d.bookings) {
    if (!LIVE.includes(b.status) || !b.date.startsWith(month)) continue;
    if (b.bookedBy === personId && (b.funding === 'personal' || b.funding === 'reimbursable')) total += b.amount;
  }
  for (const e of d.groupExpenses) {
    if (!e.date.startsWith(month)) continue;
    const share = e.shares.find((s) => s.personId === personId);
    if (share) total += share.amount;
  }
  return round(total);
}

export function check(draft, { excludeId } = {}) {
  const requester = person(draft.requestedBy);
  const month = draft.date.slice(0, 7);
  const notes = [];
  let status = 'ok';
  let pot;

  if (draft.funding === 'corporate') {
    const d = dept(requester.dept);
    const committed = deptCommitted(d.id, excludeId);
    const remaining = round(d.quarterlyBudget - committed);
    const after = round(remaining - draft.amount);
    pot = { type: 'department', name: `${d.name} · ${d.costCenter}`, limit: d.quarterlyBudget, committed, remaining, after };
    if (after < 0) {
      status = 'over';
      notes.push(`Over the ${d.name} quarterly budget by ${inr(Math.abs(after))} — Finance must approve.`);
    } else if (after < d.quarterlyBudget * 0.1) {
      status = 'warn';
      notes.push(`${d.name} will have only ${inr(after)} left this quarter.`);
    } else notes.push(`${d.name} has ${inr(remaining)} available; ${inr(after)} after this booking.`);
  } else if (draft.funding === 'reimbursable' && draft.purpose === 'wellbeing') {
    const remaining = requester.stipendBalance ?? 0;
    const after = round(remaining - draft.amount);
    pot = { type: 'stipend', name: 'Lifestyle & wellbeing stipend', limit: remaining, committed: 0, remaining, after };
    if (after < 0) {
      status = 'over';
      notes.push(`Only ${inr(remaining)} of allowance left — Benefits will reimburse up to the balance.`);
    } else notes.push(`Wellbeing allowance covers it; ${inr(after)} left afterwards.`);
  } else {
    const limit = requester.personalMonthly ?? 0;
    const committed = personalSpend(requester.id, month);
    let mine = draft.amount;
    if (draft.funding === 'shared') mine = round(draft.amount / Math.max(1, draft.attendees.length));
    const remaining = round(limit - committed);
    const after = round(remaining - mine);
    pot = { type: 'personal', name: `Personal entertainment budget (${month})`, limit, committed, remaining, after, yourShare: mine };
    if (!requester.employee) notes.push('Guest member — no personal budget tracking.');
    else if (after < 0) {
      status = 'warn';
      notes.push(`Your share (${inr(mine)}) puts you ${inr(Math.abs(after))} over your personal monthly budget. Personal money — no approval needed, just a heads-up.`);
    } else notes.push(`Your share is ${inr(mine)}; ${inr(after)} of your personal budget remains this month.`);
  }

  return { status, pot, notes };
}
