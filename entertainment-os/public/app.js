// Entertainment OS — single-page UI (vanilla JS, no build step).
const $ = (sel, root = document) => root.querySelector(sel);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const dt = (d) => new Date(`${d}T12:00:00`);
const fmtDate = (d) => dt(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
const fmtTime = (t) => new Date(t).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
const hhmm = (t) => {
  const [h, m] = t.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
};
const todayISO = () => new Date().toISOString().slice(0, 10);
const addDays = (iso, n) => new Date(Date.parse(iso) + n * 86400000).toISOString().slice(0, 10);

const ICON = {
  home: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/>',
  film: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
  ticket: '<path d="M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4V7z"/><path d="M14 7v10" stroke-dasharray="2 2"/>',
  utensils: '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M16 3c-1.7 1.3-2.5 3.3-2.5 6 0 1.4.9 2.5 2.5 2.5V21"/>',
  glass: '<path d="M6 4h12l-6 8-6-8zM12 12v7M8 20h8"/>',
  cloche: '<path d="M4 17h16M5 17a7 7 0 0 1 14 0M12 7V5M10.5 5h3M3 20h18"/>',
  gift: '<rect x="4" y="9" width="16" height="11" rx="1"/><path d="M3 9h18M12 9v11M12 9c-2-4-6-4-6-1.5S10 9 12 9zm0 0c2-4 6-4 6-1.5S14 9 12 9z"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2z"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z"/><path d="M9 8h6M9 12h6"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.8"/><path d="M16 14.2a5.5 5.5 0 0 1 6 5.8"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  wallet: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 15h2"/>',
  shield: '<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3z"/><path d="m9 12 2 2 4-4"/>',
  bot: '<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 4v4M9 14h.01M15 14h.01"/>',
};
const icon = (n, cls = 'i') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICON[n] || ''}</svg>`;

const NAV = [
  ['discover', 'Discover', 'home'],
  ['movies', 'Movies', 'film'],
  ['events', 'Events near you', 'ticket'],
  ['venues', 'Dining & venues', 'utensils'],
  'sep',
  ['bookings', 'Bookings', 'list'],
  ['approvals', 'Approvals', 'check'],
  ['expenses', 'Expense reports', 'receipt'],
  ['splits', 'Family & friends', 'users'],
  ['spend', 'Budgets & spend', 'chart'],
  ['activity', 'Agent activity', 'spark'],
];
const SUGGESTIONS = ['2 tickets for Orbit 9 IMAX tonight', 'Stand-up comedy with friends this weekend', 'Client dinner for 6 tomorrow', 'Tech conference passes for 3 for the team', 'Movie with my family Saturday evening', 'Diwali gift hampers for 40 clients'];

const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const ui = {
  tab: store.get('eos.tab', 'discover'),
  actor: store.get('eos.actor', 'u-ananya'),
  state: null,
  locations: null,
  discover: null,
  eventType: 'all',
  movieLang: 'all',
  movieDate: todayISO(),
  movie: null,
  showtimes: null,
  venueCat: 'reservations',
  bookingFilter: 'all',
  checkout: null,
};

async function api(path, body) {
  const res = await fetch(path, { method: body ? 'POST' : 'GET', headers: { 'content-type': 'application/json', 'x-user': ui.actor }, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}
function toast(msg, error = false) {
  const t = $('#toast');
  t.textContent = msg;
  t.className = `toast${error ? ' error' : ''}`;
  t.hidden = false;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => (t.hidden = true), 3800);
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

// ---------- location ----------
const loc = () => store.get(`eos.loc.${ui.actor}`, null) || ui.state?.me?.home || { country: 'India', state: 'Karnataka', city: 'Bengaluru' };
const locQS = () => new URLSearchParams(loc()).toString();
const locLabel = (l = loc()) => [l.city, l.state, l.country].filter(Boolean).join(', ');

function openLocation() {
  const cur = loc();
  const L = ui.locations;
  const countries = Object.keys(L);
  const isOther = (list, v) => v && !list.includes(v);
  const sel = { country: cur.country, state: cur.state, city: cur.city };
  const draw = () => {
    const cOther = isOther(countries, sel.country) || sel.country === '__other';
    const states = cOther ? [] : Object.keys(L[sel.country] || {});
    const sOther = cOther || isOther(states, sel.state) || sel.state === '__other';
    const cities = sOther ? [] : L[sel.country]?.[sel.state] || [];
    const ciOther = sOther || isOther(cities, sel.city) || sel.city === '__other';
    const opt = (v, cur, label = v) => `<option value="${esc(v)}" ${v === cur ? 'selected' : ''}>${esc(label)}</option>`;
    $('#modal-body').innerHTML = `
      <h2>Where are you?</h2>
      <p class="muted">Movies, events and venues are shown for this city. Can’t find your place? Choose <b>Other</b> and type it in.</p>
      <form id="loc-form" class="grid" style="gap:14px">
        <label class="field">Country
          <select name="country">${countries.map((c) => opt(c, cOther ? '' : sel.country)).join('')}${opt('__other', cOther ? '__other' : '', 'Other…')}</select>
          ${cOther ? `<input name="countryText" placeholder="Type your country" value="${esc(sel.country === '__other' ? '' : sel.country)}" required />` : ''}
        </label>
        <label class="field">State / region
          ${cOther ? '' : `<select name="state"><option value="">Select state…</option>${states.map((s) => opt(s, sOther ? '' : sel.state)).join('')}${opt('__other', sOther ? '__other' : '', 'Other…')}</select>`}
          ${sOther ? `<input name="stateText" placeholder="Type your state or region" value="${esc(['__other', ''].includes(sel.state) || states.includes(sel.state) ? '' : sel.state)}" />` : ''}
        </label>
        <label class="field">City
          ${sOther ? '' : `<select name="city"><option value="">Select city…</option>${cities.map((c) => opt(c, ciOther ? '' : sel.city)).join('')}${opt('__other', ciOther ? '__other' : '', 'Other…')}</select>`}
          ${ciOther ? `<input name="cityText" placeholder="Type your city" value="${esc(['__other', ''].includes(sel.city) || cities.includes(sel.city) ? '' : sel.city)}" required />` : ''}
        </label>
        <div class="row"><button class="btn primary">Use this location</button><button type="button" class="btn" id="loc-home">Use my office city</button></div>
      </form>`;
    const f = $('#loc-form');
    f.country?.addEventListener('change', (e) => { sel.country = e.target.value; sel.state = ''; sel.city = ''; draw(); });
    f.state?.addEventListener('change', (e) => { sel.state = e.target.value; sel.city = ''; draw(); });
    f.city?.addEventListener('change', (e) => { sel.city = e.target.value; draw(); });
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(f);
      const pick = (k) => (fd.get(`${k}Text`) ?? (fd.get(k) === '__other' ? '' : fd.get(k)) ?? '').trim();
      const next = { country: pick('country') || sel.country, state: pick('state'), city: pick('city') };
      if (!next.city) return toast('Please choose or type a city', true);
      setLocation(next);
      closeModal();
    });
    $('#loc-home').onclick = () => {
      store.set(`eos.loc.${ui.actor}`, null);
      closeModal();
      afterLocationChange();
    };
  };
  draw();
  $('#modal').hidden = false;
}
function setLocation(l) {
  store.set(`eos.loc.${ui.actor}`, l);
  afterLocationChange();
}
async function afterLocationChange() {
  ui.discover = null;
  ui.showtimes = null;
  toast(`Showing ${locLabel()}`);
  await loadDiscover();
  render();
}
async function loadDiscover() {
  ui.discover = await api(`/api/discover?${locQS()}`);
}

// ---------- helpers ----------
const name = (id) => ui.state.people.find((p) => p.id === id)?.name || id;
const pill = (cls, label) => `<span class="pill ${esc(cls)}">${esc(label ?? cls)}</span>`;
const fundingLabel = { corporate: 'Company', reimbursable: 'Reimbursable', personal: 'Personal', shared: 'Split' };
const fundingPill = (f) => pill(f, fundingLabel[f]);
const statusLabel = { pending_approval: 'Awaiting approval', confirmed: 'Confirmed', approved: 'Approved', rejected: 'Rejected', cancelled: 'Cancelled', draft: 'Draft', submitted: 'Submitted', reimbursed: 'Reimbursed' };
const statusPill = (s) => pill(s, statusLabel[s] || s);
const stepsHtml = (steps) => (steps.length ? `<div class="steps">${steps.map((s) => `<span class="step ${esc(s.status)}" title="${esc(s.reason)}">${esc(s.role)} · ${esc(name(s.approverId).split(' ')[0])}</span>`).join('')}</div>` : '<span class="muted small">No approval needed</span>');
const poster = (m, attrs = '') => `<button class="poster" data-movie="${esc(m.id)}" ${attrs}><div class="art" style="background:linear-gradient(160deg,#${esc(m.colors[0])},#${esc(m.colors[1])})"><span class="cert">${esc(m.cert)}</span>${m.local ? '<span class="local">Local pick</span>' : ''}<span class="t">${esc(m.title)}</span></div><div class="meta">${esc(m.language)} · ${esc(m.genre)}</div></button>`;
const dateBlock = (d) => `<div class="date-block"><div class="d">${dt(d).getDate()}</div><div class="m">${dt(d).toLocaleDateString('en-IN', { month: 'short' })}</div></div>`;
const evRow = (e) => `<button class="ev" data-event="${esc(e.id)}">${dateBlock(e.date)}<div><div class="t">${esc(e.title)}</div><div class="small muted">${esc(fmtDate(e.date))} · ${esc(hhmm(e.time))} · ${esc(e.venue)} · ${esc(e.distanceKm)} km</div><div style="margin-top:4px"><span class="tag ${esc(e.type)}">${esc(e.typeLabel)}</span> <span class="small muted">${e.interested.toLocaleString('en-IN')} interested</span></div></div><div class="price"><span class="small muted">from</span><br>${money(e.tiers[0].price)}</div></button>`;

// ---------- views ----------
function renderShell() {
  const s = ui.state;
  $('#company').textContent = `${s.meta.company}`;
  const inbox = s.inbox.bookings.length + s.inbox.reports.length;
  $('#nav').innerHTML = NAV.map((n) => (n === 'sep' ? '<div class="sep"></div>' : `<button data-tab="${n[0]}" class="${ui.tab === n[0] ? 'active' : ''}">${icon(n[2])}<span>${n[1]}</span>${n[0] === 'approvals' && inbox ? `<span class="badge">${inbox}</span>` : ''}</button>`)).join('');
  $('#actor').innerHTML = s.people.filter((p) => p.employee).map((p) => `<option value="${p.id}" ${p.id === ui.actor ? 'selected' : ''}>${esc(p.name)} — ${esc(p.title)}</option>`).join('');
  $('#loc-btn').innerHTML = `${icon('pin')}<span><b>${esc(loc().city)}</b> <span class="muted">${esc([loc().state, loc().country].filter(Boolean).join(', '))}</span></span>`;
}

function viewDiscover() {
  const s = ui.state;
  const D = ui.discover;
  const types = [['all', 'All'], ...Object.entries(D.eventTypes)];
  const evs = D.events.filter((e) => ui.eventType === 'all' || e.type === ui.eventType).slice(0, 8);
  const me = s.me;
  const mySpend = s.spend.find((r) => r.personId === me.id);
  const month = todayISO().slice(0, 7);
  const myGroups = s.groups.filter((g) => g.members.includes(me.id));
  const owed = myGroups.reduce((t, g) => t + (g.balances[me.id] || 0), 0);
  const recent = s.bookings.filter((b) => b.bookedBy === me.id).slice(0, 4);
  return `
  <div class="hero">
    <h1>Namaste ${esc(me.name.split(' ')[0])} — what’s the plan in ${esc(loc().city)}?</h1>
    <p>Movies, concerts, matches, dinners, offsites, gifts. Tell the concierge; the agents find it, check the budget, get approvals and split the bill.</p>
    <form class="hero-ask" id="hero-form"><input id="hero-ask" placeholder="e.g. 4 tickets for the T20 night with friends, split" autocomplete="off" /><button class="btn primary">Plan it</button></form>
    <div class="suggest">${SUGGESTIONS.map((x) => `<button type="button" data-suggest="${esc(x)}">${esc(x)}</button>`).join('')}</div>
  </div>
  <div class="discover">
    <div>
      <div class="cat-rail">${Object.entries(s.categories).map(([id, c]) => `<button class="cat" data-cat="${id}"><span class="ic">${icon(c.icon)}</span><b>${esc(c.label)}</b></button>`).join('')}</div>
      <section class="section">
        <div class="section-head"><h2>Now showing in ${esc(loc().city)}</h2><button class="btn sm ghost" data-tab="movies">All movies →</button></div>
        <div class="shelf">${D.movies.map((m) => poster(m)).join('')}</div>
      </section>
      <section class="section">
        <div class="section-head"><h2>Happening near you</h2><button class="btn sm ghost" data-tab="events">All events →</button></div>
        <div class="chips" style="margin-bottom:12px">${types.map(([k, l]) => `<button class="chip ${ui.eventType === k ? 'on' : ''}" data-etype="${k}">${esc(l)}</button>`).join('')}</div>
        <div class="ev-list">${evs.map(evRow).join('') || '<div class="card empty">No events of this type nearby in the next few weeks.</div>'}</div>
      </section>
    </div>
    <aside class="rail">
      <div class="card"><h3>Your month</h3>
        <div class="stat-line"><span>Personal budget</span><b>${money(me.personalMonthly)}</b></div>
        <div class="stat-line"><span>Out of pocket so far</span><b>${money(mySpend?.outOfPocket || 0)}</b></div>
        <div class="stat-line"><span>Wellbeing allowance left</span><b>${money(me.stipendBalance)}</b></div>
        <div class="stat-line"><span>Groups: ${owed >= 0 ? 'you get back' : 'you owe'}</span><b class="${owed >= 0 ? 'pos' : 'neg'}">${money(Math.abs(owed))}</b></div>
        <div class="stat-line"><span>Waiting on you</span><b>${s.inbox.bookings.length + s.inbox.reports.length}</b></div>
        <p class="small muted" style="margin:8px 0 0">${esc(month)} · amounts in ₹</p>
      </div>
      <div class="card"><h3>Your recent bookings</h3>
        ${recent.map((b) => `<div class="stat-line" style="cursor:pointer" data-booking="${esc(b.id)}"><span>${esc(b.title.split(' · ')[0])}<br><span class="small muted">${esc(fmtDate(b.date))}</span></span>${statusPill(b.status)}</div>`).join('') || '<p class="muted small">Nothing yet — try the concierge.</p>'}
      </div>
    </aside>
  </div>`;
}

// Hide shows that have already started today.
function upcoming(list) {
  if (ui.movieDate !== todayISO()) return list;
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  return list.map((c) => ({ ...c, shows: c.shows.filter((sh) => Number(sh.time.slice(0, 2)) * 60 + Number(sh.time.slice(3)) > mins) })).filter((c) => c.shows.length);
}

function viewMovies() {
  const D = ui.discover;
  const langs = ['all', ...new Set(D.movies.map((m) => m.language))];
  const list = D.movies.filter((m) => ui.movieLang === 'all' || m.language === ui.movieLang);
  const days = Array.from({ length: 7 }, (_, i) => addDays(todayISO(), i));
  let detail = '';
  if (ui.movie) {
    const m = D.movies.find((x) => x.id === ui.movie);
    detail = `<div class="card section" id="movie-detail">
      <div class="movie-head"><div>${poster(m, 'disabled')}</div><div>
        <h2>${esc(m.title)}</h2><p class="muted">${esc(m.language)} · ${esc(m.genre)} · ${esc(m.cert)} · ${esc(m.runtime)} · ${esc(m.formats.join(' / '))}</p>
        <div class="chips">${days.map((d, i) => `<button class="chip ${ui.movieDate === d ? 'on' : ''}" data-mdate="${d}">${i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : esc(fmtDate(d))}</button>`).join('')}</div>
      </div></div>
      ${
        ui.showtimes
          ? upcoming(ui.showtimes).map((c) => `<div class="cinema"><div class="row"><b>${esc(c.cinema.name)}</b><span class="small muted">${esc(c.cinema.distanceKm)} km</span></div><div class="times">${c.shows.map((sh) => `<button class="time" data-show="${esc(sh.key)}">${esc(hhmm(sh.time))}<small>${esc(sh.format)} · ${money(sh.price)}</small></button>`).join('')}</div></div>`).join('') || '<p class="muted">No shows on this date.</p>'
          : '<p class="muted">Loading showtimes…</p>'
      }
    </div>`;
  }
  return `<div class="section-head"><h1>Movies in ${esc(loc().city)}</h1><span class="muted">Pick a film, a show and your seats — the agents handle the rest.</span></div>
    ${detail}
    <div class="chips section">${langs.map((l) => `<button class="chip ${ui.movieLang === l ? 'on' : ''}" data-lang="${esc(l)}">${l === 'all' ? 'All languages' : esc(l)}</button>`).join('')}</div>
    <div class="movie-grid">${list.map((m) => poster(m)).join('')}</div>`;
}

function viewEvents() {
  const D = ui.discover;
  const types = [['all', 'All'], ...Object.entries(D.eventTypes)];
  const evs = D.events.filter((e) => ui.eventType === 'all' || e.type === ui.eventType);
  return `<div class="section-head"><h1>Events near ${esc(loc().city)}</h1><span class="muted">Music, sports, tech, comedy, theatre and food — next 6 weeks.</span></div>
    <div class="chips section">${types.map(([k, l]) => `<button class="chip ${ui.eventType === k ? 'on' : ''}" data-etype="${k}">${esc(l)}</button>`).join('')}</div>
    <div class="ev-list">${evs.map(evRow).join('') || '<div class="card empty">No events of this type nearby. Try another category or city.</div>'}</div>`;
}

function viewVenues() {
  const s = ui.state;
  const cats = ['reservations', 'pdr', 'catering', 'gifting', 'experiences'];
  const list = ui.discover.venues[ui.venueCat] || [];
  const unit = ui.venueCat === 'gifting' ? 'recipient' : 'person';
  return `<div class="section-head"><h1>Dining & venues in ${esc(loc().city)}</h1><span class="muted">Tables, private rooms, caterers, gifts and experiences.</span></div>
    <div class="chips section">${cats.map((c) => `<button class="chip ${ui.venueCat === c ? 'on' : ''}" data-vcat="${c}">${esc(s.categories[c].label)}</button>`).join('')}</div>
    <div class="card">${list
      .map(
        (v) => `<div class="venue"><span class="ic">${icon(s.categories[ui.venueCat].icon)}</span><div><b>${esc(v.vendor)}</b><div class="small muted">${esc(v.note)} · ~${money(v.perPerson)} per ${unit}</div></div><button class="btn sm primary" data-venue="${esc(v.id)}">Book</button></div>`,
      )
      .join('')}</div>`;
}

function bookingRows(list) {
  if (!list.length) return '<div class="empty">No bookings yet.</div>';
  return `<div class="table-wrap"><table>
    <thead><tr><th>Booking</th><th>Booked by</th><th>When · where</th><th class="num">Amount</th><th>Paid by</th><th>Approvals</th><th>Status</th></tr></thead>
    <tbody>${list
      .map(
        (b) => `<tr class="clickable" data-booking="${esc(b.id)}">
        <td><b>${esc(b.title)}</b><div class="small muted">${esc(b.id)} · ${esc(b.categoryLabel)} · ${esc(b.vendor)}</div></td>
        <td>${esc(name(b.bookedBy))}</td>
        <td>${esc(fmtDate(b.date))}${b.details?.time ? ` · ${esc(hhmm(b.details.time))}` : ''}<div class="small muted">${esc(b.location?.city || '')}</div></td>
        <td class="num">${money(b.amount)}</td>
        <td>${fundingPill(b.funding)}</td>
        <td>${stepsHtml(b.approvals)}</td>
        <td>${statusPill(b.status)}</td></tr>`,
      )
      .join('')}</tbody></table></div>`;
}

function viewBookings() {
  const f = ui.bookingFilter;
  const list = ui.state.bookings.filter((b) => f === 'all' || (f === 'mine' && b.bookedBy === ui.actor) || b.funding === f || b.category === f);
  const filters = [['all', 'All'], ['mine', 'Booked by me'], ['movies', 'Movies'], ['events', 'Events'], ['corporate', 'Company'], ['reimbursable', 'Reimbursable'], ['shared', 'Split'], ['personal', 'Personal']];
  return `<div class="section-head"><h1>Bookings</h1></div><div class="chips section">${filters.map(([k, l]) => `<button class="chip ${f === k ? 'on' : ''}" data-filter="${k}">${l}</button>`).join('')}</div><div class="card">${bookingRows(list)}</div>`;
}

function viewApprovals() {
  const { bookings, reports } = ui.state.inbox;
  const card = (item, kind) => {
    const now = item.approvals.find((x) => x.status === 'pending');
    const title = kind === 'booking' ? item.title : `Expense report ${item.id} · ${item.purposeLabel}`;
    const who = kind === 'booking' ? item.bookedBy : item.ownerId;
    return `<div class="card">
      <div class="row"><h3>${esc(title)}</h3><span class="spacer"></span><b>${money(kind === 'booking' ? item.amount : item.claimable)}</b></div>
      <p class="small muted">${esc(item.id)} · by ${esc(name(who))}${kind === 'booking' ? ` · ${esc(item.categoryLabel)} · ${esc(fmtDate(item.date))} · ${esc(item.location?.city || '')} · ${esc(item.partySize)} guests` : ` · ${item.lines.length} line(s)`}</p>
      <p class="note warn small">You are approving as <b>${esc(now.role)}</b>: ${esc(now.reason)}</p>
      ${kind === 'booking' && item.budget ? `<p class="small muted">${item.budget.notes.map(esc).join(' ')}</p>` : ''}
      ${stepsHtml(item.approvals)}
      <div class="row" style="margin-top:12px"><input style="flex:1;min-width:140px;padding:8px 10px;border:1px solid var(--line);border-radius:10px;background:var(--surface-2)" placeholder="Note (optional)" data-note="${esc(item.id)}" />
      <button class="btn primary" data-decide="approve" data-id="${esc(item.id)}">Approve</button><button class="btn danger" data-decide="reject" data-id="${esc(item.id)}">Reject</button><button class="btn" data-open="${esc(item.id)}">Details</button></div></div>`;
  };
  const all = [...bookings.map((b) => card(b, 'booking')), ...reports.map((r) => card(r, 'report'))];
  return `<div class="section-head"><h1>Approvals</h1><span class="muted">Waiting on ${esc(ui.state.me.name)}</span></div>
    ${all.length ? `<div class="grid grid-2">${all.join('')}</div>` : '<div class="card empty">Nothing is waiting on you. Switch “Acting as” to a manager, department head, Compliance, Finance, HR or Benefits to see their queue.</div>'}`;
}

function viewExpenses() {
  const s = ui.state;
  const mine = s.reports.filter((r) => r.ownerId === ui.actor);
  const others = s.reports.filter((r) => r.ownerId !== ui.actor);
  const row = (r) => `<tr class="clickable" data-open="${esc(r.id)}"><td><b>${esc(r.id)}</b><div class="small muted">${esc(r.lines.map((l) => l.description).join('; '))}</div></td><td>${esc(name(r.ownerId))}</td><td>${esc(r.purposeLabel)}</td><td>${esc(r.routeTo || '—')}</td><td class="num">${money(r.claimable)}</td><td>${stepsHtml(r.approvals)}</td><td>${statusPill(r.status)}${r.status === 'draft' && r.ownerId === ui.actor ? ` <button class="btn sm primary" data-submit="${esc(r.id)}">Submit</button>` : ''}</td></tr>`;
  const table = (rows) => (rows.length ? `<div class="table-wrap"><table><thead><tr><th>Report</th><th>Owner</th><th>Type</th><th>Routed to</th><th class="num">Claim</th><th>Approvals</th><th>Status</th></tr></thead><tbody>${rows.map(row).join('')}</tbody></table></div>` : '<div class="empty">No reports.</div>');
  return `<div class="section-head"><h1>Expense reports</h1><span class="muted">Spent your own money? The Expense agent builds the report and routes it to Finance, HR or Benefits.</span></div>
  <div class="grid grid-2 section">
    <div class="card"><h3>Claim personally-paid bookings</h3>
      ${
        s.claimable.length
          ? `<form id="report-form">${s.claimable.map((b) => `<label class="balance-row"><span><input type="checkbox" name="b" value="${esc(b.id)}" checked /> ${esc(b.title)} <span class="small muted">${esc(fmtDate(b.date))}</span></span><b>${money(b.amount)}</b></label>`).join('')}
          <div class="form" style="margin-top:12px"><label class="field">Report type<select name="purpose"><option value="">Auto-detect</option><option value="business">Client / business → Finance</option><option value="morale">Team morale → HR</option><option value="wellbeing">Wellbeing allowance → Benefits</option></select></label>
          <label class="field">Business purpose / notes<input name="notes" placeholder="Who, why" /></label></div>
          <div class="row" style="margin-top:12px"><button class="btn" name="mode" value="draft">Save draft</button><button class="btn primary" name="mode" value="submit">Create & submit</button></div></form>`
          : '<p class="muted">No confirmed reimbursable bookings to claim. Book something as “Paid personally → expense report”.</p>'
      }</div>
    <div class="card"><h3>How routing works</h3><ul class="reasons">
      <li><b>Client / business</b>: Manager → Finance</li><li><b>Team morale, celebrations, offsites</b>: Manager → HR</li>
      <li><b>Wellbeing allowance</b>: Benefits only; capped at your balance (${money(s.me.stipendBalance)} left)</li><li>Nobody approves their own spend.</li></ul></div>
  </div>
  <div class="section"><h2 style="margin-bottom:10px">My reports</h2><div class="card">${table(mine)}</div></div>
  <div class="section"><h2 style="margin-bottom:10px">Company reports</h2><div class="card">${table(others)}</div></div>`;
}

function viewSplits() {
  const s = ui.state;
  const groupCard = (g) => {
    const opts = g.members.map((m) => `<option value="${esc(m)}" ${m === ui.actor ? 'selected' : ''}>${esc(g.memberNames[m])}</option>`).join('');
    const history = [...g.expenses.map((e) => ({ t: e.createdAt, html: `<div class="balance-row"><span>${esc(e.description)} <span class="small muted">paid by ${esc(g.memberNames[e.paidBy])} · ${esc(e.method)}</span></span><b>${money(e.amount)}</b></div>` })), ...g.settlements.map((x) => ({ t: x.at, html: `<div class="balance-row"><span class="muted">${esc(g.memberNames[x.from])} paid ${esc(g.memberNames[x.to])}</span><span class="pos">${money(x.amount)}</span></div>` }))].sort((a, b) => (a.t < b.t ? 1 : -1));
    return `<div class="card">
      <div class="row"><h2>${esc(g.name)}</h2>${pill(g.type === 'family' ? 'shared' : 'info', g.type)}<span class="spacer"></span><span class="muted small">Total ${money(g.total)}</span></div>
      <div class="grid grid-2" style="margin-top:14px">
        <div><h3>Balances</h3>${g.members.map((m) => `<div class="balance-row"><span>${esc(g.memberNames[m])}</span><span class="${g.balances[m] > 0 ? 'pos' : g.balances[m] < 0 ? 'neg' : 'muted'}">${g.balances[m] > 0 ? 'gets back ' : g.balances[m] < 0 ? 'owes ' : 'settled '}${money(Math.abs(g.balances[m]))}</span></div>`).join('')}</div>
        <div><h3>Settle up <span class="muted small">(fewest payments)</span></h3>${g.settleUp.length ? g.settleUp.map((t) => `<div class="transfer"><span>${esc(g.memberNames[t.from])} → ${esc(g.memberNames[t.to])} <b>${money(t.amount)}</b></span><button class="btn sm" data-settle="${esc(JSON.stringify({ g: g.id, ...t }))}">Record UPI payment</button></div>`).join('') : '<p class="muted">All settled 🎉</p>'}</div>
      </div>
      <h3 style="margin-top:16px">Add an expense</h3>
      <form class="form" data-expense="${esc(g.id)}">
        <label class="field">Description<input name="description" required placeholder="Dinner, tickets, cab…" /></label>
        <label class="field">Amount (₹)<input name="amount" type="number" step="0.01" min="1" required /></label>
        <label class="field">Paid by<select name="paidBy">${opts}</select></label>
        <label class="field">Split<select name="method"><option value="equal">Equally</option><option value="exact">Exact amounts</option><option value="percent">Percentages</option><option value="shares">Shares</option></select></label>
        <div class="field wide"><span>Per-person values (exact ₹ / % / shares)</span><div class="row">${g.members.map((m) => `<label class="small">${esc(g.memberNames[m].split(' ')[0])} <input name="w_${esc(m)}" type="number" step="0.01" style="width:84px;padding:6px;border:1px solid var(--line);border-radius:8px;background:var(--surface-2)" /></label>`).join('')}</div></div>
        <div class="field wide"><button class="btn primary">Add & split</button></div>
      </form>
      <h3 style="margin-top:16px">History</h3>${history.map((x) => x.html).join('') || '<p class="muted">No expenses yet.</p>'}
    </div>`;
  };
  const mine = s.groups.filter((g) => g.members.includes(ui.actor));
  return `<div class="section-head"><h1>Family & friends</h1><span class="muted">Splitwise-style: shared bookings land here automatically; add anything else by hand.</span></div>
    <div class="grid section">${mine.length ? mine.map(groupCard).join('') : '<div class="card empty">You are not in any groups yet.</div>'}</div>
    <div class="card"><h3>New group</h3><form class="form" id="group-form">
      <label class="field">Name<input name="name" required placeholder="Goa trip gang" /></label>
      <label class="field">Type<select name="type"><option value="friends">Friends</option><option value="family">Family</option></select></label>
      <div class="field wide"><span>Members</span><div class="row">${s.people.filter((p) => p.id !== ui.actor).map((p) => `<label class="small"><input type="checkbox" name="m" value="${esc(p.id)}" /> ${esc(p.name)}</label>`).join('')}</div></div>
      <div class="field wide"><button class="btn primary">Create group</button></div></form></div>`;
}

function viewSpend() {
  const s = ui.state;
  const k = s.kpis;
  const kp = [[k.bookings, 'Live bookings'], [money(k.companySpend), 'Company spend'], [money(k.personalSpend), 'Personal & shared'], [k.pendingApprovals, 'Awaiting approval'], [money(k.reimbursed), 'Reimbursed']];
  const depts = s.departments.map((d) => `<div class="card"><div class="row"><h3>${esc(d.name)}</h3><span class="spacer"></span><span class="small muted">${esc(d.costCenter)}</span></div><p class="small muted">Head: ${esc(d.headName)} · Budget ${money(d.quarterlyBudget)}</p><div class="bar ${d.utilisation > 100 ? 'over' : d.utilisation > 85 ? 'warn' : ''}"><span style="width:${Math.min(100, d.utilisation)}%"></span></div><p class="small">${money(d.committed)} committed · <b>${money(d.remaining)}</b> left (${d.utilisation}%)</p></div>`).join('');
  const rows = s.spend.map((r) => `<tr><td><b>${esc(r.name)}</b><div class="small muted">${esc(r.title)}</div></td><td class="num">${r.bookings}</td><td class="num">${money(r.company)}</td><td class="num">${money(r.reimbursable)}</td><td class="num">${money(r.personal)}</td><td class="num">${money(r.sharedPaid)}</td><td class="num">${money(r.sharedShare)}</td><td class="num"><b>${money(r.outOfPocket)}</b></td></tr>`).join('');
  const max = Math.max(1, ...s.byCategory.map((c) => c.total));
  const cats = s.byCategory.map((c) => `<div class="stat-line"><span style="width:130px">${esc(c.label)}</span><div class="bar" style="flex:1;margin:6px 10px"><span style="width:${(c.total / max) * 100}%"></span></div><b style="width:110px;text-align:right">${money(c.total)}</b></div>`).join('');
  const p = s.policy;
  return `<div class="section-head"><h1>Budgets & spend</h1><span class="muted">${esc(s.meta.period)}</span></div>
    <div class="kpis">${kp.map(([v, l]) => `<div class="kpi"><div class="v">${esc(v)}</div><div class="l">${esc(l)}</div></div>`).join('')}</div>
    <div class="grid grid-4 section">${depts}</div>
    <div class="section"><h2 style="margin-bottom:10px">Who is spending how much</h2><div class="card table-wrap"><table><thead><tr><th>Person</th><th class="num">Bookings</th><th class="num">Company</th><th class="num">Reimbursable</th><th class="num">Personal</th><th class="num">Paid for groups</th><th class="num">Own group share</th><th class="num">Out of pocket</th></tr></thead><tbody>${rows}</tbody></table></div></div>
    <div class="grid grid-2"><div class="card"><h3 style="margin-bottom:8px">Live spend by category</h3>${cats}</div>
    <div class="card"><h3>Approval matrix</h3><ul class="reasons">
      <li>Up to ${money(p.autoApproveLimit)} within budget: auto-approved</li><li>Above ${money(p.autoApproveLimit)}: Manager</li>
      <li>Above ${money(p.managerLimit)} or over per-person cap: + Department head</li><li>Above ${money(p.deptHeadLimit)} or over budget: + Finance (CFO)</li>
      <li>Client event tickets & gifts: + Compliance</li><li>Caps: ${Object.entries(p.perAttendeeCap).map(([c, v]) => `${esc(s.categories[c].label)} ${money(v)}`).join(' · ')}</li></ul></div></div>`;
}

function viewActivity() {
  return `<div class="section-head"><h1>Agent activity</h1><button class="btn sm" id="reload-demo">Reset demo data</button></div><div class="card"><ul class="feed">${ui.state.activity.map((a) => `<li><span class="agent-name">${esc(a.agent)}</span><span>${esc(a.message)}</span><span class="muted small">${esc(fmtTime(a.at))}</span></li>`).join('')}</ul></div>`;
}

// ---------- checkout (shared by concierge, movies, events, venues) ----------
async function openCheckout(draft) {
  ui.checkout = { draft, preview: null, error: null };
  $('#modal').hidden = false;
  await reviewCheckout();
}
async function reviewCheckout() {
  const c = ui.checkout;
  try {
    const r = await api('/api/agent/preview', c.draft);
    c.preview = r;
    c.draft = { ...c.draft, ...r.draft, reasoning: c.draft.reasoning };
    c.error = null;
  } catch (e) {
    c.error = e.message;
  }
  drawCheckout();
}
function drawCheckout() {
  const { draft, preview, error } = ui.checkout;
  const s = ui.state;
  const d = draft.details;
  const myGroups = s.groups.filter((g) => g.members.includes(ui.actor));
  const opt = (v, cur, label) => `<option value="${esc(v)}" ${v === cur ? 'selected' : ''}>${esc(label)}</option>`;
  const facts = d?.kind === 'movie' ? [['Cinema', d.cinema], ['Show', `${fmtDate(draft.date)} · ${hhmm(d.time)} · ${d.format}`], ['Seats', d.seats.join(', ')], ['Price', `${money(d.pricePerSeat)} × ${d.seats.length}`]]
    : d?.kind === 'event' ? [['Venue', d.venue], ['When', `${fmtDate(draft.date)} · ${hhmm(d.time)}`], ['Tickets', `${d.qty} × ${d.tier}`], ['Price', `${money(d.pricePerTicket)} each`]]
    : [['Vendor', draft.vendor], ['Date', fmtDate(draft.date)], ['Guests', draft.partySize]];
  const editable = !d;
  const b = preview?.budget;
  $('#modal-body').innerHTML = `
    <div class="ticket">
      <div class="ticket-top"><span class="small muted">${esc(s.categories[draft.category]?.label || '')} · ${esc([draft.location?.city, draft.location?.state].filter(Boolean).join(', '))}</span><h2 style="margin-top:4px">${esc(draft.title)}</h2></div>
      <div class="ticket-body">
        <dl class="kv">${facts.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}<dt>Total</dt><dd><b style="font-size:18px">${money(draft.amount)}</b></dd></dl>
        <form class="form" id="co-form" style="margin-top:14px">
          <label class="field">Who pays?<select name="funding">${Object.entries(s.funding).map(([k, l]) => opt(k, draft.funding, l)).join('')}</select></label>
          ${draft.funding === 'shared' ? `<label class="field">Split with<select name="groupId">${myGroups.map((g) => opt(g.id, draft.groupId, `${g.name} (${g.type})`)).join('')}</select></label>` : ''}
          <label class="field">Purpose<select name="purpose">${[['business', 'Client / business'], ['morale', 'Team / morale'], ['wellbeing', 'Wellbeing allowance'], ['personal', 'Personal']].map(([k, l]) => opt(k, draft.purpose, l)).join('')}</select></label>
          <label class="field">Client-facing?<select name="clientFacing">${opt('false', String(!!draft.clientFacing), 'No')}${opt('true', String(!!draft.clientFacing), 'Yes')}</select></label>
          ${editable ? `<details class="edit field wide"><summary>Edit details</summary><div class="form">
            <label class="field wide">Title<input name="title" value="${esc(draft.title)}" /></label>
            <label class="field">Vendor<input name="vendor" value="${esc(draft.vendor)}" /></label>
            <label class="field">Date<input type="date" name="date" value="${esc(draft.date)}" /></label>
            <label class="field">Guests<input type="number" min="1" name="partySize" value="${esc(draft.partySize)}" /></label>
            <label class="field">Amount (₹)<input type="number" min="1" step="0.01" name="amount" value="${esc(draft.amount)}" /></label></div></details>` : ''}
        </form>
      </div>
    </div>
    <div class="agents" style="margin-top:20px">
      ${draft.reasoning?.length ? `<div class="agent"><span class="dot">${icon('bot')}</span><div><h4>Concierge agent</h4><ul class="reasons">${draft.reasoning.map((r) => `<li>${esc(r)}</li>`).join('')}</ul></div></div>` : ''}
      ${error ? `<p class="note over">${esc(error)}</p>` : ''}
      ${b ? `<div class="agent"><span class="dot">${icon('wallet')}</span><div><h4>Budget agent · ${esc(b.pot.name)}</h4><div class="bar ${esc(b.status)}" style="margin:6px 0"><span style="width:${Math.min(100, Math.max(2, b.pot.limit ? ((b.pot.limit - b.pot.after) / b.pot.limit) * 100 : 0))}%"></span></div><p class="note ${esc(b.status)}">${b.notes.map(esc).join('<br>')}</p></div></div>
      <div class="agent"><span class="dot">${icon('shield')}</span><div><h4>Policy agent</h4><p class="small muted" style="margin:0 0 6px">${preview.policyNotes.map(esc).join(' ')}</p>${preview.approvals.length ? preview.approvals.map((a) => `<div class="small">• <b>${esc(a.role)}</b> — ${esc(a.approverName)} <span class="muted">(${esc(a.reason)})</span></div>`).join('') : pill('ok', 'Auto-approved')}</div></div>` : ''}
    </div>
    <div class="total-bar"><span class="amt">${money(draft.amount)}</span><span class="muted small">${preview?.approvals?.length ? `Needs ${preview.approvals.length} approval(s) before confirming` : 'Confirms instantly'}</span><span class="spacer"></span><button class="btn" data-close="modal">Cancel</button><button class="btn primary" id="co-confirm" ${error || !preview ? 'disabled' : ''}>Confirm booking</button></div>`;
  const f = $('#co-form');
  f.addEventListener('change', () => {
    const fd = new FormData(f);
    const next = { ...ui.checkout.draft, funding: fd.get('funding'), purpose: fd.get('purpose'), clientFacing: fd.get('clientFacing') === 'true' };
    if (next.funding === 'shared') next.groupId = fd.get('groupId') || myGroups[0]?.id || null;
    if (editable) {
      for (const k of ['title', 'vendor', 'date', 'partySize', 'amount']) if (fd.get(k) !== null) next[k] = fd.get(k);
      // Editing the vendor or price by hand means it is no longer the catalog price.
      if (next.vendorId && (next.vendor !== ui.checkout.draft.vendor || Number(next.amount) !== Number(ui.checkout.draft.amount))) delete next.vendorId;
    }
    if (next.funding === 'shared' && !next.groupId) return toast('Create a family or friends group first', true);
    ui.checkout.draft = next;
    reviewCheckout();
  });
  $('#co-confirm').onclick = async () => {
    const r = await run(() => api('/api/bookings', ui.checkout.draft), (x) => `${x.id}: ${statusLabel[x.status]}`);
    if (r) {
      closeModal();
      ui.tab = 'bookings';
      if (r.category === 'movies') ui.showtimes = null;
      render();
      openDrawer(r.id);
    }
  };
}

async function openSeats(showKey) {
  const data = await api(`/api/seats?show=${encodeURIComponent(showKey)}`);
  const m = ui.discover.movies.find((x) => x.id === data.show.movieId);
  const price = ui.showtimes.flatMap((c) => c.shows).find((x) => x.key === showKey)?.price || 0;
  const cinema = ui.showtimes.find((c) => c.shows.some((x) => x.key === showKey))?.cinema;
  const sel = new Set();
  const draw = () => {
    $('#modal-body').innerHTML = `<h2>${esc(m.title)}</h2><p class="muted">${esc(cinema.name)} · ${esc(fmtDate(data.show.date))} · ${esc(hhmm(data.show.time))} · ${esc(data.show.format)} · ${money(price)} per seat</p>
      <div class="screen"></div><div class="screen-label">SCREEN THIS WAY</div>
      <div class="seats">${data.rows.map((r) => `<div class="seat-row"><span class="rl">${r.row}</span>${r.seats.map((st, i) => `<button class="seat ${st.sold ? 'sold' : ''} ${sel.has(st.id) ? 'sel' : ''} ${i === data.aisleAfter ? 'gap' : ''}" data-seat="${st.id}" ${st.sold ? 'disabled' : ''} title="${st.id}">${i + 1}</button>`).join('')}<span class="rl">${r.row}</span></div>`).join('')}</div>
      <div class="legend"><span><i></i>Available</span><span><i class="s"></i>Selected</span><span><i class="x"></i>Sold</span></div>
      <div class="total-bar"><span class="amt">${money(price * sel.size)}</span><span class="muted small">${sel.size ? [...sel].join(', ') : 'Tap seats to select (max 10)'}</span><span class="spacer"></span><button class="btn primary" id="seats-next" ${sel.size ? '' : 'disabled'}>Review with agents</button></div>`;
    $('#modal-body').querySelectorAll('[data-seat]').forEach((b) =>
      b.addEventListener('click', () => {
        const id = b.dataset.seat;
        if (sel.has(id)) sel.delete(id);
        else if (sel.size < 10) sel.add(id);
        draw();
      }),
    );
    $('#seats-next').onclick = () =>
      openCheckout({ category: 'movies', funding: 'personal', purpose: 'personal', location: loc(), details: { kind: 'movie', showKey, seats: [...sel] }, reasoning: [`You picked ${sel.size} seat(s) on the seat map.`] });
  };
  draw();
  $('#modal').hidden = false;
}

function openEvent(id) {
  const e = ui.discover.events.find((x) => x.id === id);
  let tier = e.tiers[0].name;
  let qty = 2;
  const draw = () => {
    const t = e.tiers.find((x) => x.name === tier);
    $('#drawer-body').innerHTML = `<span class="tag ${esc(e.type)}">${esc(e.typeLabel)}</span><h2 style="margin:8px 0 4px">${esc(e.title)}</h2>
      <p class="muted">${esc(fmtDate(e.date))} · ${esc(hhmm(e.time))}<br>${esc(e.venue)} · ${esc(e.distanceKm)} km away · ${e.interested.toLocaleString('en-IN')} interested</p>
      <h3 style="margin:18px 0 10px">Choose tickets</h3>
      ${e.tiers.map((x) => `<div class="tier ${x.name === tier ? 'on' : ''}" data-tier="${esc(x.name)}"><span>${esc(x.name)}</span><b>${money(x.price)}</b></div>`).join('')}
      <div class="row" style="margin-top:10px"><span>Quantity</span><span class="qty"><button data-q="-1">−</button><span>${qty}</span><button data-q="1">+</button></span></div>
      <div class="total-bar"><span class="amt">${money(t.price * qty)}</span><span class="spacer"></span><button class="btn primary" id="ev-next">Review with agents</button></div>`;
    $('#drawer-body').querySelectorAll('[data-tier]').forEach((x) => x.addEventListener('click', () => ((tier = x.dataset.tier), draw())));
    $('#drawer-body').querySelectorAll('[data-q]').forEach((x) => x.addEventListener('click', () => ((qty = Math.min(20, Math.max(1, qty + Number(x.dataset.q)))), draw())));
    $('#ev-next').onclick = () => {
      $('#drawer').hidden = true;
      openCheckout({ category: 'events', funding: 'personal', purpose: 'personal', location: loc(), details: { kind: 'event', eventId: e.id, tier, qty }, reasoning: [`You chose ${qty} × ${tier} for ${e.title}.`] });
    };
  };
  draw();
  $('#drawer').hidden = false;
}

function openVenue(id) {
  const v = ui.discover.venues[ui.venueCat].find((x) => x.id === id);
  const guests = ui.venueCat === 'catering' ? 25 : ui.venueCat === 'gifting' ? 20 : 4;
  openCheckout({ category: ui.venueCat, vendorId: v.id, vendor: v.vendor, title: `${v.vendor} · ${guests} ${ui.venueCat === 'gifting' ? 'recipients' : 'guests'}`, partySize: guests, date: addDays(todayISO(), 3), amount: v.perPerson * guests, funding: 'corporate', purpose: 'morale', location: loc(), reasoning: [`${v.vendor}: ${v.note}, ~${money(v.perPerson)} per person.`] });
}

async function askConcierge(text) {
  if (!text.trim()) return;
  try {
    const r = await api('/api/agent/plan', { text, location: loc() });
    ui.checkout = { draft: r.draft, preview: r, error: null };
    $('#modal').hidden = false;
    drawCheckout();
  } catch (e) {
    toast(e.message, true);
  }
}

function openDrawer(id) {
  const s = ui.state;
  const b = s.bookings.find((x) => x.id === id);
  const r = s.reports.find((x) => x.id === id);
  const item = b || r;
  if (!item) return;
  const timeline = `<h3 style="margin-top:20px">Agent trace</h3><ul class="timeline" style="margin-top:10px">${item.trace.map((t) => `<li><span class="agent-name">${esc(t.agent)}</span><span>${esc(t.message)}<div class="small muted">${esc(fmtTime(t.at))}</div></span></li>`).join('')}</ul>`;
  let html;
  if (b) {
    const d = b.details;
    html = `<h2>${esc(b.title)}</h2><div class="row" style="margin-top:8px">${statusPill(b.status)} ${fundingPill(b.funding)}</div>
    <dl class="kv" style="margin:16px 0"><dt>Booking</dt><dd>${esc(b.id)}${b.confirmation ? ` · conf. ${esc(b.confirmation)}` : ''}</dd>
    <dt>Category</dt><dd>${esc(b.categoryLabel)}</dd><dt>Where</dt><dd>${esc(b.vendor)}<br><span class="muted">${esc([b.location?.city, b.location?.state, b.location?.country].filter(Boolean).join(', '))}</span></dd>
    <dt>When</dt><dd>${esc(fmtDate(b.date))}${d?.time ? ` · ${esc(hhmm(d.time))}` : ''}</dd>
    ${d?.kind === 'movie' ? `<dt>Seats</dt><dd>${esc(d.seats.join(', '))} · ${esc(d.format)}</dd>` : ''}${d?.kind === 'event' ? `<dt>Tickets</dt><dd>${esc(d.qty)} × ${esc(d.tier)}</dd>` : ''}
    <dt>Guests</dt><dd>${esc(b.partySize)}</dd><dt>Amount</dt><dd>${money(b.amount)}</dd><dt>Booked by</dt><dd>${esc(name(b.bookedBy))}</dd>
    <dt>Charged to</dt><dd>${esc(b.budget?.pot?.name || '')}</dd>${b.funding === 'shared' ? `<dt>Split between</dt><dd>${b.attendees.map((a) => esc(name(a))).join(', ')}</dd>` : ''}
    <dt>Approvals</dt><dd>${stepsHtml(b.approvals)}</dd></dl>
    ${b.bookedBy === ui.actor && !['cancelled', 'rejected'].includes(b.status) ? `<button class="btn danger" data-cancel="${esc(b.id)}">Cancel booking</button>` : ''}`;
  } else {
    html = `<h2>Expense report ${esc(r.id)}</h2><div class="row" style="margin-top:8px">${statusPill(r.status)} ${pill('info', r.routeTo ? `→ ${r.routeTo}` : 'not routed')}</div>
    <dl class="kv" style="margin:16px 0"><dt>Owner</dt><dd>${esc(name(r.ownerId))}</dd><dt>Type</dt><dd>${esc(r.purposeLabel)}</dd><dt>Total</dt><dd>${money(r.total)}</dd><dt>Claimable</dt><dd>${money(r.claimable)}</dd><dt>Notes</dt><dd>${esc(r.notes || '—')}</dd><dt>Approvals</dt><dd>${stepsHtml(r.approvals)}</dd></dl>
    ${r.warnings.map((w) => `<p class="note warn small">${esc(w)}</p>`).join('')}
    <table><thead><tr><th>Date</th><th>Line</th><th class="num">Amount</th></tr></thead><tbody>${r.lines.map((l) => `<tr><td>${esc(fmtDate(l.date))}</td><td>${esc(l.description)}<div class="small muted">${esc(l.vendor)} · 📎 ${esc(l.receipt)}</div></td><td class="num">${money(l.amount)}</td></tr>`).join('')}</tbody></table>`;
  }
  $('#drawer-body').innerHTML = html + timeline;
  $('#drawer').hidden = false;
}

function closeModal() {
  $('#modal').hidden = true;
  ui.checkout = null;
}

function render() {
  renderShell();
  const views = { discover: viewDiscover, movies: viewMovies, events: viewEvents, venues: viewVenues, bookings: viewBookings, approvals: viewApprovals, expenses: viewExpenses, splits: viewSplits, spend: viewSpend, activity: viewActivity };
  $('#view').innerHTML = (views[ui.tab] || viewDiscover)();
}
async function refresh() {
  ui.state = await api('/api/state');
  render();
}
async function loadShowtimes() {
  ui.showtimes = null;
  render();
  ui.showtimes = await api(`/api/showtimes?movie=${encodeURIComponent(ui.movie)}&date=${ui.movieDate}&${locQS()}`);
  render();
}

// ---------- events ----------
document.addEventListener('click', async (e) => {
  const t = e.target.closest('button, [data-booking], [data-open], .tier');
  if (!t || t.closest('#modal-body [data-seat]')) return;
  const ds = t.dataset;
  if (ds.close === 'modal') return closeModal();
  if (ds.close === 'drawer') return ($('#drawer').hidden = true);
  if (t.id === 'loc-btn' || t.closest('#loc-btn')) return openLocation();
  if (ds.tab) {
    ui.tab = ds.tab;
    store.set('eos.tab', ui.tab);
    render();
    return window.scrollTo(0, 0);
  }
  if (ds.cat) {
    const c = ds.cat;
    ui.tab = c === 'movies' ? 'movies' : c === 'events' ? 'events' : 'venues';
    if (ui.tab === 'venues') ui.venueCat = c;
    store.set('eos.tab', ui.tab);
    return render();
  }
  if (ds.suggest) return askConcierge(ds.suggest);
  if (ds.etype) return ((ui.eventType = ds.etype), render());
  if (ds.lang) return ((ui.movieLang = ds.lang), render());
  if (ds.vcat) return ((ui.venueCat = ds.vcat), render());
  if (ds.filter) return ((ui.bookingFilter = ds.filter), render());
  if (ds.movie && !t.disabled) {
    ui.tab = 'movies';
    ui.movie = ds.movie;
    await loadShowtimes();
    return $('#movie-detail')?.scrollIntoView({ behavior: 'smooth' });
  }
  if (ds.mdate) return ((ui.movieDate = ds.mdate), loadShowtimes());
  if (ds.show) return openSeats(ds.show);
  if (ds.event) return openEvent(ds.event);
  if (ds.venue) return openVenue(ds.venue);
  if (ds.booking) return openDrawer(ds.booking);
  if (ds.open) return openDrawer(ds.open);
  if (ds.decide) {
    const note = $(`[data-note="${ds.id}"]`)?.value;
    return run(() => api(`/api/decisions/${ds.id}`, { decision: ds.decide, note }), (r) => `${r.id} → ${statusLabel[r.status] || r.status}`);
  }
  if (ds.submit) return run(() => api(`/api/reports/${ds.submit}/submit`, {}), (r) => `${r.id} submitted to ${r.routeTo}`);
  if (ds.cancel) {
    $('#drawer').hidden = true;
    ui.showtimes = null;
    return run(() => api(`/api/bookings/${ds.cancel}/cancel`, {}), 'Booking cancelled');
  }
  if (ds.settle) {
    const x = JSON.parse(ds.settle);
    return run(() => api(`/api/groups/${x.g}/settle`, { from: x.from, to: x.to, amount: x.amount }), 'Payment recorded');
  }
  if (t.id === 'reload-demo') return run(async () => { await api('/api/demo', {}); ui.showtimes = null; }, 'Demo data reloaded');
});

document.addEventListener('submit', async (e) => {
  const f = e.target;
  if (['loc-form', 'co-form'].includes(f.id)) return;
  e.preventDefault();
  const fd = new FormData(f);
  if (f.id === 'ask-form') return askConcierge($('#ask').value);
  if (f.id === 'hero-form') return askConcierge($('#hero-ask').value);
  if (f.id === 'report-form') {
    const submit = e.submitter?.value === 'submit';
    return run(() => api('/api/reports', { bookingIds: fd.getAll('b'), purpose: fd.get('purpose') || undefined, notes: fd.get('notes'), submit }), (r) => (submit ? `${r.id} submitted to ${r.routeTo}` : `${r.id} saved as draft`));
  }
  if (f.dataset.expense) {
    const g = ui.state.groups.find((x) => x.id === f.dataset.expense);
    const weights = {};
    for (const m of g.members) if (fd.get(`w_${m}`)) weights[m] = Number(fd.get(`w_${m}`));
    return run(() => api(`/api/groups/${g.id}/expenses`, { description: fd.get('description'), amount: fd.get('amount'), paidBy: fd.get('paidBy'), method: fd.get('method'), weights }), 'Expense split');
  }
  if (f.id === 'group-form') return run(() => api('/api/groups', { name: fd.get('name'), type: fd.get('type'), members: fd.getAll('m') }), 'Group created');
});

$('#actor').addEventListener('change', async (e) => {
  ui.actor = e.target.value;
  store.set('eos.actor', ui.actor);
  ui.state = await api('/api/state');
  await loadDiscover();
  render();
});
$('#modal').addEventListener('click', (e) => {
  if (e.target.id === 'modal') closeModal();
});

(async () => {
  try {
    ui.locations = await api('/api/locations');
    ui.state = await api('/api/state');
    await loadDiscover();
    render();
  } catch (e) {
    toast(e.message, true);
  }
})();
