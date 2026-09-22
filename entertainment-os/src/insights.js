// Insights: who booked what, who is spending how much, and against which pot.
import { load, person } from './store.js';
import { deptCommitted } from './agents/budget.js';
import { balances, simplify } from './agents/split.js';
import { CATEGORIES } from './seed.js';

const LIVE = ['pending_approval', 'approved', 'confirmed'];
const round = (n) => Math.round(n * 100) / 100;

export function spendByPerson() {
  const d = load();
  const rows = new Map(d.people.map((p) => [p.id, { personId: p.id, name: p.name, title: p.title, employee: p.employee, company: 0, personal: 0, reimbursable: 0, sharedPaid: 0, sharedShare: 0, bookings: 0 }]));
  for (const b of d.bookings) {
    if (!LIVE.includes(b.status)) continue;
    const r = rows.get(b.bookedBy);
    r.bookings++;
    if (b.funding === 'corporate') r.company += b.amount;
    if (b.funding === 'personal') r.personal += b.amount;
    if (b.funding === 'reimbursable') r.reimbursable += b.amount;
  }
  for (const e of d.groupExpenses) {
    rows.get(e.paidBy).sharedPaid += e.amount;
    for (const s of e.shares) rows.get(s.personId).sharedShare += s.amount;
  }
  return [...rows.values()]
    .map((r) => ({ ...r, company: round(r.company), personal: round(r.personal), reimbursable: round(r.reimbursable), sharedPaid: round(r.sharedPaid), sharedShare: round(r.sharedShare), outOfPocket: round(r.personal + r.reimbursable + r.sharedShare) }))
    .filter((r) => r.bookings || r.sharedPaid || r.sharedShare)
    .sort((a, b) => b.company + b.outOfPocket - (a.company + a.outOfPocket));
}

export function budgets() {
  return load().departments.map((dp) => {
    const committed = deptCommitted(dp.id);
    return { ...dp, headName: person(dp.headId)?.name, committed, remaining: round(dp.quarterlyBudget - committed), utilisation: Math.round((committed / dp.quarterlyBudget) * 100) };
  });
}

export function byCategory() {
  const d = load();
  return Object.entries(CATEGORIES).map(([id, c]) => {
    const live = d.bookings.filter((b) => b.category === id && LIVE.includes(b.status));
    return { id, label: c.label, count: live.length, total: round(live.reduce((s, b) => s + b.amount, 0)) };
  });
}

export function groups() {
  const d = load();
  return d.groups.map((g) => ({
    ...g,
    memberNames: Object.fromEntries(g.members.map((m) => [m, person(m).name])),
    balances: balances(g.id),
    settleUp: simplify(g.id),
    expenses: d.groupExpenses.filter((e) => e.groupId === g.id).slice().reverse(),
    settlements: d.settlements.filter((s) => s.groupId === g.id).slice().reverse(),
    total: round(d.groupExpenses.filter((e) => e.groupId === g.id).reduce((s, e) => s + e.amount, 0)),
  }));
}

export function kpis() {
  const d = load();
  const live = d.bookings.filter((b) => LIVE.includes(b.status));
  return {
    bookings: live.length,
    companySpend: round(live.filter((b) => b.funding === 'corporate').reduce((s, b) => s + b.amount, 0)),
    personalSpend: round(live.filter((b) => b.funding !== 'corporate').reduce((s, b) => s + b.amount, 0)),
    pendingApprovals: d.bookings.filter((b) => b.status === 'pending_approval').length + d.reports.filter((r) => r.status === 'submitted').length,
    reimbursed: round(d.reports.filter((r) => r.status === 'reimbursed').reduce((s, r) => s + r.claimable, 0)),
  };
}
