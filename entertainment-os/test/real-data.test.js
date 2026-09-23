import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import * as live from '../src/live/index.js';
import * as catalog from '../src/catalog.js';
process.env.EOS_DEMO = '0';
const loc = { country: 'Canada', state: 'Ontario', city: 'Toronto' };
beforeEach(() => live.clear());
test('unavailable data never invents listings or showtimes', () => {
  assert.deepEqual(catalog.movies(loc), []);
  assert.deepEqual(catalog.cinemas(loc), []);
  assert.deepEqual(catalog.events(loc), []);
  assert.deepEqual(catalog.vendors('reservations', loc), []);
  assert.deepEqual(catalog.showtimes('m-orbit-9', '2026-09-23', loc), []);
  assert.equal(catalog.findMovie('m-orbit-9', loc), null);
});
test('real places and films do not acquire invented formats or prices', () => {
  live.set(loc, { places: { cinema: [{ name: 'Cinema', osmId: '1', website: 'https://example.com' }], restaurant: [{ name: 'Restaurant', osmId: '2', kind: 'restaurant' }] }, movies: [{ id: 'real', title: 'Film' }], moviesSource: 'Provider' });
  assert.deepEqual(catalog.movies(loc)[0].formats, []);
  assert.deepEqual(catalog.cinemas(loc)[0].formats, []);
  assert.equal(catalog.cinemas(loc)[0].website, 'https://example.com');
  assert.equal(catalog.vendors('reservations', loc)[0].perPerson, null);
});
test('away teams never place a fixture in the selected city; prices remain unknown', () => {
  live.set(loc, { sports: [
    { id: 'away', title: 'Winnipeg vs Toronto', city: 'Winnipeg', timestamp: '2026-09-25T20:00:00Z' },
    { id: 'home', title: 'Toronto vs Miami', city: 'Toronto', timestamp: '2026-09-25T20:00:00Z' },
  ] });
  const events = catalog.events(loc, { now: new Date('2026-09-23') });
  assert.equal(events.find((e) => e.id === 'away').local, false);
  assert.equal(events.find((e) => e.id === 'home').local, true);
  assert.ok(events.every((e) => e.tiers.length === 0 && e.source !== 'sample'));
});
