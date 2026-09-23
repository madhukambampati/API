// Chat agent: a conversational front door that drives the other agents step by step.
// Movie flow: theatres near you → movies & shows at a theatre → seats → who pays → payment → ticket.
// Event flow: events near you → tier → quantity → who pays → payment → ticket.
// Anything else goes to the Concierge for a priced proposal.
import { person, load, save } from '../store.js';
import { normaliseLocation, locationLabel, COUNTRY_META, findCityInText, DEFAULT_LOCATION } from '../locations.js';
import { cinemas, showtimesAtCinema, seatMap, bestSeats, parseShowKey, findMovie, events, findEvent, EVENT_TYPES, movies } from '../catalog.js';
import { parseDate } from './concierge.js';
import * as orchestrator from './orchestrator.js';
import * as expense from './expense.js';
import * as payment from './payment.js';
import * as live from '../live/index.js';
import { inr, CURRENCY, convert } from '../money.js';
import { FX_FALLBACK } from '../live/providers.js';

const sessions = new Map();
const MAX_SESSIONS = 500;

// ---------- small helpers ----------
const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (date, n) => iso(new Date(Date.parse(date) + n * 86400000));
const say = (text, extra = {}) => ({ role: 'agent', text, ...extra });
const opt = (label, action) => ({ label, action });
const txt = (label, text = label) => ({ label, text });

function localNow(loc) {
  const b = live.get(loc);
  const offset = b?.weather ? b.weather.utcOffsetSeconds : loc.country === 'India' ? 19800 : -new Date().getTimezoneOffset() * 60;
  const t = new Date(Date.now() + offset * 1000);
  return { date: iso(t), minutes: t.getUTCHours() * 60 + t.getUTCMinutes() };
}
const toMin = (hhmm) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
const dayWord = (s, date) => (date === localNow(s.loc).date ? 'today' : date === addDays(localNow(s.loc).date, 1) ? 'tomorrow' : `on ${new Date(`${date}T12:00:00Z`).toUTCString().slice(0, 11)}`);

function upcomingShows(s, shows, date) {
  const now = localNow(s.loc);
  return date === now.date ? shows.filter((sh) => toMin(sh.time) > now.minutes + 10) : shows;
}

function sourceNote(loc) {
  const b = live.get(loc);
  const real = cinemas(loc)[0]?.source === 'OpenStreetMap';
  const mv = b?.moviesSource;
  return [real ? 'Theatres are real places from OpenStreetMap' : 'Theatres are sample data (live map data unavailable)', mv ? `films from ${mv}` : 'films are sample data', 'showtimes, seat maps and prices are simulated'].join('; ') + '.';
}

function wantsTime(t) {
  return /morning/.test(t) ? [0, 720] : /afternoon|matinee/.test(t) ? [720, 1020] : /late night|midnight/.test(t) ? [1260, 1440] : /evening|night|after work/.test(t) ? [1020, 1320] : null;
}

function readCount(t) {
  const m = t.match(/\b(\d{1,2})\s*(?:tickets?|seats?|people|persons?|of us|pax|adults)\b/) || t.match(/\bfor\s+(\d{1,2})\b/);
  if (m) return Number(m[1]);
  const words = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8 };
  const w = t.match(/\b(one|two|three|four|five|six|seven|eight)\s+(?:tickets?|seats?|people|of us)\b/);
  if (w) return words[w[1]];
  if (/\b(me and my (?:wife|husband|partner|friend)|couple|two of us)\b/.test(t)) return 2;
  if (/\bjust me|only me|myself\b/.test(t)) return 1;
  return null;
}

