// Concierge agent: turns a free-text ask into a priced, location-aware booking draft.
// Handles dining/venues, movie tickets (showtime + best seats) and events near you.
import { load, person } from '../store.js';
import { CATEGORIES } from '../seed.js';
import { parseWithClaude } from '../llm.js';
import { findCityInText, normaliseLocation, DEFAULT_LOCATION, locationLabel } from '../locations.js';
import { vendors, movies, showtimes, seatMap, bestSeats, events, findEvent, findMovie, parseShowKey, cinemas, MOVIES, EVENT_TYPES } from '../catalog.js';
import { inr, parseAmount } from '../money.js';

const KEYWORDS = [
  ['movies', /\b(movie|movies|film|cinema|screening|imax|recliner|matinee|multiplex)\b/i],
  ['pdr', /private (dining|room)|\bpdr\b|buyout|banquet|event space/i],
  ['catering', /cater|(?:lunch|breakfast|dinner)\b[^\d]*\d{2,}\s*(?:people|guests|pax)|boxed|buffet/i],
  ['events', /concert|\bgig\b|music|festival|\bmatch\b|cricket|\bt20\b|football|kabaddi|marathon|\btech\b|summit|conference|meetup|hackathon|devcon|comedy|stand-?up|improv|\bplay\b|theatre|theater|musical|carnival|live event|tickets? (?:for|to) (?:the )?(?:game|show)/i],
  ['gifting', /gift|merch|swag|hamper|diwali box|festive box/i],
  ['experiences', /offsite|retreat|tour|experience|trail|walk|spa|trip|class|workshop|houseboat/i],
  ['reservations', /dinner|lunch|brunch|table|reservation|restaurant|drinks|dine/i],
];
const EVENT_TYPE_WORDS = [
  ['music', /concert|\bgig\b|music|festival|qawwali|carnatic|bollywood|indie/i],
  ['sports', /\bmatch\b|cricket|\bt20\b|football|kabaddi|marathon|\brun\b|stadium|sports?/i],
  ['tech', /\btech\b|summit|conference|meetup|hackathon|devcon|\bai\b|cloud|startup/i],
  ['comedy', /comedy|stand-?up|improv/i],
  ['theatre', /\bplay\b|theatre|theater|musical|drama/i],
  ['food', /food|carnival|coffee|chai/i],
];

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const iso = (d) => d.toISOString().slice(0, 10);

export function parseDate(text, now = new Date()) {
  const t = text.toLowerCase();
  const base = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const plus = (n) => iso(new Date(base.getTime() + n * 86400000));
  if (/tonight|today/.test(t)) return { date: iso(base), explicit: true };
  if (/tomorrow/.test(t)) return { date: plus(1), explicit: true };
  if (/weekend/.test(t)) return { date: plus((6 - base.getUTCDay() + 7) % 7), explicit: true };
  const isoMatch = t.match(/(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) return { date: isoMatch[1], explicit: true };
  const md = t.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})\b/) || t.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/);
  if (md) {
    const [mon, day] = MONTHS.includes(md[1]) ? [md[1], md[2]] : [md[2], md[1]];
    const month = MONTHS.indexOf(mon);
    let d = new Date(Date.UTC(base.getUTCFullYear(), month, Number(day)));
    if (d < base) d = new Date(Date.UTC(base.getUTCFullYear() + 1, month, Number(day)));
    return { date: iso(d), explicit: true };
  }
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayIdx = days.findIndex((d) => t.includes(d));
  if (dayIdx >= 0) return { date: plus((dayIdx - base.getUTCDay() + 7) % 7 || 7), explicit: true };
  return { date: plus(7), explicit: false };
}

