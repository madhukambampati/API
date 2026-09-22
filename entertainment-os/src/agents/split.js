// Split agent: Splitwise-style shared ledger for family and friends groups.
// All maths is done in integer cents so shares always add up exactly.
import { load, nextId, person, log } from '../store.js';

const cents = (n) => Math.round(n * 100);
const dollars = (c) => Math.round(c) / 100;

// method: 'equal' | 'exact' | 'percent' | 'shares'
// weights: { personId: number } — exact dollars, percentages, or share units.
export function computeShares(amount, members, method = 'equal', weights = {}) {
  const total = cents(amount);
  if (!members.length) throw new Error('Split needs at least one member');
  let raw;
  if (method === 'equal') raw = members.map(() => 1);
  else if (method === 'exact') {
    const sum = members.reduce((s, m) => s + cents(weights[m] || 0), 0);
    if (sum !== total) throw new Error(`Exact amounts add up to $${dollars(sum)}, expected $${dollars(total)}`);
    return members.map((m) => ({ personId: m, amount: dollars(cents(weights[m] || 0)) }));
  } else if (method === 'percent') {
    const sum = members.reduce((s, m) => s + Number(weights[m] || 0), 0);
    if (Math.abs(sum - 100) > 0.001) throw new Error(`Percentages add up to ${sum}%, expected 100%`);
    raw = members.map((m) => Number(weights[m] || 0));
  } else if (method === 'shares') {
    raw = members.map((m) => Number(weights[m] ?? 1));
  } else throw new Error(`Unknown split method ${method}`);

  const units = raw.reduce((s, x) => s + x, 0);
  if (units <= 0) throw new Error('Split weights must be positive');
  const base = raw.map((x) => Math.floor((total * x) / units));
  let remainder = total - base.reduce((s, x) => s + x, 0);
  // Hand out leftover cents one at a time, largest weight first.
  const order = raw.map((x, i) => i).sort((a, b) => raw[b] - raw[a]);
  for (let k = 0; remainder > 0; k = (k + 1) % order.length, remainder--) base[order[k]] += 1;
  return members.map((m, i) => ({ personId: m, amount: dollars(base[i]) }));
}

export function addExpense({ groupId, paidBy, amount, description, method = 'equal', weights = {}, members, date, bookingId = null }) {
  const d = load();
  const group = d.groups.find((g) => g.id === groupId);
  if (!group) throw new Error(`Unknown group ${groupId}`);
  if (!group.members.includes(paidBy)) throw new Error('Payer must be a group member');
  const participants = members && members.length ? members : group.members;
  const shares = computeShares(Number(amount), participants, method, weights);
  const expense = {
    id: nextId('expense', 'EXP'),
    groupId,
    paidBy,
    amount: dollars(cents(amount)),
    description,
    method,
    shares,
    date: date || new Date().toISOString().slice(0, 10),
    bookingId,
    createdAt: new Date().toISOString(),
  };
  d.groupExpenses.push(expense);
  log('Split agent', `${person(paidBy).name} paid $${expense.amount} for "${description}" — split ${method} across ${participants.length} in ${group.name}.`, expense.id);
  return expense;
}

export function settle({ groupId, from, to, amount }) {
  const d = load();
  if (from === to) throw new Error('Cannot settle with yourself');
  const s = { id: nextId('settlement', 'SET'), groupId, from, to, amount: dollars(cents(amount)), at: new Date().toISOString() };
  d.settlements.push(s);
  log('Split agent', `${person(from).name} paid ${person(to).name} $${s.amount} to settle up.`, s.id);
  return s;
}

// Net balance per member: positive = is owed money, negative = owes money.
export function balances(groupId) {
  const d = load();
  const group = d.groups.find((g) => g.id === groupId);
  const net = Object.fromEntries(group.members.map((m) => [m, 0]));
  for (const e of d.groupExpenses.filter((x) => x.groupId === groupId)) {
    net[e.paidBy] = (net[e.paidBy] || 0) + cents(e.amount);
    for (const s of e.shares) net[s.personId] = (net[s.personId] || 0) - cents(s.amount);
  }
  for (const s of d.settlements.filter((x) => x.groupId === groupId)) {
    net[s.from] = (net[s.from] || 0) + cents(s.amount);
    net[s.to] = (net[s.to] || 0) - cents(s.amount);
  }
  return Object.fromEntries(Object.entries(net).map(([k, v]) => [k, dollars(v)]));
}

// Greedy debt simplification: fewest transfers to bring everyone to zero.
export function simplify(groupId) {
  const net = balances(groupId);
  const creditors = [];
  const debtors = [];
  for (const [id, v] of Object.entries(net)) {
    const c = cents(v);
    if (c > 0) creditors.push({ id, c });
    else if (c < 0) debtors.push({ id, c: -c });
  }
  creditors.sort((a, b) => b.c - a.c);
  debtors.sort((a, b) => b.c - a.c);
  const transfers = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].c, creditors[j].c);
    transfers.push({ from: debtors[i].id, to: creditors[j].id, amount: dollars(pay) });
    debtors[i].c -= pay;
    creditors[j].c -= pay;
    if (!debtors[i].c) i++;
    if (!creditors[j].c) j++;
  }
  return transfers;
}