function readFunding(t, s) {
  const groups = load().groups.filter((g) => g.members.includes(s.actorId));
  if (/\b(split|share)\b|\bfamily\b|\bfriends\b|\bgang\b/.test(t)) {
    const type = /\bfamily\b/.test(t) ? 'family' : /\bfriends\b|\bgang\b/.test(t) ? 'friends' : null;
    const g = groups.find((x) => !type || x.type === type);
    if (g) return { funding: 'shared', groupId: g.id };
  }
  if (/expense|reimburs|claim/.test(t)) return { funding: 'reimbursable', purpose: /client/.test(t) ? 'business' : /team/.test(t) ? 'morale' : 'wellbeing' };
  if (/\b(team|office|company|colleagues|offsite)\b/.test(t)) return { funding: 'corporate', purpose: 'morale' };
  if (/\b(just me|myself|personal|on me|i will pay|i'll pay)\b/.test(t)) return { funding: 'personal', purpose: 'personal' };
  return null;
}

// Match a theatre the user named ("PVR Orion", "Galaxy"), ignoring generic words and the city.
const GENERIC = new Set(['cinema', 'cinemas', 'multiplex', 'theatre', 'theater', 'theatres', 'screens', 'screen', 'mall', 'central', 'movie', 'movies', 'the', 'and', 'city', 'plaza', 'centre', 'center']);
function cinemaByName(s, t) {
  const cityWords = s.loc.city.toLowerCase().split(/\s+/);
  return cinemas(s.loc).find((c) =>
    c.name
      .toLowerCase()
      .split(/[\s—–,()-]+/)
      .filter((w) => w.length >= 3 && !GENERIC.has(w) && !cityWords.includes(w))
      .some((w) => new RegExp(`\\b${w.replace(/[^a-z0-9]/g, '')}\\b`).test(t)),
  );
}

// ---------- session ----------
function create(actorId, location) {
  if (sessions.size >= MAX_SESSIONS) sessions.delete(sessions.keys().next().value);
  const me = person(actorId);
  const s = { id: `chat-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, actorId, loc: normaliseLocation(location || me.home || DEFAULT_LOCATION), step: 'idle', ctx: {} };
  sessions.set(s.id, s);
  return s;
}

function greet(s, out) {
  const me = person(s.actorId);
  out.push(
    say(`Hi ${me.name.split(' ')[0]} 👋 I'm your entertainment concierge for ${locationLabel(s.loc)}. Tell me what you're planning and I'll find it, check your budget and approvals, pick seats and take you through payment.`, {
      options: [
        txt('🎬 Movie today — check theatres near me', "I'm planning to go for a movie today, can you check the theatres near me?"),
        txt('🎟️ Events this weekend', 'Any concerts or sports events this weekend?'),
        txt('👨‍👩‍👧 Family movie on Saturday', 'Movie with my family on Saturday evening'),
        txt('🍽️ Client dinner for 6 tomorrow', 'Book a client dinner for 6 tomorrow'),
        txt('🏒 Hockey tickets this week', 'Any hockey or basketball games this week?'),
      ],
    }),
  );
}

// ---------- movie flow ----------
function startMovie(s, text, out) {
  const t = text.toLowerCase();
  const { date, explicit } = parseDate(text, new Date(`${localNow(s.loc).date}T12:00:00Z`));
  const fund = readFunding(t, s);
  const list = movies(s.loc);
  const wanted = list.find((m) => m.title && t.includes(m.title.toLowerCase().split(':')[0].trim()));
  s.step = 'cinemas';
  s.ctx = {
    kind: 'movie',
    date: explicit ? date : localNow(s.loc).date,
    count: readCount(t),
    window: wantsTime(t),
    movieId: wanted?.id || null,
    format: /imax/.test(t) ? 'IMAX' : /\b3d\b/.test(t) ? '3D' : /recliner/.test(t) ? 'Recliner' : null,
    ...(fund || {}),
    fundingExplicit: Boolean(fund),
  };
  if (fund?.funding === 'shared' && !s.ctx.count) s.ctx.count = load().groups.find((g) => g.id === fund.groupId).members.length;
  // Named a theatre? Go straight to it.
  const named = cinemaByName(s, t);
  if (named) return pickCinema(s, named.id, out);
  return listCinemas(s, out);
}