export function parseRuleBased(text, now = new Date(), movieList = MOVIES) {
  const t = text.toLowerCase();
  const titleHit = movieList.find((m) => m.title && m.title.length > 2 && t.includes(m.title.toLowerCase().split(':')[0].trim()));
  const category = titleHit ? 'movies' : (KEYWORDS.find(([, re]) => re.test(text)) || ['reservations'])[0];
  const sizeMatch =
    t.match(/\b(\d+)\s*(?:tickets?|seats?|people|guests|clients|pax|attendees|recipients|of us|friends|folks|passes)\b/) || t.match(/\b(?:for|x)\s*(\d+)\b(?!\s*(?:am|pm|:))/);
  let partySize = sizeMatch ? Number(sizeMatch[1]) : category === 'catering' ? 25 : 2;
  const budget = parseAmount(text);

  let groupType = null;
  if (/\bfamily\b|\bmy (?:wife|husband|partner|kids|parents|sister|brother|mom|dad|amma|appa)\b|\bkids\b/.test(t)) groupType = 'family';
  else if (/\bfriends\b|buddies|\bgang\b|crew|pals/.test(t)) groupType = 'friends';

  const clientFacing = /client|customer|prospect/.test(t);
  let funding = 'corporate';
  let purpose = clientFacing ? 'business' : 'morale';
  if (/reimburs|expense it|claim/.test(t)) {
    funding = 'reimbursable';
    purpose = clientFacing ? 'business' : /wellness|wellbeing|allowance|stipend|spa/.test(t) ? 'wellbeing' : 'morale';
  } else if (groupType) {
    funding = 'shared';
    purpose = 'personal';
  } else if (/personal|my own|myself|on me|just me/.test(t)) {
    funding = 'personal';
    purpose = 'personal';
  } else if ((category === 'movies' || category === 'events') && !/team|office|client|company|colleagues/.test(t)) {
    funding = 'personal'; // a movie or concert night defaults to your own money
    purpose = 'personal';
  }
  if (/wellness|wellbeing|allowance|stipend/.test(t) && funding === 'corporate') {
    funding = 'reimbursable';
    purpose = 'wellbeing';
  }
  if (groupType && !sizeMatch) partySize = 0; // fill from group membership

  const format = /imax/.test(t) ? 'IMAX' : /\b3d\b/.test(t) ? '3D' : /recliner/.test(t) ? 'Recliner' : null;
  const timeOfDay = /morning/.test(t) ? 'morning' : /afternoon|matinee/.test(t) ? 'afternoon' : /late night|midnight/.test(t) ? 'late' : /evening|night|after work/.test(t) ? 'evening' : null;
  const eventType = category === 'events' ? (EVENT_TYPE_WORDS.find(([, re]) => re.test(text)) || [null])[0] : null;
  const premium = /\bvip\b|premium|\bbox\b|best seats|courtside|front row/.test(t);
  const { date, explicit } = parseDate(text, now);
  const title = text.trim().replace(/\s+/g, ' ').slice(0, 80);
  return { category, title, partySize, date, dateExplicit: explicit, funding, purpose, budget, groupType, clientFacing, movieId: titleHit?.id || null, format, timeOfDay, eventType, premium };
}

const inWindow = (time, tod) => {
  if (!tod) return true;
  const h = Number(time.slice(0, 2));
  return tod === 'morning' ? h < 12 : tod === 'afternoon' ? h >= 12 && h < 17 : tod === 'evening' ? h >= 17 && h < 22 : h >= 21;
};

function planMovie(intent, loc, reasoning) {
  const list = movies(loc);
  const movie = (intent.movieId && findMovie(intent.movieId, loc)) || (intent.format ? list.find((m) => m.formats.includes(intent.format)) : null) || list[0];
  const n = Math.max(1, intent.partySize);
  // Collect shows for the next week, then relax the wishes one at a time:
  // format + time of day → format → time of day → anything.
  const candidates = [];
  for (let add = 0; add < 7; add++) {
    const date = iso(new Date(Date.parse(intent.date) + add * 86400000));
    for (const s of showtimes(movie.id, date, loc)) for (const sh of s.shows) candidates.push({ ...sh, cinema: s.cinema, date, add });
  }
  const fmtOk = (o) => !intent.format || o.format === intent.format;
  const timeOk = (o) => inWindow(o.time, intent.timeOfDay);
  const passes = [(o) => fmtOk(o) && timeOk(o), fmtOk, timeOk, () => true];
  for (const pass of passes) {
    for (const show of candidates.filter(pass)) {
      const seats = bestSeats(seatMap(show.key, load().seatBookings?.[show.key] || []), n);
      if (!seats) continue;
      if (show.add) reasoning.push(`No matching show on ${intent.date}; the closest is on ${show.date}.`);
      if (intent.format && show.format !== intent.format) reasoning.push(`${intent.format} was not available — booked ${show.format} instead.`);
      reasoning.push(`Picked "${movie.title}" (${movie.language}, ${movie.cert}) at ${show.cinema.name}, ${show.date} ${show.time}, ${show.format}: ${n} seats together (${seats.join(', ')}).`);
      return {
        vendor: show.cinema.name,
        date: show.date,
        amount: show.price * n,
        title: `${movie.title} · ${show.format} · ${n} ticket${n > 1 ? 's' : ''}`,
        details: { kind: 'movie', movieId: movie.id, movieTitle: movie.title, language: movie.language, cinemaId: show.cinema.id, cinema: show.cinema.name, showKey: show.key, time: show.time, format: show.format, seats, pricePerSeat: show.price },
      };
    }
  }
  return null;
}

