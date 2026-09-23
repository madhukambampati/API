// Canada edition (the default): locations, CAD prices, policy, films, events, chat + Interac payment.
// Run with EOS_REGION=CA (npm test does this).
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

process.env.EOS_OFFLINE = '1';
process.env.EOS_DISABLE_LLM = '1';

const { REGION } = await import('../src/region.js');
const { useMemory, load } = await import('../src/store.js');
const { seed, POLICY } = await import('../src/seed.js');
const { ACTIVE_LOCATIONS, DEFAULT_LOCATION, findCityInText } = await import('../src/locations.js');
const { inr, convert } = await import('../src/money.js');
const catalog = await import('../src/catalog.js');
const live = await import('../src/live/index.js');
const P = await import('../src/live/providers.js');
const orchestrator = await import('../src/agents/orchestrator.js');
const chat = await import('../src/agents/chat.js');
const { loadDemo } = await import('../src/demo.js');

const TOR = { country: 'Canada', state: 'Ontario', city: 'Toronto' };
const MTL = { country: 'Canada', state: 'Quebec', city: 'Montreal' };

beforeEach(() => useMemory(seed()));

test('Canada is the default edition: Toronto, Canadian provinces and cities only', () => {
  assert.equal(REGION, 'CA');
  assert.deepEqual(DEFAULT_LOCATION, TOR);
  assert.deepEqual(Object.keys(ACTIVE_LOCATIONS), ['Canada']);
  assert.equal(Object.keys(ACTIVE_LOCATIONS.Canada).length, 13);
  assert.equal(findCityInText('dinner in Pune'), null, 'Indian cities are not offered in the Canada edition');
  assert.deepEqual(findCityInText('hockey in Montréal tonight'), MTL);
  assert.equal(findCityInText('show in London').state, 'Ontario');
});

test('company money is in Canadian dollars', () => {
  assert.equal(inr(1234.5), 'C$1,234.50');
  assert.equal(inr(300), 'C$300');
  assert.equal(POLICY.currency, 'CAD');
  assert.equal(POLICY.autoApproveLimit, 300);
  const d = seed();
  assert.equal(d.meta.company, 'Northwind Canada Inc.');
  assert.ok(d.people.filter((p) => p.employee).every((p) => p.home.country === 'Canada'));
  assert.equal(Math.round(convert(100, 'CAD', 'INR', { CAD: 0.016 })), 6250);
});

test('prices are realistic Canadian prices', () => {
  const shows = catalog.showtimes('m-orbit-9', '2026-09-25', TOR).flatMap((c) => c.shows);
  const byFormat = Object.fromEntries(shows.map((s) => [s.format, s.price]));
  assert.equal(byFormat['2D'], 15);
  if (byFormat.IMAX) assert.equal(byFormat.IMAX, 24);
  const dinner = catalog.vendors('reservations', TOR)[0];
  assert.ok(dinner.perPerson >= 40 && dinner.perPerson <= 120, `dinner ${dinner.perPerson}`);
  const evs = catalog.events(TOR);
  assert.ok(evs.every((e) => e.tiers.every((t) => t.price > 0 && t.price < 1000)));
  assert.ok(!evs.some((e) => /Kabaddi|Chai|Qawwali|Monsoon|Bharat|Mughals/.test(e.title)));
});

test('a French film is the local pick in Quebec', () => {
  const films = catalog.movies(MTL);
  assert.equal(films[0].language, 'French');
  assert.ok(films[0].local);
});

test('Wikidata recent releases + Wikipedia posters normalise', () => {
  const films = P.normaliseWikidataFilms({
    results: {
      bindings: [
        { film: { value: 'http://www.wikidata.org/entity/Q1' }, filmLabel: { value: 'Big Film' }, date: { value: '2026-09-05T00:00:00Z' }, article: { value: 'https://en.wikipedia.org/wiki/Big_Film' }, links: { value: '40' }, langLabel: { value: 'English' }, genreLabel: { value: 'action film' } },
        { film: { value: 'http://www.wikidata.org/entity/Q1' }, filmLabel: { value: 'Big Film' }, date: { value: '2026-09-05T00:00:00Z' }, article: { value: 'https://en.wikipedia.org/wiki/Big_Film' }, links: { value: '40' }, langLabel: { value: 'English' }, genreLabel: { value: 'thriller film' } },
        { film: { value: 'http://www.wikidata.org/entity/Q2' }, filmLabel: { value: 'Q2' }, date: { value: '2026-09-05T00:00:00Z' }, article: { value: 'https://en.wikipedia.org/wiki/X' }, links: { value: '90' } },
        { film: { value: 'http://www.wikidata.org/entity/Q3' }, filmLabel: { value: 'Le Film' }, date: { value: '2026-09-10T00:00:00Z' }, article: { value: 'https://en.wikipedia.org/wiki/Le_Film_(2026_film)' }, links: { value: '12' }, langLabel: { value: 'French' } },
      ],
    },
  });
  assert.deepEqual(films.map((f) => f.id), ['wd-Q1', 'wd-Q3'], 'unlabelled items dropped, sorted by popularity');
  assert.equal(films[0].genre, 'Action · Thriller');
  assert.equal(films[1].wiki, 'Le_Film_(2026_film)');
  const sum = P.normaliseWikiSummary({ extract: 'A film.', thumbnail: { source: 'https://upload.wikimedia.org/x/Poster.jpg' } });
  assert.deepEqual(sum, { poster: 'https://upload.wikimedia.org/x/Poster.jpg', summary: 'A film.' });
});