function listCinemas(s, out) {
  const { date, movieId, window } = s.ctx;
  const rows = cinemas(s.loc)
    .map((c) => {
      let slate = showtimesAtCinema(c.id, date, s.loc).map((x) => ({ ...x, shows: upcomingShows(s, x.shows, date) })).filter((x) => x.shows.length);
      if (movieId) slate = slate.filter((x) => x.movie.id === movieId);
      const inWindow = window ? slate.flatMap((x) => x.shows).filter((sh) => toMin(sh.time) >= window[0] && toMin(sh.time) < window[1]).length : null;
      return { id: c.id, name: c.name, distanceKm: c.distanceKm, address: c.address || null, formats: c.formats, source: c.source, movies: slate.length, shows: slate.reduce((n, x) => n + x.shows.length, 0), inWindow };
    })
    .filter((c) => c.shows > 0)
    .sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99));
  const movie = movieId ? findMovie(movieId, s.loc) : null;
  s.ctx.shown = rows.map((r) => r.id);
  if (!rows.length) {
    s.step = 'idle';
    out.push(say(`I couldn't find any more shows ${dayWord(s, date)}${movie ? ` for ${movie.title}` : ''} near ${s.loc.city}. Want me to check tomorrow?`, { options: [opt('Check tomorrow', { type: 'changeDate', date: addDays(date, 1) })] }));
    return;
  }
  out.push(
    say(`Here are ${rows.length} theatres near ${s.loc.city} with shows ${dayWord(s, date)}${movie ? ` for **${movie.title}**` : ''}. Pick one and I'll show you what's playing.`, {
      card: { type: 'cinemas', date, cinemas: rows },
      note: sourceNote(s.loc),
      options: [opt('Tomorrow instead', { type: 'changeDate', date: addDays(date, 1) })],
    }),
  );
}

function pickCinema(s, cinemaId, out) {
  const cin = cinemas(s.loc).find((c) => c.id === cinemaId);
  if (!cin) return out.push(say("I couldn't find that theatre any more — here's the list again.")), listCinemas(s, out);
  s.ctx.cinemaId = cinemaId;
  const { date, window, movieId, format } = s.ctx;
  const slate = showtimesAtCinema(cinemaId, date, s.loc)
    .map((x) => ({
      movie: { id: x.movie.id, title: x.movie.title, language: x.movie.language, genre: x.movie.genre, cert: x.movie.cert, poster: x.movie.poster || null, colors: x.movie.colors, rating: x.movie.rating || null, source: x.movie.source },
      shows: upcomingShows(s, x.shows, date).map((sh) => ({ ...sh, match: (!window || (toMin(sh.time) >= window[0] && toMin(sh.time) < window[1])) && (!format || sh.format === format) })),
      wanted: x.movie.id === movieId,
    }))
    .filter((x) => x.shows.length)
    .sort((a, b) => Number(b.wanted) - Number(a.wanted));
  if (!slate.length) {
    out.push(say(`${cin.name} has no more shows ${dayWord(s, date)}.`, { options: [opt('Other theatres', { type: 'listCinemas' }), opt('Check tomorrow', { type: 'changeDate', date: addDays(date, 1) })] }));
    return;
  }
  s.step = 'shows';
  const hint = window || format ? ' Shows that match what you asked for are highlighted.' : '';
  out.push(say(`**${cin.name}** has ${slate.length} movie${slate.length > 1 ? 's' : ''} ${dayWord(s, date)}. Tap a showtime to choose seats.${hint}`, { card: { type: 'cinemaMovies', cinema: { id: cin.id, name: cin.name, address: cin.address || null, distanceKm: cin.distanceKm }, date, movies: slate }, options: [opt('← Other theatres', { type: 'listCinemas' })] }));
}

function pickShow(s, showKey, out) {
  const { movieId, cinemaId, date, time, format } = parseShowKey(showKey);
  const shows = showtimesAtCinema(cinemaId, date, s.loc).find((x) => x.movie.id === movieId)?.shows || [];
  const show = shows.find((x) => x.key === showKey);
  if (!show) return out.push(say("That show isn't available any more — pick another time.")), pickCinema(s, cinemaId, out);
  s.ctx = { ...s.ctx, showKey, movieId, cinemaId, date, time, format, price: show.price };
  if (s.ctx.count) return showSeats(s, out);
  s.step = 'count';
  const movie = findMovie(movieId, s.loc);
  const groups = load().groups.filter((g) => g.members.includes(s.actorId));
  out.push(
    say(`${movie.title} · ${time} · ${format} at ${inr(show.price)} a seat. How many tickets?`, {
      options: [1, 2, 3, 4, 5, 6].map((n) => opt(String(n), { type: 'count', n })).concat(groups.map((g) => opt(`Everyone in ${g.name} (${g.members.length})`, { type: 'count', n: g.members.length, groupId: g.id }))),
    }),
  );
}

