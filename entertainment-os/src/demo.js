// Seeds a realistic set of bookings by driving the real agent pipeline, so the
// demo data always matches the rules in code.
import { reset, save, load, person } from './store.js';
import { seed } from './seed.js';
import { REGION } from './region.js';
import * as orchestrator from './agents/orchestrator.js';
import * as expense from './agents/expense.js';
import * as split from './agents/split.js';

const CA = REGION === 'CA';
const REQUESTS = [
  ['u-ananya', 'Client dinner for 6 tonight'],
  ['u-rahul', 'Private dining room for 30 on 15 Oct for the client summit'],
  ['u-neha', 'Offsite lunch catering for 120 people on 2 Oct'],
  ['u-priya', CA ? 'Corporate box at the hockey game for 10 clients' : 'Corporate box at the T20 night for 10 clients'],
  ['u-ananya', CA ? 'Holiday gift hampers for 60 clients on 20 Oct' : 'Diwali gift hampers for 60 clients on 20 Oct'],
  ['u-kavya', 'Team offsite retreat for 12 on 24 Oct'],
  ['u-arjun', CA ? 'Team movie night for 8 — Frostbound IMAX Friday evening' : 'Team movie night for 8 — Pushpaka Rising IMAX Friday evening'],
  ['u-ananya', CA ? 'Harbour Lights movie with my family Saturday evening' : 'Kaveri Diaries movie with my family Saturday evening'],
  ['u-arjun', 'Stand-up comedy with friends this weekend, split'],
  ['u-ananya', 'Client lunch for 2 tomorrow, I will pay and expense it'],
  ['u-arjun', 'Cooking class on my wellbeing allowance, reimburse me, for 1 on 5 Oct'],
];

export async function loadDemo({ now = new Date() } = {}) {
  // Demo mode is off by default (see catalog.js's demoMode), but this dataset can only be built
  // while it's on — it plans requests like "Frostbound IMAX Friday evening" against the catalog's
  // demo theatres/films, which real-data-only mode deliberately returns empty for. Set only here
  // (never at module load — merely importing loadDemo, e.g. for the reset-demo-data route, must
  // not flip demo mode on for the whole process) and only restored if this call changed it, so a
  // caller that explicitly asked for strict mode isn't overridden by an unrelated import.
  const hadEosDemo = process.env.EOS_DEMO;
  if (hadEosDemo === undefined) process.env.EOS_DEMO = '1';
  try {
    return await loadDemoData(now);
  } finally {
    if (hadEosDemo === undefined) delete process.env.EOS_DEMO;
  }
}

async function loadDemoData(now) {
  reset(seed());
  const created = [];
  for (const [who, text] of REQUESTS) {
    const { draft } = await orchestrator.plan(text, who, { useLLM: false, now, location: person(who).home });
    created.push(orchestrator.createBooking(draft, who));
  }
  const byTitle = (t) => created[REQUESTS.findIndex(([, text]) => text.startsWith(t))];

  // Walk a few approvals so every state is visible.
  const approveAll = (b, upto = Infinity) => {
    let n = 0;
    while (b.status === 'pending_approval' && n < upto) {
      const stepper = b.approvals.find((s) => s.status === 'pending');
      orchestrator.decide(b.id, stepper.approverId, 'approve', 'Looks good');
      n++;
    }
  };
  approveAll(byTitle('Private dining room'));
  approveAll(byTitle('Offsite lunch'));
  approveAll(byTitle('Corporate box'), 1); // manager done, Compliance pending
  approveAll(byTitle('Team offsite'));

  // Family & friends add costs outside of bookings, Splitwise style.
  split.addExpense({ groupId: 'g-friends', paidBy: 'f-sneha', amount: CA ? 38 : 640, description: CA ? 'Uber to the venue' : 'Cabs to the venue', method: 'equal' });
  split.addExpense({ groupId: 'g-family', paidBy: 'f-rohan', amount: CA ? 180 : 4800, description: CA ? 'Groceries for Thanksgiving dinner' : 'Groceries for the Onam sadya', method: 'shares', weights: { 'u-ananya': 1, 'f-rohan': 1, 'f-diya': 2 } });
  split.settle({ groupId: 'g-friends', from: 'f-karthik', to: 'u-arjun', amount: CA ? 30 : 500 });

  // Expense reports: client lunch (business → Finance), cooking class (wellbeing → Benefits).
  const lunch = byTitle('Client lunch for 2');
  const r1 = expense.createReport({ ownerId: 'u-ananya', bookingIds: [lunch.id], submit: true, notes: 'Lunch with Acme procurement team' });
  orchestrator.decide(r1.id, r1.approvals[0].approverId, 'approve', 'Approved');
  const cls = byTitle('Cooking class');
  const r2 = expense.createReport({ ownerId: 'u-arjun', bookingIds: [cls.id], submit: true });
  orchestrator.decide(r2.id, r2.approvals[0].approverId, 'approve', 'Within allowance');
  save();
  return load();
}

if (process.argv[1] && process.argv[1].endsWith('demo.js')) {
  loadDemo().then((d) => console.log(`Demo loaded: ${d.bookings.length} bookings, ${d.reports.length} reports.`));
}
