// Free public data sources. Each provider = a fetch + a pure normaliser.
// The normalisers are exported separately so they can be tested without a network.
import { getJSON } from './http.js';

const enc = encodeURIComponent;

// ---------- helpers ----------
export function distanceKm(a, b) {
  if (!a || !b) return null;
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 10) / 10;
}
const arr = (x) => (Array.isArray(x) ? x : x ? [x] : []);

// ---------- 1. Geocoding: OpenStreetMap Nominatim ----------
export function normaliseGeocode(json) {
  const hit = arr(json)[0];
  if (!hit) return null;
  return { lat: Number(hit.lat), lon: Number(hit.lon), label: hit.display_name, countryCode: hit.address?.country_code?.toUpperCase() || null };
}

export async function geocode(loc) {
  const base = 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1';
  const structured = `${base}&city=${enc(loc.city)}${loc.state ? `&state=${enc(loc.state)}` : ''}&country=${enc(loc.country)}`;
  let r = await getJSON(structured, { ttl: 30 * 86400 });
  let g = r.ok ? normaliseGeocode(r.data) : null;
  if (!g) {
    // Free-text fallback copes with typed-in "Other" places and spelling variants.
    r = await getJSON(`${base}&q=${enc([loc.city, loc.state, loc.country].filter(Boolean).join(', '))}`, { ttl: 30 * 86400 });
    g = r.ok ? normaliseGeocode(r.data) : null;
  }
  return { source: 'OpenStreetMap Nominatim', ok: Boolean(g), error: g ? null : r.error || 'place not found', data: g };
}

// ---------- 2. Real places: OpenStreetMap Overpass ----------
const PLACE_SETS = [
  ['cinema', 'nwr["amenity"="cinema"]', 15000, 25],
  ['restaurant', 'nwr["amenity"="restaurant"]["name"]', 4000, 60],
  ['theatre', 'nwr["amenity"~"^(theatre|arts_centre)$"]["name"]', 15000, 20],
  ['stadium', 'nwr["leisure"="stadium"]["name"]', 25000, 15],
  ['venue', 'nwr["amenity"~"^(events_venue|conference_centre)$"]["name"]', 15000, 20],
  ['hotel', 'nwr["tourism"="hotel"]["name"]', 8000, 20],
  ['caterer', 'nwr["craft"="caterer"]["name"]', 20000, 15],
  ['gift', 'nwr["shop"~"^(gift|confectionery)$"]["name"]', 8000, 20],
  ['attraction', 'nwr["tourism"~"^(attraction|museum|gallery)$"]["name"]', 20000, 25],
];

export function overpassQuery({ lat, lon }) {
  const parts = PLACE_SETS.map(([k, sel, radius, limit]) => `(${sel}(around:${radius},${lat},${lon});)->.${k};.${k} out center tags ${limit};`);
  return `[out:json][timeout:25];${parts.join('')}`;
}

function kindOf(tags = {}) {
  if (tags.amenity === 'cinema') return 'cinema';
  if (tags.amenity === 'restaurant') return 'restaurant';
  if (tags.amenity === 'theatre' || tags.amenity === 'arts_centre') return 'theatre';
  if (tags.leisure === 'stadium') return 'stadium';
  if (tags.amenity === 'events_venue' || tags.amenity === 'conference_centre') return 'venue';
  if (tags.tourism === 'hotel') return 'hotel';
  if (tags.craft === 'caterer') return 'caterer';
  if (tags.shop === 'gift' || tags.shop === 'confectionery') return 'gift';
  if (['attraction', 'museum', 'gallery'].includes(tags.tourism)) return 'attraction';
  return null;
}

export function normaliseOsm(json, center) {
  const out = {};
  const seen = new Set();
  for (const el of json?.elements || []) {
    const tags = el.tags || {};
    const name = tags['name:en'] || tags.name;
    const kind = kindOf(tags);
    if (!name || !kind) continue;
    const key = `${kind}|${name.toLowerCase()}`;
    if (seen.has(key)) continue; // chains often appear more than once
    seen.add(key);
    const pos = el.lat != null ? { lat: el.lat, lon: el.lon } : el.center ? { lat: el.center.lat, lon: el.center.lon } : null;
    const address = [[tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' '), tags['addr:suburb'] || tags['addr:neighbourhood'], tags['addr:city']].filter(Boolean).join(', ');
    (out[kind] ||= []).push({
      osmId: `${el.type}-${el.id}`,
      name,
      kind,
      cuisine: tags.cuisine ? tags.cuisine.split(';').map((c) => c.replace(/_/g, ' ')).slice(0, 2).join(', ') : null,
      stars: tags.stars || null,
      address: address || null,
      website: tags.website || tags['contact:website'] || null,
      distanceKm: distanceKm(center, pos),
    });
  }
  for (const k of Object.keys(out)) out[k].sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99));
  return out;
}

