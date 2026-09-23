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
  ['cinema', 'nwr["amenity"="cinema"]["name"]', 30000, 40],
  ['restaurant', 'nwr["amenity"="restaurant"]["name"]', 4000, 60],
  ['theatre', 'nwr["amenity"~"^(theatre|arts_centre)$"]["name"]', 15000, 20],
  ['stadium', 'nwr["leisure"="stadium"]["name"]', 25000, 15],
  ['venue', 'nwr["amenity"~"^(events_venue|conference_centre)$"]["name"]', 15000, 20],
  ['hotel', 'nwr["tourism"="hotel"]["name"]', 8000, 20],
  ['caterer', 'nwr["craft"="caterer"]["name"]', 20000, 15],
  ['gift', 'nwr["shop"~"^(gift|confectionery)$"]["name"]', 8000, 20],
  ['attraction', 'nwr["tourism"~"^(attraction|museum|gallery)$"]["name"]', 20000, 25],
];

export function overpassQuery({ lat, lon }, only) {
  const sets = only ? PLACE_SETS.filter(([k]) => only.includes(k)) : PLACE_SETS;
  const parts = sets.map(([k, sel, radius, limit]) => `(${sel}(around:${radius},${lat},${lon});)->.${k};.${k} out center tags ${limit};`);
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

const OVERPASS_MIRRORS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter'];

// Overpass sometimes answers HTTP 200 with an empty result and a "runtime error" remark
// (server busy / query timed out) — that is a failure, not "no cinemas here".
export function overpassFailure(json) {
  if (!json || !Array.isArray(json.elements)) return 'unexpected response';
  if (!json.elements.length && /error/i.test(json.remark || '')) return json.remark.slice(0, 120);
  return null;
}

const OVERPASS_DEADLINE_MS = 25000;

// Tries the mirrors in turn but gives up after OVERPASS_DEADLINE_MS overall; Nominatim covers
// the gap. A late answer still lands in the cache, so the next refresh gets it instantly.
function overpass(q, timeout) {
  let timer;
  const deadline = new Promise((r) => {
    timer = setTimeout(() => r({ ok: false, error: `no answer within ${OVERPASS_DEADLINE_MS / 1000}s` }), OVERPASS_DEADLINE_MS);
  });
  return Promise.race([overpassMirrors(q, timeout), deadline]).finally(() => clearTimeout(timer));
}

async function overpassMirrors(q, timeout) {
  const errors = [];
  for (const url of OVERPASS_MIRRORS) {
    const r = await getJSON(url, { method: 'POST', body: `data=${enc(q)}`, headers: { 'content-type': 'application/x-www-form-urlencoded', accept: '*/*' }, ttl: 7 * 86400, timeout, key: `overpass ${q}`, accept: (d) => !overpassFailure(d) });
    const bad = r.ok ? overpassFailure(r.data) : r.error;
    if (!bad) return r;
    errors.push(`${new URL(url).host}: ${bad}`);
  }
  return { ok: false, error: errors.join('; ') };
}

// ---------- 2b. Real places, second route: Nominatim search ----------
// Nominatim understands "special phrases" like "cinema" inside a bounded box and returns the
// same OpenStreetMap objects. It's slower (1 request/second) but far more dependable than Overpass.
const NOMINATIM_PLACES = [
  ['cinema', 'cinema', (x) => x.category === 'amenity' && x.type === 'cinema'],
  ['theatre', 'theatre', (x) => x.category === 'amenity' && /^(theatre|arts_centre)$/.test(x.type)],
  ['stadium', 'stadium', (x) => x.category === 'leisure' && x.type === 'stadium'],
  ['restaurant', 'restaurant', (x) => x.category === 'amenity' && x.type === 'restaurant'],
  ['hotel', 'hotel', (x) => x.category === 'tourism' && x.type === 'hotel'],
  ['attraction', 'museum', (x) => x.category === 'tourism' && /^(museum|attraction|gallery)$/.test(x.type)],
];

export function normaliseNominatimPlaces(json, kind, center) {
  const test = NOMINATIM_PLACES.find(([k]) => k === kind)?.[2] || (() => true);
  const seen = new Set();
  return arr(json)
    .filter((x) => x?.name && test(x))
    .filter((x) => (seen.has(x.name.toLowerCase()) ? false : seen.add(x.name.toLowerCase())))
    .map((x) => {
      const a = x.address || {};
      const pos = { lat: Number(x.lat), lon: Number(x.lon) };
      const address = [[a.house_number, a.road].filter(Boolean).join(' '), a.suburb || a.neighbourhood, a.city || a.town || a.village].filter(Boolean).join(', ');
      return {
        osmId: `${x.osm_type}-${x.osm_id}`,
        name: x.namedetails?.['name:en'] || x.name,
        kind,
        cuisine: x.extratags?.cuisine ? x.extratags.cuisine.split(';').map((c) => c.replace(/_/g, ' ')).slice(0, 2).join(', ') : null,
        stars: x.extratags?.stars || null,
        address: address || null,
        website: x.extratags?.website || x.extratags?.['contact:website'] || null,
        distanceKm: distanceKm(center, pos),
      };
    })
    .sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99));
}