function showSeats(s, out) {
  const { showKey, count, date, time, format, price } = s.ctx;
  const map = seatMap(showKey, load().seatBookings?.[showKey] || []);
  const best = bestSeats(map, count);
  const movie = findMovie(s.ctx.movieId, s.loc);
  const cin = cinemas(s.loc).find((c) => c.id === s.ctx.cinemaId);
  s.step = 'seats';
  out.push(
    say(best ? `I've picked the best ${count} seats together for you: **${best.join(', ')}**. Tap seats to change them, or confirm.` : `There aren't ${count} seats together left — pick any ${count} seats on the map.`, {
      card: { type: 'seats', showKey, rows: map.rows, aisleAfter: map.aisleAfter, suggested: best || [], count, price, title: movie.title, cinema: cin?.name, date, time, format },
    }),
  );
}

// ---------- event flow ----------
const EVENT_WORDS = [
  ['music', /concert|\bgig\b|music|band|jazz|qawwali|carnatic|dj/],
  ['sports', /sport|match|game|cricket|\bipl\b|hockey|\bnhl\b|basketball|\bnba\b|football|soccer|baseball|\bmlb\b|\bmls\b|\bcfl\b|raptors|maple leafs|blue jays|canucks|canadiens|kabaddi|marathon/],
  ['tech', /\btech\b|conference|summit|meetup|hackathon|devcon|startup/],
  ['comedy', /comedy|stand-?up|improv/],
  ['theatre', /\bplay\b|drama|musical|theatre show/],
  ['food', /food|festival|carnival/],
];

function startEvents(s, text, out) {
  const t = text.toLowerCase();
  const type = (EVENT_WORDS.find(([, re]) => re.test(t)) || [null])[0];
  const today = localNow(s.loc).date;
  const { date, explicit } = parseDate(text, new Date(`${today}T12:00:00Z`));
  const fund = readFunding(t, s);
  s.ctx = { kind: 'event', type, count: readCount(t), ...(fund || {}), fundingExplicit: Boolean(fund) };
  if (fund?.funding === 'shared' && !s.ctx.count) s.ctx.count = load().groups.find((g) => g.id === fund.groupId).members.length;
  let from = today;
  let to = addDays(today, 30);
  if (explicit) {
    from = /weekend/.test(t) ? date : date;
    to = /weekend/.test(t) ? addDays(date, 1) : date;
  }
  const all = events(s.loc, { days: 60 }).filter((e) => e.local !== false && (!type || e.type === type));
  let list = all.filter((e) => e.date >= from && e.date <= to);
  let widened = false;
  if (!list.length) {
    list = all.filter((e) => e.date >= today).slice(0, 8);
    widened = true;
  }
  if (!list.length) {
    out.push(say(`I couldn't find ${type ? EVENT_TYPES[type].toLowerCase() + ' ' : ''}events near ${s.loc.city} right now.`, { options: [txt('Show all events', 'Show me all events near me')] }));
    return;
  }
  s.step = 'events';
  s.ctx.shown = list.slice(0, 8).map((e) => e.id);
  const elsewhere = events(s.loc, { days: 60 }).filter((e) => e.local === false && (!type || e.type === type)).length;
  const what = type ? EVENT_TYPES[type].toLowerCase() : '';
  out.push(
    say(`${widened ? `Nothing matched those dates, but here are the next ${what} events` : `Here's what's on`} near ${s.loc.city}. Pick one to see tickets.`, {
      card: { type: 'events', events: list.slice(0, 8).map((e) => ({ id: e.id, title: e.title, type: e.type, typeLabel: e.typeLabel, venue: e.venue, date: e.date, time: e.time, from: e.tiers[0]?.price, source: e.source, league: e.league || null, priceEstimated: Boolean(e.priceEstimated) })) },
      note: `Live fixtures come from TheSportsDB${process.env.TICKETMASTER_API_KEY ? ' and Ticketmaster' : ''}; anything marked "sample" is demo data.${elsewhere ? ` ${elsewhere} more live fixtures are elsewhere in ${s.loc.country}.` : ''}`,
    }),
  );
}

