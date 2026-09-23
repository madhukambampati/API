// Live data for a location: gathers every free source in parallel and keeps the
// result in memory so the (synchronous) catalog and agents can use it.
import { COUNTRY_META } from '../locations.js';
import * as P from './providers.js';

const bundles = new Map(); // locKey -> bundle
const inflight = new Map(); // locKey -> Promise<bundle>
const FRESH_MS = 30 * 60 * 1000;
const RETRY_MS = 3 * 60 * 1000; // try again sooner when real cinemas couldn't be fetched

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

// Publish each provider as it finishes; weather and films need not wait for places.
export async function gather(loc, providers = P, publish = () => {}) {
  const today = new Date().toISOString().slice(0, 10);
  const meta = COUNTRY_META[loc.country];
  const bundle = { at: Date.now(), coords: null, countryCode: meta?.code || null,
    currency: meta?.currency || null, places: {}, cinemasOk: false, weather: null,
    fx: null, holidays: [], movies: [], moviesSource: null, sports: [], ticketmaster: [], sources: [] };
  const run = async (name, task, assign) => {
    let r;
    try { r = await task(); }
    catch (err) { r = { source: name, ok: false, error: err.message }; }
    assign(r);
    bundle.sources.push({ name: r.source || name, ok: Boolean(r.ok), error: r.error || null, optional: Boolean(r.optional) });
    bundle.at = Date.now();
    publish({ ...bundle, sources: [...bundle.sources] });
    return r;
  };
  const geo = run('OpenStreetMap Nominatim', () => providers.geocode(loc), (r) => {
    bundle.coords = r.data ? { lat: r.data.lat, lon: r.data.lon } : null;
    bundle.countryCode ||= r.data?.countryCode || null;
  });
  await Promise.all([
    run('Frankfurter (ECB)', () => providers.fx(), (r) => { bundle.fx = r.data || null; }),
    geo.then(async () => {
      const cc = { countryCode: bundle.countryCode };
      const coords = bundle.coords;
      await Promise.all([
        run('OpenStreetMap places', () => coords ? providers.places(coords) : { ok: false, error: 'no coordinates' }, (r) => {
          bundle.places = r.data || {}; bundle.cinemasOk = Boolean(r.cinemasOk);
        }),
        run('Open-Meteo', () => coords ? providers.weather(coords) : { ok: false, error: 'no coordinates' }, (r) => { bundle.weather = r.data || null; }),
        run('Nager.Date', () => providers.holidays({ ...cc, state: loc.state, from: today }), (r) => { bundle.holidays = r.data || []; }),
        run('Movies', () => providers.movies(cc), (r) => { bundle.movies = r.data || []; bundle.moviesSource = r.ok ? r.source : null; }),
        run('TheSportsDB', () => providers.sports(cc), (r) => { bundle.sports = r.data || []; }),
        run('Ticketmaster', () => coords ? providers.ticketmaster(coords) : { ok: false, error: 'no coordinates', optional: true }, (r) => { bundle.ticketmaster = r.data || []; }),
      ]);
    }),
  ]);
  return bundle;
}

export function status(loc) {
  const key = locKey(loc);
  return inflight.has(key) ? 'loading' : bundles.has(key) ? 'ready' : 'none';
}

function refresh(loc) {
  const key = locKey(loc);
  if (inflight.has(key)) return inflight.get(key);
  const t0 = Date.now();
  const p = gather(loc, P, (b) => bundles.set(key, b))
    .catch((err) => ({ at: Date.now(), places: {}, movies: [], sports: [], ticketmaster: [], holidays: [], sources: [{ name: 'live data', ok: false, error: err.message }] }))
    .then((b) => {
      bundles.set(key, b);
      inflight.delete(key);
      if (process.env.NODE_ENV !== 'test' && process.env.EOS_OFFLINE !== '1') {
        const ok = b.sources.filter((x) => x.ok).length;
        console.log(`[live] ${loc.city}: ${ok}/${b.sources.length} sources in ${((Date.now() - t0) / 1000).toFixed(1)}s · ${Object.values(b.places || {}).flat().length} places (${(b.places?.cinema || []).length} cinemas) · ${b.movies.length} films · ${b.sports.length} fixtures`);
        for (const x of b.sources.filter((x) => x.error && !x.optional)) console.log(`[live]   ${x.ok ? '!' : '✗'} ${x.name}: ${x.error}`);
      }
      return b;
    });
  inflight.set(key, p);
  return p;
}

/**
 * Fetch (or reuse) live data for a location. Never throws; failures become "sample data" fallbacks.
 * waitMs: how long the caller is willing to wait. If the data isn't ready by then it resolves to
 * whatever is available now (possibly null) and gathering carries on in the background.
 * Stale data is served immediately while it refreshes in the background.
 */
export async function ensure(loc, { waitMs = Infinity } = {}) {
  const key = locKey(loc);
  const have = bundles.get(key);
  if (have && !inflight.has(key) && Date.now() - have.at < (have.sources?.some((s) => !s.ok && !s.optional) || have.cinemasOk === false ? RETRY_MS : FRESH_MS)) return have;
  const p = refresh(loc);
  if (have) return have;
  if (waitMs === Infinity) return p;
  let timer;
  try {
    return await Promise.race([p, new Promise((r) => { timer = setTimeout(() => r(bundles.get(key) || null), waitMs); })]);
  } finally { clearTimeout(timer); }
}
