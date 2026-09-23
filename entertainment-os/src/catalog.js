// Location-aware catalog: venues & vendors, movies with showtimes and seat maps,
// and events near a city. Everything is generated deterministically from the
// location and date so the same city always shows the same line-up.
// When live data is available (src/live) real places, movies and fixtures are
// used first; otherwise the fictional sample data below fills in.
import { priceTier, STATE_LANGUAGES, NEARBY_ESCAPES } from './locations.js';
import * as live from './live/index.js';
import { SPORT_TIERS, FX_FALLBACK, distanceKm } from './live/providers.js';

// ---------- helpers ----------
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function rng(seed) {
  let s = hash(seed) || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}
export const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (d, n) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + n));
const price = (base, loc) => Math.round((base * priceTier(loc)) / 10) * 10;

// ---------- venues & vendors ----------
function sampleVendors(category, loc) {
  const c = loc.city;
  const list = {
    reservations: [
      { vendor: `${c} Supper Club`, perPerson: 3500, note: 'Fine dining · tasting menu' },
      { vendor: `The ${c} Street Kitchen`, perPerson: 1800, note: 'Modern Indian · casual' },
      { vendor: `Saffron Terrace, ${c}`, perPerson: 2400, note: 'North Indian · rooftop' },
    ],
    pdr: [
      { vendor: `The ${c} Grand — Private Dining Room`, perPerson: 4500, note: 'Seats up to 40' },
      { vendor: `Banyan Hall, ${c}`, perPerson: 3200, note: 'Banquet · up to 150' },
    ],
    catering: [
      { vendor: `Annapurna Caterers ${c}`, perPerson: 900, note: 'Veg & non-veg buffets' },
      { vendor: `${c} Feast Co.`, perPerson: 1400, note: 'Live counters' },
    ],
    gifting: [
      { vendor: `${c} Artisan Hampers`, perPerson: 3500, note: 'Dry fruits, sweets, handloom' },
      { vendor: 'Brand Merch Co.', perPerson: 1200, note: 'Branded merch · pan-India delivery' },
    ],
    experiences: [
      { vendor: NEARBY_ESCAPES[loc.state] || `Weekend retreat near ${c}`, perPerson: 22000, note: 'Overnight team offsite' },
      { vendor: `${c} Heritage Walk & Food Trail`, perPerson: 2500, note: 'Half-day experience' },
      { vendor: `${c} Cooking Studio`, perPerson: 3000, note: 'Hands-on class' },
    ],
  }[category];
  return (list || []).map((v, i) => ({ id: `${category}-${slug(c)}-${i}`, category, ...v, perPerson: price(v.perPerson, loc), source: 'sample' }));
}

// Which OpenStreetMap place kinds feed each category, and the per-person price band (₹ before city tier).
const LIVE_KINDS = { reservations: ['restaurant'], pdr: ['venue', 'hotel'], catering: ['caterer', 'hotel'], gifting: ['gift'], experiences: ['attraction'] };
const LIVE_BANDS = { reservations: [1200, 3800], pdr: [3000, 5500], catering: [700, 1600], gifting: [800, 4000], experiences: [500, 2500] };
const KIND_LABEL = { restaurant: 'Restaurant', venue: 'Event venue', hotel: 'Hotel banquet', caterer: 'Caterer', gift: 'Gift shop', attraction: 'Attraction' };
const cap = (x) => x.charAt(0).toUpperCase() + x.slice(1);

export function vendors(category, loc) {
  const sample = sampleVendors(category, loc);
  const b = live.get(loc);
  const places = (LIVE_KINDS[category] || []).flatMap((k) => b?.places?.[k] || []).slice(0, 12);
  if (!places.length) return sample;
  const [lo, hi] = LIVE_BANDS[category];
  const list = places.map((pl) => ({
    id: `${category}-osm-${pl.osmId}`,
    category,
    vendor: pl.name,
    perPerson: price(lo + (hi - lo) * rng(`${category}|${pl.osmId}`)(), loc),
    note: [pl.cuisine && cap(pl.cuisine), KIND_LABEL[pl.kind], pl.address, pl.distanceKm != null && `${pl.distanceKm} km`].filter(Boolean).join(' · '),
    website: pl.website,
    distanceKm: pl.distanceKm,
    source: 'OpenStreetMap',
    estimated: true,
  }));
  // The weekend-escape offsite is a suggestion, not a single mapped place, so keep it.
  if (category === 'experiences') list.unshift({ ...sample[0], source: 'suggestion' });
  return list;
}

