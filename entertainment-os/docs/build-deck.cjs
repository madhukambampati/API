// Generates docs/Entertainment-OS-Overview.pptx
// Run: npm run docs  (needs the `pptxgenjs` and `sharp` dev dependencies)
const path = require('path');
const { execFileSync } = require('child_process');
const pptxgen = require('pptxgenjs');
const sharp = require('sharp');

const data = JSON.parse(execFileSync('node', [path.join(__dirname, 'export-demo.mjs')], { cwd: path.join(__dirname, '..') }).toString());

const C = { forest: '2F6B3F', deep: '1F4A2B', tile: 'E4F1DF', ink: '2B2A27', muted: '6F6C64', line: 'DDD9CF', white: 'FFFFFF', amber: 'B7791F', amberBg: 'FDF3E1', plum: '6B3FA0', plumBg: 'EFE7F7', blueBg: 'E8EEF8', blue: '35598F' };
const HEAD = 'Cambria';
const BODY = 'Calibri';

const ICONS = {
  utensils: '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M16 3c-1.7 1.3-2.5 3.3-2.5 6 0 1.4.9 2.5 2.5 2.5V21"/>',
  glass: '<path d="M6 4h12l-6 8-6-8zM12 12v7M8 20h8"/>',
  cloche: '<path d="M4 17h16M5 17a7 7 0 0 1 14 0M12 7V5M10.5 5h3M3 20h18"/>',
  ticket: '<path d="M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4V7z"/><path d="M14 7v10" stroke-dasharray="2 2"/>',
  gift: '<rect x="4" y="9" width="16" height="11" rx="1"/><path d="M3 9h18M12 9v11M12 9c-2-4-6-4-6-1.5S10 9 12 9zm0 0c2-4 6-4 6-1.5S14 9 12 9z"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8 6.6 19.7l1.1-6.1-4.5-4.2 6.1-.8L12 3z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  wallet: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 15h2"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.8"/><path d="M16 14.2a5.5 5.5 0 0 1 6 5.8"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z"/><path d="M9 8h6M9 12h6"/>',
  shield: '<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3z"/><path d="m9 12 2 2 4-4"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
};

async function icon(name, color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="256" height="256" fill="none" stroke="#${color}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return 'image/png;base64,' + buf.toString('base64');
}

const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
const shadow = () => ({ type: 'outer', color: '000000', blur: 8, offset: 2, angle: 90, opacity: 0.12 });