test('demo: hockey box goes to Compliance, prices in C$', async () => {
  const d = await loadDemo();
  const box = d.bookings.find((b) => /hockey/i.test(b.request || ''));
  assert.equal(box.category, 'events');
  assert.ok(box.approvals.some((a) => a.key === 'compliance'));
  assert.ok(d.bookings.every((b) => b.location.country === 'Canada'));
});

test('chat in Toronto: theatres → films → seats → Interac payment → ticket', async () => {
  const say = (sessionId, text) => chat.handle({ sessionId, actorId: 'u-ananya', text, location: TOR });
  const tap = (sessionId, action) => chat.handle({ sessionId, actorId: 'u-ananya', action, location: TOR });
  let r = await chat.handle({ actorId: 'u-ananya', location: TOR });
  const id = r.sessionId;
  r = await say(id, 'Movie tomorrow for 2, check the theatres near me');
  assert.equal(r.messages.at(-1).card.type, 'cinemas');
  r = await say(id, '1');
  const show = r.messages.at(-1).card.movies[0].shows[0];
  r = await tap(id, { type: 'pickShow', showKey: show.key });
  r = await tap(id, { type: 'confirmSeats', seats: r.messages.at(-1).card.suggested });
  r = await tap(id, { type: 'payer', funding: 'personal' });
  const pay = r.messages.at(-1).card;
  assert.deepEqual(pay.methods.map((m) => m.id), ['card', 'interac', 'wallet']);
  assert.equal(pay.localAmount, null, 'no conversion needed in Canada');
  r = await tap(id, { type: 'pay', method: 'upi', upiId: 'a@okaxis' });
  assert.match(r.messages[0].text, /available/, 'UPI is India-only');
  r = await say(id, 'pay with interac ananya@example.ca');
  const t = r.messages.at(-1).card;
  assert.equal(t.type, 'ticket');
  assert.match(t.booking.payment.label, /Interac/);
  assert.equal(load().bookings.find((b) => b.id === t.booking.id).payment.currency, 'CAD');
});

test('chat: hockey games near me', async () => {
  let r = await chat.handle({ actorId: 'u-ananya', location: TOR });
  r = await chat.handle({ sessionId: r.sessionId, actorId: 'u-ananya', text: 'any hockey or basketball games this week?', location: TOR });
  const card = r.messages.at(-1).card;
  assert.equal(card.type, 'events');
  assert.ok(card.events.every((e) => e.type === 'sports'));
});

test('without live map data, theatres are clearly labelled demo theatres, never real-sounding names', () => {
  const list = catalog.cinemas({ country: 'Canada', state: 'Ontario', city: 'Kitchener' });
  assert.ok(list.every((c) => c.source === 'sample' && /Demo Theatre .* \(sample\)/.test(c.name) && c.distanceKm == null));
});