function pickEvent(s, eventId, out) {
  const e = findEvent(eventId, s.loc, { days: 60 });
  if (!e) return out.push(say("That event isn't listed any more."));
  s.ctx.eventId = e.id;
  s.step = 'tier';
  out.push(
    say(`**${e.title}** · ${e.venue} · ${e.date} ${e.time}. Which tickets?${e.priceEstimated ? ' (Prices are estimates — the organiser hasn’t published them.)' : ''}`, {
      options: e.tiers.map((t) => opt(`${t.name} · ${inr(t.price)}`, { type: 'tier', tier: t.name })),
    }),
  );
}

function pickTier(s, tier, out) {
  s.ctx.tier = tier;
  if (s.ctx.count) return askPayer(s, out);
  s.step = 'count';
  const groups = load().groups.filter((g) => g.members.includes(s.actorId));
  out.push(say('How many tickets?', { options: [1, 2, 3, 4, 5, 6].map((n) => opt(String(n), { type: 'count', n })).concat(groups.map((g) => opt(`Everyone in ${g.name} (${g.members.length})`, { type: 'count', n: g.members.length, groupId: g.id }))) }));
}

// ---------- shared: who pays → payment → ticket ----------
function draftOf(s) {
  const c = s.ctx;
  const funding = c.funding || 'personal';
  const purpose = c.purpose || (funding === 'corporate' ? 'morale' : funding === 'reimbursable' ? 'wellbeing' : 'personal');
  const base = { funding, purpose, groupId: funding === 'shared' ? c.groupId : null, clientFacing: false, location: s.loc, reasoning: ['Booked through the chat concierge.'] };
  if (c.kind === 'movie') return { ...base, category: 'movies', details: { kind: 'movie', showKey: c.showKey, seats: c.seats } };
  return { ...base, category: 'events', details: { kind: 'event', eventId: c.eventId, tier: c.tier, qty: c.count } };
}

function askPayer(s, out) {
  if (s.ctx.fundingExplicit) return review(s, out);
  s.step = 'payer';
  const groups = load().groups.filter((g) => g.members.includes(s.actorId));
  out.push(
    say('Who is paying for this?', {
      options: [
        opt('🙋 Just me', { type: 'payer', funding: 'personal' }),
        ...groups.map((g) => opt(`👥 Split with ${g.name}`, { type: 'payer', funding: 'shared', groupId: g.id })),
        opt('🏢 Company (team outing)', { type: 'payer', funding: 'corporate' }),
        opt('🧾 I pay & expense it', { type: 'payer', funding: 'reimbursable' }),
      ],
    }),
  );
}

