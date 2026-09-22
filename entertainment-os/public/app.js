// Entertainment OS — single-page UI (vanilla JS, no build step).
const $ = (sel, root = document) => root.querySelector(sel);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const money = (n) => `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
const fmtDate = (d) => new Date(`${d}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
const fmtTime = (t) => new Date(t).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

const ICONS = {
  utensils: '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M16 3c-1.7 1.3-2.5 3.3-2.5 6 0 1.4.9 2.5 2.5 2.5V21"/>',
  glass: '<path d="M6 4h12l-6 8-6-8zM12 12v7M8 20h8"/>',
  cloche: '<path d="M4 17h16M5 17a7 7 0 0 1 14 0M12 7V5M10.5 5h3M3 20h18"/>',
  ticket: '<path d="M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4V7z"/><path d="M14 7v10" stroke-dasharray="2 2"/>',
  gift: '<rect x="4" y="9" width="16" height="11" rx="1"/><path d="M3 9h18M12 9v11M12 9c-2-4-6-4-6-1.5S10 9 12 9zm0 0c2-4 6-4 6-1.5S14 9 12 9z"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8 6.6 19.7l1.1-6.1-4.5-4.2 6.1-.8L12 3z"/>',
};
const icon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`;

const TABS = [
  ['home', 'Home'],
  ['bookings', 'Bookings'],
  ['approvals', 'Approvals'],
  ['expenses', 'Expense reports'],
  ['splits', 'Family & friends'],
  ['spend', 'Budgets & spend'],
  ['activity', 'Agent activity'],
];

const ui = { tab: 'home', actor: null, state: null, plan: null, bookingFilter: 'all' };
try {
  ui.actor = localStorage.getItem('eos.actor') || 'u-maya';
  ui.tab = localStorage.getItem('eos.tab') || 'home';
} catch {
  ui.actor = 'u-maya';
}

async function api(path, body) {
  const res = await fetch(path, {
    method: body ? 'POST' : 'GET',
    headers: { 'content-type': 'application/json', 'x-user': ui.actor },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function toast(msg, error = false) {
  const t = $('#toast');
  t.textContent = msg;
  t.className = `toast${error ? ' error' : ''}`;
  t.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => (t.hidden = true), 3500);
}

async function run(fn, okMsg) {
  try {
    const r = await fn();
    if (okMsg) toast(typeof okMsg === 'function' ? okMsg(r) : okMsg);
    await refresh();
    return r;
  } catch (e) {
    toast(e.message, true);
  }
}

const name = (id) => ui.state.people.find((p) => p.id === id)?.name || id;
const pill = (cls, label) => `<span class="pill ${esc(cls)}">${esc(label ?? cls.replace('_', ' '))}</span>`;
const fundingPill = (f) => pill(f, { corporate: 'Company', reimbursable: 'Reimbursable', personal: 'Personal', shared: 'Split' }[f]);
const statusLabel = { pending_approval: 'Awaiting approval', confirmed: 'Confirmed', approved: 'Approved', rejected: 'Rejected', cancelled: 'Cancelled', draft: 'Draft', submitted: 'Submitted', reimbursed: 'Reimbursed' };
const statusPill = (s) => pill(s, statusLabel[s] || s);
const stepsHtml = (steps) =>
  steps.length ? `<div class="steps">${steps.map((s) => `<span class="step ${esc(s.status)}" title="${esc(s.reason)}">${esc(s.role)} · ${esc(name(s.approverId).split(' ')[0])}</span>`).join('')}</div>` : '<span class="muted small">No approval needed</span>';

// ---------- rendering ----------
function renderShell() {
  const s = ui.state;
  $('#company').textContent = `${s.meta.company} · ${s.meta.period} · Intake: ${s.meta.llm ? 'Claude' : 'rule engine'}`;
  const inboxCount = s.inbox.bookings.length + s.inbox.reports.length;
  $('#tabs').innerHTML = TABS.map(([id, label]) => `<button data-tab="${id}" class="${ui.tab === id ? 'active' : ''}">${label}${id === 'approvals' && inboxCount ? `<span class="badge">${inboxCount}</span>` : ''}</button>`).join('');
  const sel = $('#actor');
  sel.innerHTML = s.people.filter((p) => p.employee).map((p) => `<option value="${p.id}" ${p.id === ui.actor ? 'selected' : ''}>${esc(p.name)} — ${esc(p.title)}</option>`).join('');
}

function kpis() {
  const k = ui.state.kpis;
  const items = [
    [k.bookings, 'Live bookings'],
    [money(k.companySpend), 'Company spend'],
    [money(k.personalSpend), 'Personal & shared spend'],
    [k.pendingApprovals, 'Awaiting approval'],
    [money(k.reimbursed), 'Reimbursed to staff'],
  ];
  return `<div class="kpis">${items.map(([v, l]) => `<div class="kpi"><div class="v">${esc(v)}</div><div class="l">${esc(l)}</div></div>`).join('')}</div>`;
}

function viewHome() {
  const s = ui.state;
  const cats = Object.entries(s.categories)
    .map(([id, c]) => {
      const st = s.byCategory.find((x) => x.id === id);
      return `<button class="card cat-card" data-example="${esc(c.example)}">
        <div class="icon-tile">${icon(c.icon)}</div>
        <h3>${esc(c.label)}</h3>
        <div class="example">${esc(c.example)}</div>
        <div class="stat">${st.count} live · ${money(st.total)}</div>
      </button>`;
    })
    .join('');
  return `
    <div class="hero">
      <div><h1>What are we planning, ${esc(s.me.name.split(' ')[0])}?</h1>
      <p class="muted">Describe it in plain words. The agents price it, check budget, pick the funding, route approvals and handle the split or expense report.</p></div>
      <form class="prompt" id="prompt-form">
        <input id="prompt" placeholder="e.g. Client dinner for 4 tonight · Giants tickets with friends Sunday, split · Spa day on my wellbeing stipend, reimburse me" value="${esc(ui.promptText || '')}" />
        <button class="btn primary">Plan it</button>
      </form>
    </div>
    ${ui.plan ? viewPlan() : ''}
    ${kpis()}
    <div class="grid grid-3">${cats}</div>`;
}

function viewPlan() {
  const { draft, budget, approvals, policyNotes } = ui.plan;
  const s = ui.state;
  const myGroups = s.groups.filter((g) => g.members.includes(ui.actor));
  const opt = (v, cur, label) => `<option value="${esc(v)}" ${v === cur ? 'selected' : ''}>${esc(label)}</option>`;
  return `
  <div class="plan">
    <div class="card">
      <div class="section-head"><h2>Booking draft</h2><span class="muted small">Edit anything, then run the agents</span></div>
      <form class="form" id="draft-form">
        <label class="field wide">Title<input name="title" value="${esc(draft.title)}" required /></label>
        <label class="field">Category<select name="category">${Object.entries(s.categories).map(([k, c]) => opt(k, draft.category, c.label)).join('')}</select></label>
        <label class="field">Vendor<input name="vendor" value="${esc(draft.vendor)}" /></label>
        <label class="field">Date<input type="date" name="date" value="${esc(draft.date)}" /></label>
        <label class="field">Guests / recipients<input type="number" min="1" name="partySize" value="${esc(draft.partySize)}" /></label>
        <label class="field">Amount (USD)<input type="number" min="1" step="0.01" name="amount" value="${esc(draft.amount)}" /></label>
        <label class="field">Who pays?<select name="funding">${Object.entries(s.funding).map(([k, l]) => opt(k, draft.funding, l)).join('')}</select></label>
        <label class="field">Purpose<select name="purpose">${[['business', 'Client / business'], ['morale', 'Team morale / offsite'], ['wellbeing', 'Wellbeing stipend'], ['personal', 'Personal']].map(([k, l]) => opt(k, draft.purpose, l)).join('')}</select></label>
        <label class="field">Client-facing?<select name="clientFacing">${opt('true', String(draft.clientFacing), 'Yes')}${opt('false', String(draft.clientFacing), 'No')}</select></label>
        <label class="field">Split with group<select name="groupId"><option value="">—</option>${myGroups.map((g) => opt(g.id, draft.groupId, `${g.name} (${g.type})`)).join('')}</select></label>
        <label class="field">Split method<select name="splitMethod">${['equal', 'shares'].map((m) => opt(m, 'equal', m)).join('')}</select></label>
        <div class="field wide row"><button class="btn primary">Confirm & run agents</button><button type="button" class="btn" id="discard-plan">Discard</button></div>
      </form>
    </div>
    <div class="grid">
      <div class="card">
        <h3>Budget agent</h3>
        <p class="muted small">${esc(budget.pot.name)}</p>
        <div class="bar ${esc(budget.status)}"><span style="width:${Math.min(100, Math.max(0, budget.pot.limit ? ((budget.pot.limit - budget.pot.after) / budget.pot.limit) * 100 : 0))}%"></span></div>
        <p class="note ${esc(budget.status)}">${budget.notes.map(esc).join('<br>')}</p>
      </div>
      <div class="card">
        <h3>Policy agent</h3>
        <p class="small muted">${policyNotes.map(esc).join(' ')}</p>
        ${approvals.length ? `<ol class="small">${approvals.map((a) => `<li><b>${esc(a.role)}</b> — ${esc(a.approverName)}<br><span class="muted">${esc(a.reason)}</span></li>`).join('')}</ol>` : pill('ok', 'Auto-approved')}
      </div>
      <div class="card"><h3>Concierge agent</h3><ul class="reasons">${draft.reasoning.map((r) => `<li>${esc(r)}</li>`).join('')}</ul></div>
    </div>
  </div>`;
}

function bookingRows(list) {
  if (!list.length) return '<div class="empty">No bookings yet.</div>';
  return `<div class="table-wrap"><table>
    <thead><tr><th>Booking</th><th>Booked by</th><th>Date</th><th class="num">Amount</th><th>Paid by</th><th>Approvals</th><th>Status</th></tr></thead>
    <tbody>${list
      .map(
        (b) => `<tr class="clickable" data-booking="${esc(b.id)}">
        <td><b>${esc(b.title)}</b><div class="small muted">${esc(b.id)} · ${esc(b.categoryLabel)} · ${esc(b.vendor)} · ${esc(b.partySize)} guests</div></td>
        <td>${esc(name(b.bookedBy))}</td>
        <td>${fmtDate(b.date)}</td>
        <td class="num">${money(b.amount)}</td>
        <td>${fundingPill(b.funding)}${b.groupId ? `<div class="small muted">${esc(ui.state.groups.find((g) => g.id === b.groupId)?.name || '')}</div>` : ''}</td>
        <td>${stepsHtml(b.approvals)}</td>
        <td>${statusPill(b.status)}</td></tr>`,
      )
      .join('')}</tbody></table></div>`;
}

function viewBookings() {
  const s = ui.state;
  const f = ui.bookingFilter;
  const list = s.bookings.filter((b) => f === 'all' || (f === 'mine' && b.bookedBy === ui.actor) || b.funding === f);
  const filters = [['all', 'All'], ['mine', 'Booked by me'], ['corporate', 'Company'], ['reimbursable', 'Reimbursable'], ['shared', 'Split'], ['personal', 'Personal']];
  return `<div class="section-head"><h1>Bookings</h1><div class="row">${filters.map(([k, l]) => `<button class="btn sm ${f === k ? 'primary' : ''}" data-filter="${k}">${l}</button>`).join('')}</div></div>
  <div class="card">${bookingRows(list)}</div>`;
}

function viewApprovals() {
  const { bookings, reports } = ui.state.inbox;
  const card = (item, kind) => {
    const stepNow = item.approvals.find((x) => x.status === 'pending');
    const title = kind === 'booking' ? item.title : `Expense report ${item.id} · ${item.purposeLabel}`;
    const who = kind === 'booking' ? item.bookedBy : item.ownerId;
    const amt = kind === 'booking' ? item.amount : item.claimable;
    return `<div class="card">
      <div class="row"><h3>${esc(title)}</h3><span class="spacer"></span><b>${money(amt)}</b></div>
      <p class="small muted">${esc(item.id)} · requested by ${esc(name(who))}${kind === 'booking' ? ` · ${esc(item.categoryLabel)} · ${fmtDate(item.date)} · ${esc(item.partySize)} guests · ${esc(item.budget?.pot?.name || '')}` : ` · ${item.lines.length} line(s)`}</p>
      <p class="note warn small">You are approving as <b>${esc(stepNow.role)}</b>: ${esc(stepNow.reason)}</p>
      ${kind === 'booking' && item.budget ? `<p class="small muted">${item.budget.notes.map(esc).join(' ')}</p>` : ''}
      ${stepsHtml(item.approvals)}
      <div class="row" style="margin-top:12px"><input class="field" style="flex:1;padding:8px 10px;border:1px solid var(--line);border-radius:10px" placeholder="Note (optional)" data-note="${esc(item.id)}" />
      <button class="btn primary" data-decide="approve" data-id="${esc(item.id)}">Approve</button>
      <button class="btn danger" data-decide="reject" data-id="${esc(item.id)}">Reject</button>
      <button class="btn" data-open="${esc(item.id)}">Details</button></div>
    </div>`;
  };
  const all = [...bookings.map((b) => card(b, 'booking')), ...reports.map((r) => card(r, 'report'))];
  return `<div class="section-head"><h1>Approvals inbox</h1><span class="muted">Items waiting on ${esc(ui.state.me.name)}</span></div>
    ${all.length ? `<div class="grid grid-2">${all.join('')}</div>` : '<div class="card empty">Nothing is waiting on you. Switch “Acting as” to a manager, department head, Compliance, Finance, HR or Benefits to see their queue.</div>'}`;
}

function viewExpenses() {
  const s = ui.state;
  const mine = s.reports.filter((r) => r.ownerId === ui.actor);
  const others = s.reports.filter((r) => r.ownerId !== ui.actor);
  const reportCard = (r) => `<tr class="clickable" data-open="${esc(r.id)}">
    <td><b>${esc(r.id)}</b><div class="small muted">${esc(r.lines.map((l) => l.description).join('; '))}</div></td>
    <td>${esc(name(r.ownerId))}</td><td>${esc(r.purposeLabel)}</td><td>${esc(r.routeTo || '—')}</td>
    <td class="num">${money(r.claimable)}</td><td>${stepsHtml(r.approvals)}</td><td>${statusPill(r.status)}${r.status === 'draft' && r.ownerId === ui.actor ? ` <button class="btn sm primary" data-submit="${esc(r.id)}">Submit</button>` : ''}</td></tr>`;
  const table = (rows) => (rows.length ? `<div class="table-wrap"><table><thead><tr><th>Report</th><th>Owner</th><th>Type</th><th>Routed to</th><th class="num">Claim</th><th>Approvals</th><th>Status</th></tr></thead><tbody>${rows.map(reportCard).join('')}</tbody></table></div>` : '<div class="empty">No reports.</div>');
  return `<div class="section-head"><h1>Expense reports</h1><span class="muted">Spent your own money? The Expense agent builds the report and routes it to Finance, HR or Benefits.</span></div>
  <div class="grid grid-2 section">
    <div class="card">
      <h3>Claim personally-paid bookings</h3>
      ${
        s.claimable.length
          ? `<form id="report-form">${s.claimable.map((b) => `<label class="balance-row"><span><input type="checkbox" name="b" value="${esc(b.id)}" checked /> ${esc(b.title)} <span class="muted small">${fmtDate(b.date)} · ${esc(b.purpose)}</span></span><b>${money(b.amount)}</b></label>`).join('')}
          <div class="form" style="margin-top:12px"><label class="field">Report type<select name="purpose"><option value="">Auto-detect</option><option value="business">Client / business → Finance</option><option value="morale">Team morale → HR</option><option value="wellbeing">Wellbeing stipend → Benefits</option></select></label>
          <label class="field">Business purpose / notes<input name="notes" placeholder="Who, why" /></label></div>
          <div class="row" style="margin-top:12px"><button class="btn" name="mode" value="draft">Save draft</button><button class="btn primary" name="mode" value="submit">Create & submit</button></div></form>`
          : '<p class="muted">No confirmed reimbursable bookings to claim. Book something with “Paid personally → expense report”.</p>'
      }
    </div>
    <div class="card"><h3>How routing works</h3>
      <ul class="reasons">
        <li><b>Client / business</b>: Manager → Finance</li>
        <li><b>Team morale, celebrations, offsites</b>: Manager → HR</li>
        <li><b>Wellbeing stipend</b>: Benefits only; capped at your stipend balance (${money(s.me.stipendBalance)} left)</li>
        <li>Nobody approves their own spend — the Policy agent escalates up the chain.</li>
      </ul></div>
  </div>
  <div class="section"><h2 style="margin-bottom:10px">My reports</h2><div class="card">${table(mine)}</div></div>
  <div class="section"><h2 style="margin-bottom:10px">Company reports</h2><div class="card">${table(others)}</div></div>`;
}

function viewSplits() {
  const s = ui.state;
  const nonMembers = s.people.filter((p) => p.id !== ui.actor);
  const groupCard = (g) => {
    const opts = g.members.map((m) => `<option value="${esc(m)}" ${m === ui.actor ? 'selected' : ''}>${esc(g.memberNames[m])}</option>`).join('');
    return `<div class="card">
      <div class="row"><h2>${esc(g.name)}</h2>${pill(g.type === 'family' ? 'shared' : 'info', g.type)}<span class="spacer"></span><span class="muted small">Total spent ${money(g.total)}</span></div>
      <div class="grid grid-2" style="margin-top:14px">
        <div><h3>Balances</h3>${g.members.map((m) => `<div class="balance-row"><span>${esc(g.memberNames[m])}</span><span class="${g.balances[m] > 0 ? 'pos' : g.balances[m] < 0 ? 'neg' : 'muted'}">${g.balances[m] > 0 ? 'gets back ' : g.balances[m] < 0 ? 'owes ' : 'settled '}${money(Math.abs(g.balances[m]))}</span></div>`).join('')}</div>
        <div><h3>Settle up <span class="muted small">(fewest payments)</span></h3>${g.settleUp.length ? g.settleUp.map((t) => `<div class="transfer"><span>${esc(g.memberNames[t.from])} → ${esc(g.memberNames[t.to])} <b>${money(t.amount)}</b></span><button class="btn sm" data-settle='${esc(JSON.stringify({ g: g.id, ...t }))}'>Record</button></div>`).join('') : '<p class="muted">All settled 🎉</p>'}</div>
      </div>
      <h3 style="margin-top:16px">Add an expense</h3>
      <form class="form" data-expense="${esc(g.id)}">
        <label class="field">Description<input name="description" required placeholder="Dinner, tickets, Uber…" /></label>
        <label class="field">Amount<input name="amount" type="number" step="0.01" min="0.01" required /></label>
        <label class="field">Paid by<select name="paidBy">${opts}</select></label>
        <label class="field">Split<select name="method"><option value="equal">Equally</option><option value="exact">Exact amounts</option><option value="percent">Percentages</option><option value="shares">Shares</option></select></label>
        <div class="field wide"><span>Per-person values (for exact / percent / shares)</span><div class="row">${g.members.map((m) => `<label class="small">${esc(g.memberNames[m].split(' ')[0])} <input name="w_${esc(m)}" type="number" step="0.01" style="width:80px;padding:6px;border:1px solid var(--line);border-radius:8px" /></label>`).join('')}</div></div>
        <div class="field wide"><button class="btn primary">Add & split</button></div>
      </form>
      <h3 style="margin-top:16px">History</h3>
      ${[...g.expenses.map((e) => ({ t: e.createdAt, html: `<div class="balance-row"><span>${esc(e.description)} <span class="muted small">paid by ${esc(g.memberNames[e.paidBy])} · ${esc(e.method)}${e.bookingId ? ` · ${esc(e.bookingId)}` : ''}</span></span><b>${money(e.amount)}</b></div>` })), ...g.settlements.map((x) => ({ t: x.at, html: `<div class="balance-row"><span class="muted">${esc(g.memberNames[x.from])} paid ${esc(g.memberNames[x.to])}</span><span class="pos">${money(x.amount)}</span></div>` }))]
        .sort((a, b) => (a.t < b.t ? 1 : -1))
        .map((x) => x.html)
        .join('') || '<p class="muted">No expenses yet.</p>'}
    </div>`;
  };
  const mine = s.groups.filter((g) => g.members.includes(ui.actor));
  return `<div class="section-head"><h1>Family & friends</h1><span class="muted">Splitwise-style: shared bookings land here automatically; add anything else by hand.</span></div>
    <div class="grid section">${mine.length ? mine.map(groupCard).join('') : '<div class="card empty">You are not in any groups yet.</div>'}</div>
    <div class="card"><h3>New group</h3>
      <form class="form" id="group-form">
        <label class="field">Name<input name="name" required placeholder="Ski trip crew" /></label>
        <label class="field">Type<select name="type"><option value="friends">Friends</option><option value="family">Family</option></select></label>
        <div class="field wide"><span>Members</span><div class="row">${nonMembers.map((p) => `<label class="small"><input type="checkbox" name="m" value="${esc(p.id)}" /> ${esc(p.name)}</label>`).join('')}</div></div>
        <div class="field wide"><button class="btn primary">Create group</button></div>
      </form></div>`;
}

function viewSpend() {
  const s = ui.state;
  const depts = s.departments
    .map((d) => {
      const cls = d.utilisation > 100 ? 'over' : d.utilisation > 85 ? 'warn' : '';
      return `<div class="card"><div class="row"><h3>${esc(d.name)}</h3><span class="spacer"></span><span class="muted small">${esc(d.costCenter)}</span></div>
      <p class="small muted">Head: ${esc(d.headName)} · Quarterly budget ${money(d.quarterlyBudget)}</p>
      <div class="bar ${cls}"><span style="width:${Math.min(100, d.utilisation)}%"></span></div>
      <p class="small">${money(d.committed)} committed · <b>${money(d.remaining)}</b> left (${d.utilisation}%)</p></div>`;
    })
    .join('');
  const rows = s.spend
    .map(
      (r) => `<tr><td><b>${esc(r.name)}</b><div class="small muted">${esc(r.title)}</div></td><td class="num">${r.bookings}</td><td class="num">${money(r.company)}</td><td class="num">${money(r.reimbursable)}</td><td class="num">${money(r.personal)}</td><td class="num">${money(r.sharedPaid)}</td><td class="num">${money(r.sharedShare)}</td><td class="num"><b>${money(r.outOfPocket)}</b></td></tr>`,
    )
    .join('');
  const cats = s.byCategory.map((c) => `<div class="kpi"><div class="v">${money(c.total)}</div><div class="l">${esc(c.label)} · ${c.count}</div></div>`).join('');
  return `<div class="section-head"><h1>Budgets & spend</h1><span class="muted">${esc(s.meta.period)}</span></div>
  <div class="grid grid-4 section">${depts}</div>
  <div class="section"><h2 style="margin-bottom:10px">Who is spending how much</h2><div class="card table-wrap"><table>
    <thead><tr><th>Person</th><th class="num">Bookings</th><th class="num">Company-paid</th><th class="num">Reimbursable</th><th class="num">Personal</th><th class="num">Paid for groups</th><th class="num">Own group share</th><th class="num">Out of pocket</th></tr></thead>
    <tbody>${rows}</tbody></table></div></div>
  <div class="section"><h2 style="margin-bottom:10px">By category</h2><div class="grid grid-3">${cats}</div></div>
  <div class="card"><h3>Approval matrix</h3><ul class="reasons">
    <li>Up to ${money(s.policy.autoApproveLimit)} and within budget: auto-approved by the Policy agent</li>
    <li>Above ${money(s.policy.autoApproveLimit)}: Manager</li>
    <li>Above ${money(s.policy.managerLimit)} or over per-attendee cap: + Department head</li>
    <li>Above ${money(s.policy.deptHeadLimit)} or over department budget: + Finance (CFO)</li>
    <li>Client-facing sports tickets and gifts: + Compliance</li>
    <li>Per-attendee caps: ${Object.entries(s.policy.perAttendeeCap).map(([k, v]) => `${esc(s.categories[k].label)} ${money(v)}`).join(' · ')}</li></ul></div>`;
}

function viewActivity() {
  const items = ui.state.activity.map((a) => `<li><span class="agent" style="font-weight:600;color:var(--tile-ink)">${esc(a.agent)}</span><span>${esc(a.message)}</span><span class="muted small">${fmtTime(a.at)}</span></li>`).join('');
  return `<div class="section-head"><h1>Agent activity</h1><button class="btn sm" id="reload-demo">Reset demo data</button></div><div class="card"><ul class="feed">${items}</ul></div>`;
}

function openDrawer(id) {
  const s = ui.state;
  const b = s.bookings.find((x) => x.id === id);
  const r = s.reports.find((x) => x.id === id);
  const item = b || r;
  if (!item) return;
  const timeline = `<h3 style="margin-top:20px">Agent trace</h3><ul class="timeline">${item.trace.map((t) => `<li><span class="agent">${esc(t.agent)}</span><span>${esc(t.message)}<div class="small muted">${fmtTime(t.at)}</div></span></li>`).join('')}</ul>`;
  let html;
  if (b) {
    html = `<h2>${esc(b.title)}</h2><div class="row" style="margin-top:8px">${statusPill(b.status)} ${fundingPill(b.funding)}</div>
    <dl class="kv"><dt>Booking</dt><dd>${esc(b.id)}${b.confirmation ? ` · conf. ${esc(b.confirmation)}` : ''}</dd>
    <dt>Category</dt><dd>${esc(b.categoryLabel)}</dd><dt>Vendor</dt><dd>${esc(b.vendor)}</dd><dt>Date</dt><dd>${fmtDate(b.date)}</dd>
    <dt>Guests</dt><dd>${esc(b.partySize)}</dd><dt>Amount</dt><dd>${money(b.amount)}</dd><dt>Booked by</dt><dd>${esc(name(b.bookedBy))}</dd>
    <dt>Purpose</dt><dd>${esc(b.purpose)}${b.clientFacing ? ' · client-facing' : ''}</dd><dt>Charged to</dt><dd>${esc(b.budget?.pot?.name || '')}</dd>
    ${b.funding === 'shared' ? `<dt>Split between</dt><dd>${b.attendees.map((a) => esc(name(a))).join(', ')}</dd>` : ''}
    <dt>Approvals</dt><dd>${stepsHtml(b.approvals)}</dd></dl>
    ${b.bookedBy === ui.actor && !['cancelled', 'rejected'].includes(b.status) ? `<button class="btn danger" data-cancel="${esc(b.id)}">Cancel booking</button>` : ''}`;
  } else {
    html = `<h2>Expense report ${esc(r.id)}</h2><div class="row" style="margin-top:8px">${statusPill(r.status)} ${pill('info', r.routeTo ? `→ ${r.routeTo}` : 'not routed')}</div>
    <dl class="kv"><dt>Owner</dt><dd>${esc(name(r.ownerId))}</dd><dt>Type</dt><dd>${esc(r.purposeLabel)}</dd><dt>Total</dt><dd>${money(r.total)}</dd><dt>Claimable</dt><dd>${money(r.claimable)}</dd><dt>Notes</dt><dd>${esc(r.notes || '—')}</dd><dt>Approvals</dt><dd>${stepsHtml(r.approvals)}</dd></dl>
    ${r.warnings.map((w) => `<p class="note warn small">${esc(w)}</p>`).join('')}
    <table><thead><tr><th>Date</th><th>Line</th><th class="num">Amount</th></tr></thead><tbody>${r.lines.map((l) => `<tr><td>${fmtDate(l.date)}</td><td>${esc(l.description)}<div class="small muted">${esc(l.vendor)} · ${esc(l.category)} · 📎 ${esc(l.receipt)}</div></td><td class="num">${money(l.amount)}</td></tr>`).join('')}</tbody></table>`;
  }
  $('#drawer-body').innerHTML = html + timeline;
  $('#drawer').hidden = false;
}

function render() {
  renderShell();
  const views = { home: viewHome, bookings: viewBookings, approvals: viewApprovals, expenses: viewExpenses, splits: viewSplits, spend: viewSpend, activity: viewActivity };
  $('#view').innerHTML = (views[ui.tab] || viewHome)();
}

async function refresh() {
  ui.state = await api('/api/state');
  render();
}

// ---------- events ----------
document.addEventListener('click', async (e) => {
  const t = e.target.closest('button, tr[data-booking], tr[data-open]');
  if (!t) return;
  if (t.dataset.tab) {
    ui.tab = t.dataset.tab;
    try { localStorage.setItem('eos.tab', ui.tab); } catch {}
    return render();
  }
  if (t.classList.contains('cat-card')) {
    ui.promptText = t.dataset.example.replace(' · ', ' ');
    render();
    return $('#prompt').focus();
  }
  if (t.dataset.filter) {
    ui.bookingFilter = t.dataset.filter;
    return render();
  }
  if (t.dataset.booking) return openDrawer(t.dataset.booking);
  if (t.dataset.open) return openDrawer(t.dataset.open);
  if (t.id === 'drawer-close') return ($('#drawer').hidden = true);
  if (t.id === 'discard-plan') {
    ui.plan = null;
    return render();
  }
  if (t.dataset.decide) {
    const note = $(`[data-note="${t.dataset.id}"]`)?.value;
    return run(() => api(`/api/decisions/${t.dataset.id}`, { decision: t.dataset.decide, note }), (r) => `${r.id} → ${statusLabel[r.status] || r.status}`);
  }
  if (t.dataset.submit) return run(() => api(`/api/reports/${t.dataset.submit}/submit`, {}), (r) => `${r.id} submitted to ${r.routeTo}`);
  if (t.dataset.cancel) {
    $('#drawer').hidden = true;
    return run(() => api(`/api/bookings/${t.dataset.cancel}/cancel`, {}), 'Booking cancelled');
  }
  if (t.dataset.settle) {
    const x = JSON.parse(t.dataset.settle);
    return run(() => api(`/api/groups/${x.g}/settle`, { from: x.from, to: x.to, amount: x.amount }), 'Payment recorded');
  }
  if (t.id === 'reload-demo') return run(() => api('/api/demo', {}), 'Demo data reloaded');
});

document.addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  const fd = new FormData(f);
  if (f.id === 'prompt-form') {
    ui.promptText = $('#prompt').value;
    if (!ui.promptText.trim()) return;
    try {
      ui.plan = await api('/api/agent/plan', { text: ui.promptText });
      render();
    } catch (err) {
      toast(err.message, true);
    }
  } else if (f.id === 'draft-form') {
    const body = Object.fromEntries(fd);
    body.clientFacing = body.clientFacing === 'true';
    body.reasoning = ui.plan.draft.reasoning;
    if (body.funding === 'shared' && !body.groupId) return toast('Pick a group to split with', true);
    if (body.funding !== 'shared') body.groupId = null;
    const b = await run(() => api('/api/bookings', body), (r) => `${r.id}: ${statusLabel[r.status]}`);
    if (b) {
      ui.plan = null;
      ui.promptText = '';
      ui.tab = 'bookings';
      render();
      openDrawer(b.id);
    }
  } else if (f.id === 'report-form') {
    const bookingIds = fd.getAll('b');
    const submit = e.submitter?.value === 'submit';
    await run(() => api('/api/reports', { bookingIds, purpose: fd.get('purpose') || undefined, notes: fd.get('notes'), submit }), (r) => (submit ? `${r.id} submitted to ${r.routeTo}` : `${r.id} saved as draft`));
  } else if (f.dataset.expense) {
    const g = ui.state.groups.find((x) => x.id === f.dataset.expense);
    const weights = {};
    for (const m of g.members) if (fd.get(`w_${m}`)) weights[m] = Number(fd.get(`w_${m}`));
    await run(() => api(`/api/groups/${g.id}/expenses`, { description: fd.get('description'), amount: fd.get('amount'), paidBy: fd.get('paidBy'), method: fd.get('method'), weights }), 'Expense split');
  } else if (f.id === 'group-form') {
    await run(() => api('/api/groups', { name: fd.get('name'), type: fd.get('type'), members: fd.getAll('m') }), 'Group created');
  }
});

$('#actor').addEventListener('change', (e) => {
  ui.actor = e.target.value;
  ui.plan = null;
  try { localStorage.setItem('eos.actor', ui.actor); } catch {}
  refresh();
});

refresh().catch((e) => toast(e.message, true));
