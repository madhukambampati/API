// Location-aware catalog: venues & vendors, movies with showtimes and seat maps,
// and events near a city. Everything is generated deterministically from the
// location and date so the same city always shows the same line-up.
// All names are fictional demo data.
import { priceTier, STATE_LANGUAGES, NEARBY_ESCAPES } from './locations.js';

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
export function vendors(category, loc) {
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
  return (list || []).map((v, i) => ({ id: `${category}-${slug(c)}-${i}`, category, ...v, perPerson: price(v.perPerson, loc) }));
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

export function movies(loc) {
  const local = STATE_LANGUAGES[loc.state] || [];
  const rank = (m) => (local.includes(m.language) ? 0 : m.language === 'Hindi' || m.language === 'English' ? 1 : 2);
  return MOVIES.map((m) => ({ ...m, local: local.includes(m.language) })).sort((a, b) => rank(a) - rank(b));
}

export function cinemas(loc) {
  const c = loc.city;
  return [
    { id: `cin-${slug(c)}-starlight`, name: `Starlight Multiplex — ${c} Central`, formats: ['2D', '3D', 'IMAX'], distanceKm: 3.2 },
    { id: `cin-${slug(c)}-galaxy`, name: `Galaxy Cinemas — ${c} Mall`, formats: ['2D', 'Recliner'], distanceKm: 5.8 },
    { id: `cin-${slug(c)}-royal`, name: `Royal Screens ${c}`, formats: ['2D', '3D'], distanceKm: 8.1 },
  ];
}

// Showtimes for a movie on a date, across the city's cinemas.
export function showtimes(movieId, date, loc) {
  const movie = MOVIES.find((m) => m.id === movieId);
  if (!movie) return [];
  return cinemas(loc)
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
export const EVENT_TYPES = { music: 'Music', sports: 'Sports', tech: 'Tech', comedy: 'Comedy', theatre: 'Theatre', food: 'Food & festivals' };

const EVENT_TEMPLATES = [
  { type: 'music', title: 'Monsoon Beats Festival', venue: '{c} Open Grounds', time: '16:00', tiers: [['General', 999], ['Fan pit', 2499], ['VIP lounge', 5999]] },
  { type: 'music', title: 'Indie Nights Live', venue: 'The Loft, {c}', time: '20:00', tiers: [['Entry', 799], ['Entry + 2 drinks', 1499]] },
  { type: 'music', title: 'Sufi & Qawwali Evening', venue: '{c} Cultural Centre', time: '19:00', tiers: [['Silver', 600], ['Gold', 1500], ['Platinum', 3000]] },
  { type: 'music', title: 'Carnatic Classics under the Stars', venue: '{c} Amphitheatre', time: '18:30', tiers: [['Lawn', 400], ['Reserved', 1200]] },
  { type: 'music', title: 'Bollywood Retro Night', venue: 'Skybar {c}', time: '21:00', tiers: [['Entry', 1200], ['Table for 4', 8000]] },
  { type: 'sports', title: 'T20 Night: {c} Chargers vs Capital Kings', venue: '{c} Cricket Stadium', time: '19:30', tiers: [['Stand', 800], ['Pavilion', 2500], ['Corporate box (per seat)', 15000]] },
  { type: 'sports', title: 'Football: {c} FC vs Coastal United', venue: '{c} Football Arena', time: '19:00', tiers: [['Stand', 499], ['Premium', 1499]] },
  { type: 'sports', title: 'Kabaddi Showdown: {c} Titans vs Desert Hawks', venue: '{c} Indoor Stadium', time: '20:00', tiers: [['General', 350], ['Courtside', 2000]] },
  { type: 'sports', title: '{c} Half Marathon 2026', venue: '{c} Riverfront', time: '05:30', tiers: [['10K run', 1200], ['Half marathon', 1800]] },
  { type: 'tech', title: 'DevCon {c} 2026', venue: '{c} International Convention Centre', time: '09:30', tiers: [['Standard pass', 1499], ['Pro pass (workshops)', 4999]] },
  { type: 'tech', title: 'AI & Cloud Summit', venue: 'Tech Park Auditorium, {c}', time: '10:00', tiers: [['Delegate', 2999], ['Delegate + dinner', 5999]] },
  { type: 'tech', title: 'Hackathon: Build for Bharat', venue: '{c} Innovation Hub', time: '09:00', tiers: [['Team of 4', 2000]] },
  { type: 'tech', title: 'Product Managers Meetup', venue: 'Cowork Commons, {c}', time: '18:30', tiers: [['RSVP + snacks', 299]] },
  { type: 'comedy', title: 'Stand-up Saturday', venue: 'The Laugh Store, {c}', time: '20:30', tiers: [['Regular', 499], ['Front rows', 999]] },
  { type: 'comedy', title: 'Improv Night: Made Up on the Spot', venue: 'Black Box Theatre, {c}', time: '19:30', tiers: [['Regular', 399]] },
  { type: 'theatre', title: 'The Last Letter — a play', venue: 'Rangmanch Hall, {c}', time: '19:00', tiers: [['Balcony', 600], ['Stalls', 1200]] },
  { type: 'theatre', title: 'Musical: Gardens of the Mughals', venue: '{c} Performing Arts Centre', time: '19:30', tiers: [['Silver', 1500], ['Gold', 3500]] },
  { type: 'food', title: '{c} Street Food Carnival', venue: '{c} Exhibition Grounds', time: '12:00', tiers: [['Entry', 199], ['Entry + tasting tokens', 799]] },
  { type: 'food', title: 'Craft Coffee & Chai Festival', venue: '{c} Heritage Courtyard', time: '11:00', tiers: [['Day pass', 499]] },
];

export function events(loc, { now = new Date(), type, days = 45 } = {}) {
  const c = loc.city;
  const r = rng(`events|${loc.country}|${loc.state}|${c}`);
  const base = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const list = [];
  EVENT_TEMPLATES.forEach((tpl, i) => {
    if (r() < 0.25) return; // not every city gets every event
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
    });
  });
  return list.filter((e) => !type || type === 'all' || e.type === type).sort((a, b) => (a.date + a.time < b.date + b.time ? -1 : 1));
}

export function findEvent(id, loc, opts) {
  return events(loc, opts).find((e) => e.id === id) || null;
}