function review(s, out) {
  let p;
  try {
    p = orchestrator.preview(draftOf(s), s.actorId);
  } catch (err) {
    out.push(say(`⚠️ ${err.message}`));
    if (s.ctx.kind === 'movie') showSeats(s, out);
    return;
  }
  const d = p.draft;
  const b = p.budget;
  const lines = [
    d.details.kind === 'movie' ? `${d.details.movieTitle} · ${d.details.cinema} · ${d.date} ${d.details.time} · ${d.details.format} · seats ${d.details.seats.join(', ')}` : `${d.details.eventTitle} · ${d.details.venue} · ${d.date} ${d.details.time} · ${d.details.qty} × ${d.details.tier}`,
  ];
  const agents = [`💰 Budget agent: ${b.notes.join(' ')}`, `🛡️ Policy agent: ${p.policyNotes.join(' ')}${p.approvals.length ? ` ${p.approvals.map((a) => `${a.role}: ${a.approverName}`).join(' → ')}.` : ''}`];
  if (d.funding === 'shared') {
    const g = load().groups.find((x) => x.id === d.groupId);
    agents.push(`👥 Split agent: you pay ${inr(d.amount)} now; each of the ${g.members.length} people in ${g.name} owes about ${inr(d.amount / g.members.length)} and I'll add it to the group ledger.`);
  }
  if (d.funding === 'reimbursable') agents.push(`🧾 Expense agent: after payment I can file the expense report for you (${d.purpose === 'business' ? 'Finance' : d.purpose === 'morale' ? 'HR' : 'Benefits'}).`);
  s.ctx.amount = d.amount;
  if (d.funding === 'corporate') {
    s.step = 'corporate';
    out.push(say(p.approvals.length ? `This goes on the company card, but it needs approval first. I'll hold your seats and send it to ${p.approvals[0].approverName}.` : 'This is within the auto-approval limit, so it goes straight on the company card.', { card: { type: 'review', lines, agents, amount: d.amount }, options: [opt(p.approvals.length ? '📨 Send for approval' : '✅ Confirm booking', { type: 'corporate' }), opt('Change who pays', { type: 'askPayer' })] }));
    return;
  }
  s.step = 'payment';
  const meta = COUNTRY_META[s.loc.country];
  const fx = live.get(s.loc)?.fx;
  const conv = meta && meta.currency !== CURRENCY ? convert(d.amount, CURRENCY, meta.currency, { ...FX_FALLBACK, ...(fx?.rates || {}) }) : null;
  const localAmount = conv ? `${meta.symbol}${conv.toFixed(2)}` : null;
  out.push(
    say('All checks passed. Here is your payment page.', {
      card: { type: 'payment', lines, agents, amount: d.amount, localAmount, methods: payment.methodsFor(s.loc.country), funding: d.funding },
      options: [opt('Change who pays', { type: 'askPayer' })],
    }),
  );
}

function finish(s, booking, out) {
  s.step = 'done';
  s.ctx.bookingId = booking.id;
  const options = [txt('🎬 Book another movie', 'I want to watch another movie'), txt('🎟️ Find events', 'What events are on this weekend?')];
  if (booking.funding === 'reimbursable' && booking.status === 'confirmed') options.unshift(opt('🧾 File my expense report now', { type: 'expense', bookingId: booking.id }));
  const pending = booking.status === 'pending_approval';
  out.push(
    say(pending ? `Sent for approval — your seats are held. I'll confirm as soon as ${person(booking.approvals.find((a) => a.status === 'pending').approverId).name} approves.` : `🎉 You're booked! Your ${booking.category === 'movies' ? 'm-tickets have' : 'e-tickets have'} been sent.`, {
      card: { type: 'ticket', booking: { id: booking.id, title: booking.title, vendor: booking.vendor, date: booking.date, time: booking.details?.time, seats: booking.details?.seats || null, tier: booking.details?.tier || null, qty: booking.details?.qty || null, amount: booking.amount, status: booking.status, confirmation: booking.confirmation, payment: booking.payment ? { label: booking.payment.label, ref: booking.payment.ref } : null, funding: booking.funding } },
      options,
    }),
  );
}

function pay(s, action, out) {
  const draft = draftOf(s);
  let p;
  try {
    p = orchestrator.preview(draft, s.actorId); // re-check seats & price right before charging
  } catch (err) {
    out.push(say(`⚠️ ${err.message}`));
    if (s.ctx.kind === 'movie') showSeats(s, out);
    return;
  }
  let receipt;
  try {
    receipt = payment.authorize({ amount: p.draft.amount, method: action.method, upiId: action.upiId, country: s.loc.country });
  } catch (err) {
    out.push(say(`⚠️ ${err.message}`));
    return;
  }
  const booking = orchestrator.createBooking(draft, s.actorId, { payment: receipt });
  finish(s, booking, out);
}

// ---------- entry point ----------
export async function handle({ sessionId, actorId, text, action, location }) {
  let s = sessions.get(sessionId);
  if (!s || s.actorId !== actorId) s = create(actorId, location);
  if (location && s.step === 'idle') s.loc = normaliseLocation(location);
  await live.ensure(s.loc);
  const out = [];
  try {
    if (action) await onAction(s, action, out);
    else if (text && text.trim()) await onText(s, text.trim().slice(0, 500), out);
    else greet(s, out);
  } catch (err) {
    out.push(say(`⚠️ ${err.message}`));
  }
  return { sessionId: s.id, step: s.step, location: s.loc, messages: out };
}

