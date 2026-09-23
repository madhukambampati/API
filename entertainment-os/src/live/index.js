// Live data for a location: gathers every free source in parallel and keeps the
// result in memory so the (synchronous) catalog and agents can use it.
import { COUNTRY_META } from '../locations.js';
import * as P from './providers.js';

const bundles = new Map(); // locKey -> bundle
const inflight = new Map(); // locKey -> Promise<bundle>
const FRESH_MS = 30 * 60 * 1000;

export const locKey = (loc) => [loc.country, loc.state, loc.city].map((x) => String(x || '').trim().toLowerCase()).join('|');

export function get(loc) {
  return bundles.get(locKey(loc)) || null;
}

// For tests: pretend a location's live data has been fetched.
export function set(loc, bundle) {
  bundles.set(locKey(loc), { at: Date.now(), ...bundle });
}

export function clear() {
  bundles.clear();
}

async function gather(loc) {
  const today = new Date().toISOString().slice(0, 10);
  const meta = COUNTRY_META[loc.country];
  const sources = [];
  const track = (r) => {
    sources.push({ name: r.source, ok: r.ok, error: r.error || null, optional: Boolean(r.optional) });
    return r;
  };

  const geo = track(await P.geocode(loc));
  const coords = geo.data ? { lat: geo.data.lat, lon: geo.data.lon } : null;
  const countryCode = meta?.code || geo.data?.countryCode || null;

  const [places, weather, fx, holidays, movies, sports, tm] = await Promise.all([
    coords ? P.places(coords) : Promise.resolve({ source: 'OpenStreetMap Overpass', ok: false, error: 'no coordinates', data: {} }),
    coords ? P.weather(coords) : Promise.resolve({ source: 'Open-Meteo', ok: false, error: 'no coordinates', data: null }),
    P.fx(),
    P.holidays({ countryCode, state: loc.state, from: today }),
    P.movies({ countryCode }),
    P.sports({ countryCode }),
    coords ? P.ticketmaster(coords) : Promise.resolve({ source: 'Ticketmaster', ok: false, error: 'no coordinates', data: [], optional: true }),
  ]);
  [places, weather, fx, holidays, movies, sports, tm].forEach(track);

  return {
    at: Date.now(),
    coords,
    countryCode,
    currency: meta?.currency || null,
    places: places.data || {},
    weather: weather.data,
    fx: fx.data,
    holidays: holidays.data || [],
    movies: movies.data || [],
    moviesSource: movies.ok ? movies.source : null,
    sports: sports.data || [],
    ticketmaster: tm.data || [],
    sources,
  };
}

// Fetch (or reuse) live data for a location. Never throws; failures become "sample data" fallbacks.
export async function ensure(loc) {
  const key = locKey(loc);
  const have = bundles.get(key);
  if (have && Date.now() - have.at < FRESH_MS) return have;
  if (inflight.has(key)) return inflight.get(key);
  const p = gather(loc)
    .catch((err) => ({ at: Date.now(), places: {}, movies: [], sports: [], ticketmaster: [], holidays: [], sources: [{ name: 'live data', ok: false, error: err.message }] }))
    .then((b) => {
      bundles.set(key, b);
      inflight.delete(key);
      return b;
    });
  inflight.set(key, p);
  return p;
}
