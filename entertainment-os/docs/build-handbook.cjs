// Generates docs/Entertainment-OS-Handbook.docx
// Run: npm run docs  (needs the `docx` dev dependency)
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, ShadingType,
  AlignmentType, LevelFormat, BorderStyle, Footer, PageNumber, TableOfContents,
} = require('docx');

const GREEN = '2F6B3F';
const TILE = 'E4F1DF';
const FONT = 'Arial';
const W = 9360; // content width in DXA (US Letter, 1" margins)

const p = (text, opts = {}) => new Paragraph({ spacing: { after: 120 }, ...opts, children: [].concat(text).map((t) => (typeof t === 'string' ? new TextRun(t) : t)) });
const b = (t) => new TextRun({ text: t, bold: true });
const h1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, children: [new TextRun(t)] });
const h2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const bullet = (parts) => new Paragraph({ numbering: { reference: 'bullets', level: 0 }, spacing: { after: 60 }, children: [].concat(parts).map((t) => (typeof t === 'string' ? new TextRun(t) : t)) });
let stepsInstance = 0;
const stepList = (items) => {
  stepsInstance += 1;
  return items.map((it) => new Paragraph({ numbering: { reference: 'steps', level: 0, instance: stepsInstance }, spacing: { after: 60 }, children: [].concat(it).map((t) => (typeof t === 'string' ? new TextRun(t) : t)) }));
};

const border = { style: BorderStyle.SINGLE, size: 4, color: 'D9D5CC' };
function table(headers, rows, widths) {
  const total = widths.reduce((s, x) => s + x, 0);
  const cell = (text, header, i) =>
    new TableCell({
      width: { size: widths[i], type: WidthType.DXA },
      shading: header ? { type: ShadingType.CLEAR, fill: GREEN, color: 'auto' } : undefined,
      margins: { top: 80, bottom: 80, left: 100, right: 100 },
      borders: { top: border, bottom: border, left: border, right: border },
      children: [new Paragraph({ children: [new TextRun({ text: String(text), bold: header, color: header ? 'FFFFFF' : undefined, size: 19 })] })],
    });
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: widths,
    rows: [new TableRow({ tableHeader: true, children: headers.map((h, i) => cell(h, true, i)) }), ...rows.map((r) => new TableRow({ children: r.map((c, i) => cell(c, false, i)) }))],
  });
}
const callout = (title, text) =>
  new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: [W],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: W, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: TILE, color: 'auto' },
            margins: { top: 140, bottom: 140, left: 200, right: 200 },
            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
            children: [new Paragraph({ children: [new TextRun({ text: title, bold: true, color: GREEN })] }), new Paragraph({ children: [new TextRun(text)] })],
          }),
        ],
      }),
    ],
  });
const gap = () => new Paragraph({ spacing: { after: 120 }, children: [] });