test('cinemas get their own Overpass query; old films with re-release dates are filtered out', () => {
  const q = P.overpassQuery({ lat: 43.45, lon: -80.49 }, ['cinema']);
  assert.match(q, /amenity"="cinema"/);
  assert.doesNotMatch(q, /restaurant/);
  assert.match(P.overpassQuery({ lat: 43.45, lon: -80.49 }), /restaurant/);
  assert.match(P.wikidataFilmsQuery({ countryCode: 'CA', from: '2026-08-09', to: '2026-10-03' }), /FILTER NOT EXISTS \{ \?film wdt:P577 \?earlier . FILTER\(\?earlier < "2025-08-09/);
  assert.equal(P.releaseYearFromSummary('Cobra is a 1986 American action film directed by George P. Cosmatos'), 1986);
  assert.equal(P.releaseYearFromSummary('Frostbound is a 2026 Canadian science fiction thriller film.'), 2026);
  assert.equal(P.releaseYearFromSummary('A film.'), null);
});

test('Nominatim place search backs up Overpass; Overpass "busy" replies count as failures', () => {
  const center = { lat: 43.4516, lon: -80.4925 };
  const url = P.nominatimPlacesUrl(center, 'cinema');
  assert.match(url, /q=cinema&viewbox=-80\.\d+,43\.\d+,-80\.\d+,43\.\d+&bounded=1&limit=40/);
  const list = P.normaliseNominatimPlaces(
    [
      { osm_type: 'way', osm_id: 1, lat: '43.46', lon: '-80.52', category: 'amenity', type: 'cinema', name: 'Real Cinema One', address: { house_number: '10', road: 'King St', city: 'Waterloo' }, extratags: { website: 'https://example.ca' } },
      { osm_type: 'node', osm_id: 2, lat: '43.45', lon: '-80.49', category: 'amenity', type: 'cinema', name: 'Real Cinema Two', address: { city: 'Kitchener' } },
      { osm_type: 'node', osm_id: 3, lat: '43.45', lon: '-80.49', category: 'amenity', type: 'cafe', name: 'Cinema Cafe' },
      { osm_type: 'node', osm_id: 4, lat: '43.45', lon: '-80.49', category: 'amenity', type: 'cinema', name: 'Real Cinema Two' },
    ],
    'cinema',
    center,
  );
  assert.deepEqual(list.map((c) => c.name), ['Real Cinema Two', 'Real Cinema One'], 'nearest first, non-cinemas and duplicates dropped');
  assert.equal(list[1].address, '10 King St, Waterloo');
  assert.equal(list[1].osmId, 'way-1');
  assert.match(P.overpassFailure({ elements: [], remark: 'runtime error: Query timed out in "query" at line 1 after 26 seconds.' }), /timed out/);
  assert.equal(P.overpassFailure({ elements: [] }), null, 'an empty answer without an error is genuine');
  assert.equal(P.overpassFailure({ remark: 'x' }), 'unexpected response');
});

test('a real theatre never looks empty: with 3 or fewer real cinemas every movie shows, and every cinema gets at least 2 showtimes', () => {
  const loc = { country: 'Canada', state: 'Ontario', city: 'Kitchener' };
  // Fake a single real theatre so we can see the "few real cinemas" path deterministically.
  live.set(loc, { movies: [], sports: [], ticketmaster: [], holidays: [], places: { cinema: [{ osmId: 'way-1', name: 'Apollo Cinema', distanceKm: 0.3, address: '141 Ontario St N' }] }, sources: [] });
  const list = catalog.cinemas(loc);
  assert.equal(list.length, 1);
  for (const m of catalog.MOVIES) {
    const shows = catalog.showtimes(m.id, '2026-09-25', loc);
    assert.equal(shows.length, 1, `${m.title} should be showing at the only real cinema`);
    assert.ok(shows[0].shows.length >= 2, `${m.title} should have at least 2 showtimes, got ${shows[0].shows.length}`);
  }
  live.clear();
});

test('Wikidata: diaspora-language films are queried and merged in for non-India editions', () => {
  const q = P.wikidataFilmsQuery({ countryCode: 'CA', from: '2026-08-09', to: '2026-10-03', langQids: P.DIASPORA_LANGUAGE_QIDS });
  assert.match(q, /VALUES \?wantedLang \{ wd:Q1568 wd:Q58635 wd:Q5885 wd:Q8097 wd:Q36236 wd:Q33673 wd:Q9610 \}/);
  assert.match(q, /\?film wdt:P364 \?wantedLang \./);
  const plain = P.wikidataFilmsQuery({ countryCode: 'CA', from: '2026-08-09', to: '2026-10-03' });
  assert.doesNotMatch(plain, /wantedLang/);
});

test('movies(): Telugu/Tamil films are interleaved by title, not dumped after every English one', () => {
  live.set(TOR, {
    movies: [
      { id: 'wd-1', title: 'Zeta', language: 'English', source: 'x' },
      { id: 'wd-2', title: 'Alpha Talkies', language: 'Telugu', source: 'x' },
      { id: 'wd-3', title: 'Kabali Returns', language: 'Tamil', source: 'x' },
    ],
    sports: [], ticketmaster: [], holidays: [], places: {}, sources: [], moviesSource: 'test',
  });
  const titles = catalog.movies(TOR).map((m) => m.title);
  assert.deepEqual(titles, ['Zeta', 'Alpha Talkies', 'Kabali Returns']);
  live.clear();
});