async function onAction(s, a, out) {
  switch (a.type) {
    case 'pickCinema':
      return pickCinema(s, a.cinemaId, out);
    case 'listCinemas':
      return listCinemas(s, out);
    case 'changeDate':
      s.ctx.date = a.date;
      return s.ctx.kind === 'movie' && s.ctx.cinemaId && s.step === 'shows' ? pickCinema(s, s.ctx.cinemaId, out) : ((s.ctx.kind = 'movie'), listCinemas(s, out));
    case 'pickShow':
      return pickShow(s, a.showKey, out);
    case 'count':
      s.ctx.count = Math.max(1, Math.min(10, Number(a.n) || 1));
      if (a.groupId) Object.assign(s.ctx, { funding: 'shared', groupId: a.groupId, fundingExplicit: true });
      return s.ctx.kind === 'movie' ? showSeats(s, out) : askPayer(s, out);
    case 'confirmSeats':
      s.ctx.seats = (a.seats || []).slice(0, 10);
      if (s.ctx.seats.length !== s.ctx.count) s.ctx.count = s.ctx.seats.length;
      if (!s.ctx.seats.length) return out.push(say('Pick at least one seat.'));
      return askPayer(s, out);
    case 'pickEvent':
      return pickEvent(s, a.eventId, out);
    case 'tier':
      return pickTier(s, a.tier, out);
    case 'askPayer':
      s.ctx.fundingExplicit = false;
      return askPayer(s, out);
    case 'payer':
      Object.assign(s.ctx, { funding: a.funding, groupId: a.groupId || null, purpose: a.funding === 'corporate' ? 'morale' : a.funding === 'reimbursable' ? 'wellbeing' : 'personal', fundingExplicit: true });
      return review(s, out);
    case 'pay':
      return pay(s, a, out);
    case 'corporate': {
      const d = orchestrator.preview(draftOf(s), s.actorId).draft;
      const booking = orchestrator.createBooking(draftOf(s), s.actorId, { payment: payment.companyCard(d.amount) });
      return finish(s, booking, out);
    }
    case 'expense': {
      const r = expense.createReport({ ownerId: s.actorId, bookingIds: [a.bookingId], submit: true });
      save();
      return out.push(say(`🧾 Done — expense report ${r.id} for ${inr(r.claimable)} is filed and routed to ${r.routeTo} (${r.approvals.map((x) => person(x.approverId).name).join(' → ')}).`, { options: [txt('🎬 Book another movie', 'I want to watch another movie')] }));
    }
    case 'restart':
      s.step = 'idle';
      s.ctx = {};
      return greet(s, out);
    default:
      return out.push(say("Sorry, I didn't get that."));
  }
}

