// Generates docs/Entertainment-OS-Handbook.docx
// Run: npm run docs  (needs the `docx` dev dependency)
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, ShadingType,
  AlignmentType, LevelFormat, BorderStyle, Footer, PageNumber, TableOfContents,
} = require('docx');

const GREEN = '2F6B3F';
const TILE = 'E4F1DF';
const FONT = 'Arial';
const W = 9360; // content width in DXA (US Letter, 1" margins)

// Figures come from the live policy and demo run, so the handbook always matches the app.
const data = JSON.parse(execFileSync('node', [path.join(__dirname, 'export-demo.mjs')], { cwd: path.join(__dirname, '..') }).toString());
const P = data.policy;
const inr = (n) => '\u20b9' + Math.round(n).toLocaleString('en-IN');
const CAT = data.categories;

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
  new Paragraph({ spacing: { after: 400 }, children: [new TextRun({ text: 'Employee & Approver Handbook — India & Canada', size: 36 })] }),
  p('Movies · Events near you (music, sports, tech, comedy, theatre, food) · Dining · Private dining · Catering · Gifting & merch · Experiences'),
  p('One agentic operating system for finding, booking, budgeting, approving, expensing and splitting every entertainment spend — company-paid, personal, family or friends. All amounts are in Indian rupees (₹).'),
  p([new TextRun({ text: `Version 2.0 · ${data.meta.period} · ${data.meta.company} · Owner: Finance Operations with People (HR & Benefits)`, color: '777777' })]),
  new Paragraph({ pageBreakBefore: true, heading: HeadingLevel.HEADING_1, children: [new TextRun('Contents')] }),
  new TableOfContents('Contents', { hyperlink: true, headingStyleRange: '1-2' }),

  h1('1. What Entertainment OS is'),
  p('Entertainment OS brings together what used to need a movie app, an events app, restaurant bookings, caterer emails, an expense tool and a bill-splitting app. You pick your city, browse what is on, or simply describe what you need in plain language. A team of software agents then finds it, prices it, checks the right budget, works out who pays, routes approvals, books it, and finally charges the cost center, drafts your expense report, or splits the bill with family or friends.'),
  p('Every booking answers four questions, visible to you, your approvers and Finance:'),
  bullet([b('Who booked it? '), 'The requester, their department, cost center and the city of the booking.']),
  bullet([b('Who is spending how much? '), 'Company spend, reimbursable spend, personal spend and each person’s share of group spend.']),
  bullet([b('Which pot of money? '), 'Department budget, personal monthly budget, or the lifestyle & wellbeing allowance.']),
  bullet([b('Who needs to approve it? '), 'An ordered approval chain built from the policy in section 10.']),
  gap(),
  callout('Principle', 'Company money needs approval proportional to risk. Personal money needs no approval — only transparency. Shared money needs a fair, auditable split.'),

  h1('2. The chat concierge'),
  p('The first thing you see is a chat with the concierge. Say what you are planning in your own words and it takes you through every step, with the other agents working behind it.'),
  table(
    ['You', 'The agents'],
    [
      ['“I’m planning to go for a movie today, can you check the theatres?”', 'Lists the theatres near your city (real cinemas from OpenStreetMap when online), with the number of films and shows left today and how many fall in the time you asked for.'],
      ['Tap a theatre, or type “the first one” or its name', 'Shows every film playing there, with posters and showtimes. Shows matching your time or format (IMAX, 3D, Recliner) are highlighted.'],
      ['Tap a showtime, or type “7 pm”', 'Asks how many tickets (or uses your family or friends group size), then opens a seat map with the best seats together already selected.'],
      ['Confirm seats, or type “F7 F8” / “best seats”', 'Budget and Policy agents check the booking. Asks who pays: just me, split with a group, company (team outing) or pay & expense it.'],
      ['Pick who pays', 'Opens the payment page: UPI, card or netbanking in India; card, Apple Pay / Google Pay or Interac in Canada. Company outings go on the company card, after approval if needed.'],
      ['Pay', 'Books the seats, issues the ticket with a booking ID and QR code, records the payment on the booking trace, posts group shares, and offers to file the expense report.'],
    ],
    [3600, 5760],
  ),
  gap(),
  callout('Demo payments', 'Payments go through a simulated gateway: the UPI ID format is checked and a payment reference is issued, but no money moves and no card numbers are ever asked for. Connecting a real gateway (Razorpay, Stripe, Moneris) replaces one module, src/agents/payment.js.'),
  gap(),
  p('The same chat handles events ("any stand-up comedy this weekend with friends?": list → tier → quantity → who pays → payment) and everything else ("client dinner for 6 tomorrow" returns a priced proposal you can review and book).'),

  h1('3. Live data from free public APIs'),
  p('When the app has internet access it fills itself with real data from free services that need no sign-up. Every item is labelled live or sample, and anything a service can’t provide falls back to sample data automatically.'),
  table(
    ['What', 'Free source', 'Notes'],
    [
      ['City coordinates', 'OpenStreetMap Nominatim', 'Works for typed-in “Other” places too'],
      ['Cinemas, restaurants, stadiums, theatres, caterers, gift shops, attractions', 'OpenStreetMap Overpass (Nominatim search as backup)', 'Real names, addresses and distances; prices are estimates'],
      ['Films', 'Apple iTunes movie chart (India / Canada)', 'With a free TMDB key, the films actually playing in cinemas'],
      ['Sports fixtures', 'TheSportsDB (public key)', 'IPL and ISL in India; NHL, NBA, MLB, MLS and CFL in Canada; ticket prices are estimates'],
      ['Concerts & shows', 'Ticketmaster Discovery (optional free key)', 'Real events and price ranges, strongest in Canada'],
      ['Weather (16 days)', 'Open-Meteo', 'Shown on the home page and on events'],
      ['Exchange rates', 'Frankfurter (European Central Bank)', '₹ amounts also shown in C$, US$, £, S$'],
      ['Public holidays', 'Nager.Date; built-in list for India', 'Canadian holidays filtered by province'],
    ],
    [3000, 2900, 3460],
  ),
  gap(),
  p('Showtimes, seat maps and ticket prices are simulated: no free API publishes them for Indian or Canadian cinemas. Results are cached (weather for an hour, places for a week) so the free services are used politely.'),

  h1('4. Choosing your location'),
  p('The location picker at the top of every screen controls which movies, cinemas, events and venues you see. It has three linked dropdowns:'),
  ...stepList([
    [b('Country '), `— India first, then Canada (13 provinces and territories), plus a few other countries (${data.locationCounts.countries} in total).`],
    [b('State / region '), `— all ${data.locationCounts.indiaStates} Indian states and union territories.`],
    [b('City '), `— the main cities of the chosen state (${data.locationCounts.indiaCities} Indian cities built in).`],
  ]),
  gap(),
  callout('Can’t find your place? Choose “Other”', 'Every dropdown has an Other option. Choosing it shows a text box so you can type any country, state or city. The agents still generate cinemas, events and venues for a typed-in place, so nothing is blocked because a city is missing from the list.'),
  gap(),
  bullet('Your choice is remembered per person on this device. "Use my office city" goes back to your home office.'),
  bullet('Typing a city in a request ("dinner for 6 in Pune tomorrow") overrides the picker for that request.'),
  bullet('Prices adjust by city: metros are the baseline, tier-2 cities are about 20% lower, other cities about 30% lower, and cities outside India are shown converted to ₹.'),

  h1('5. What you can book'),
  table(
    ['Category', 'What it covers', 'Per-person cap (company money)'],
    Object.entries(CAT).map(([k, c]) => [c.label, c.blurb, inr(P.perAttendeeCap[k])]),
    [2400, 4200, 2760],
  ),
  gap(),
  p('Going over a per-person cap never blocks a booking; it adds the department head to the approval chain.'),

  h2('Movies'),
  ...stepList([
    'Open Movies. Films are ranked with your state’s language first ("Local pick"), then Hindi and English. Filter by language.',
    'Pick a film and a date (today plus the next six days). Each cinema in your city lists its shows with format (2D, 3D, IMAX, Recliner) and price per seat.',
    'Choose a show to open the seat map. Tap up to 10 seats; sold seats are greyed out.',
    'Press Review with agents: the Budget and Policy agents check the booking, and you choose who pays.',
    'Confirm. Seats are held immediately so nobody else can take them, m-tickets are issued, and cancelling releases the seats.',
  ]),
  p('Or just ask: "3 tickets for Orbit 9 IMAX tomorrow evening". The Concierge picks the closest matching show and the best block of seats together. If your format or time isn’t available, it relaxes one wish at a time and tells you what it changed.'),

  h2('Events near you'),
  p(`Events lists what is happening in your city over the next six weeks, filtered by type: ${Object.values(data.eventTypes).join(', ')}. Each event shows the date, time, venue, distance and ticket tiers (e.g. General, Fan pit, VIP; Stand, Pavilion, Corporate box).`),
  bullet('Open an event, choose a tier and quantity (up to 20), then Review with agents and Confirm.'),
  bullet('Or ask: "Stand-up comedy with friends this weekend, split" or "Corporate box at the T20 night for 10 clients".'),
  bullet('Client-facing event tickets always go to Compliance for gift & entertainment review.'),

  h2('Dining & venues'),
  p('Restaurants, private dining rooms, caterers, gift hampers and experiences (heritage walks, cooking classes, and a weekend-escape suggestion for team offsites in your state). Pick a venue and the price is calculated on the server from the venue’s per-person rate.'),

  h1('6. Who pays: the four funding types'),
  p('The Concierge suggests a funding type from your wording, and you can always change it before confirming. A movie or concert for yourself defaults to Personal; anything for "the team", "office" or "clients" defaults to Company-paid.'),
  table(
    ['Funding type', 'Use it when', 'Approvals', 'What happens after booking'],
    [
      ['Company-paid', 'Client entertainment, team events, anything the company should pay directly.', 'Per the approval matrix (section 10).', 'Charged to your department cost center; budget updates straight away.'],
      ['Paid personally → expense report', 'You pay with your own card or UPI for something the company or your allowance should cover.', 'None at booking; approvals happen on the expense report.', 'Receipt captured; the booking becomes claimable on an expense report.'],
      ['Personal', 'Your own leisure, not reimbursed.', 'None.', 'Counts toward your personal monthly budget (a private heads-up only).'],
      ['Shared with family / friends', 'Several people share the cost.', 'None.', 'The Split agent posts it to the group ledger and works out who owes whom.'],
    ],
    [2100, 2700, 1900, 2660],
  ),

  h1('7. The agent pipeline'),
  p('Every request passes through the same chain of agents. Each agent writes to the booking’s trace, so anyone can see why a decision was made.'),
  table(
    ['#', 'Agent', 'Input', 'Decision / output'],
    [
      ['1', 'Concierge agent', 'Your request + location', 'Category, city, date, party size; the show and seats, the event and tier, or the venue; price; funding; purpose; matching group. Uses Claude when configured, otherwise a built-in rule engine.'],
      ['2', 'Budget agent', 'Draft + funding', 'Checks the right pot: department quarterly budget, wellbeing allowance, or personal monthly budget. Status ok / warn / over.'],
      ['3', 'Policy agent', 'Draft + budget result', 'Builds the ordered approval chain; never lets someone approve their own spend; auto-approves low-risk spend.'],
      ['4', 'Approval agent', 'Approver decisions', 'Notifies the current approver, enforces the order, moves to the next step, and stops if anyone rejects.'],
      ['5', 'Booking agent', 'Approved booking', 'Confirms with the cinema, organiser or venue; issues a confirmation code, m-tickets or e-tickets; holds or releases seats.'],
      ['6', 'Split agent', 'Shared bookings, manual group expenses', 'Posts to the group ledger; shares exact to the paisa; balances; fewest-payments settle-up.'],
      ['7', 'Expense agent', 'Reimbursable bookings', 'Drafts reports with receipts, routes them to Finance / HR / Benefits, applies allowance limits, marks them reimbursed.'],
      ['8', 'Payment agent', 'Payment method (UPI / card / netbanking / Interac)', 'Validates the details, re-checks seats and price, issues a payment reference, and records it on the booking (simulated gateway, no money moves).'],
      ['9', 'Chat agent', 'Your messages and taps', 'Runs the conversation: theatres → films → seats → who pays → payment → ticket, calling the agents above at each step.'],
    ],
    [500, 1700, 2100, 5060],
  ),
  gap(),
  p('Prices for movie seats, event tickets and catalog venues are always recalculated on the server, so a booking can never be made at a price other than the listed one, and a seat can never be sold twice.'),

  h1('8. Roles'),
  table(
    ['Role', 'Demo person', 'What they do'],
    [
      ['Requester', 'Any employee (e.g. Ananya Iyer)', 'Plans, books, cancels, submits expense reports, splits with groups.'],
      ['Manager', 'Direct manager (e.g. Rahul Mehta)', `First approver for company spend above ${inr(P.autoApproveLimit)}, and for business or morale expense reports.`],
      ['Department head', 'Budget owner (e.g. Priya Sharma, Kavya Nair)', `Approves spend above ${inr(P.managerLimit)} or above per-person caps.`],
      ['Finance (CFO)', 'Vikram Singh', `Approves spend above ${inr(P.deptHeadLimit)} or over budget; final approver for business expense reports.`],
      ['Compliance', 'Meera Joshi', 'Reviews client-facing event tickets and client gifts.'],
      ['HR team', 'Neha Gupta', 'Final approver for team morale, celebration and offsite expense reports.'],
      ['Benefits team', 'Farhan Qureshi', 'Approves wellbeing-allowance claims and tracks balances.'],
      ['Guest member', 'Family and friends', 'Not employees. Can pay for, or owe shares of, group expenses.'],
    ],
    [1800, 2800, 4760],
  ),

  h1('9. Budgets'),
  table(
    ['Pot', 'Owner', 'Period', 'What counts against it'],
    [
      ['Department budget (cost center)', 'Department head', 'Quarter', 'Company-paid bookings that are awaiting approval, approved or confirmed.'],
      ['Personal entertainment budget', 'The employee', 'Month', 'Personal bookings, reimbursable bookings not yet repaid, and your share of every group expense.'],
      ['Lifestyle & wellbeing allowance', 'Benefits team', 'Year', 'Approved wellbeing expense reports. Claims above the balance are paid only up to the balance.'],
    ],
    [2600, 2000, 1200, 3560],
  ),
  gap(),
  p('Status: ok (healthy), warn (less than 10% of the department budget left, or a personal overshoot), over (department budget exceeded, which adds Finance).'),

  h1('10. Approval matrix (company money)'),
  table(
    ['Condition', 'Approver added', 'Why'],
    [
      [`Total ≤ ${inr(P.autoApproveLimit)}, within budget and caps`, 'None — auto-approved by the Policy agent', 'Low risk; team movie nights and small lunches go straight through.'],
      [`Total > ${inr(P.autoApproveLimit)}`, 'Manager', 'Manager confirms the business need.'],
      [`Total > ${inr(P.managerLimit)}, or above the per-person cap`, 'Department head', 'The budget owner signs off on material spend.'],
      ['Client-facing Events or Gifting', 'Compliance', 'Gift & entertainment / anti-bribery review.'],
      [`Total > ${inr(P.deptHeadLimit)}, or the department budget would be exceeded`, 'Finance (CFO)', 'Material or unbudgeted spend.'],
    ],
    [3400, 2600, 3360],
  ),
  gap(),
  bullet('Steps run in order; only the current approver can approve or reject.'),
  bullet('Nobody approves their own spend. If the approver would be the requester, the chain moves to their manager, and the same person is never listed twice.'),
  bullet('A rejection ends the chain, the booking is not placed, and any held movie seats are released.'),
  bullet('Approvers always see the live budget position, not a snapshot from the time of the request.'),

  h1('11. Expense reports'),
  ...stepList([
    'Book with "Paid personally → expense report" (or say "I’ll pay and expense it").',
    'When the booking is confirmed, open Expense reports. Every confirmed booking you haven’t claimed yet is listed.',
    'Select bookings, choose the report type (or let the agent detect it), add the business purpose, and Create & submit.',
    'The Policy agent routes the report (table below). Each approver sees it in their Approvals list.',
    'On final approval, the Expense agent marks it reimbursed with the next payroll and, for wellbeing claims, reduces your allowance.',
  ]),
  table(
    ['Report type', 'Examples', 'Approval chain', 'Team'],
    [
      ['Client / business', 'Client lunch, prospect drinks', 'Manager → Finance', 'Finance (Accounts Payable)'],
      ['Team morale', 'Team drinks, birthday cake, offsite', 'Manager → HR', 'HR team'],
      ['Wellbeing allowance', 'Cooking class, fitness, a concert for yourself', 'Benefits', 'Benefits team'],
    ],
    [2000, 2800, 2200, 2360],
  ),
  gap(),
  bullet('A booking can be on only one open or approved report, so nothing is claimed twice.'),
  bullet(`Submit within ${P.reportSlaDays} business days of the event. Receipts are captured at booking.`),
  bullet('A booking on an expense report can’t be cancelled until the report is withdrawn.'),

  h1('12. Family & friends: splitting costs'),
  p('Groups work like Splitwise. A group is family or friends; members can be employees or guests. Shared bookings (a family movie, a comedy night with friends) post to the group automatically; anything else (cabs, groceries for a sadya, a gift) can be added by hand.'),
  table(
    ['Method', 'How it works', 'Example: ₹3,000 dinner, 3 people'],
    [
      ['Equally', 'Total divided by participants; leftover paise go to the first members.', '₹1,000 each'],
      ['Exact amounts', 'Enter each person’s rupee amount; must add up to the total.', '₹1,500 / ₹1,000 / ₹500'],
      ['Percentages', 'Each person’s share in %; must add up to 100%.', '50% / 25% / 25%'],
      ['Shares', 'Weighted units (e.g. adults 2, kids 1).', '2 : 1 : 1 → ₹1,500 / ₹750 / ₹750'],
    ],
    [1800, 4200, 3360],
  ),
  gap(),
  bullet('Each member has a net balance: positive means they get money back, negative means they owe.'),
  bullet('Settle up suggests the fewest payments that bring everyone to zero; record each UPI payment with one click.'),
  bullet('Your share of every group expense counts toward your personal monthly budget.'),

  h1('13. Worked examples'),
  table(
    ['Request', 'What the agents do', 'Outcome'],
    data.bookings
      .slice()
      .reverse()
      .map((bk) => [
        `${data.people.find((x) => x.id === bk.bookedBy).name}: “${bk.request || bk.title}”`,
        `${bk.categoryLabel} · ${bk.vendor} · ${bk.location.city} · ${inr(bk.amount)} · ${bk.funding}${bk.details?.seats ? ` · seats ${bk.details.seats.join(', ')}` : ''}${bk.details?.tier ? ` · ${bk.details.qty} × ${bk.details.tier}` : ''}`,
        bk.approvals.length ? `${bk.approvals.map((a) => `${a.role} (${data.people.find((x) => x.id === a.approverId).name}): ${a.status}`).join(' → ')}` : 'No approval needed — confirmed',
      ]),
    [2700, 3900, 2760],
  ),
  p([new TextRun({ text: 'These rows are produced by running the real agents on the demo requests.', italics: true, color: '777777' })]),

  h1('14. Controls, privacy and audit'),
  bullet('Every agent decision and every human decision is written to the booking or report trace, and to the company-wide Agent activity log, with a timestamp.'),
  bullet('Budget, policy and approval decisions are plain code. When Claude is enabled, it only turns your text into a structured draft.'),
  bullet('Seat availability and ticket and venue prices are checked on the server at booking time.'),
  bullet('The Budgets & spend dashboard shows each person’s company, reimbursable, personal and group totals. In this reference build every employee can see it; in production, restrict the per-person view to Finance and the individual.'),

  h1('15. FAQ'),
  p([b('My city is not in the list. '), 'Choose Other in the State or City dropdown and type it. You’ll still get cinemas, events and venues.']),
  p([b('Can I book a family movie on the company? '), 'No. Use Shared (split) or Personal. Company-paid bookings need a business or team purpose.']),
  p([b('The seats I wanted were taken. '), 'Someone booked them first. Refresh the seat map and pick again; the system never double-books a seat.']),
  p([b('I chose the wrong funding type. '), 'Cancel the booking and plan it again. If it is on an expense report, withdraw the report first.']),
  p([b('My approver is on leave. '), 'Delegation isn’t automatic in this version. Ask the approver’s manager or Finance to act, or cancel and plan again later.']),
  p([b('Why did my small booking need approval? '), 'Either the per-person cap was exceeded or your department is over budget. The Policy agent’s note on the booking tells you which.']),

  h1('Appendix: running the system'),
  bullet('npm start — starts the app on http://localhost:4600 with demo data.'),
  bullet('npm test — runs the agent test suite (locations, movies & seats, events, approvals, splits, expense routing).'),
  bullet('Set ANTHROPIC_API_KEY to let the Concierge agent read requests with Claude; without it, the rule engine is used.'),
  bullet('Use "Acting as" in the sidebar to see the app as a requester, manager, department head, Finance, Compliance, HR or Benefits.'),
  bullet('Offline, movies, cinemas, events and venues are fictional sample data; online they come from the free APIs in section 3. Showtimes, seat maps and payments are always simulated.'),
];

const doc = new Document({
  creator: 'Entertainment OS',
  title: 'Entertainment OS — Employee & Approver Handbook (India & Canada)',
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