function planEvent(intent, loc, reasoning, now) {
  const all = events(loc, { now, days: 60 }).filter((e) => e.local !== false);
  let pool = intent.eventType ? all.filter((e) => e.type === intent.eventType) : all;
  const text = intent.title.toLowerCase();
  const titleHit = all.find((e) => {
    const core = e.title.toLowerCase().split(/[:—]/)[0].replace(loc.city.toLowerCase(), '').trim();
    return core.length > 6 && text.includes(core);
  });
  if (titleHit) pool = [titleHit];
  if (!pool.length) {
    reasoning.push(`No ${EVENT_TYPES[intent.eventType] || ''} events found near ${loc.city}; suggesting the next event instead.`);
    pool = all;
  }
  if (!pool.length) return null;
  const target = Date.parse(intent.date);
  const ev = intent.dateExplicit ? [...pool].sort((a, b) => Math.abs(Date.parse(a.date) - target) - Math.abs(Date.parse(b.date) - target))[0] : pool[0];
  const tier = intent.premium ? ev.tiers[ev.tiers.length - 1] : ev.tiers[0];
  const n = Math.max(1, intent.partySize);
  reasoning.push(`Found "${ev.title}" at ${ev.venue} on ${ev.date} ${ev.time} (${ev.distanceKm} km away): ${n} × ${tier.name} at ${inr(tier.price)}.`);
  return {
    vendor: ev.venue,
    date: ev.date,
    amount: tier.price * n,
    title: `${ev.title} · ${n} × ${tier.name}`,
    details: { kind: 'event', eventId: ev.id, eventTitle: ev.title, eventType: ev.type, venue: ev.venue, time: ev.time, tier: tier.name, pricePerTicket: tier.price, qty: n },
  };
}

function pickVendor(category, loc, budgetPerHead, text = '') {
  const options = vendors(category, loc).sort((a, b) => b.perPerson - a.perPerson);
  if (!options.length) return { vendor: 'Concierge-sourced vendor', perPerson: 1500 };
  const t = text.toLowerCase();
  if (budgetPerHead) return options.find((v) => v.perPerson <= budgetPerHead) || options[options.length - 1];
  if (category === 'reservations' && !/client|fine|special|anniversary/.test(t)) return options.find((v) => /casual|rooftop/.test(v.note)) || options[0];
  if (category === 'experiences' && !/offsite|retreat|overnight/.test(t)) return options.find((v) => /walk|trail|class|cooking/i.test(v.vendor + v.note)) || options[0];
  return options[0];
}