const children = [
  new Paragraph({ spacing: { before: 2400, after: 200 }, children: [new TextRun({ text: 'Entertainment OS', bold: true, size: 64, color: GREEN })] }),
  new Paragraph({ spacing: { after: 400 }, children: [new TextRun({ text: 'Employee & Approver Handbook', size: 36 })] }),
  p('Dining · Private dining & events · Catering · Sports & live events · Gifting & merch · Experiences'),
  p('One agentic operating system for booking, budgeting, approving, expensing and splitting every entertainment spend — company-paid, personal, family or friends.'),
  p([new TextRun({ text: 'Version 1.0 · Q3 2026 · Owner: Finance Operations with People (HR & Benefits)', color: '777777' })]),
  new Paragraph({ pageBreakBefore: true, heading: HeadingLevel.HEADING_1, children: [new TextRun('Contents')] }),
  new TableOfContents('Contents', { hyperlink: true, headingStyleRange: '1-2' }),

  h1('1. What Entertainment OS is'),
  p('Entertainment OS replaces the patchwork of restaurant apps, ticket brokers, caterer emails, expense tools and group-payment apps with one system. You describe what you need in plain language; a team of software agents prices it, checks the right budget, decides who pays, routes approvals, books it, and then either charges the cost center, drafts your expense report, or splits the bill with your family or friends.'),
  p('Every booking answers four questions, always visible to you, your approvers and Finance:'),
  bullet([b('Who booked it? '), 'The requester, their department and cost center.']),
  bullet([b('Who is spending how much? '), 'Company spend, reimbursable spend, personal spend and each person’s share of group spend.']),
  bullet([b('Which pot of money? '), 'Department budget, personal monthly budget, or the lifestyle & wellbeing stipend.']),
  bullet([b('Who needs to approve it? '), 'An ordered approval chain built from the policy in section 6.']),
  gap(),
  callout('Principle', 'Company money needs approval proportional to risk. Personal money needs no approval — only transparency. Shared money needs a fair, auditable split.'),

  h1('2. Roles'),
  table(
    ['Role', 'Who', 'What they do in the OS'],
    [
      ['Requester', 'Any employee', 'Describes the need, reviews the draft, confirms, cancels, submits expense reports, splits with groups.'],
      ['Manager', 'Requester’s direct manager', 'First approver for company spend above $250 and for business/morale expense reports.'],
      ['Department head', 'Budget owner of the cost center', 'Approves spend above $2,500 or above per-attendee caps.'],
      ['Finance (CFO)', 'Finance team', 'Approves spend above $10,000 or over budget; final approver for business expense reports; pays reimbursements.'],
      ['Compliance', 'Compliance officer', 'Reviews client-facing sports/live-event tickets and client gifts (gift & entertainment policy).'],
      ['HR team', 'HR business partner', 'Final approver for team morale, celebrations and offsite expense reports.'],
      ['Benefits team', 'Benefits lead', 'Approves wellbeing-stipend claims and tracks stipend balances.'],
      ['Guest member', 'Family and friends', 'Not employees. Appear in groups, can pay for or owe shares of group expenses.'],
    ],
    [1800, 2300, 5260],
  ),

  h1('3. The six categories'),
  table(
    ['Category', 'Typical request', 'Per-attendee cap (company spend)'],
    [
      ['Reservations', 'Client dinner for 4 · tonight', '$150'],
      ['Private dining & events (PDR)', 'Private room for 30 · Aug 5', '$175'],
      ['Catering', 'Offsite lunch · 120 people', '$60'],
      ['Sports & live events', 'Suite at the Warriors game', '$600'],
      ['Gifting & merch', 'Holiday gifts · 40 clients', '$100 per recipient'],
      ['Experiences', 'Team offsite · Napa', '$900'],
    ],
    [3000, 3400, 2960],
  ),
  gap(),
  p('Exceeding a per-attendee cap never blocks a booking — it adds the department head to the approval chain.'),

  h1('4. Who pays: the four funding types'),
  p('The Concierge agent proposes a funding type from your wording; you can always change it on the draft.'),
  table(
    ['Funding type', 'Use it when', 'Approvals', 'What happens after booking'],
    [
      ['Company-paid (corporate)', 'Client entertainment, team events, anything the company should pay directly.', 'Per approval matrix (section 6).', 'Charged to your department cost center; budget updated in real time.'],
      ['Paid personally → expense report (reimbursable)', 'You pay with your own card for something the company or your stipend should cover.', 'None at booking; approvals happen on the expense report.', 'Receipt captured; booking becomes claimable on an expense report.'],
      ['Personal', 'Your own leisure, not reimbursed.', 'None.', 'Tracked against your personal monthly budget (a private heads-up only).'],
      ['Shared with family / friends', 'Several people share the cost.', 'None.', 'The Split agent posts it to the group ledger and computes who owes whom.'],
    ],
    [2100, 2700, 1900, 2660],
  ),
  gap(),
  callout('Wording the agents understand', '"client" → business purpose · "team", "offsite" → morale · "I’ll pay and expense it", "reimburse" → reimbursable · "wellbeing", "stipend" → Benefits · "with my family" / "with friends", "split" → shared · "on me", "personal" → personal.'),

  h1('5. The agent pipeline'),
  p('Every request runs through the same chain of agents. Each agent writes to the booking’s trace so anyone can see exactly why a decision was made.'),
  table(
    ['#', 'Agent', 'Input', 'Decision / output'],
    [
      ['1', 'Concierge agent', 'Your free-text request', 'Category, date, party size, vendor, price estimate, funding, purpose, matching family/friends group. Uses Claude when configured, otherwise a deterministic rule engine.'],
      ['2', 'Budget agent', 'Draft + funding', 'Checks the right pot: department quarterly budget, wellbeing stipend or personal monthly budget. Status ok / warn / over.'],
      ['3', 'Policy agent', 'Draft + budget result', 'Builds the ordered approval chain. Skips approvers who are the requester (walks up the management chain). Auto-approves low-risk spend.'],
      ['4', 'Approval agent', 'Approver decisions', 'Notifies the current approver, enforces order (only the current approver can act), routes to the next step, stops on rejection.'],
      ['5', 'Booking agent', 'Fully approved booking', 'Confirms with the vendor, issues a confirmation code, sends calendar invites, handles cancellations.'],
      ['6', 'Split agent', 'Shared bookings, manual group expenses', 'Posts to the group ledger, computes exact-to-the-cent shares, balances and the fewest-payments settle-up plan.'],
      ['7', 'Expense agent', 'Reimbursable bookings', 'Drafts expense reports with receipts, routes to Finance / HR / Benefits, applies stipend limits, marks reimbursement.'],
    ],
    [500, 1700, 2300, 4860],
  ),

  h1('6. Approval matrix (company-paid)'),
  table(
    ['Condition', 'Approver added', 'Why'],
    [
      ['Total ≤ $250 and within budget and caps', 'None — auto-approved by the Policy agent', 'Low risk; keeps small team lunches frictionless.'],
      ['Total > $250', 'Manager', 'Manager confirms business need.'],
      ['Total > $2,500, or above the per-attendee cap', 'Department head', 'Budget owner signs off on material spend.'],
      ['Client-facing Sports & live events or Gifting', 'Compliance', 'Gift & entertainment / anti-bribery review.'],
      ['Total > $10,000, or department budget would be exceeded', 'Finance (CFO)', 'Material or unbudgeted spend.'],
    ],
    [3400, 2600, 3360],
  ),
  gap(),
  h2('Rules the Approval agent enforces'),
  bullet('Steps run in order; only the current approver can approve or reject.'),
  bullet('Nobody approves their own spend. If the approver would be the requester, the chain moves to that person’s manager; the same person is never listed twice.'),
  bullet('A rejection ends the chain and the booking is not placed. The requester can re-plan and resubmit.'),
  bullet('Approvers always see the live budget position, not the snapshot from when the request was made.'),

  h1('7. Budgets'),
  table(
    ['Pot', 'Owner', 'Period', 'What counts against it'],
    [
      ['Department budget (cost center)', 'Department head', 'Quarter', 'Company-paid bookings that are awaiting approval, approved or confirmed.'],
      ['Personal entertainment budget', 'The employee (self-set)', 'Month', 'Personal bookings, reimbursable bookings not yet repaid, and your share of every group expense.'],
      ['Lifestyle & wellbeing stipend', 'Benefits team', 'Year', 'Approved wellbeing expense reports. Claims above the balance are reimbursed only up to the balance.'],
    ],
    [2600, 2000, 1200, 3560],
  ),
  gap(),
  p('Status thresholds: ok (healthy), warn (less than 10% of the department budget left, or a personal budget overshoot), over (department budget exceeded — adds Finance).'),

  h1('8. Expense reports'),
  p('Use an expense report whenever you paid with your own money for something the company or your stipend should cover.'),
  h2('Flow'),
  ...stepList([
    'Book with funding "Paid personally → expense report" (or say "I’ll pay and expense it").',
    'After the booking is confirmed, open Expense reports: every confirmed, unclaimed reimbursable booking is listed.',
    'Select the bookings, choose the report type (or let the agent detect it), add the business purpose, and Create & submit.',
    'The Policy agent routes the report (table below). Each approver sees it in their Approvals inbox.',
    'On final approval the Expense agent marks it reimbursed (paid with the next payroll) and, for wellbeing, reduces your stipend balance.',
  ]),
  h2('Routing'),
  table(
    ['Report type', 'Examples', 'Approval chain', 'Destination team'],
    [
      ['Client / business', 'Client lunch, prospect drinks', 'Manager → Finance', 'Finance (Accounts Payable)'],
      ['Team morale', 'Team drinks, birthday cake, offsite', 'Manager → HR', 'HR team'],
      ['Wellbeing stipend', 'Spa day, fitness class, concert for yourself', 'Benefits', 'Benefits team'],
    ],
    [2000, 2800, 2200, 2360],
  ),
  gap(),
  h2('Guardrails'),
  bullet('A booking can appear on only one open or approved report — no double claiming.'),
  bullet('Only the owner can submit their report; submitted reports are locked.'),
  bullet(`Submit within 5 business days of the event. Receipts are captured automatically at booking.`),
  bullet('A booking on an expense report cannot be cancelled until the report is withdrawn.'),

  h1('9. Family & friends: splitting costs'),
  p('Groups work like Splitwise. A group has a type (family or friends) and members who may be employees or guests. Shared bookings post to the group automatically; anything else (Ubers, groceries, a gift) can be added by hand.'),
  h2('Split methods'),
  table(
    ['Method', 'How it works', 'Example: $300 dinner, 3 people'],
    [
      ['Equally', 'Total divided by participants; leftover cents go to the first members.', '$100 / $100 / $100'],
      ['Exact amounts', 'You enter each person’s dollar amount; must add up to the total.', '$150 / $100 / $50'],
      ['Percentages', 'Each person’s percentage; must add up to 100%.', '50% / 25% / 25% → $150 / $75 / $75'],
      ['Shares', 'Weighted units (e.g. adults 2, kids 1).', '2 : 1 : 1 → $150 / $75 / $75'],
    ],
    [1800, 4200, 3360],
  ),
  gap(),
  h2('Balances and settle-up'),
  bullet('Each member has a net balance: positive means they get money back, negative means they owe.'),
  bullet('The Split agent computes the fewest payments that bring everyone to zero (e.g. four friends settle with at most three transfers).'),
  bullet('Recording a payment ("Tom paid Leo $40") updates balances immediately. All maths is done in whole cents, so shares always add up exactly.'),
  bullet('Your share of every group expense counts toward your personal monthly budget.'),

  h1('10. Worked examples'),
  table(
    ['Request', 'What the agents do', 'Outcome'],
    [
      ['Maya: "Client dinner for 4 tonight"', 'Reservations · Quince · $560 · company-paid · business. Sales budget ok. $560 > $250 → Manager (Raj).', 'Confirmed after Raj approves; charged to CC-4100.'],
      ['Maya: "Holiday gifts for 40 clients Dec 1"', 'Gifting · $3,400 · client-facing. > $2,500 → Manager + Dept head; client gifts → Compliance.', 'Raj → Elena → Ivy, then confirmed.'],
      ['Elena (dept head): "Suite at the Warriors game for 12 clients"', 'Sports · $6,600. Elena is the dept head, so the chain skips her: Manager = Sam (CFO) + Compliance.', 'No self-approval; Compliance reviews tickets.'],
      ['Leo: "Giants tickets with friends for 4 Sunday, split"', 'Sports · Oracle Park · $720 · shared with "Weekend crew". No approval.', 'Ledger: each owes $180; Leo is owed $540.'],
      ['Maya: "Client lunch for 2 tomorrow, I will pay and expense it"', 'Reimbursable · business. Confirmed; claimable.', 'Report → Raj (Manager) → Sam (Finance) → reimbursed.'],
      ['Leo: "Spa day, wellbeing stipend, reimburse me"', 'Reimbursable · wellbeing. Stipend check.', 'Report → Omar (Benefits) → reimbursed; stipend reduced.'],
    ],
    [2600, 4000, 2760],
  ),

  h1('11. Controls, privacy and audit'),
  bullet('Every agent decision and every human decision is written to the booking or report trace and to the company-wide Agent activity log with a timestamp.'),
  bullet('The Budgets & spend dashboard shows each person\u2019s company, reimbursable, personal and group totals. In this reference build every employee can see it; in production restrict the per-person view to Finance and the individual.'),
  bullet('Policy thresholds, caps and routing live in one configuration (src/seed.js → POLICY) so Finance can change them without code changes elsewhere.'),
  bullet('When Claude is enabled for intake it only parses the request into a structured draft; budget, policy and approval decisions are always made by deterministic code.'),

  h1('12. FAQ'),
  p([b('Can I book for my family on the company? '), 'No. Use Shared (split) or Personal. Company-paid bookings must have a business or team purpose.']),
  p([b('I booked the wrong funding type. '), 'Cancel the booking and re-plan it. If it is already on an expense report, withdraw the report first.']),
  p([b('My approver is on leave. '), 'Delegation is not automated in this version: ask the approver\u2019s manager or Finance to act, or cancel and re-plan once they are back.']),
  p([b('A friend is not an employee. '), 'Add them as a guest member of a group. They can pay for expenses and settle up; they cannot book company spend.']),
  p([b('Why did my small booking need approval? '), 'Either the per-attendee cap was exceeded or your department is over budget — the Policy agent’s note on the booking tells you which.']),

  h1('Appendix: running the system'),
  p('The reference implementation lives in the entertainment-os folder of this repository.'),
  bullet('npm start — starts the app on http://localhost:4600 with demo data.'),
  bullet('npm test — runs the agent test suite (approval matrix, splits, expense routing).'),
  bullet('Set ANTHROPIC_API_KEY to let the Concierge agent parse requests with Claude; without it the rule engine is used.'),
  bullet('Use the "Acting as" selector to experience the system as a requester, manager, department head, Finance, Compliance, HR or Benefits.'),
];

const doc = new Document({
  creator: 'Entertainment OS',
  title: 'Entertainment OS — Employee & Approver Handbook',
  styles: {
    default: { document: { run: { font: FONT, size: 21 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 34, bold: true, color: GREEN, font: FONT }, paragraph: { spacing: { before: 240, after: 200 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 26, bold: true, color: '2B2A27', font: FONT }, paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [
      { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } }] },
      { reference: 'steps', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 360 } } } }] },
    ],
  },
  features: { updateFields: true },
  sections: [
    {
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Entertainment OS Handbook · page ', color: '888888', size: 16 }), new TextRun({ children: [PageNumber.CURRENT], color: '888888', size: 16 })] })] }) },
      children,
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  const out = path.join(__dirname, 'Entertainment-OS-Handbook.docx');
  fs.writeFileSync(out, buf);
  console.log('wrote', out);
});
