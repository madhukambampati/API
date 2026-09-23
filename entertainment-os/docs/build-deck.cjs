// Generates docs/Entertainment-OS-Overview.pptx (India edition)
// Run: npm run docs  (needs the `pptxgenjs` and `sharp` dev dependencies)
const path = require('path');
const { execFileSync } = require('child_process');
const pptxgen = require('pptxgenjs');
const sharp = require('sharp');

const data = JSON.parse(execFileSync('node', [path.join(__dirname, 'export-demo.mjs')], { cwd: path.join(__dirname, '..') }).toString());
const P = data.policy;

// Palette matches the app: deep indigo, violet, vermilion accent.
const C = { deep: '17153B', violet: '4B3FD1', soft: 'ECEBFF', brand: 'E4572E', brandSoft: 'FDEBE5', ink: '1B1938', muted: '6E6A86', line: 'E0DDEE', white: 'FFFFFF', paper: 'F7F6FB', amber: 'A8660B', amberBg: 'FDF1DC', green: '1D8A5A', greenBg: 'E3F5EC', plum: '7B3FB8', plumBg: 'F3E8FF' };
const HEAD = 'Cambria';
const BODY = 'Calibri';

const ICONS = {
  film: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
  ticket: '<path d="M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4V7z"/><path d="M14 7v10" stroke-dasharray="2 2"/>',
  utensils: '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M16 3c-1.7 1.3-2.5 3.3-2.5 6 0 1.4.9 2.5 2.5 2.5V21"/>',
  glass: '<path d="M6 4h12l-6 8-6-8zM12 12v7M8 20h8"/>',
  cloche: '<path d="M4 17h16M5 17a7 7 0 0 1 14 0M12 7V5M10.5 5h3M3 20h18"/>',
  gift: '<rect x="4" y="9" width="16" height="11" rx="1"/><path d="M3 9h18M12 9v11M12 9c-2-4-6-4-6-1.5S10 9 12 9zm0 0c2-4 6-4 6-1.5S14 9 12 9z"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  wallet: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 15h2"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.8"/><path d="M16 14.2a5.5 5.5 0 0 1 6 5.8"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z"/><path d="M9 8h6M9 12h6"/>',
  shield: '<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3z"/><path d="m9 12 2 2 4-4"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  seat: '<path d="M6 11V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5"/><path d="M4 11h16v5H4zM6 16v4M18 16v4"/>',
};

async function icon(name, color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="256" height="256" fill="none" stroke="#${color}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return 'image/png;base64,' + buf.toString('base64');
}

const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
const shadow = () => ({ type: 'outer', color: '000000', blur: 8, offset: 2, angle: 90, opacity: 0.1 });