// ---------- movies ----------
export const MOVIES = [
  { id: 'm-monsoon-letters', title: 'Monsoon Letters', language: 'Hindi', genre: 'Romance · Drama', cert: 'UA', runtime: '2h 18m', formats: ['2D', 'Recliner'], colors: ['1D4E89', '7FB7BE'] },
  { id: 'm-rakshak', title: 'Rakshak: The Last Guard', language: 'Hindi', genre: 'Action', cert: 'UA', runtime: '2h 34m', formats: ['2D', 'IMAX', 'Recliner'], colors: ['7A1C1C', 'E0A458'] },
  { id: 'm-marina-nights', title: 'Marina Nights', language: 'Tamil', genre: 'Thriller', cert: 'UA', runtime: '2h 26m', formats: ['2D', 'Recliner'], colors: ['0B3C49', '3FA7D6'] },
  { id: 'm-pushpaka', title: 'Pushpaka Rising', language: 'Telugu', genre: 'Action · Fantasy', cert: 'UA', runtime: '2h 51m', formats: ['2D', '3D', 'IMAX'], colors: ['4A2C6D', 'F2A541'] },
  { id: 'm-kaveri', title: 'Kaveri Diaries', language: 'Kannada', genre: 'Drama', cert: 'U', runtime: '2h 05m', formats: ['2D'], colors: ['2D5A27', 'C9D86B'] },
  { id: 'm-orbit-9', title: 'Orbit 9', language: 'English', genre: 'Sci-fi', cert: 'UA', runtime: '2h 12m', formats: ['2D', '3D', 'IMAX'], colors: ['111827', '6366F1'] },
  { id: 'm-ponnonam', title: 'Ponnonam', language: 'Malayalam', genre: 'Family · Comedy', cert: 'U', runtime: '2h 10m', formats: ['2D'], colors: ['8A5A00', 'F6D55C'] },
  { id: 'm-kolkata-noir', title: 'Kolkata Noir', language: 'Bengali', genre: 'Mystery', cert: 'A', runtime: '2h 01m', formats: ['2D', 'Recliner'], colors: ['1F1F1F', 'B08968'] },
];
const FORMAT_PRICE = { '2D': 220, '3D': 320, IMAX: 520, Recliner: 680 };
const SHOW_SLOTS = ['09:30', '12:45', '15:30', '18:45', '21:30', '22:45'];

const POSTER_COLORS = [['1D4E89', '7FB7BE'], ['7A1C1C', 'E0A458'], ['0B3C49', '3FA7D6'], ['4A2C6D', 'F2A541'], ['2D5A27', 'C9D86B'], ['111827', '6366F1'], ['8A5A00', 'F6D55C'], ['1F1F1F', 'B08968']];

function liveMovies(loc) {
  const b = live.get(loc);
  if (!b?.movies?.length) return null;
  return b.movies.map((m) => {
    const r = rng(m.id);
    const formats = ['2D', ...(r() < 0.5 ? ['3D'] : []), ...(r() < 0.4 ? ['IMAX'] : []), ...(r() < 0.5 ? ['Recliner'] : [])];
    return { ...m, formats, colors: POSTER_COLORS[hash(m.id) % POSTER_COLORS.length], source: b.moviesSource };
  });
}

export function movies(loc) {
  const local = STATE_LANGUAGES[loc.state] || [];
  const list = liveMovies(loc) || MOVIES.map((m) => ({ ...m, source: 'sample' }));
  const rank = (m) => (local.includes(m.language) ? 0 : !m.language || m.language === 'Hindi' || m.language === 'English' ? 1 : 2);
  return list.map((m) => ({ ...m, local: local.includes(m.language) })).sort((a, b) => rank(a) - rank(b));
}

export function findMovie(id, loc) {
  return movies(loc).find((m) => m.id === id) || MOVIES.find((m) => m.id === id) || null;
}

export function cinemas(loc) {
  const b = live.get(loc);
  const real = (b?.places?.cinema || []).slice(0, 8);
  if (real.length) {
    return real.map((pl) => {
      const r = rng(pl.osmId);
      const formats = ['2D', ...(r() < 0.6 ? ['3D'] : []), ...(/imax/i.test(pl.name) || r() < 0.35 ? ['IMAX'] : []), ...(/insignia|gold|lux|recliner/i.test(pl.name) || r() < 0.5 ? ['Recliner'] : [])];
      return { id: `cin-osm-${pl.osmId}`, name: pl.name, formats, distanceKm: pl.distanceKm, address: pl.address, source: 'OpenStreetMap' };
    });
  }
  const c = loc.city;
  return [
    { id: `cin-${slug(c)}-starlight`, name: `Starlight Multiplex — ${c} Central`, formats: ['2D', '3D', 'IMAX'], distanceKm: 3.2, source: 'sample' },
    { id: `cin-${slug(c)}-galaxy`, name: `Galaxy Cinemas — ${c} Mall`, formats: ['2D', 'Recliner'], distanceKm: 5.8, source: 'sample' },
    { id: `cin-${slug(c)}-royal`, name: `Royal Screens ${c}`, formats: ['2D', '3D'], distanceKm: 8.1, source: 'sample' },
  ];
}