(async () => {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5
  pres.title = 'Entertainment OS — How the flow works';
  const W = 13.333;
  const M = 0.6;

  const tileIcon = async (slide, name, x, y, size = 0.7, bg = C.tile, fg = C.forest) => {
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: size, h: size, fill: { color: bg }, line: { color: bg }, rectRadius: 0.12 });
    slide.addImage({ data: await icon(name, fg), x: x + size * 0.2, y: y + size * 0.2, w: size * 0.6, h: size * 0.6 });
  };
  const title = (slide, text, sub) => {
    slide.addText(text, { x: M, y: 0.4, w: W - 2 * M, h: 0.8, fontFace: HEAD, fontSize: 34, bold: true, color: C.ink, margin: 0, isTextBox: true });
    if (sub) slide.addText(sub, { x: M, y: 1.15, w: W - 2 * M, h: 0.45, fontFace: BODY, fontSize: 15, color: C.muted, margin: 0, isTextBox: true });
  };
  const card = (slide, x, y, w, h, fill = C.white) => slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { color: C.line, width: 0.75 }, rectRadius: 0.15, shadow: shadow() });

  // 1. Title
  {
    const s = pres.addSlide();
    s.background = { color: C.deep };
    await tileIcon(s, 'spark', M, 1.2, 0.9, C.forest, C.white);
    s.addText('Entertainment OS', { x: M, y: 2.35, w: 10, h: 1.1, fontFace: HEAD, fontSize: 54, bold: true, color: C.white, margin: 0, isTextBox: true });
    s.addText('One agentic operating system for dining, private events, catering, sports, gifting and experiences — with budgets, approvals, expense reports and family & friends splits built in.', { x: M, y: 3.55, w: 9.5, h: 1.2, fontFace: BODY, fontSize: 18, color: 'D8E6D6', margin: 0, isTextBox: true });
    s.addText('How the flow works · Q3 2026', { x: M, y: 6.3, w: 8, h: 0.4, fontFace: BODY, fontSize: 13, color: 'A9C4A6', margin: 0, isTextBox: true });
    s.addNotes('Entertainment OS brings every kind of entertainment spend into one system run by cooperating agents.');
  }

  // 2. Six categories
  {
    const s = pres.addSlide();
    s.background = { color: 'F7F6F2' };
    title(s, 'Everything in one place', 'Six categories, one request box. Describe it in plain words and the agents take it from there.');
    const cats = [
      ['utensils', 'Reservations', 'Client dinner for 4 · tonight'],
      ['glass', 'Private dining & events', 'Private room for 30 · Aug 5'],
      ['cloche', 'Catering', 'Offsite lunch · 120 people'],
      ['ticket', 'Sports & live events', 'Suite at the Warriors game'],
      ['gift', 'Gifting & merch', 'Holiday gifts · 40 clients'],
      ['star', 'Experiences', 'Team offsite · Napa'],
    ];
    const cw = 3.85, ch = 2.3, gx = 0.37, gy = 0.35, y0 = 1.9;
    for (let i = 0; i < cats.length; i++) {
      const [ic, name, ex] = cats[i];
      const x = M + (i % 3) * (cw + gx);
      const y = y0 + Math.floor(i / 3) * (ch + gy);
      card(s, x, y, cw, ch);
      await tileIcon(s, ic, x + 0.3, y + 0.3, 0.7);
      s.addText(name, { x: x + 0.3, y: y + 1.1, w: cw - 0.6, h: 0.5, fontFace: HEAD, fontSize: 19, bold: true, color: C.ink, margin: 0, isTextBox: true });
      s.addText(ex, { x: x + 0.3, y: y + 1.65, w: cw - 0.6, h: 0.4, fontFace: BODY, fontSize: 14, color: C.muted, margin: 0, isTextBox: true });
    }
  }

  // 3. Four questions
  {
    const s = pres.addSlide();
    title(s, 'Every booking answers four questions', 'Visible to the requester, approvers and Finance — always.');
    const q = [
      ['user', 'Who booked it?', 'Requester, department and cost center are captured on every booking and shown in every list.'],
      ['wallet', 'Who is spending how much?', 'Company-paid, reimbursable, personal and each person’s share of group spend — per person, per category.'],
      ['receipt', 'Which pot of money?', 'Department quarterly budget, personal monthly budget, or the lifestyle & wellbeing stipend.'],
      ['check', 'Who needs to approve?', 'An ordered chain — Manager, Department head, Compliance, Finance — built from policy, never self-approved.'],
    ];
    const cw = 5.9, ch = 2.25;
    for (let i = 0; i < 4; i++) {
      const x = M + (i % 2) * (cw + 0.33);
      const y = 1.95 + Math.floor(i / 2) * (ch + 0.3);
      card(s, x, y, cw, ch, 'FBFAF7');
      await tileIcon(s, q[i][0], x + 0.3, y + 0.35, 0.75);
      s.addText(q[i][1], { x: x + 1.3, y: y + 0.3, w: cw - 1.6, h: 0.55, fontFace: HEAD, fontSize: 20, bold: true, color: C.ink, margin: 0, isTextBox: true });
      s.addText(q[i][2], { x: x + 1.3, y: y + 0.9, w: cw - 1.6, h: 1.1, fontFace: BODY, fontSize: 14, color: C.muted, margin: 0, valign: 'top', isTextBox: true });
    }
  }

  // 4. Agent pipeline
  {
    const s = pres.addSlide();
    s.background = { color: 'F7F6F2' };
    title(s, 'The agent pipeline', 'Each agent does one job and writes its reasoning to the booking’s trace.');
    const agents = [
      ['Concierge', 'Parses the request, picks vendor, prices it, proposes who pays'],
      ['Budget', 'Checks department, personal or stipend budget'],
      ['Policy', 'Builds the approval chain; auto-approves low risk'],
      ['Approval', 'Routes to each approver in order; stops on reject'],
      ['Booking', 'Confirms with vendor, invites attendees'],
    ];
    const bw = 2.26, gap = 0.16, y = 2.1;
    agents.forEach(([n, d], i) => {
      const x = M + i * (bw + gap);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: bw, h: 2.2, fill: { color: i % 2 ? C.white : C.tile }, line: { color: C.line, width: 0.75 }, rectRadius: 0.15 });
      s.addShape(pres.shapes.OVAL, { x: x + 0.25, y: y + 0.25, w: 0.5, h: 0.5, fill: { color: C.forest }, line: { color: C.forest } });
      s.addText(String(i + 1), { x: x + 0.25, y: y + 0.25, w: 0.5, h: 0.5, align: 'center', valign: 'middle', fontFace: BODY, fontSize: 14, bold: true, color: C.white, margin: 0, isTextBox: true });
      s.addText(n + ' agent', { x: x + 0.25, y: y + 0.85, w: bw - 0.45, h: 0.45, fontFace: HEAD, fontSize: 16, bold: true, color: C.ink, margin: 0, isTextBox: true });
      s.addText(d, { x: x + 0.25, y: y + 1.3, w: bw - 0.45, h: 0.8, fontFace: BODY, fontSize: 12, color: C.muted, margin: 0, valign: 'top', isTextBox: true });
    });
    // fan-out
    s.addText('Then, depending on who pays:', { x: M, y: 4.65, w: 6, h: 0.4, fontFace: BODY, fontSize: 14, bold: true, color: C.ink, margin: 0, isTextBox: true });
    const outs = [
      ['wallet', 'Company-paid', 'Charged to the cost center; budget updated live.', C.blueBg, C.blue],
      ['users', 'Split agent', 'Shared bookings posted to the family / friends ledger.', C.plumBg, C.plum],
      ['receipt', 'Expense agent', 'Personally-paid bookings become claimable expense reports.', C.amberBg, C.amber],
    ];
    for (let i = 0; i < outs.length; i++) {
      const [ic, n, d, bg, fg] = outs[i];
      const x = M + i * 4.1;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 5.15, w: 3.85, h: 1.5, fill: { color: bg }, line: { color: bg }, rectRadius: 0.15 });
      await tileIcon(s, ic, x + 0.25, 5.4, 0.6, C.white, fg);
      s.addText(n, { x: x + 1.05, y: 5.35, w: 2.6, h: 0.4, fontFace: HEAD, fontSize: 16, bold: true, color: fg, margin: 0, isTextBox: true });
      s.addText(d, { x: x + 1.05, y: 5.75, w: 2.65, h: 0.8, fontFace: BODY, fontSize: 12, color: C.ink, margin: 0, valign: 'top', isTextBox: true });
    }
    s.addNotes('Concierge can use Claude for intake when an API key is configured; budget, policy and approvals are always deterministic code.');
  }

  // 5. Who pays
  {
    const s = pres.addSlide();
    title(s, 'Who pays? Four funding types', 'The Concierge proposes one from your wording — you can always change it on the draft.');
    const cols = [
      ['Company-paid', '"client dinner", "team offsite"', 'Per approval matrix', 'Cost center charged', C.blueBg, C.blue],
      ['Paid personally → expense report', '"I’ll pay and expense it", "reimburse me"', 'On the expense report', 'Claimable report → Finance / HR / Benefits', C.amberBg, C.amber],
      ['Personal', '"on me", "personal"', 'None', 'Counts toward your personal monthly budget', 'EEEEEA', '5B5A55'],
      ['Shared with family / friends', '"with my family, split", "with friends"', 'None', 'Posted to the group ledger; fewest-payments settle-up', C.plumBg, C.plum],
    ];
    const cw = 2.9, gap = 0.18, y = 1.95;
    cols.forEach(([n, say, appr, after, bg, fg], i) => {
      const x = M + i * (cw + gap);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h: 4.8, fill: { color: bg }, line: { color: bg }, rectRadius: 0.15 });
      s.addText(n, { x: x + 0.25, y: y + 0.25, w: cw - 0.5, h: 0.9, fontFace: HEAD, fontSize: 18, bold: true, color: fg, margin: 0, valign: 'top', isTextBox: true });
      const block = (label, text, yy) => {
        s.addText(label.toUpperCase(), { x: x + 0.25, y: yy, w: cw - 0.5, h: 0.3, fontFace: BODY, fontSize: 10, bold: true, color: C.muted, charSpacing: 1, margin: 0, isTextBox: true });
        s.addText(text, { x: x + 0.25, y: yy + 0.3, w: cw - 0.5, h: 0.85, fontFace: BODY, fontSize: 13, color: C.ink, margin: 0, valign: 'top', isTextBox: true });
      };
      block('You say', say, y + 1.25);
      block('Approvals', appr, y + 2.4);
      block('After booking', after, y + 3.55);
    });
  }

  // 6. Approval matrix
  {
    const s = pres.addSlide();
    s.background = { color: 'F7F6F2' };
    title(s, 'Approval matrix for company money', 'Approval grows with risk. Nobody approves their own spend.');
    const steps = [
      ['≤ $250', 'Auto-approved', 'Within budget and per-attendee caps'],
      ['> $250', '+ Manager', 'Confirms the business need'],
      ['> $2,500 or over cap', '+ Department head', 'Budget owner signs off'],
      ['> $10,000 or over budget', '+ Finance (CFO)', 'Material or unbudgeted spend'],
    ];
    steps.forEach(([amt, who, why], i) => {
      const x = M;
      const y = 1.95 + i * 1.18;
      const w = 7.9;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 0.85, fill: { color: i === 0 ? C.tile : C.white }, line: { color: C.line, width: 0.75 }, rectRadius: 0.1 });
      s.addText(amt, { x: x + 0.2, y, w: 2.4, h: 0.85, fontFace: HEAD, fontSize: 16, bold: true, color: C.forest, valign: 'middle', margin: 0, isTextBox: true });
      s.addText([{ text: who, options: { bold: true, color: C.ink, breakLine: true } }, { text: why, options: { color: C.muted, fontSize: 12 } }], { x: x + 2.7, y, w: w - 2.9, h: 0.85, fontFace: BODY, fontSize: 14, valign: 'middle', margin: 0, isTextBox: true });
    });
    const sideX = W - M - 3.9;
    card(s, sideX, 1.95, 3.9, 4.5);
    await tileIcon(s, 'shield', sideX + 0.3, 2.2, 0.65);
    s.addText('Also triggers', { x: sideX + 1.1, y: 2.3, w: 2.6, h: 0.45, fontFace: HEAD, fontSize: 18, bold: true, color: C.ink, margin: 0, isTextBox: true });
    s.addText(
      [
        { text: 'Compliance for client-facing sports tickets and client gifts', options: { bullet: true, breakLine: true } },
        { text: 'Dept head when $/attendee exceeds the cap (e.g. Reservations $150, Catering $60, Sports $600)', options: { bullet: true, breakLine: true } },
        { text: 'If the approver is the requester, the chain moves to their manager', options: { bullet: true, breakLine: true } },
        { text: 'Rejection ends the chain; approvers see the live budget', options: { bullet: true } },
      ],
      { x: sideX + 0.3, y: 3.05, w: 3.35, h: 3.2, fontFace: BODY, fontSize: 13, color: C.ink, paraSpaceAfter: 8, valign: 'top', margin: 0, isTextBox: true },
    );
  }

  // 7. Expense reports
  {
    const s = pres.addSlide();
    title(s, 'Spent your own money? Expense reports', 'The Expense agent drafts the report with receipts and routes it to the right team.');
    const flow = ['Book as "paid personally"', 'Booking confirmed, receipt captured', 'Select bookings → Create & submit', 'Routed by report type', 'Approved → reimbursed with payroll'];
    flow.forEach((t, i) => {
      const x = M + i * 2.45;
      s.addShape(pres.shapes.CHEVRON, { x, y: 1.95, w: 2.4, h: 0.95, fill: { color: i === 4 ? C.forest : C.tile }, line: { color: C.white, width: 1 } });
      s.addText(t, { x: x + 0.4, y: 1.95, w: 1.7, h: 0.95, fontFace: BODY, fontSize: 11.5, bold: true, color: i === 4 ? C.white : C.forest, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
    });
    const lanes = [
      ['Client / business', 'Client lunch, prospect drinks', 'Manager → Finance', C.blueBg, C.blue],
      ['Team morale', 'Team drinks, celebrations, offsites', 'Manager → HR', C.tile, C.forest],
      ['Wellbeing stipend', 'Spa day, fitness class, a concert for you', 'Benefits only · capped at stipend balance', C.amberBg, C.amber],
    ];
    lanes.forEach(([n, ex, chain, bg, fg], i) => {
      const x = M + i * 4.1;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 3.35, w: 3.85, h: 2.2, fill: { color: bg }, line: { color: bg }, rectRadius: 0.15 });
      s.addText(n, { x: x + 0.3, y: 3.55, w: 3.3, h: 0.45, fontFace: HEAD, fontSize: 19, bold: true, color: fg, margin: 0, isTextBox: true });
      s.addText(ex, { x: x + 0.3, y: 4.05, w: 3.3, h: 0.5, fontFace: BODY, fontSize: 13, color: C.muted, margin: 0, isTextBox: true });
      s.addText(chain, { x: x + 0.3, y: 4.65, w: 3.3, h: 0.7, fontFace: BODY, fontSize: 15, bold: true, color: C.ink, margin: 0, valign: 'top', isTextBox: true });
    });
    s.addText('Guardrails: a booking can be claimed once · only the owner submits · submit within 5 business days · a claimed booking can’t be cancelled until the report is withdrawn.', { x: M, y: 5.95, w: W - 2 * M, h: 0.7, fontFace: BODY, fontSize: 13, color: C.muted, margin: 0, isTextBox: true });
  }

  // 8. Splits
  {
    const s = pres.addSlide();
    s.background = { color: 'F7F6F2' };
    title(s, 'Family & friends: split it like Splitwise', 'Shared bookings land in the group ledger automatically; add Ubers, groceries or gifts by hand.');
    const fam = data.groups.find((g) => g.type === 'friends');
    const names = Object.fromEntries(data.people.map((p) => [p.id, p.name]));
    // compute balances from demo data
    const bal = Object.fromEntries(fam.members.map((m) => [m, 0]));
    for (const e of data.groupExpenses.filter((x) => x.groupId === fam.id)) {
      bal[e.paidBy] += e.amount;
      for (const sh of e.shares) bal[sh.personId] -= sh.amount;
    }
    for (const st of data.settlements.filter((x) => x.groupId === fam.id)) {
      bal[st.from] += st.amount;
      bal[st.to] -= st.amount;
    }
    card(s, M, 1.95, 5.6, 4.7);
    await tileIcon(s, 'users', M + 0.3, 2.2, 0.65, C.plumBg, C.plum);
    s.addText(`${fam.name} (friends)`, { x: M + 1.1, y: 2.3, w: 4.2, h: 0.45, fontFace: HEAD, fontSize: 18, bold: true, color: C.ink, margin: 0, isTextBox: true });
    const rows = [[{ text: 'Member', options: { bold: true, color: C.muted } }, { text: 'Balance', options: { bold: true, color: C.muted, align: 'right' } }]];
    for (const m of fam.members) {
      const v = Math.round(bal[m] * 100) / 100;
      rows.push([{ text: names[m] }, { text: (v > 0 ? 'gets back ' : v < 0 ? 'owes ' : 'settled ') + money(Math.abs(v)), options: { align: 'right', bold: true, color: v > 0 ? C.forest : v < 0 ? 'B23B3B' : C.muted } }]);
    }
    s.addTable(rows, { x: M + 0.3, y: 3.05, w: 5.0, colW: [2.6, 2.4], fontFace: BODY, fontSize: 14, color: C.ink, border: { type: 'solid', pt: 0.5, color: C.line }, rowH: 0.42 });
    s.addText('Ledger: Giants tickets $720 (Leo, split 4 ways) · Uber $96 (Priya) · Tom paid Leo $40', { x: M + 0.3, y: 5.4, w: 5.0, h: 0.9, fontFace: BODY, fontSize: 12, color: C.muted, margin: 0, valign: 'top', isTextBox: true });

    const mx = M + 6.0;
    s.addText('Four ways to split', { x: mx, y: 1.95, w: 6, h: 0.45, fontFace: HEAD, fontSize: 18, bold: true, color: C.ink, margin: 0, isTextBox: true });
    const methods = [['Equally', '$300 ÷ 3 = $100 each'], ['Exact amounts', '$150 / $100 / $50'], ['Percentages', '50% / 25% / 25%'], ['Shares', 'Adults 2, kids 1 → $150 / $75 / $75']];
    methods.forEach(([n, ex], i) => {
      const x = mx + (i % 2) * 3.1;
      const y = 2.5 + Math.floor(i / 2) * 1.25;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 2.95, h: 1.1, fill: { color: C.white }, line: { color: C.line, width: 0.75 }, rectRadius: 0.12 });
      s.addText([{ text: n, options: { bold: true, color: C.plum, breakLine: true } }, { text: ex, options: { color: C.ink, fontSize: 12 } }], { x: x + 0.2, y, w: 2.6, h: 1.1, fontFace: BODY, fontSize: 15, valign: 'middle', margin: 0, isTextBox: true });
    });
    s.addText(
      [
        { text: 'Exact to the cent — leftover cents are handed out so shares always add up', options: { bullet: true, breakLine: true } },
        { text: 'Settle-up suggests the fewest payments that bring everyone to zero', options: { bullet: true, breakLine: true } },
        { text: 'Your share counts toward your personal monthly budget', options: { bullet: true } },
      ],
      { x: mx, y: 5.1, w: 6.1, h: 1.5, fontFace: BODY, fontSize: 13, color: C.ink, paraSpaceAfter: 6, valign: 'top', margin: 0, isTextBox: true },
    );
  }

  // 9. Demo snapshot with native chart
  {
    const s = pres.addSlide();
    title(s, 'Demo snapshot: who is spending what', `${data.meta.company} · ${data.meta.period} · produced by running the agents on 11 sample requests`);
    const LIVE = ['pending_approval', 'approved', 'confirmed'];
    const live = data.bookings.filter((b) => LIVE.includes(b.status));
    const company = live.filter((b) => b.funding === 'corporate').reduce((t, b) => t + b.amount, 0);
    const personal = live.filter((b) => b.funding !== 'corporate').reduce((t, b) => t + b.amount, 0);
    const pending = data.bookings.filter((b) => b.status === 'pending_approval').length + data.reports.filter((r) => r.status === 'submitted').length;
    const stats = [[money(company), 'company-paid'], [money(personal), 'personal, reimbursable & shared'], [String(pending), 'items awaiting approval']];
    stats.forEach(([v, l], i) => {
      const y = 1.95 + i * 1.55;
      s.addText(v, { x: M, y, w: 3.8, h: 0.85, fontFace: HEAD, fontSize: 44, bold: true, color: C.forest, margin: 0, isTextBox: true });
      s.addText(l, { x: M, y: y + 0.85, w: 3.8, h: 0.4, fontFace: BODY, fontSize: 13, color: C.muted, margin: 0, isTextBox: true });
    });
    const catNames = { reservations: 'Reservations', pdr: 'Private dining', catering: 'Catering', sports: 'Sports & live', gifting: 'Gifting', experiences: 'Experiences' };
    const labels = Object.values(catNames);
    const vals = Object.keys(catNames).map((k) => live.filter((b) => b.category === k).reduce((t, b) => t + b.amount, 0));
    s.addChart(pres.charts.BAR, [{ name: 'Live spend ($)', labels, values: vals }], {
      x: 4.8, y: 1.85, w: W - 4.8 - M, h: 4.9, barDir: 'bar',
      showTitle: true, title: 'Live spend by category ($)', titleFontFace: BODY, titleFontSize: 14, titleColor: C.ink,
      chartColors: [C.forest], showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '$#,##0', dataLabelFontSize: 11, dataLabelColor: C.ink,
      catAxisLabelColor: C.ink, catAxisLabelFontSize: 12, valAxisHidden: true, valGridLine: { style: 'none' }, catGridLine: { style: 'none' }, showLegend: false,
    });
  }

  // 10. Guardrails
  {
    const s = pres.addSlide();
    s.background = { color: 'F7F6F2' };
    title(s, 'Controls & audit trail', 'Autonomous where it is safe, human where it matters.');
    const items = [
      ['shield', 'Deterministic decisions', 'Budget, policy and approval logic is plain code; Claude (optional) only turns text into a structured draft.'],
      ['check', 'Ordered, un-skippable approvals', 'Only the current approver can act; no self-approval; rejection stops the booking.'],
      ['receipt', 'No double claims', 'A booking can sit on one live expense report; claimed bookings can’t be cancelled.'],
      ['spark', 'Full trace', 'Every agent and human decision is time-stamped on the booking and in the Agent activity log.'],
    ];
    for (let i = 0; i < items.length; i++) {
      const y = 1.9 + i * 1.2;
      await tileIcon(s, items[i][0], M, y, 0.75);
      s.addText(items[i][1], { x: M + 1.0, y, w: 10.5, h: 0.4, fontFace: HEAD, fontSize: 18, bold: true, color: C.ink, margin: 0, isTextBox: true });
      s.addText(items[i][2], { x: M + 1.0, y: y + 0.42, w: 10.5, h: 0.5, fontFace: BODY, fontSize: 14, color: C.muted, margin: 0, isTextBox: true });
    }
  }

  // 11. Closing
  {
    const s = pres.addSlide();
    s.background = { color: C.deep };
    s.addText('Try it', { x: M, y: 1.0, w: 8, h: 0.9, fontFace: HEAD, fontSize: 44, bold: true, color: C.white, margin: 0, isTextBox: true });
    s.addText(
      [
        { text: 'cd entertainment-os && npm start → http://localhost:4600', options: { bullet: true, breakLine: true } },
        { text: 'Switch "Acting as" to play requester, manager, dept head, Compliance, Finance, HR or Benefits', options: { bullet: true, breakLine: true } },
        { text: 'npm test runs the agent test suite', options: { bullet: true, breakLine: true } },
        { text: 'Set ANTHROPIC_API_KEY to let Claude read free-text requests', options: { bullet: true, breakLine: true } },
        { text: 'Companion docs: Handbook (.docx) and Operations Workbook (.xlsx)', options: { bullet: true } },
      ],
      { x: M, y: 2.2, w: 11, h: 3.5, fontFace: BODY, fontSize: 18, color: 'E3EEE1', paraSpaceAfter: 12, valign: 'top', margin: 0, isTextBox: true },
    );
  }

  const out = path.join(__dirname, 'Entertainment-OS-Overview.pptx');
  await pres.writeFile({ fileName: out });
  console.log('wrote', out);
})();