export async function places(center) {
  const q = overpassQuery(center);
  const mirrors = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
  let last;
  for (const url of mirrors) {
    last = await getJSON(url, { method: 'POST', body: `data=${enc(q)}`, headers: { 'content-type': 'application/x-www-form-urlencoded' }, ttl: 7 * 86400, timeout: 30000, key: `overpass ${q}` });
    if (last.ok) {
      const data = normaliseOsm(last.data, center);
      const n = Object.values(data).reduce((t, l) => t + l.length, 0);
      return { source: 'OpenStreetMap Overpass', ok: n > 0, error: n ? null : 'no places found', data, count: n };
    }
  }
  return { source: 'OpenStreetMap Overpass', ok: false, error: last?.error, data: {} };
}

// ---------- 3. Weather: Open-Meteo ----------
const WMO = [
  [[0], 'Clear', '☀️'], [[1, 2], 'Partly cloudy', '⛅'], [[3], 'Cloudy', '☁️'], [[45, 48], 'Fog', '🌫️'],
  [[51, 53, 55, 56, 57], 'Drizzle', '🌦️'], [[61, 63, 65, 66, 67], 'Rain', '🌧️'], [[71, 73, 75, 77], 'Snow', '🌨️'],
  [[80, 81, 82], 'Showers', '🌦️'], [[85, 86], 'Snow showers', '🌨️'], [[95, 96, 99], 'Thunderstorm', '⛈️'],
];
export const weatherLabel = (code) => WMO.find(([codes]) => codes.includes(code)) || [[code], 'Weather', '🌡️'];

export function normaliseWeather(json) {
  const d = json?.daily;
  if (!d?.time?.length) return null;
  return {
    timezone: json.timezone,
    utcOffsetSeconds: json.utc_offset_seconds ?? 0,
    days: d.time.map((date, i) => {
      const [, label, emoji] = weatherLabel(d.weather_code?.[i]);
      return { date, code: d.weather_code?.[i], label, emoji, max: Math.round(d.temperature_2m_max?.[i]), min: Math.round(d.temperature_2m_min?.[i]), rain: d.precipitation_probability_max?.[i] ?? null };
    }),
  };
}

export async function weather({ lat, lon }) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=16`;
  const r = await getJSON(url, { ttl: 3600 });
  const data = r.ok ? normaliseWeather(r.data) : null;
  return { source: 'Open-Meteo', ok: Boolean(data), error: data ? null : r.error, data };
}

// ---------- 4. Currency: Frankfurter (European Central Bank rates) ----------
// Approximate fallbacks (1 INR in each currency) when the API can't be reached.
export const FX_FALLBACK = { CAD: 0.0162, USD: 0.0118, GBP: 0.0089, SGD: 0.0152, AED: 0.0433 };

export function normaliseFx(json) {
  if (!json?.rates) return null;
  return { base: 'INR', date: json.date, rates: { ...FX_FALLBACK, ...json.rates }, approx: false };
}

export async function fx() {
  const r = await getJSON('https://api.frankfurter.app/latest?from=INR&to=CAD,USD,GBP,SGD', { ttl: 12 * 3600 });
  const data = r.ok ? normaliseFx(r.data) : null;
  return { source: 'Frankfurter (ECB)', ok: Boolean(data), error: data ? null : r.error, data: data || { base: 'INR', rates: FX_FALLBACK, approx: true } };
}

// ---------- 5. Public holidays: Nager.Date ----------
const CA_PROVINCES = { Alberta: 'AB', 'British Columbia': 'BC', Manitoba: 'MB', 'New Brunswick': 'NB', 'Newfoundland and Labrador': 'NL', 'Nova Scotia': 'NS', Ontario: 'ON', 'Prince Edward Island': 'PE', Quebec: 'QC', Saskatchewan: 'SK', 'Northwest Territories': 'NT', Nunavut: 'NU', Yukon: 'YT' };
// Nager.Date does not cover India, so fixed-date national holidays are built in.
const INDIA_FIXED = [['01-26', 'Republic Day'], ['08-15', 'Independence Day'], ['10-02', 'Gandhi Jayanti'], ['12-25', 'Christmas']];

export function normaliseHolidays(json, { countryCode, state, from, days = 90 }) {
  const region = countryCode === 'CA' && CA_PROVINCES[state] ? `CA-${CA_PROVINCES[state]}` : null;
  const end = new Date(Date.parse(from) + days * 86400000).toISOString().slice(0, 10);
  return arr(json)
    .filter((h) => h.date >= from && h.date <= end)
    .filter((h) => !h.counties || !region || h.counties.includes(region))
    .map((h) => ({ date: h.date, name: h.name, localName: h.localName, regional: Boolean(h.counties) }));
}

export async function holidays({ countryCode, state, from }) {
  const year = Number(from.slice(0, 4));
  if (countryCode === 'IN') {
    const list = [year, year + 1].flatMap((y) => INDIA_FIXED.map(([md, name]) => ({ date: `${y}-${md}`, name, localName: name })));
    return { source: 'Built-in (India national holidays)', ok: true, data: normaliseHolidays(list, { countryCode, state, from }) };
  }
  if (!countryCode) return { source: 'Nager.Date', ok: false, error: 'unknown country', data: [] };
  const results = await Promise.all([year, year + 1].map((y) => getJSON(`https://date.nager.at/api/v3/PublicHolidays/${y}/${countryCode}`, { ttl: 7 * 86400 })));
  const ok = results.some((r) => r.ok);
  const all = results.filter((r) => r.ok).flatMap((r) => arr(r.data));
  return { source: 'Nager.Date', ok, error: ok ? null : results[0].error, data: normaliseHolidays(all, { countryCode, state, from }) };
}