async function onText(s, text, out) {
  const t = text.toLowerCase();
  if (/^(start over|restart|reset|cancel|new chat)\b/.test(t)) return onAction(s, { type: 'restart' }, out);
  const city = findCityInText(text, s.loc.country);
  if (city && city.city !== s.loc.city) {
    s.loc = city;
    await live.ensure(s.loc);
    out.push(say(`📍 Switched to ${locationLabel(s.loc)}.`));
  }

  // Answers to the current step, typed instead of tapped.
  const num = t.match(/^\s*(?:the\s+)?(\d{1,2}|first|second|third|fourth|fifth)\b/);
  const ordinal = num ? { first: 1, second: 2, third: 3, fourth: 4, fifth: 5 }[num[1]] || Number(num[1]) : null;
  if (s.step === 'cinemas') {
    const byName = cinemaByName(s, t);
    if (byName) return pickCinema(s, byName.id, out);
    if (ordinal && s.ctx.shown?.[ordinal - 1]) return pickCinema(s, s.ctx.shown[ordinal - 1], out);
  }
  if (s.step === 'shows') {
    const slate = showtimesAtCinema(s.ctx.cinemaId, s.ctx.date, s.loc);
    const m = t.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/);
    const movie = slate.find((x) => t.includes(x.movie.title.toLowerCase().split(':')[0].trim()));
    if (m) {
      let h = Number(m[1]) % 12;
      if (m[3] === 'pm' || (!m[3] && h < 9)) h += 12;
      if (m[3] === 'am' && h === 12) h = 0;
      const want = h * 60 + Number(m[2] || 0);
      const candidates = (movie ? [movie] : slate).flatMap((x) => upcomingShows(s, x.shows, s.ctx.date));
      const best = candidates.sort((a, b) => Math.abs(toMin(a.time) - want) - Math.abs(toMin(b.time) - want))[0];
      if (best) return pickShow(s, best.key, out);
    }
  }
  if (s.step === 'count') {
    const n = readCount(t) || ordinal;
    if (n) return onAction(s, { type: 'count', n }, out);
  }
  if (s.step === 'seats') {
    const seats = [...text.toUpperCase().matchAll(/\b([A-J])\s?(\d{1,2})\b/g)].map((m) => `${m[1]}${m[2]}`);
    if (seats.length) return onAction(s, { type: 'confirmSeats', seats }, out);
    if (/best|pick|choose|any|you decide|ok|fine|confirm|yes/.test(t)) {
      const best = bestSeats(seatMap(s.ctx.showKey, load().seatBookings?.[s.ctx.showKey] || []), s.ctx.count);
      if (best) return onAction(s, { type: 'confirmSeats', seats: best }, out);
    }
  }
  if (s.step === 'payer' || s.step === 'payment' || s.step === 'corporate') {
    const fund = readFunding(t, s);
    if (fund) {
      Object.assign(s.ctx, fund, { fundingExplicit: true });
      return review(s, out);
    }
    if (s.step === 'payment' && s.loc.country === 'Canada') {
      const handle = text.match(/\S+@\S+\.\S+|\+?1?\d{10}/);
      if (handle || /\binterac\b/.test(t)) return pay(s, { method: 'interac', upiId: handle?.[0] }, out);
      if (/\b(card|credit|debit|visa|mastercard|pay)\b/.test(t)) return pay(s, { method: /apple|google|wallet/.test(t) ? 'wallet' : 'card' }, out);
    }
    const upi = text.match(/[\w.-]{2,64}@[a-zA-Z]{2,32}/);
    if (s.step === 'payment' && (upi || /\b(upi|card|netbanking|pay)\b/.test(t))) {
      const method = upi || /upi/.test(t) ? 'upi' : /netbank/.test(t) ? 'netbanking' : 'card';
      return pay(s, { method, upiId: upi?.[0] }, out);
    }
  }
  if (s.step === 'events' && ordinal && s.ctx.shown?.[ordinal - 1]) return pickEvent(s, s.ctx.shown[ordinal - 1], out);

  // New request.
  if (/\b(movie|movies|film|cinema|cinemas|theat(?:re|er)s?|multiplex|imax|showtimes?)\b/.test(t) && !/\bplay\b|drama|musical/.test(t)) return startMovie(s, text, out);
  if (EVENT_WORDS.some(([, re]) => re.test(t)) || /\bevents?\b|what'?s on|tickets? for/.test(t)) return startEvents(s, text, out);
  if (/^(hi|hello|hey|namaste|help)\b/.test(t)) return greet(s, out);

  // Anything else (dinner, catering, gifts, offsites…) → the Concierge's priced proposal.
  const plan = await orchestrator.plan(text, s.actorId, { location: s.loc });
  s.step = 'idle';
  out.push(
    say(`Here's what I'd book: **${plan.draft.title}** at ${plan.draft.vendor} for ${inr(plan.draft.amount)}. ${plan.approvals.length ? `It needs approval from ${plan.approvals.map((a) => a.approverName).join(' → ')}.` : 'No approval needed.'}`, {
      card: { type: 'proposal', draft: plan.draft, budget: plan.budget.notes, approvals: plan.approvals.map((a) => `${a.role}: ${a.approverName}`) },
      options: [opt('Review & book', { type: 'openCheckout' })],
    }),
  );
}