// Build a complete, priced draft the requester can review before committing.
export async function plan(text, requesterId, { now = new Date(), useLLM = true, location } = {}) {
  const requester = person(requesterId);
  if (!requester) throw new Error(`Unknown requester ${requesterId}`);
  const reasoning = [];
  const mentioned = findCityInText(text, (location || requester.home || DEFAULT_LOCATION).country);
  const loc = normaliseLocation(mentioned || location || requester.home || DEFAULT_LOCATION);
  reasoning.push(mentioned ? `Location taken from your request: ${locationLabel(loc)}.` : `Using your selected location: ${locationLabel(loc)}.`);

  let intent = null;
  if (useLLM) {
    const ai = await parseWithClaude(text, iso(now));
    if (ai) {
      intent = { ...parseRuleBased(text, now, movies(loc)), ...ai, dateExplicit: true };
      reasoning.push('Understood your request with Claude (structured output).');
    }
  }
  if (!intent) {
    intent = parseRuleBased(text, now, movies(loc));
    reasoning.push('Understood your request with the built-in rule engine.');
  }

  let groupId = null;
  let attendees = [requesterId];
  if (intent.funding === 'shared' || intent.groupType) {
    const group = load().groups.find((g) => g.type === (intent.groupType || 'friends') && g.members.includes(requesterId));
    if (group) {
      groupId = group.id;
      attendees = [...group.members];
      if (!intent.partySize) intent.partySize = group.members.length;
      intent.funding = 'shared';
      intent.purpose = 'personal';
      reasoning.push(`Matched ${group.type} group "${group.name}" (${group.members.length} people) to split the cost.`);
    } else if (intent.funding === 'shared') {
      intent.funding = 'personal';
      reasoning.push('No matching group found — treating it as a personal booking.');
    }
  }
  intent.partySize = Math.max(1, intent.partySize || 1);

  let priced = null;
  if (intent.category === 'movies') priced = planMovie(intent, loc, reasoning);
  else if (intent.category === 'events') priced = planEvent(intent, loc, reasoning, now);
  if (!priced) {
    if (intent.category === 'movies' || intent.category === 'events') {
      reasoning.push('Could not find tickets automatically — pick a show or event from the Movies / Events pages.');
      intent.category = 'reservations';
    }
    const perHeadBudget = intent.budget ? intent.budget / intent.partySize : null;
    const v = pickVendor(intent.category, loc, perHeadBudget, text);
    priced = { vendor: v.vendor, date: intent.date, amount: v.perPerson * intent.partySize, title: intent.title, details: null };
    reasoning.push(`Selected ${v.vendor} at ~${inr(v.perPerson)}/person × ${intent.partySize} = ${inr(priced.amount)}.`);
  }
  if (intent.budget && priced.amount > intent.budget) reasoning.push(`Estimate ${inr(priced.amount)} is above the ${inr(intent.budget)} you mentioned.`);
  reasoning.push(`Who pays: ${intent.funding}; purpose: ${intent.purpose}.`);

  return {
    category: intent.category,
    categoryLabel: CATEGORIES[intent.category].label,
    title: priced.title,
    vendor: priced.vendor,
    partySize: intent.partySize,
    date: priced.date,
    amount: Math.round(priced.amount * 100) / 100,
    funding: intent.funding,
    purpose: intent.purpose,
    clientFacing: Boolean(intent.clientFacing),
    groupId,
    attendees,
    location: loc,
    details: priced.details,
    requestedBy: requesterId,
    request: text.trim().slice(0, 300),
    reasoning,
  };
}

// Server-side re-pricing for ticketed bookings so a client can't change prices or grab sold seats.
export function verifyTickets(draft, now = new Date()) {
  const d = draft.details;
  if (!d) return draft;
  const loc = normaliseLocation(draft.location);
  if (d.kind === 'movie') {
    const { movieId, cinemaId, date } = parseShowKey(d.showKey);
    const show = showtimes(movieId, date, loc).flatMap((s) => s.shows).find((x) => x.key === d.showKey);
    if (!show) throw new Error('That show is not available in this city');
    const seats = [...new Set(d.seats || [])];
    if (!seats.length) throw new Error('Pick at least one seat');
    if (seats.length > 10) throw new Error('At most 10 seats per booking');
    const map = seatMap(d.showKey, load().seatBookings?.[d.showKey] || []);
    const byId = new Map(map.rows.flatMap((r) => r.seats).map((s) => [s.id, s]));
    for (const s of seats) {
      if (!byId.has(s)) throw new Error(`Seat ${s} does not exist`);
      if (byId.get(s).sold) throw new Error(`Seat ${s} was just taken — pick another`);
    }
    const movie = findMovie(movieId, loc);
    const cinema = cinemas(loc).find((c) => c.id === cinemaId);
    return {
      ...draft,
      category: 'movies',
      date,
      vendor: cinema.name,
      partySize: seats.length,
      amount: show.price * seats.length,
      title: `${movie.title} · ${show.format} · ${seats.length} ticket${seats.length > 1 ? 's' : ''}`,
      details: { kind: 'movie', movieId, movieTitle: movie.title, language: movie.language, cinemaId, cinema: cinema.name, showKey: d.showKey, time: show.time, format: show.format, seats, pricePerSeat: show.price },
    };
  }
  if (d.kind === 'event') {
    const ev = findEvent(d.eventId, loc, { now, days: 60 });
    if (!ev) throw new Error('That event is no longer listed');
    const tier = ev.tiers.find((x) => x.name === d.tier);
    if (!tier) throw new Error('Unknown ticket tier');
    const qty = Math.max(1, Math.min(20, Number(d.qty) || 1));
    return {
      ...draft,
      category: 'events',
      date: ev.date,
      vendor: ev.venue,
      partySize: qty,
      amount: tier.price * qty,
      title: `${ev.title} · ${qty} × ${tier.name}`,
      details: { kind: 'event', eventId: ev.id, eventTitle: ev.title, eventType: ev.type, venue: ev.venue, time: ev.time, tier: tier.name, pricePerTicket: tier.price, qty },
    };
  }
  throw new Error('Unknown ticket type');
}
