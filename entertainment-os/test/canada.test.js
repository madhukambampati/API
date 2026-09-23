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