// Not every film plays at every cinema (about 70% do), but every film plays somewhere.
function playsAt(movie, list) {
  const picked = list.filter((cin) => hash(`${movie.id}|${cin.id}`) % 100 < 70);
  return picked.length ? picked : list.slice(0, 1);
}

// Showtimes for a movie on a date, across the city's cinemas.
export function showtimes(movieId, date, loc) {
  const movie = findMovie(movieId, loc);
  if (!movie) return [];
  return playsAt(movie, cinemas(loc))
    .map((cin) => {
      const formats = movie.formats.filter((f) => cin.formats.includes(f));
      if (!formats.length) return null;
      const r = rng(`${movieId}|${cin.id}|${date}`);
      const slots = SHOW_SLOTS.filter(() => r() > 0.35).slice(0, 4);
      if (!slots.length) slots.push(SHOW_SLOTS[3]);
      const shows = slots.map((time, i) => {
        const format = formats[i % formats.length];
        return { key: `${movieId}|${cin.id}|${date}|${time}|${format}`, time, format, price: price(FORMAT_PRICE[format], loc) };
      });
      return { cinema: cin, shows };
    })
    .filter(Boolean);
}

// Everything showing at one cinema on a date: [{ movie, shows }].
export function showtimesAtCinema(cinemaId, date, loc) {
  return movies(loc)
    .map((movie) => ({ movie, shows: showtimes(movie.id, date, loc).find((c) => c.cinema.id === cinemaId)?.shows || [] }))
    .filter((x) => x.shows.length);
}

export function parseShowKey(key) {
  const [movieId, cinemaId, date, time, format] = String(key).split('|');
  return { movieId, cinemaId, date, time, format };
}

// Seat map: rows × seats, with some seats pre-sold (deterministic) plus seats booked in the OS.
export function seatMap(showKey, bookedSeats = []) {
  const { format } = parseShowKey(showKey);
  const recliner = format === 'Recliner';
  const rows = recliner ? 'ABCDEF'.split('') : 'ABCDEFGHIJ'.split('');
  const perRow = recliner ? 8 : 12;
  const r = rng(showKey);
  const taken = new Set(bookedSeats);
  const layout = rows.map((row) => ({
    row,
    seats: Array.from({ length: perRow }, (_, i) => {
      const id = `${row}${i + 1}`;
      const preSold = r() < 0.3; // always draw, so OS bookings never reshuffle other seats
      const sold = taken.has(id) || preSold;
      return { id, sold };
    }),
  }));
  return { rows: layout, aisleAfter: perRow / 2 };
}

// Best block of n adjacent free seats, preferring middle rows.
export function bestSeats(map, n) {
  const order = map.rows.map((r, i) => ({ r, d: Math.abs(i - map.rows.length * 0.6) })).sort((a, b) => a.d - b.d);
  for (const { r } of order) {
    for (let s = 0; s + n <= r.seats.length; s++) {
      const block = r.seats.slice(s, s + n);
      if (block.every((x) => !x.sold)) return block.map((x) => x.id);
    }
  }
  return null;
}

// ---------- events near you ----------
export const EVENT_TYPES = { music: 'Music', sports: 'Sports', tech: 'Tech', comedy: 'Comedy', theatre: 'Theatre', food: 'Food & festivals', other: 'Other' };