// ---------- 6. Movies: TMDB now playing (free key) or the iTunes movie chart (no key) ----------
const LANG = { hi: 'Hindi', ta: 'Tamil', te: 'Telugu', kn: 'Kannada', ml: 'Malayalam', bn: 'Bengali', mr: 'Marathi', pa: 'Punjabi', gu: 'Gujarati', en: 'English', fr: 'French', es: 'Spanish', ko: 'Korean', ja: 'Japanese', zh: 'Chinese' };
const TMDB_GENRES = { 28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-fi', 53: 'Thriller', 10752: 'War', 37: 'Western' };

export function normaliseTmdb(json) {
  return arr(json?.results)
    .filter((m) => m.title)
    .slice(0, 16)
    .map((m) => ({
      id: `tmdb-${m.id}`,
      title: m.title,
      language: LANG[m.original_language] || (m.original_language || '').toUpperCase() || null,
      genre: (m.genre_ids || []).map((g) => TMDB_GENRES[g]).filter(Boolean).slice(0, 2).join(' · ') || 'Film',
      cert: null,
      runtime: null,
      releaseDate: m.release_date || null,
      rating: m.vote_average ? Math.round(m.vote_average * 10) / 10 : null,
      poster: m.poster_path ? `https://image.tmdb.org/t/p/w342${m.poster_path}` : null,
      summary: m.overview || null,
    }));
}

export function normaliseItunes(json) {
  return arr(json?.feed?.entry)
    .slice(0, 16)
    .map((e) => {
      const images = arr(e['im:image']);
      const img = images[images.length - 1]?.label || null;
      return {
        id: `itunes-${e.id?.attributes?.['im:id'] || e['im:name']?.label}`,
        title: e['im:name']?.label,
        language: null,
        genre: e.category?.attributes?.label || 'Film',
        cert: null,
        runtime: null,
        releaseDate: e['im:releaseDate']?.label?.slice(0, 10) || null,
        rating: null,
        // Ask the image CDN for a larger poster than the 170px default.
        poster: img ? img.replace(/\/\d+x\d+(bb)?\.(jpg|png)$/, '/342x513bb.$2') : null,
        summary: e.summary?.label || null,
      };
    })
    .filter((m) => m.title);
}

export async function movies({ countryCode }) {
  const cc = (countryCode || 'IN').toLowerCase();
  const key = process.env.TMDB_API_KEY;
  if (key) {
    const bearer = key.startsWith('eyJ');
    const url = `https://api.themoviedb.org/3/movie/now_playing?region=${cc.toUpperCase()}&page=1${bearer ? '' : `&api_key=${enc(key)}`}`;
    const r = await getJSON(url, { ttl: 6 * 3600, headers: bearer ? { authorization: `Bearer ${key}` } : {}, key: `tmdb now_playing ${cc}` });
    const data = r.ok ? normaliseTmdb(r.data) : [];
    if (data.length) return { source: 'TMDB (now playing in cinemas)', ok: true, data };
  }
  const r = await getJSON(`https://itunes.apple.com/${cc}/rss/topmovies/limit=20/json`, { ttl: 6 * 3600 });
  const data = r.ok ? normaliseItunes(r.data) : [];
  return { source: `Apple iTunes movie chart (${cc.toUpperCase()})`, ok: data.length > 0, error: data.length ? null : r.error || 'no movies', data };
}

// ---------- 7. Sports fixtures: TheSportsDB (free public key "123") ----------
export const LEAGUES = {
  IN: [4460, 4791], // IPL cricket, Indian Super League football
  CA: [4380, 4387, 4424, 4346, 4405], // NHL, NBA, MLB, MLS, CFL
  US: [4380, 4387, 4424, 4346, 4391], // NHL, NBA, MLB, MLS, NFL
  GB: [4328, 4329], // Premier League, Championship
  AE: [4328],
  SG: [4328],
};
// Rough ticket tiers per sport (₹ before the city price tier) — the API has no prices.
export const SPORT_TIERS = {
  Cricket: [['Stand', 800], ['Pavilion', 2500], ['Corporate box (per seat)', 15000]],
  'Ice Hockey': [['Upper bowl', 5000], ['Lower bowl', 12000], ['Club seats', 25000]],
  Basketball: [['Upper level', 4000], ['Lower level', 11000], ['Courtside club', 30000]],
  Baseball: [['Outfield', 2500], ['Infield', 6000], ['Premium', 15000]],
  Soccer: [['Stand', 1500], ['Premium', 5000]],
  'American Football': [['Upper deck', 4000], ['Lower deck', 9000], ['Club', 20000]],
};

export function normaliseSportsDb(json) {
  return arr(json?.events).map((e) => ({
    id: `tsdb-${e.idEvent}`,
    title: e.strEvent || [e.strHomeTeam, e.strAwayTeam].filter(Boolean).join(' vs '),
    league: e.strLeague,
    sport: e.strSport,
    homeTeam: e.strHomeTeam,
    awayTeam: e.strAwayTeam,
    venue: e.strVenue || null,
    city: e.strCity || null,
    country: e.strCountry || null,
    timestamp: e.strTimestamp ? `${e.strTimestamp.replace(' ', 'T').replace(/Z?$/, '')}Z` : e.dateEvent ? `${e.dateEvent}T${(e.strTime || '19:00:00').slice(0, 8)}Z` : null,
    image: e.strThumb || e.strPoster || null,
  }));
}

export async function sports({ countryCode }) {
  const leagues = LEAGUES[countryCode] || [];
  if (!leagues.length) return { source: 'TheSportsDB', ok: false, error: 'no leagues for this country', data: [] };
  const results = await Promise.all(leagues.map((id) => getJSON(`https://www.thesportsdb.com/api/v1/json/123/eventsnextleague.php?id=${id}`, { ttl: 3 * 3600 })));
  const data = results.filter((r) => r.ok).flatMap((r) => normaliseSportsDb(r.data));
  return { source: 'TheSportsDB', ok: results.some((r) => r.ok), error: results.every((r) => !r.ok) ? results[0].error : null, data };
}

// ---------- 8. Concerts & shows: Ticketmaster Discovery (optional free key) ----------
export function normaliseTicketmaster(json) {
  return arr(json?._embedded?.events).map((e) => {
    const cls = e.classifications?.[0] || {};
    const segment = cls.segment?.name || '';
    const genre = cls.genre?.name || '';
    const type = /comedy/i.test(genre) ? 'comedy' : segment === 'Music' ? 'music' : segment === 'Sports' ? 'sports' : segment === 'Arts & Theatre' ? 'theatre' : 'other';
    const v = e._embedded?.venues?.[0] || {};
    const pr = e.priceRanges?.[0];
    return {
      id: `tm-${e.id}`,
      title: e.name,
      type,
      date: e.dates?.start?.localDate || null,
      time: (e.dates?.start?.localTime || '19:00:00').slice(0, 5),
      venue: v.name || null,
      pos: v.location ? { lat: Number(v.location.latitude), lon: Number(v.location.longitude) } : null,
      price: pr ? { min: pr.min, max: pr.max, currency: pr.currency } : null,
      url: e.url || null,
    };
  });
}

export async function ticketmaster({ lat, lon }) {
  const key = process.env.TICKETMASTER_API_KEY;
  if (!key) return { source: 'Ticketmaster', ok: false, error: 'set TICKETMASTER_API_KEY to enable', data: [], optional: true };
  const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${enc(key)}&latlong=${lat},${lon}&radius=50&unit=km&size=40&sort=date,asc`;
  const r = await getJSON(url, { ttl: 3 * 3600, key: `tm ${lat},${lon}` });
  const data = r.ok ? normaliseTicketmaster(r.data) : [];
  return { source: 'Ticketmaster', ok: r.ok, error: r.ok ? null : r.error, data };
}