(async () => {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5
  pres.title = 'Entertainment OS — How the flow works (India)';
  const W = 13.333;
  const M = 0.6;

  const circleIcon = async (slide, name, x, y, size = 0.7, bg = C.soft, fg = C.violet) => {
    slide.addShape(pres.shapes.OVAL, { x, y, w: size, h: size, fill: { color: bg }, line: { color: bg } });
    slide.addImage({ data: await icon(name, fg), x: x + size * 0.22, y: y + size * 0.22, w: size * 0.56, h: size * 0.56 });
  };
  const title = (slide, text, sub) => {
    slide.addText(text, { x: M, y: 0.4, w: W - 2 * M, h: 0.8, fontFace: HEAD, fontSize: 34, bold: true, color: C.ink, margin: 0, isTextBox: true });
    if (sub) slide.addText(sub, { x: M, y: 1.15, w: W - 2 * M, h: 0.45, fontFace: BODY, fontSize: 15, color: C.muted, margin: 0, isTextBox: true });
  };
  const card = (slide, x, y, w, h, fill = C.white) => slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { color: C.line, width: 0.75 }, rectRadius: 0.15, shadow: shadow() });
  const chev = (slide, items, y, h = 0.95, lastColor = C.brand) => {
    const w = (W - 2 * M) / items.length;
    items.forEach((t, i) => {
      const last = i === items.length - 1;
      slide.addShape(pres.shapes.CHEVRON, { x: M + i * w, y, w: w + 0.05, h, fill: { color: last ? lastColor : C.soft }, line: { color: C.white, width: 1 } });
      slide.addText(t, { x: M + i * w + 0.38, y, w: w - 0.6, h, fontFace: BODY, fontSize: 12, bold: true, color: last ? C.white : C.violet, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
    });
  };

  // 1. Title
  {
    const s = pres.addSlide();
    s.background = { color: C.deep };
    await circleIcon(s, 'spark', M, 1.2, 0.95, C.brand, C.white);
    s.addText('Entertainment OS', { x: M, y: 2.4, w: 10, h: 1.1, fontFace: HEAD, fontSize: 54, bold: true, color: C.white, margin: 0, isTextBox: true });
    s.addText('One agentic operating system for movies, events near you, dining, private events, catering, gifting and experiences across India, with budgets, approvals, expense reports and family & friends splits built in.', { x: M, y: 3.6, w: 10, h: 1.2, fontFace: BODY, fontSize: 18, color: 'D6D3F5', margin: 0, isTextBox: true });
    s.addText(`How the flow works · ${data.meta.company} · amounts in ₹`, { x: M, y: 6.3, w: 10, h: 0.4, fontFace: BODY, fontSize: 13, color: 'A9A5D6', margin: 0, isTextBox: true });
    s.addNotes('Entertainment OS brings every kind of entertainment spend into one system run by cooperating agents. Built for India first.');
  }

  // 2. Seven categories as a list
  {
    const s = pres.addSlide();
    s.background = { color: C.paper };
    s.addText('Everything in one place', { x: M, y: 0.6, w: 4.6, h: 1.6, fontFace: HEAD, fontSize: 36, bold: true, color: C.ink, margin: 0, valign: 'top', isTextBox: true });
    s.addText('Seven categories, one request box. Browse what’s on in your city, or describe it in plain words and let the agents take it from there.', { x: M, y: 2.3, w: 4.4, h: 1.6, fontFace: BODY, fontSize: 16, color: C.muted, margin: 0, valign: 'top', isTextBox: true });
    const entries = Object.entries(data.categories);
    const rowH = 0.86;
    for (let i = 0; i < entries.length; i++) {
      const [, c] = entries[i];
      const y = 0.55 + i * rowH;
      await circleIcon(s, c.icon, 5.6, y + 0.08, 0.62, i < 2 ? C.brandSoft : C.soft, i < 2 ? C.brand : C.violet);
      s.addText(c.label, { x: 6.45, y, w: 3.0, h: rowH - 0.1, fontFace: HEAD, fontSize: 18, bold: true, color: C.ink, valign: 'middle', margin: 0, isTextBox: true });
      s.addText(c.blurb, { x: 9.5, y, w: 3.3, h: rowH - 0.1, fontFace: BODY, fontSize: 14, color: C.muted, valign: 'middle', margin: 0, isTextBox: true });
    }
  }

  // 3. Location picker
  {
    const s = pres.addSlide();
    title(s, 'Pick your city: Country → State → City', 'Movies, cinemas, events and venues all follow the location you choose.');
    const boxes = [['Country', 'India · Canada · …'], ['State / region', 'Karnataka · Ontario'], ['City', 'Bengaluru · Toronto']];
    for (let i = 0; i < boxes.length; i++) {
      const x = M + i * 4.1;
      s.addText(boxes[i][0].toUpperCase(), { x, y: 1.95, w: 3.6, h: 0.3, fontFace: BODY, fontSize: 11, bold: true, color: C.muted, charSpacing: 1, margin: 0, isTextBox: true });
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 2.3, w: 3.6, h: 0.7, fill: { color: C.white }, line: { color: C.violet, width: 1.25 }, rectRadius: 0.1 });
      s.addText([{ text: boxes[i][1], options: { color: C.ink } }, { text: '   ▾', options: { color: C.muted } }], { x: x + 0.2, y: 2.3, w: 3.2, h: 0.7, fontFace: BODY, fontSize: 16, valign: 'middle', margin: 0, isTextBox: true });
      if (i < 2) s.addText('→', { x: x + 3.6, y: 2.3, w: 0.5, h: 0.7, fontFace: BODY, fontSize: 22, color: C.brand, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
    }
    const stats = [[String(data.locationCounts.indiaStates), 'Indian states & union territories'], [String(data.locationCounts.indiaCities), 'Indian cities built in'], [String(Object.values(data.locations.Canada).flat().length), 'Canadian cities in 13 provinces & territories']];
    stats.forEach(([v, l], i) => {
      const x = M + i * 2.75;
      s.addText(v, { x, y: 3.55, w: 2.5, h: 0.9, fontFace: HEAD, fontSize: 48, bold: true, color: C.violet, margin: 0, isTextBox: true });
      s.addText(l, { x, y: 4.45, w: 2.5, h: 0.6, fontFace: BODY, fontSize: 13, color: C.muted, margin: 0, valign: 'top', isTextBox: true });
    });
    const cx = M + 8.4;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: cx, y: 3.5, w: W - M - cx, h: 3.2, fill: { color: C.brandSoft }, line: { color: C.brandSoft }, rectRadius: 0.15 });
    s.addText('Not listed? Choose “Other”', { x: cx + 0.3, y: 3.7, w: W - M - cx - 0.6, h: 0.5, fontFace: HEAD, fontSize: 16, bold: true, color: C.brand, margin: 0, isTextBox: true });
    s.addText(
      [
        { text: 'Every dropdown has an Other option with a text box', options: { bullet: true, breakLine: true } },
        { text: 'Typed-in places still get cinemas, events and venues', options: { bullet: true, breakLine: true } },
        { text: '"Dinner in Pune" in a request overrides the picker', options: { bullet: true, breakLine: true } },
        { text: 'Abroad, ₹ prices also show the local currency (C$)', options: { bullet: true } },
      ],
      { x: cx + 0.3, y: 4.3, w: W - M - cx - 0.6, h: 2.3, fontFace: BODY, fontSize: 13, color: C.ink, paraSpaceAfter: 6, valign: 'top', margin: 0, isTextBox: true },
    );
    s.addText('Remembered per person; "Use my office city" resets it.', { x: M, y: 5.6, w: 7.8, h: 0.5, fontFace: BODY, fontSize: 13, italic: true, color: C.muted, margin: 0, isTextBox: true });
  }

  // 4. Movies & events
  {
    const s = pres.addSlide();
    s.background = { color: C.paper };
    title(s, 'Movies and events near you', 'Book tickets in the same app, for yourself, with family or friends, or for the team.');
    await circleIcon(s, 'film', M, 1.95, 0.6, C.brandSoft, C.brand);
    s.addText('Movies', { x: M + 0.8, y: 1.95, w: 5, h: 0.6, fontFace: HEAD, fontSize: 20, bold: true, color: C.ink, valign: 'middle', margin: 0, isTextBox: true });
    chev(s, ['Film (local language first)', 'Date & cinema', 'Show: 2D/3D/IMAX/Recliner', 'Seat map (up to 10)', 'Agents review', 'm-tickets'], 2.75);
    await circleIcon(s, 'ticket', M, 4.05, 0.6, C.brandSoft, C.brand);
    s.addText('Events near you', { x: M + 0.8, y: 4.05, w: 5, h: 0.6, fontFace: HEAD, fontSize: 20, bold: true, color: C.ink, valign: 'middle', margin: 0, isTextBox: true });
    chev(s, ['Music · sports · tech · comedy · theatre · food', 'Event, date & venue', 'Ticket tier', 'Quantity', 'Agents review', 'e-tickets'], 4.85);
    s.addText('Or just ask: "3 tickets for Orbit 9 IMAX tomorrow evening" · "Stand-up comedy with friends this weekend, split". Seats and prices are checked on the server, so a seat is never sold twice.', { x: M, y: 6.1, w: W - 2 * M, h: 0.7, fontFace: BODY, fontSize: 13, color: C.muted, margin: 0, isTextBox: true });
  }

  // 4b. Chat concierge + live data
  {
    const s = pres.addSlide();
    title(s, 'Just ask: the chat concierge', 'The opening screen is a chat. The agents do every step through to payment and the ticket.');
    const turns = [
      ['you', '“I’m planning to go for a movie today, can you check the theatres?”'],
      ['agent', 'Lists theatres near you (real cinemas from OpenStreetMap) with shows left today'],
      ['you', 'Taps a theatre'],
      ['agent', 'Shows each film and its showtimes; matches your time are highlighted'],
      ['you', '“2 tickets” → confirms the seats the agent preselected'],
      ['agent', 'Budget + Policy checks, then who pays → payment page (UPI / card / netbanking)'],
      ['agent', 'Books, sends the ticket, splits with the group, offers to file the expense'],
    ];
    turns.forEach(([who, t], i) => {
      const y = 1.85 + i * 0.68;
      const me = who === 'you';
      const w = 6.4;
      const x = me ? M + 1.2 : M;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 0.56, fill: { color: me ? C.violet : C.white }, line: { color: me ? C.violet : C.line, width: 0.75 }, rectRadius: 0.12 });
      s.addText(t, { x: x + 0.2, y, w: w - 0.4, h: 0.56, fontFace: BODY, fontSize: 12.5, color: me ? C.white : C.ink, valign: 'middle', margin: 0, isTextBox: true });
    });
    const sx = M + 8.0;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: sx, y: 1.85, w: W - M - sx, h: 4.7, fill: { color: C.paper }, line: { color: C.line, width: 0.75 }, rectRadius: 0.15 });
    s.addText('Live data, free APIs', { x: sx + 0.3, y: 2.0, w: W - M - sx - 0.6, h: 0.45, fontFace: HEAD, fontSize: 17, bold: true, color: C.ink, margin: 0, isTextBox: true });
    s.addText(
      [
        ['OpenStreetMap', 'real cinemas, restaurants, venues'],
        ['iTunes chart / TMDB', 'films and posters'],
        ['TheSportsDB', 'IPL, ISL, NHL, NBA, MLS, CFL fixtures'],
        ['Open-Meteo', 'weather'],
        ['Frankfurter', '₹ ↔ C$ rates'],
        ['Nager.Date', 'public holidays'],
      ].map(([a, b2], i, all) => ({ text: `${a}: ${b2}`, options: { bullet: true, breakLine: i < all.length - 1 } })),
      { x: sx + 0.3, y: 2.55, w: W - M - sx - 0.6, h: 3.0, fontFace: BODY, fontSize: 13, color: C.ink, paraSpaceAfter: 6, valign: 'top', margin: 0, isTextBox: true },
    );
    s.addText('Falls back to labelled sample data offline. Payments are a demo gateway.', { x: sx + 0.3, y: 5.65, w: W - M - sx - 0.6, h: 0.7, fontFace: BODY, fontSize: 11.5, italic: true, color: C.muted, margin: 0, isTextBox: true });
  }

  // 5. Four questions
  {
    const s = pres.addSlide();
    title(s, 'Every booking answers four questions', 'Visible to the requester, approvers and Finance, always.');
    const q = [
      ['user', 'Who booked it?', 'Requester, department, cost center and city are recorded on every booking and shown in every list.'],
      ['wallet', 'Who is spending how much?', 'Company-paid, reimbursable, personal and each person’s share of group spend, per person and per category.'],
      ['receipt', 'Which pot of money?', 'Department quarterly budget, personal monthly budget, or the lifestyle & wellbeing allowance.'],
      ['check', 'Who needs to approve?', 'An ordered chain (Manager, Department head, Compliance, Finance) built from policy; nobody approves their own spend.'],
    ];
    const cw = 5.9, ch = 2.25;
    for (let i = 0; i < 4; i++) {
      const x = M + (i % 2) * (cw + 0.33);
      const y = 1.95 + Math.floor(i / 2) * (ch + 0.3);
      card(s, x, y, cw, ch, 'FBFAFF');
      await circleIcon(s, q[i][0], x + 0.3, y + 0.35, 0.75);
      s.addText(q[i][1], { x: x + 1.3, y: y + 0.3, w: cw - 1.6, h: 0.55, fontFace: HEAD, fontSize: 20, bold: true, color: C.ink, margin: 0, isTextBox: true });
      s.addText(q[i][2], { x: x + 1.3, y: y + 0.9, w: cw - 1.6, h: 1.1, fontFace: BODY, fontSize: 14, color: C.muted, margin: 0, valign: 'top', isTextBox: true });
    }
  }

  // 6. Agent pipeline
  {
    const s = pres.addSlide();
    s.background = { color: C.paper };
    title(s, 'The agent pipeline', 'Each agent does one job and writes its reasoning to the booking’s trace.');
    const agents = [
      ['Concierge', 'Reads the request and city; picks show & seats, event & tier, or venue; prices it; suggests who pays'],
      ['Budget', 'Checks the department, personal or wellbeing budget'],
      ['Policy', 'Builds the approval chain; auto-approves low-risk spend'],
      ['Approval', 'Sends it to each approver in order; stops if anyone rejects'],
      ['Booking', 'Confirms and issues tickets; holds or releases seats'],
    ];
    const bw = 2.26, gap = 0.16, y = 2.0;
    agents.forEach(([n, d], i) => {
      const x = M + i * (bw + gap);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: bw, h: 2.4, fill: { color: i % 2 ? C.white : C.soft }, line: { color: C.line, width: 0.75 }, rectRadius: 0.15 });
      s.addShape(pres.shapes.OVAL, { x: x + 0.25, y: y + 0.25, w: 0.5, h: 0.5, fill: { color: C.violet }, line: { color: C.violet } });
      s.addText(String(i + 1), { x: x + 0.25, y: y + 0.25, w: 0.5, h: 0.5, align: 'center', valign: 'middle', fontFace: BODY, fontSize: 14, bold: true, color: C.white, margin: 0, isTextBox: true });
      s.addText(n + ' agent', { x: x + 0.25, y: y + 0.85, w: bw - 0.45, h: 0.45, fontFace: HEAD, fontSize: 16, bold: true, color: C.ink, margin: 0, isTextBox: true });
      s.addText(d, { x: x + 0.25, y: y + 1.3, w: bw - 0.45, h: 1.0, fontFace: BODY, fontSize: 12, color: C.muted, margin: 0, valign: 'top', isTextBox: true });
    });
    s.addText('Then, depending on who pays:', { x: M, y: 4.7, w: 6, h: 0.4, fontFace: BODY, fontSize: 14, bold: true, color: C.ink, margin: 0, isTextBox: true });
    const outs = [
      ['wallet', 'Company-paid', 'Charged to the cost center; the budget updates straight away.', C.soft, C.violet],
      ['users', 'Split agent', 'Shared bookings go to the family or friends ledger.', C.plumBg, C.plum],
      ['receipt', 'Expense agent', 'Personally-paid bookings become claimable expense reports.', C.amberBg, C.amber],
    ];
    for (let i = 0; i < outs.length; i++) {
      const [ic, n, d, bg, fg] = outs[i];
      const x = M + i * 4.1;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 5.2, w: 3.85, h: 1.5, fill: { color: bg }, line: { color: bg }, rectRadius: 0.15 });
      await circleIcon(s, ic, x + 0.25, 5.45, 0.6, C.white, fg);
      s.addText(n, { x: x + 1.05, y: 5.4, w: 2.6, h: 0.4, fontFace: HEAD, fontSize: 16, bold: true, color: fg, margin: 0, isTextBox: true });
      s.addText(d, { x: x + 1.05, y: 5.8, w: 2.65, h: 0.8, fontFace: BODY, fontSize: 12, color: C.ink, margin: 0, valign: 'top', isTextBox: true });
    }
    s.addNotes('The Concierge can use Claude for intake when an API key is configured; budget, policy and approval decisions are always plain code.');
  }

  // 7. Who pays
  {
    const s = pres.addSlide();
    title(s, 'Who pays? Four funding types', 'The Concierge suggests one from your wording. You can always change it before confirming.');
    const cols = [
      ['Company-paid', '"client dinner", "team movie night"', 'Per approval matrix', 'Cost center charged', C.soft, C.violet],
      ['Paid personally → expense report', '"I’ll pay and expense it", "reimburse me"', 'On the expense report', 'Claimable report → Finance / HR / Benefits', C.amberBg, C.amber],
      ['Personal', '"movie tonight", "on me"', 'None', 'Counts toward your personal monthly budget', 'F1F0F6', '4F4B6B'],
      ['Shared with family / friends', '"with my family", "with friends, split"', 'None', 'Posted to the group ledger; settle up by UPI', C.plumBg, C.plum],
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

  // 8. Approval matrix
  {
    const s = pres.addSlide();
    s.background = { color: C.paper };
    title(s, 'Approval matrix for company money', 'The more money involved, the more approvers it needs. Nobody approves their own spend.');
    const steps = [
      [`≤ ${inr(P.autoApproveLimit)}`, 'Auto-approved', 'Within budget and per-person caps'],
      [`> ${inr(P.autoApproveLimit)}`, '+ Manager', 'Confirms the business need'],
      [`> ${inr(P.managerLimit)} or over cap`, '+ Department head', 'The budget owner signs off'],
      [`> ${inr(P.deptHeadLimit)} or over budget`, '+ Finance (CFO)', 'Material or unbudgeted spend'],
    ];
    steps.forEach(([amt, who, why], i) => {
      const y = 1.95 + i * 1.18;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y, w: 7.9, h: 0.95, fill: { color: i === 0 ? C.soft : C.white }, line: { color: C.line, width: 0.75 }, rectRadius: 0.1 });
      s.addText(amt, { x: M + 0.2, y, w: 3.3, h: 0.95, fontFace: HEAD, fontSize: 16, bold: true, color: C.violet, valign: 'middle', margin: 0, isTextBox: true });
      s.addText([{ text: who, options: { bold: true, color: C.ink, breakLine: true } }, { text: why, options: { color: C.muted, fontSize: 12 } }], { x: M + 3.6, y, w: 4.1, h: 0.95, fontFace: BODY, fontSize: 14, valign: 'middle', margin: 0, isTextBox: true });
    });
    const sideX = W - M - 3.9;
    card(s, sideX, 1.95, 3.9, 4.55);
    await circleIcon(s, 'shield', sideX + 0.3, 2.2, 0.65);
    s.addText('Also triggers', { x: sideX + 1.1, y: 2.3, w: 2.6, h: 0.45, fontFace: HEAD, fontSize: 18, bold: true, color: C.ink, margin: 0, isTextBox: true });
    s.addText(
      [
        { text: 'Compliance for client-facing event tickets and client gifts', options: { bullet: true, breakLine: true } },
        { text: `Dept head when ₹/person exceeds the cap (Movies ${inr(P.perAttendeeCap.movies)}, Dining ${inr(P.perAttendeeCap.reservations)}, Events ${inr(P.perAttendeeCap.events)})`, options: { bullet: true, breakLine: true } },
        { text: 'If the approver is the requester, the chain moves to their manager', options: { bullet: true, breakLine: true } },
        { text: 'A rejection ends the chain and releases held seats', options: { bullet: true } },
      ],
      { x: sideX + 0.3, y: 3.05, w: 3.35, h: 3.3, fontFace: BODY, fontSize: 13, color: C.ink, paraSpaceAfter: 8, valign: 'top', margin: 0, isTextBox: true },
    );
  }

  // 9. Expense reports
  {
    const s = pres.addSlide();
    title(s, 'Spent your own money? Expense reports', 'The Expense agent drafts the report with receipts and routes it to the right team.');
    chev(s, ['Book as "paid personally"', 'Confirmed, receipt captured', 'Select bookings → submit', 'Routed by report type', 'Approved → reimbursed with payroll'], 1.95, 0.95, C.green);
    const lanes = [
      ['Client / business', 'Client lunch, prospect drinks', 'Manager → Finance', C.soft, C.violet],
      ['Team morale', 'Team drinks, celebrations, offsites', 'Manager → HR', C.greenBg, C.green],
      ['Wellbeing allowance', 'Cooking class, fitness, a concert for you', 'Benefits only · capped at your balance', C.amberBg, C.amber],
    ];
    lanes.forEach(([n, ex, chain, bg, fg], i) => {
      const x = M + i * 4.1;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 3.35, w: 3.85, h: 2.2, fill: { color: bg }, line: { color: bg }, rectRadius: 0.15 });
      s.addText(n, { x: x + 0.3, y: 3.55, w: 3.3, h: 0.45, fontFace: HEAD, fontSize: 19, bold: true, color: fg, margin: 0, isTextBox: true });
      s.addText(ex, { x: x + 0.3, y: 4.05, w: 3.3, h: 0.5, fontFace: BODY, fontSize: 13, color: C.muted, margin: 0, isTextBox: true });
      s.addText(chain, { x: x + 0.3, y: 4.65, w: 3.3, h: 0.7, fontFace: BODY, fontSize: 15, bold: true, color: C.ink, margin: 0, valign: 'top', isTextBox: true });
    });
    s.addText(`Guardrails: a booking can be claimed only once · only the owner submits · submit within ${P.reportSlaDays} business days · a claimed booking can’t be cancelled until its report is withdrawn.`, { x: M, y: 5.95, w: W - 2 * M, h: 0.7, fontFace: BODY, fontSize: 13, color: C.muted, margin: 0, isTextBox: true });
  }

  // 10. Splits
  {
    const s = pres.addSlide();
    s.background = { color: C.paper };
    title(s, 'Family & friends: split it like Splitwise', 'Shared bookings land in the group ledger automatically; add cabs or groceries by hand and settle up by UPI.');
    const grp = data.groups.find((g) => g.type === 'friends');
    const names = Object.fromEntries(data.people.map((p) => [p.id, p.name]));
    const bal = Object.fromEntries(grp.members.map((m) => [m, 0]));
    for (const e of data.groupExpenses.filter((x) => x.groupId === grp.id)) {
      bal[e.paidBy] += e.amount;
      for (const sh of e.shares) bal[sh.personId] -= sh.amount;
    }
    for (const st of data.settlements.filter((x) => x.groupId === grp.id)) {
      bal[st.from] += st.amount;
      bal[st.to] -= st.amount;
    }
    card(s, M, 1.95, 5.6, 4.75);
    await circleIcon(s, 'users', M + 0.3, 2.2, 0.65, C.plumBg, C.plum);
    s.addText(`${grp.name} (friends)`, { x: M + 1.1, y: 2.3, w: 4.2, h: 0.45, fontFace: HEAD, fontSize: 18, bold: true, color: C.ink, margin: 0, isTextBox: true });
    const rows = [[{ text: 'Member', options: { bold: true, color: C.muted } }, { text: 'Balance', options: { bold: true, color: C.muted, align: 'right' } }]];
    for (const m of grp.members) {
      const v = Math.round(bal[m] * 100) / 100;
      rows.push([{ text: names[m] }, { text: (v > 0 ? 'gets back ' : v < 0 ? 'owes ' : 'settled ') + inr(Math.abs(v)), options: { align: 'right', bold: true, color: v > 0 ? C.green : v < 0 ? 'C0392B' : C.muted } }]);
    }
    s.addTable(rows, { x: M + 0.3, y: 3.05, w: 5.0, colW: [2.6, 2.4], fontFace: BODY, fontSize: 14, color: C.ink, border: { type: 'solid', pt: 0.5, color: C.line }, rowH: 0.42 });
    const ledger = data.groupExpenses.filter((x) => x.groupId === grp.id).map((e) => `${e.description.split(' · ')[0]} ${inr(e.amount)} (${names[e.paidBy].split(' ')[0]})`);
    const settled = data.settlements.filter((x) => x.groupId === grp.id).map((x) => `${names[x.from].split(' ')[0]} paid ${names[x.to].split(' ')[0]} ${inr(x.amount)}`);
    s.addText(`Ledger: ${[...ledger, ...settled].join(' · ')}`, { x: M + 0.3, y: 5.35, w: 5.0, h: 1.15, fontFace: BODY, fontSize: 12, color: C.muted, margin: 0, valign: 'top', isTextBox: true });

    const mx = M + 6.0;
    s.addText('Four ways to split', { x: mx, y: 1.95, w: 6, h: 0.45, fontFace: HEAD, fontSize: 18, bold: true, color: C.ink, margin: 0, isTextBox: true });
    const methods = [['Equally', '₹3,000 ÷ 3 = ₹1,000 each'], ['Exact amounts', '₹1,500 / ₹1,000 / ₹500'], ['Percentages', '50% / 25% / 25%'], ['Shares', 'Adults 2, kids 1 → ₹1,500 / ₹750 / ₹750']];
    methods.forEach(([n, ex], i) => {
      const x = mx + (i % 2) * 3.1;
      const y = 2.5 + Math.floor(i / 2) * 1.25;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 2.95, h: 1.1, fill: { color: C.white }, line: { color: C.line, width: 0.75 }, rectRadius: 0.12 });
      s.addText([{ text: n, options: { bold: true, color: C.plum, breakLine: true } }, { text: ex, options: { color: C.ink, fontSize: 12 } }], { x: x + 0.2, y, w: 2.6, h: 1.1, fontFace: BODY, fontSize: 15, valign: 'middle', margin: 0, isTextBox: true });
    });
    s.addText(
      [
        { text: 'Exact to the paisa: shares always add up to the total', options: { bullet: true, breakLine: true } },
        { text: 'Settle-up suggests the fewest payments that bring everyone to zero', options: { bullet: true, breakLine: true } },
        { text: 'Your share counts toward your personal monthly budget', options: { bullet: true } },
      ],
      { x: mx, y: 5.1, w: 6.1, h: 1.5, fontFace: BODY, fontSize: 13, color: C.ink, paraSpaceAfter: 6, valign: 'top', margin: 0, isTextBox: true },
    );
  }

  // 11. Demo snapshot with native chart
  {
    const s = pres.addSlide();
    title(s, 'Demo snapshot: who is spending what', `${data.meta.period} · the agents run on 11 sample requests in Bengaluru, Mumbai and Hyderabad`);
    const LIVE = ['pending_approval', 'approved', 'confirmed'];
    const live = data.bookings.filter((b) => LIVE.includes(b.status));
    const company = live.filter((b) => b.funding === 'corporate').reduce((t, b) => t + b.amount, 0);
    const personal = live.filter((b) => b.funding !== 'corporate').reduce((t, b) => t + b.amount, 0);
    const pending = data.bookings.filter((b) => b.status === 'pending_approval').length + data.reports.filter((r) => r.status === 'submitted').length;
    const stats = [[inr(company), 'company-paid'], [inr(personal), 'personal, reimbursable & shared'], [String(pending), 'items awaiting approval']];
    stats.forEach(([v, l], i) => {
      const y = 1.95 + i * 1.55;
      s.addText(v, { x: M, y, w: 4.1, h: 0.85, fontFace: HEAD, fontSize: 40, bold: true, color: C.violet, margin: 0, isTextBox: true });
      s.addText(l, { x: M, y: y + 0.85, w: 4.1, h: 0.4, fontFace: BODY, fontSize: 13, color: C.muted, margin: 0, isTextBox: true });
    });
    const entries = Object.entries(data.categories);
    const labels = entries.map(([, c]) => c.label);
    const vals = entries.map(([k]) => live.filter((b) => b.category === k).reduce((t, b) => t + b.amount, 0));
    s.addChart(pres.charts.BAR, [{ name: 'Live spend (INR)', labels, values: vals }], {
      x: 4.9, y: 1.85, w: W - 4.9 - M, h: 4.9, barDir: 'bar',
      showTitle: true, title: 'Live spend by category (₹)', titleFontFace: BODY, titleFontSize: 14, titleColor: C.ink,
      chartColors: [C.violet], showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '#,##0', dataLabelFontSize: 11, dataLabelColor: C.ink,
      catAxisLabelColor: C.ink, catAxisLabelFontSize: 12, valAxisHidden: true, valGridLine: { style: 'none' }, catGridLine: { style: 'none' }, showLegend: false,
    });
  }

  // 12. Guardrails
  {
    const s = pres.addSlide();
    s.background = { color: C.paper };
    title(s, 'Controls & audit trail', 'The agents act on their own where it is safe; people decide where it matters.');
    const items = [
      ['shield', 'Deterministic decisions', 'Budget, policy and approval logic is plain code; Claude (optional) only turns text into a structured draft.'],
      ['seat', 'Server-checked tickets', 'Seat availability, ticket tiers and venue prices are recalculated on the server; a seat is never sold twice.'],
      ['check', 'Approvals in a fixed order', 'Only the current approver can act; no self-approval; a rejection stops the booking.'],
      ['receipt', 'No double claims', 'A booking can sit on one live expense report; claimed bookings can’t be cancelled.'],
      ['spark', 'Full trace', 'Every agent and human decision is time-stamped on the booking and in the Agent activity log.'],
    ];
    for (let i = 0; i < items.length; i++) {
      const y = 1.85 + i * 1.0;
      await circleIcon(s, items[i][0], M, y, 0.7);
      s.addText(items[i][1], { x: M + 1.0, y: y - 0.02, w: 10.5, h: 0.4, fontFace: HEAD, fontSize: 17, bold: true, color: C.ink, margin: 0, isTextBox: true });
      s.addText(items[i][2], { x: M + 1.0, y: y + 0.38, w: 11, h: 0.45, fontFace: BODY, fontSize: 14, color: C.muted, margin: 0, isTextBox: true });
    }
  }

  // 13. Closing
  {
    const s = pres.addSlide();
    s.background = { color: C.deep };
    s.addText('Try it', { x: M, y: 1.0, w: 8, h: 0.9, fontFace: HEAD, fontSize: 44, bold: true, color: C.white, margin: 0, isTextBox: true });
    s.addText(
      [
        { text: 'cd entertainment-os && npm start → http://localhost:4600', options: { bullet: true, breakLine: true } },
        { text: 'Type in the chat: “I’m planning to go for a movie today, check the theatres”', options: { bullet: true, breakLine: true } },
        { text: 'Set your city (India, Canada, or Other) with the location picker', options: { bullet: true, breakLine: true } },
        { text: 'Switch "Acting as" to play requester, manager, dept head, Compliance, Finance, HR or Benefits', options: { bullet: true, breakLine: true } },
        { text: 'npm test runs the agent test suite; set ANTHROPIC_API_KEY to let Claude read requests', options: { bullet: true, breakLine: true } },
        { text: 'Companion docs: Handbook (.docx) and Operations Workbook (.xlsx)', options: { bullet: true } },
      ],
      { x: M, y: 2.2, w: 11.5, h: 3.8, fontFace: BODY, fontSize: 18, color: 'E3E1FA', paraSpaceAfter: 12, valign: 'top', margin: 0, isTextBox: true },
    );
    s.addText('Online: real places, films and fixtures from free APIs. Offline: labelled sample data. Payments are simulated.', { x: M, y: 6.5, w: 11, h: 0.4, fontFace: BODY, fontSize: 12, color: 'A9A5D6', margin: 0, isTextBox: true });
  }

  const out = path.join(__dirname, 'Entertainment-OS-Overview.pptx');
  await pres.writeFile({ fileName: out });
  console.log('wrote', out);
})();