const EVENT_TEMPLATES = [
  { only: 'India', type: 'music', title: 'Monsoon Beats Festival', venue: '{c} Open Grounds', time: '16:00', tiers: [['General', 999], ['Fan pit', 2499], ['VIP lounge', 5999]] },
  { type: 'music', title: 'Indie Nights Live', venue: 'The Loft, {c}', time: '20:00', tiers: [['Entry', 799], ['Entry + 2 drinks', 1499]] },
  { only: 'India', type: 'music', title: 'Sufi & Qawwali Evening', venue: '{c} Cultural Centre', time: '19:00', tiers: [['Silver', 600], ['Gold', 1500], ['Platinum', 3000]] },
  { only: 'India', type: 'music', title: 'Carnatic Classics under the Stars', venue: '{c} Amphitheatre', time: '18:30', tiers: [['Lawn', 400], ['Reserved', 1200]] },
  { only: 'India', type: 'music', title: 'Bollywood Retro Night', venue: 'Skybar {c}', time: '21:00', tiers: [['Entry', 1200], ['Table for 4', 8000]] },
  { only: 'India', type: 'sports', title: 'T20 Night: {c} Chargers vs Capital Kings', venue: '{c} Cricket Stadium', time: '19:30', tiers: [['Stand', 800], ['Pavilion', 2500], ['Corporate box (per seat)', 15000]] },
  { only: 'India', type: 'sports', title: 'Football: {c} FC vs Coastal United', venue: '{c} Football Arena', time: '19:00', tiers: [['Stand', 499], ['Premium', 1499]] },
  { only: 'India', type: 'sports', title: 'Kabaddi Showdown: {c} Titans vs Desert Hawks', venue: '{c} Indoor Stadium', time: '20:00', tiers: [['General', 350], ['Courtside', 2000]] },
  { type: 'sports', title: '{c} Half Marathon 2026', venue: '{c} Riverfront', time: '05:30', tiers: [['10K run', 1200], ['Half marathon', 1800]] },
  { type: 'tech', title: 'DevCon {c} 2026', venue: '{c} International Convention Centre', time: '09:30', tiers: [['Standard pass', 1499], ['Pro pass (workshops)', 4999]] },
  { type: 'tech', title: 'AI & Cloud Summit', venue: 'Tech Park Auditorium, {c}', time: '10:00', tiers: [['Delegate', 2999], ['Delegate + dinner', 5999]] },
  { only: 'India', type: 'tech', title: 'Hackathon: Build for Bharat', venue: '{c} Innovation Hub', time: '09:00', tiers: [['Team of 4', 2000]] },
  { type: 'tech', title: 'Product Managers Meetup', venue: 'Cowork Commons, {c}', time: '18:30', tiers: [['RSVP + snacks', 299]] },
  { type: 'comedy', title: 'Stand-up Saturday', venue: 'The Laugh Store, {c}', time: '20:30', tiers: [['Regular', 499], ['Front rows', 999]] },
  { type: 'comedy', title: 'Improv Night: Made Up on the Spot', venue: 'Black Box Theatre, {c}', time: '19:30', tiers: [['Regular', 399]] },
  { only: 'India', type: 'theatre', title: 'The Last Letter — a play', venue: 'Rangmanch Hall, {c}', time: '19:00', tiers: [['Balcony', 600], ['Stalls', 1200]] },
  { only: 'India', type: 'theatre', title: 'Musical: Gardens of the Mughals', venue: '{c} Performing Arts Centre', time: '19:30', tiers: [['Silver', 1500], ['Gold', 3500]] },
  { type: 'food', title: '{c} Street Food Carnival', venue: '{c} Exhibition Grounds', time: '12:00', tiers: [['Entry', 199], ['Entry + tasting tokens', 799]] },
  { only: 'India', type: 'food', title: 'Craft Coffee & Chai Festival', venue: '{c} Heritage Courtyard', time: '11:00', tiers: [['Day pass', 499]] },
  // Outside India
  { only: 'intl', type: 'music', title: 'Harbourfront Jazz Night', venue: '{c} Waterfront Stage', time: '19:30', tiers: [['General', 1800], ['Reserved', 3500]] },
  { only: 'intl', type: 'sports', title: 'Hockey Night: {c} Blades vs Northern Stars', venue: '{c} Arena', time: '19:00', tiers: [['Upper bowl', 5000], ['Lower bowl', 12000]] },
  { only: 'intl', type: 'sports', title: 'Basketball: {c} Kings vs Harbour Hawks', venue: '{c} Centre Court', time: '19:30', tiers: [['Upper level', 4000], ['Lower level', 11000]] },
  { only: 'intl', type: 'tech', title: 'Startup Pitch Night', venue: '{c} Innovation Hub', time: '18:00', tiers: [['General', 1500]] },
  { only: 'intl', type: 'theatre', title: 'The Last Letter — a play', venue: '{c} Playhouse', time: '19:30', tiers: [['Balcony', 2500], ['Orchestra', 5000]] },
  { only: 'intl', type: 'food', title: 'Poutine & Street Food Fest', venue: '{c} Market Square', time: '12:00', tiers: [['Entry', 800], ['Tasting pass', 2200]] },
];

