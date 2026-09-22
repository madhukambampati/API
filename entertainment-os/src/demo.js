// Seeds a realistic set of bookings by driving the real agent pipeline, so the
// demo data always matches the rules in code.
import { reset, save, load } from './store.js';
import { seed } from './seed.js';
import * as orchestrator from './agents/orchestrator.js';
import * as expense from './agents/expense.js';
import * as split from './agents/split.js';

const REQUESTS = [
  ['u-maya', 'Client dinner for 4 tonight'],
  ['u-raj', 'Private room for 30 on Oct 15 for the client summit'],
  ['u-kim', 'Offsite lunch catering for 120 people on Oct 2'],
  ['u-elena', 'Suite at the Warriors game for 12 clients Nov 4'],
  ['u-maya', 'Holiday gifts for 40 clients Dec 1'],
  ['u-ana', 'Team offsite in Napa for 8 on Oct 20'],
  ['u-leo', 'Team drinks for 3 Friday'],
  ['u-maya', 'Dinner with my family Saturday — split with the family'],
  ['u-leo', 'Giants game tickets with friends for 4 Sunday, split'],
  ['u-maya', 'Client lunch for 2 tomorrow, I will pay and expense it'],
  ['u-leo', 'Spa day wellbeing stipend, reimburse me, for 1 Oct 5'],
];

export async function loadDemo() {
  reset(seed());
  const created = [];
  for (const [who, text] of REQUESTS) {
    const { draft } = await orchestrator.plan(text, who, { useLLM: false });
    created.push(orchestrator.createBooking(draft, who));
  }
  const byTitle = (t) => created.find((b) => b.title.startsWith(t));

  // Walk a few approvals so every state is visible.
  const approveAll = (b, upto = Infinity) => {
    let n = 0;
    while (b.status === 'pending_approval' && n < upto) {
      const stepper = b.approvals.find((s) => s.status === 'pending');
      orchestrator.decide(b.id, stepper.approverId, 'approve', 'Looks good');
      n++;
    }
  };
  approveAll(byTitle('Private room for 30'));
  approveAll(byTitle('Offsite lunch'));
  approveAll(byTitle('Suite at the Warriors'), 1); // manager done, dept head/compliance pending
  approveAll(byTitle('Team offsite in Napa'));

  // Friends top up the ledger outside of bookings, Splitwise style.
  split.addExpense({ groupId: 'g-friends', paidBy: 'f-priya', amount: 96, description: 'Uber to the ballpark', method: 'equal' });
  split.addExpense({ groupId: 'g-family', paidBy: 'f-daniel', amount: 180, description: 'Groceries for the family BBQ', method: 'shares', weights: { 'u-maya': 1, 'f-daniel': 1, 'f-lucy': 2 } });
  split.settle({ groupId: 'g-friends', from: 'f-tom', to: 'u-leo', amount: 40 });

  // Expense reports: Maya's client lunch (business → Finance), Leo's spa (wellbeing → Benefits).
  const lunch = byTitle('Client lunch for 2');
  const r1 = expense.createReport({ ownerId: 'u-maya', bookingIds: [lunch.id], submit: true, notes: 'Lunch with Acme procurement' });
  orchestrator.decide(r1.id, r1.approvals[0].approverId, 'approve', 'Approved');
  const spa = byTitle('Spa day');
  const r2 = expense.createReport({ ownerId: 'u-leo', bookingIds: [spa.id], submit: true });
  orchestrator.decide(r2.id, r2.approvals[0].approverId, 'approve', 'Within stipend');
  save();
  return load();
}

if (process.argv[1] && process.argv[1].endsWith('demo.js')) {
  loadDemo().then((d) => console.log(`Demo loaded: ${d.bookings.length} bookings, ${d.reports.length} reports.`));
}
