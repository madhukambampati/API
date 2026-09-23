// Checks which free data sources this machine can reach, for a city.
// Usage: npm run check-live              (Toronto, Ontario, Canada)
//        npm run check-live -- "Vancouver, British Columbia, Canada"
import * as live from '../src/live/index.js';
import { DEFAULT_LOCATION } from '../src/locations.js';

const arg = process.argv[2];
const [city, state, country] = arg ? arg.split(',').map((x) => x.trim()) : [DEFAULT_LOCATION.city, DEFAULT_LOCATION.state, DEFAULT_LOCATION.country];
const loc = { city, state, country: country || DEFAULT_LOCATION.country };

console.log(`Checking live data for ${[loc.city, loc.state, loc.country].filter(Boolean).join(', ')} … (the first run can take up to a minute)\n`);
const t0 = Date.now();
const b = await live.ensure(loc);
for (const s of b.sources) console.log(`${s.ok ? (s.error ? "⚠️ " : "✅") : s.optional ? "➖" : "❌"}  ${s.name}${s.error ? `  — ${s.error}` : ""}`);
const places = Object.fromEntries(Object.entries(b.places || {}).map(([k, v]) => [k, v.length]));
console.log(`\nPlaces found: ${JSON.stringify(places)}`);
const cins = b.places?.cinema || [];
console.log(cins.length ? `Cinemas (OpenStreetMap):\n${cins.slice(0, 8).map((c) => `  - ${c.name}${c.distanceKm != null ? ` · ${c.distanceKm} km` : ''}${c.address ? ` · ${c.address}` : ''}`).join('\n')}` : 'Cinemas: none found — the app will show clearly-marked demo theatres.');
console.log(`Films: ${b.movies.length} (${b.moviesSource || 'none'}), with posters: ${b.movies.filter((m) => m.poster).length}`);
b.movies.slice(0, 5).forEach((m) => console.log(`   • ${m.title}${m.poster ? '' : '  (no poster)'}`));
console.log(`Sports fixtures: ${b.sports.length}; Ticketmaster events: ${b.ticketmaster.length}; holidays: ${b.holidays.length}; weather days: ${b.weather?.days?.length || 0}`);
console.log(`\nDone in ${((Date.now() - t0) / 1000).toFixed(1)}s. Anything marked ❌ falls back to sample data in the app.`);
process.exit(0); // don't wait for slow background requests (their answers are cached for next time)
