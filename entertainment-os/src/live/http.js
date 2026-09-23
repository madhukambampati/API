// Minimal JSON fetcher for the free public APIs: timeout, on-disk cache, offline switch.
// Set EOS_OFFLINE=1 to never touch the network (tests, demos without internet).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
// Same /tmp fallback as store.js, for the same reason (Vercel's filesystem is read-only outside /tmp).
const CACHE_PATH = process.env.EOS_CACHE || (process.env.VERCEL ? '/tmp/eos-live-cache.json' : path.join(here, '..', '..', 'data', 'live-cache.json'));
const USER_AGENT = 'EntertainmentOS-demo/1.0 (+https://github.com/madhukambampati/API)';

let cache = null;
let saveTimer = null;

export const offline = () => process.env.EOS_OFFLINE === '1';

function loadCache() {
  if (cache) return cache;
  try {
    cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
  } catch {
    cache = {};
  }
  return cache;
}

function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
      fs.writeFileSync(CACHE_PATH, JSON.stringify(cache));
    } catch {
      /* cache is best-effort */
    }
  }, 200);
  saveTimer.unref?.();
}

// Nominatim asks for at most one request per second; queue calls to that host.
let nominatimChain = Promise.resolve();
function politely(url, fn) {
  if (!url.includes('nominatim.openstreetmap.org')) return fn();
  const run = nominatimChain.then(fn, fn);
  nominatimChain = run.then(() => new Promise((r) => setTimeout(r, 1100)), () => new Promise((r) => setTimeout(r, 1100)));
  return run;
}

/**
 * Fetch JSON with caching. Returns { ok, data, error, cached }.
 * ttl is in seconds. `key` defaults to method + url + body.
 */
export async function getJSON(url, { ttl = 3600, method = 'GET', body, headers = {}, timeout = 9000, key, accept = () => true } = {}) {
  const c = loadCache();
  const k = key || `${method} ${url} ${body || ''}`;
  const hit = c[k];
  if (hit && Date.now() - hit.at < ttl * 1000) return { ok: true, data: hit.data, cached: true };
  if (offline()) return hit ? { ok: true, data: hit.data, cached: true, stale: true } : { ok: false, error: 'offline mode' };
  try {
    const res = await politely(url, () =>
      fetch(url, {
        method,
        body,
        headers: { 'user-agent': USER_AGENT, accept: 'application/json', ...headers },
        signal: AbortSignal.timeout(timeout),
      }),
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (accept(data)) {
      // only cache answers worth keeping (e.g. not an Overpass "server busy" reply)
      c[k] = { at: Date.now(), data };
      persist();
    }
    return { ok: true, data, cached: false };
  } catch (err) {
    // Serve stale data rather than nothing when the service is down.
    if (hit) return { ok: true, data: hit.data, cached: true, stale: true };
    return { ok: false, error: err?.name === 'TimeoutError' ? 'timed out' : err?.message || String(err) };
  }
}