export function nominatimPlacesUrl({ lat, lon }, phrase, km = 25) {
  const dLat = km / 111;
  const dLon = km / (111 * Math.cos((lat * Math.PI) / 180));
  const box = [lon - dLon, lat + dLat, lon + dLon, lat - dLat].map((n) => n.toFixed(4)).join(',');
  return `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${enc(phrase)}&viewbox=${box}&bounded=1&limit=40&addressdetails=1&extratags=1`;
}

async function nominatimPlaces(center, kinds) {
  const out = {};
  const errors = [];
  for (const [kind, phrase] of NOMINATIM_PLACES.filter(([k]) => kinds.includes(k))) {
    // "cinema" is usually read as a special phrase; "[cinema]" forces that on newer servers.
    let list = [];
    for (const q of [phrase, `[${phrase}]`]) {
      const r = await getJSON(nominatimPlacesUrl(center, q), { ttl: 7 * 86400, timeout: 15000 });
      if (!r.ok) {
        errors.push(`${kind}: ${r.error}`);
        break;
      }
      list = normaliseNominatimPlaces(r.data, kind, center);
      if (list.length) break;
    }
    if (list.length) out[kind] = list;
  }
  return { data: out, error: errors.join('; ') || null };
}

// Cinemas are asked for on their own (small query, answers fast). Nominatim runs alongside and
// fills in whatever Overpass couldn't deliver, so real theatres show up even when Overpass is down.
export async function places(center) {
  const kinds = PLACE_SETS.map(([k]) => k);
  const [cin, rest, nom] = await Promise.all([
    overpass(overpassQuery(center, ['cinema']), 12000),
    overpass(overpassQuery(center, kinds.filter((k) => k !== 'cinema')), 20000),
    nominatimPlaces(center, NOMINATIM_PLACES.map(([k]) => k)),
  ]);
  const data = { ...nom.data, ...(rest.ok ? normaliseOsm(rest.data, center) : {}) };
  const osmCinemas = cin.ok ? normaliseOsm(cin.data, center).cinema || [] : [];
  if (osmCinemas.length || !data.cinema) data.cinema = osmCinemas.length ? osmCinemas : data.cinema;
  if (!data.cinema?.length) delete data.cinema;
  const n = Object.values(data).reduce((t, l) => t + l.length, 0);
  const overpassOk = cin.ok && rest.ok;
  const via = overpassOk ? 'Overpass' : n ? 'Nominatim search' : null;
  const error = overpassOk ? (n ? null : 'no places found') : `Overpass — ${[cin.ok ? null : cin.error, rest.ok ? null : rest.error].filter(Boolean)[0]}${nom.error ? `; Nominatim — ${nom.error}` : ''}`;
  return { source: via ? `OpenStreetMap places (${via})` : 'OpenStreetMap places', ok: n > 0, error, data, count: n, cinemasOk: Boolean(data.cinema?.length) || cin.ok };
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

// Recent theatrical releases from Wikidata (no key), with posters from Wikipedia page summaries.
// Languages with a large diaspora audience outside their home country — a Wikidata popularity
// ranking by total (worldwide) sitelinks buries these under Hollywood films, so cities with a
// South Asian diaspora (much of Canada, the UK, the US, Singapore, the UAE) never saw them.
// Wikidata QIDs: Hindi, Punjabi, Tamil, Telugu, Malayalam, Kannada, Bengali.
export const DIASPORA_LANGUAGE_QIDS = ['Q1568', 'Q58635', 'Q5885', 'Q8097', 'Q36236', 'Q33673', 'Q9610'];

export function wikidataFilmsQuery({ countryCode, from, to, firstBy = shiftDays(from, -365), langQids = null }) {
  const origin = countryCode === 'IN' ? '?film wdt:P495 wd:Q668 .' : '';
  const langFilter = langQids ? `VALUES ?wantedLang { ${langQids.map((q) => `wd:${q}`).join(' ')} } ?film wdt:P364 ?wantedLang .` : '';
  return `SELECT ?film ?filmLabel ?date ?article ?links ?langLabel ?genreLabel WHERE {
  ?film wdt:P31 wd:Q11424 ; wdt:P577 ?date ; wikibase:sitelinks ?links .
  FILTER(?date >= "${from}T00:00:00Z"^^xsd:dateTime && ?date <= "${to}T00:00:00Z"^^xsd:dateTime)
  FILTER NOT EXISTS { ?film wdt:P577 ?earlier . FILTER(?earlier < "${firstBy}T00:00:00Z"^^xsd:dateTime) }
  ${origin}
  ${langFilter}
  ?article schema:about ?film ; schema:isPartOf <https://en.wikipedia.org/> .
  OPTIONAL { ?film wdt:P364 ?lang . }
  OPTIONAL { ?film wdt:P136 ?genre . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} ORDER BY DESC(?links) LIMIT 150`;
}

export function normaliseWikidataFilms(json) {
  const byId = new Map();
  for (const b of json?.results?.bindings || []) {
    const qid = b.film?.value?.split('/').pop();
    const title = b.filmLabel?.value;
    if (!qid || !title || /^Q\d+$/.test(title)) continue;
    const f = byId.get(qid) || { qid, title, links: Number(b.links?.value || 0), date: b.date?.value?.slice(0, 10), wiki: decodeURIComponent((b.article?.value || '').split('/wiki/')[1] || ''), languages: new Set(), genres: new Set() };
    if (b.langLabel?.value && !/^Q\d+$/.test(b.langLabel.value)) f.languages.add(b.langLabel.value.replace(/ language$/, '').replace(/^\w/, (c) => c.toUpperCase()));
    if (b.genreLabel?.value && !/^Q\d+$/.test(b.genreLabel.value)) f.genres.add(b.genreLabel.value.replace(/ film$/, '').replace(/^\w/, (c) => c.toUpperCase()));
    byId.set(qid, f);
  }
  return [...byId.values()]
    .sort((a, b) => b.links - a.links)
    .map((f) => ({
      id: `wd-${f.qid}`,
      title: f.title,
      wiki: f.wiki,
      language: [...f.languages][0] || null,
      genre: [...f.genres].slice(0, 2).join(' · ') || 'Film',
      cert: null,
      runtime: null,
      releaseDate: f.date,
      rating: null,
      poster: null,
      summary: null,
    }));
}

const shiftDays = (iso, days) => new Date(Date.parse(iso) + days * 86400000).toISOString().slice(0, 10);

// Wikipedia opens film articles with "X is a 1986 American action film…": use it as a second
// guard against old films that only have a recent re-release date on Wikidata.
export function releaseYearFromSummary(text) {
  const m = /\b(?:is|was) an? (\d{4}) (?:[A-Za-z-]+ ){0,6}(?:film|movie)/.exec(text || '');
  return m ? Number(m[1]) : null;
}

export function normaliseWikiSummary(json) {
  if (!json) return null;
  return { poster: json.thumbnail?.source || json.originalimage?.source || null, summary: json.extract || null };
}

async function wikidataQuery({ countryCode, from, to, langQids, cacheKey }) {
  const q = wikidataFilmsQuery({ countryCode, from, to, langQids });
  const r = await getJSON(`https://query.wikidata.org/sparql?format=json&query=${enc(q)}`, { ttl: 12 * 3600, timeout: 30000, headers: { accept: 'application/sparql-results+json' }, key: `wikidata films v2 ${cacheKey}` });
  return r.ok ? { ok: true, films: normaliseWikidataFilms(r.data) } : { ok: false, error: r.error, films: [] };
}

// Wikipedia page summaries, four at a time: gives us a poster, a summary, and (via
// releaseYearFromSummary) a second opinion on the release year.
async function addSummaries(films) {
  for (let i = 0; i < films.length; i += 4) {
    await Promise.all(
      films.slice(i, i + 4).map(async (f) => {
        if (!f.wiki) return;
        const s = await getJSON(`https://en.wikipedia.org/api/rest_v1/page/summary/${enc(f.wiki)}`, { ttl: 7 * 86400 });
        const n = s.ok ? normaliseWikiSummary(s.data) : null;
        if (n) Object.assign(f, n);
      }),
    );
  }
  return films;
}

async function recentFilms({ countryCode }) {
  const today = new Date();
  const iso = (d) => d.toISOString().slice(0, 10);
  const from = iso(new Date(today.getTime() - 45 * 86400000));
  const to = iso(new Date(today.getTime() + 10 * 86400000));

  const main = await wikidataQuery({ countryCode, from, to, langQids: null, cacheKey: `${countryCode} ${from}` });
  if (!main.ok) return { ok: false, error: main.error, data: [] };
  let films = main.films.slice(0, 18);

  // A worldwide-popularity ranking buries diaspora-language films under Hollywood ones, so for
  // editions outside India ask for them separately and merge in whatever the main query missed.
  if (countryCode !== 'IN') {
    const diaspora = await wikidataQuery({ countryCode, from, to, langQids: DIASPORA_LANGUAGE_QIDS, cacheKey: `diaspora ${from}` });
    const have = new Set(films.map((f) => f.id));
    const extra = diaspora.films.filter((f) => !have.has(f.id)).slice(0, 8);
    films = [...films, ...extra];
  }

  films = await addSummaries(films);
  const minYear = today.getFullYear() - 1;
  films = films.filter((f) => (releaseYearFromSummary(f.summary) ?? minYear) >= minYear);
  const withPosters = films.filter((f) => f.poster);
  return { ok: withPosters.length > 0, error: withPosters.length ? null : 'no posters found', data: withPosters.length >= 6 ? withPosters : films };
}

export async function movies({ countryCode }) {
  const cc = (countryCode || 'CA').toLowerCase();
  const key = process.env.TMDB_API_KEY;
  if (key) {
    const bearer = key.startsWith('eyJ');
    const url = `https://api.themoviedb.org/3/movie/now_playing?region=${cc.toUpperCase()}&page=1${bearer ? '' : `&api_key=${enc(key)}`}`;
    const r = await getJSON(url, { ttl: 6 * 3600, headers: bearer ? { authorization: `Bearer ${key}` } : {}, key: `tmdb now_playing ${cc}` });
    const data = r.ok ? normaliseTmdb(r.data) : [];
    if (data.length) return { source: 'TMDB (now playing in cinemas)', ok: true, data };
  }
  const wd = await recentFilms({ countryCode: cc.toUpperCase() });
  if (wd.ok && wd.data.length >= 6) return { source: 'Wikidata + Wikipedia (recent releases)', ok: true, data: wd.data };
  const r = await getJSON(`https://itunes.apple.com/${cc}/rss/topmovies/limit=20/json`, { ttl: 6 * 3600 });
  const chart = r.ok ? normaliseItunes(r.data) : [];
  const data = [...(wd.ok ? wd.data : []), ...chart].slice(0, 18);
  const source = chart.length ? `Apple iTunes movie chart (${cc.toUpperCase()})` : 'Wikidata + Wikipedia (recent releases)';
  return { source, ok: data.length > 0, error: data.length ? null : [wd.error, r.error].filter(Boolean).join('; ') || 'no movies', data };
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
// Rough ticket tiers per sport (before the city price tier) — the API has no prices.
export const SPORT_TIERS = {
  // [tier, ₹ base, C$ base]
  Cricket: [['Stand', 800, 25], ['Pavilion', 2500, 60], ['Corporate box (per seat)', 15000, 250]],
  'Ice Hockey': [['Upper bowl', 5000, 95], ['Lower bowl', 12000, 240], ['Club seats', 25000, 450]],
  Basketball: [['Upper level', 4000, 75], ['Lower level', 11000, 210], ['Courtside club', 30000, 650]],
  Baseball: [['Outfield', 2500, 35], ['Infield', 6000, 85], ['Premium', 15000, 220]],
  Soccer: [['Stand', 1500, 35], ['Premium', 5000, 95]],
  'American Football': [['Upper deck', 4000, 45], ['Lower deck', 9000, 95], ['Club', 20000, 180]],
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
    timeKnown: Boolean(e.strTimestamp || e.strTime),
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
      time: e.dates?.start?.localTime?.slice(0, 5) || null,
      venue: v.name || null,
      city: v.city?.name || null,
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