const toInr = (amount, currency, fx) => {
  if (!currency || currency === 'INR') return amount;
  const rate = fx?.rates?.[currency] || FX_FALLBACK[currency];
  return rate ? amount / rate : amount;
};
const CITY_ALIASES = { Bengaluru: 'Bangalore', Mumbai: 'Bombay', 'New Delhi': 'Delhi', Gurugram: 'Gurgaon', Montreal: 'Montréal', 'Quebec City': 'Québec' };

// Real fixtures (TheSportsDB) and shows (Ticketmaster) for the location, in the event shape.
function liveEvents(loc, { now, days }) {
  const b = live.get(loc);
  if (!b) return [];
  const from = iso(now);
  const to = iso(addDays(now, days));
  const names = [loc.city, CITY_ALIASES[loc.city]].filter(Boolean).map((n) => n.toLowerCase());
  const out = [];
  const offset = (b.weather?.utcOffsetSeconds || 0) * 1000;
  for (const sp of b.sports || []) {
    const t = new Date(Date.parse(sp.timestamp) + offset);
    if (Number.isNaN(t.getTime())) continue;
    const date = iso(t);
    if (date < from || date > to) continue;
    const text = [sp.title, sp.homeTeam, sp.venue, sp.city].join(' ').toLowerCase();
    out.push({
      id: sp.id,
      type: 'sports',
      typeLabel: EVENT_TYPES.sports,
      title: sp.title,
      venue: sp.venue || `${sp.homeTeam} home ground`,
      city: sp.city || null,
      date,
      time: t.toISOString().slice(11, 16),
      distanceKm: null,
      tiers: (SPORT_TIERS[sp.sport] || [['Standard', 1500], ['Premium', 5000]]).map(([name, p]) => ({ name, price: price(p, loc) })),
      interested: null,
      league: sp.league,
      local: names.some((n) => text.includes(n)),
      source: 'TheSportsDB',
      priceEstimated: true,
    });
  }
  for (const e of b.ticketmaster || []) {
    if (!e.date || e.date < from || e.date > to) continue;
    const tiers = e.price
      ? [...new Set([e.price.min, e.price.max])].map((amt, i, all) => ({ name: all.length > 1 ? (i ? 'Premium' : 'Standard') : 'Standard', price: Math.round(toInr(amt, e.price.currency, b.fx) / 10) * 10 }))
      : [{ name: 'Standard', price: price(1500, loc) }];
    out.push({ id: e.id, type: e.type, typeLabel: EVENT_TYPES[e.type], title: e.title, venue: e.venue || 'Venue TBA', city: loc.city, date: e.date, time: e.time, distanceKm: distanceKm(b.coords, e.pos), tiers, interested: null, local: true, source: 'Ticketmaster', priceEstimated: !e.price, url: e.url });
  }
  return out;
}

export function events(loc, { now = new Date(), type, days = 45 } = {}) {
  const c = loc.city;
  const r = rng(`events|${loc.country}|${loc.state}|${c}`);
  const base = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const list = [];
  const india = loc.country === 'India';
  EVENT_TEMPLATES.forEach((tpl, i) => {
    if (r() < 0.25) return; // not every city gets every event
    if ((tpl.only === 'India' && !india) || (tpl.only === 'intl' && india)) return;
    const offset = Math.floor(r() * days);
    const date = iso(addDays(base, offset));
    list.push({
      id: `ev-${slug(c)}-${i}`,
      type: tpl.type,
      typeLabel: EVENT_TYPES[tpl.type],
      title: tpl.title.replaceAll('{c}', c),
      venue: tpl.venue.replaceAll('{c}', c),
      city: c,
      date,
      time: tpl.time,
      distanceKm: Math.round((1 + r() * 18) * 10) / 10,
      tiers: tpl.tiers.map(([name, p]) => ({ name, price: price(p, loc) })),
      interested: 200 + Math.floor(r() * 4800),
      local: true,
      source: 'sample',
    });
  });
  // Real events come first; sample events only fill types that have no real local events.
  const real = liveEvents(loc, { now: base, days });
  const realTypes = new Set(real.filter((e) => e.local).map((e) => e.type));
  const merged = [...real, ...list.filter((e) => !realTypes.has(e.type))];
  return merged.filter((e) => !type || type === 'all' || e.type === type).sort((a, b) => (a.date + a.time < b.date + b.time ? -1 : 1));
}

export function findEvent(id, loc, opts) {
  return events(loc, opts).find((e) => e.id === id) || null;
}
