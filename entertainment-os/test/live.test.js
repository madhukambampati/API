// Live-data parsing, live data feeding the booking agents, the chat flow, payments and Canada.
// No network: EOS_OFFLINE=1 and hand-written responses in each API's documented shape.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

process.env.EOS_OFFLINE = '1';
process.env.EOS_DISABLE_LLM = '1';

const { useMemory, load } = await import('../src/store.js');
const { seed } = await import('../src/seed.js');
const P = await import('../src/live/providers.js');
const live = await import('../src/live/index.js');
const catalog = await import('../src/catalog.js');
const orchestrator = await import('../src/agents/orchestrator.js');
const chat = await import('../src/agents/chat.js');
const payment = await import('../src/agents/payment.js');
const { LOCATIONS, findCityInText } = await import('../src/locations.js');

const BLR = { country: 'India', state: 'Karnataka', city: 'Bengaluru' };
const TOR = { country: 'Canada', state: 'Ontario', city: 'Toronto' };
const center = { lat: 12.9716, lon: 77.5946 };

const OSM = {
  elements: [
    { type: 'node', id: 1, lat: 12.9352, lon: 77.6245, tags: { amenity: 'cinema', name: 'PVR Forum Mall', 'addr:street': 'Hosur Road', 'addr:suburb': 'Koramangala' } },
    { type: 'way', id: 2, center: { lat: 12.9719, lon: 77.6412 }, tags: { amenity: 'cinema', name: 'INOX Garuda' } },
    { type: 'node', id: 3, lat: 12.975, lon: 77.6, tags: { amenity: 'restaurant', name: 'Koshy’s', cuisine: 'indian;continental' } },
    { type: 'node', id: 4, lat: 12.975, lon: 77.6, tags: { amenity: 'restaurant', name: 'Koshy’s' } }, // duplicate
    { type: 'node', id: 5, lat: 12.97, lon: 77.59, tags: { leisure: 'stadium', name: 'M. Chinnaswamy Stadium' } },
    { type: 'node', id: 6, lat: 12.97, lon: 77.59, tags: { tourism: 'museum', name: 'Visvesvaraya Museum' } },
    { type: 'node', id: 7, lat: 12.97, lon: 77.59, tags: { shop: 'supermarket', name: 'Ignored' } },
  ],
};

beforeEach(() => {
  useMemory(seed());
  live.clear();
});

test('Canada is a country with provinces and cities; ambiguous names follow the current country', () => {
  assert.equal(Object.keys(LOCATIONS.Canada).length, 13);
  assert.ok(LOCATIONS.Canada.Ontario.includes('Toronto'));
  assert.equal(findCityInText('dinner in London', 'Canada').country, 'Canada');
  assert.equal(findCityInText('dinner in London', 'United Kingdom').country, 'United Kingdom');
});

test('OpenStreetMap places are classified, de-duplicated and sorted by distance', () => {
  const out = P.normaliseOsm(OSM, center);
  assert.deepEqual(out.cinema.map((c) => c.name).sort(), ['INOX Garuda', 'PVR Forum Mall']);
  assert.equal(out.restaurant.length, 1);
  assert.equal(out.restaurant[0].cuisine, 'indian, continental');
  assert.equal(out.stadium[0].name, 'M. Chinnaswamy Stadium');
  assert.equal(out.attraction[0].name, 'Visvesvaraya Museum');
  assert.ok(!out.supermarket);
  assert.ok(out.cinema[0].distanceKm <= out.cinema[1].distanceKm);
  assert.match(out.cinema.find((c) => c.name.startsWith('PVR')).address, /Hosur Road/);
});

test('weather, FX, holidays, movies, fixtures and Ticketmaster responses normalise', () => {
  const w = P.normaliseWeather({ timezone: 'Asia/Kolkata', utc_offset_seconds: 19800, daily: { time: ['2026-09-23'], weather_code: [61], temperature_2m_max: [28.4], temperature_2m_min: [20.1], precipitation_probability_max: [70] } });
  assert.deepEqual(w.days[0], { date: '2026-09-23', code: 61, label: 'Rain', emoji: '🌧️', max: 28, min: 20, rain: 70 });

  const fx = P.normaliseFx({ base: 'INR', date: '2026-09-22', rates: { CAD: 0.0165 } });
  assert.equal(fx.rates.CAD, 0.0165);
  assert.ok(fx.rates.USD > 0, 'missing currencies fall back');

  const hol = P.normaliseHolidays(
    [
      { date: '2026-10-12', name: 'Thanksgiving', localName: 'Thanksgiving', counties: null },
      { date: '2026-11-11', name: 'Remembrance Day', localName: 'Remembrance Day', counties: ['CA-BC', 'CA-NS'] },
      { date: '2025-01-01', name: 'Old', localName: 'Old', counties: null },
    ],
    { countryCode: 'CA', state: 'Ontario', from: '2026-09-23' },
  );
  assert.deepEqual(hol.map((h) => h.name), ['Thanksgiving'], 'regional holidays outside Ontario are dropped');

  const tmdb = P.normaliseTmdb({ results: [{ id: 42, title: 'Real Film', original_language: 'hi', genre_ids: [28, 18], poster_path: '/p.jpg', release_date: '2026-09-01', vote_average: 7.46 }] });
  assert.deepEqual([tmdb[0].id, tmdb[0].language, tmdb[0].genre, tmdb[0].rating], ['tmdb-42', 'Hindi', 'Action · Drama', 7.5]);
  assert.match(tmdb[0].poster, /image\.tmdb\.org\/t\/p\/w342\/p\.jpg/);

  const it = P.normaliseItunes({ feed: { entry: { 'im:name': { label: 'Chart Film' }, 'im:image': [{ label: 'https://x/a/170x170bb.jpg' }], category: { attributes: { label: 'Drama' } }, id: { attributes: { 'im:id': '99' } } } } });
  assert.deepEqual([it[0].id, it[0].title, it[0].genre], ['itunes-99', 'Chart Film', 'Drama']);
  assert.match(it[0].poster, /342x513bb\.jpg$/);

  const sp = P.normaliseSportsDb({ events: [{ idEvent: '7', strEvent: 'Toronto Maple Leafs vs Montreal Canadiens', strHomeTeam: 'Toronto Maple Leafs', strAwayTeam: 'Montreal Canadiens', strTimestamp: '2026-10-01T23:00:00', strVenue: 'Scotiabank Arena', strLeague: 'NHL', strSport: 'Ice Hockey' }] });
  assert.deepEqual([sp[0].id, sp[0].timestamp, sp[0].sport], ['tsdb-7', '2026-10-01T23:00:00Z', 'Ice Hockey']);

  const tm = P.normaliseTicketmaster({ _embedded: { events: [{ id: 'A1', name: 'Jazz Night', dates: { start: { localDate: '2026-10-02', localTime: '20:00:00' } }, classifications: [{ segment: { name: 'Music' } }], priceRanges: [{ min: 45, max: 120, currency: 'CAD' }], _embedded: { venues: [{ name: 'Massey Hall', location: { latitude: '43.65', longitude: '-79.37' } }] } }] } });
  assert.deepEqual([tm[0].id, tm[0].type, tm[0].time, tm[0].venue, tm[0].price.currency], ['tm-A1', 'music', '20:00', 'Massey Hall', 'CAD']);
});

test('offline, every provider reports failure instead of throwing', async () => {
  const b = await live.ensure(BLR);
  assert.ok(b.sources.length >= 7);
  assert.ok(b.sources.filter((s) => s.name.startsWith('Built-in')).every((s) => s.ok), 'India holidays are built in');
  assert.ok(b.sources.filter((s) => s.name.includes('Nominatim')).every((s) => !s.ok));
});

function withLive() {
  const now = new Date();
  const soon = new Date(now.getTime() + 3 * 86400000).toISOString().slice(0, 19);
  live.set(BLR, {
    coords: center,
    places: P.normaliseOsm(OSM, center),
    movies: P.normaliseTmdb({ results: [{ id: 42, title: 'Real Film', original_language: 'kn', genre_ids: [18], poster_path: '/p.jpg' }, { id: 43, title: 'Second Film', original_language: 'en', genre_ids: [35] }] }),
    moviesSource: 'TMDB (now playing in cinemas)',
    sports: P.normaliseSportsDb({ events: [{ idEvent: '9', strEvent: 'Royal Challengers Bengaluru vs Mumbai Indians', strHomeTeam: 'Royal Challengers Bengaluru', strTimestamp: soon, strVenue: 'M. Chinnaswamy Stadium', strLeague: 'Indian Premier League', strSport: 'Cricket' }] }),
    ticketmaster: [],
    weather: { utcOffsetSeconds: 19800, days: [] },
    fx: { rates: P.FX_FALLBACK },
    holidays: [],
    sources: [],
  });
}

test('live places, films and fixtures replace the sample catalog and stay bookable', () => {
  withLive();
  const cins = catalog.cinemas(BLR);
  assert.deepEqual(cins.map((c) => c.source), ['OpenStreetMap', 'OpenStreetMap']);
  assert.ok(cins.some((c) => c.name === 'PVR Forum Mall'));
  const films = catalog.movies(BLR);
  assert.equal(films[0].title, 'Real Film', 'Kannada film ranks first in Karnataka');
  assert.equal(catalog.vendors('reservations', BLR)[0].vendor, 'Koshy’s');
  const ev = catalog.events(BLR).find((e) => e.id === 'tsdb-9');
  assert.ok(ev && ev.local && ev.source === 'TheSportsDB');
  assert.ok(!catalog.events(BLR).some((e) => e.source === 'sample' && e.type === 'sports'), 'real local sports replace sample sports');

  // A real cinema + real film goes through seat selection and booking.
  const date = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const show = catalog.showtimes('tmdb-42', date, BLR)[0];
  const seat = catalog.seatMap(show.shows[0].key).rows.flatMap((r) => r.seats).find((x) => !x.sold).id;
  const b = orchestrator.createBooking({ category: 'movies', funding: 'personal', location: BLR, details: { kind: 'movie', showKey: show.shows[0].key, seats: [seat] } }, 'u-ananya');
  assert.equal(b.details.movieTitle, 'Real Film');
  assert.equal(b.vendor, show.cinema.name);
  const tix = orchestrator.createBooking({ category: 'events', funding: 'personal', location: BLR, details: { kind: 'event', eventId: 'tsdb-9', tier: 'Stand', qty: 2 } }, 'u-ananya');
  assert.equal(tix.amount, 1600);
});

test('Canadian cities get Canadian sample events and a C$ payment in ₹', () => {
  const evs = catalog.events(TOR);
  assert.ok(evs.length);
  assert.ok(!evs.some((e) => /Kabaddi|Chai|Qawwali|Monsoon/.test(e.title)));
  assert.ok(evs.some((e) => /Hockey|Basketball/.test(e.title)));
  assert.deepEqual(payment.methodsFor('Canada').map((m) => m.id), ['card', 'interac', 'wallet']);
  assert.throws(() => payment.authorize({ amount: 100, method: 'upi', upiId: 'a@b', country: 'Canada' }), /available/);
});

test('payment agent validates UPI and never needs card numbers', () => {
  assert.throws(() => payment.authorize({ amount: 440, method: 'upi', upiId: 'nope', country: 'India' }), /UPI ID/);
  const r = payment.authorize({ amount: 440, method: 'upi', upiId: 'ananya@okaxis', country: 'India' });
  assert.equal(r.status, 'captured');
  assert.ok(r.demo);
  assert.match(r.ref, /^PAY-/);
});

async function say(sessionId, text) {
  return chat.handle({ sessionId, actorId: 'u-ananya', text, location: BLR });
}
async function tap(sessionId, action) {
  return chat.handle({ sessionId, actorId: 'u-ananya', action, location: BLR });
}

test('chat: movie → theatres → movies at a theatre → seats → who pays → payment → ticket', async () => {
  withLive();
  let r = await chat.handle({ actorId: 'u-ananya', location: BLR });
  const id = r.sessionId;
  assert.match(r.messages[0].text, /concierge/);

  r = await say(id, "I'm planning to go for a movie tomorrow evening, can you check the theatres?");
  const cinemasCard = r.messages.at(-1).card;
  assert.equal(cinemasCard.type, 'cinemas');
  assert.ok(cinemasCard.cinemas.every((c) => c.source === 'OpenStreetMap'));

  r = await say(id, 'the first one'); // typed choice
  const moviesCard = r.messages.at(-1).card;
  assert.equal(moviesCard.type, 'cinemaMovies');
  assert.equal(moviesCard.cinema.id, cinemasCard.cinemas[0].id);
  const show = moviesCard.movies.flatMap((m) => m.shows).find((s) => s.match) || moviesCard.movies[0].shows[0];

  r = await tap(id, { type: 'pickShow', showKey: show.key });
  assert.equal(r.step, 'count');
  r = await say(id, '2 tickets');
  const seatsCard = r.messages.at(-1).card;
  assert.equal(seatsCard.type, 'seats');
  assert.equal(seatsCard.suggested.length, 2);

  r = await say(id, 'best seats please');
  assert.equal(r.step, 'payer');
  r = await tap(id, { type: 'payer', funding: 'personal' });
  const pay = r.messages.at(-1).card;
  assert.equal(pay.type, 'payment');
  assert.equal(pay.amount, show.price * 2);

  r = await tap(id, { type: 'pay', method: 'upi', upiId: 'bad' });
  assert.match(r.messages[0].text, /UPI ID/);
  r = await say(id, 'pay with ananya@okaxis');
  const ticket = r.messages.at(-1).card;
  assert.equal(ticket.type, 'ticket');
  assert.equal(ticket.booking.status, 'confirmed');
  assert.equal(ticket.booking.seats.length, 2);
  const b = load().bookings.find((x) => x.id === ticket.booking.id);
  assert.equal(b.payment.method, 'upi');
  assert.ok(b.trace.some((t) => t.agent === 'Payment agent'));
});

test('chat: shared family movie splits the bill; team outing goes to the company card', async () => {
  let r = await chat.handle({ actorId: 'u-ananya', location: BLR });
  const id = r.sessionId;
  r = await say(id, 'movie with my family on Saturday evening');
  r = await tap(id, { type: 'pickCinema', cinemaId: r.messages.at(-1).card.cinemas[0].id });
  const show = r.messages.at(-1).card.movies[0].shows[0];
  r = await tap(id, { type: 'pickShow', showKey: show.key });
  assert.equal(r.messages.at(-1).card.count, 3, 'family size used as ticket count');
  r = await tap(id, { type: 'confirmSeats', seats: r.messages.at(-1).card.suggested });
  assert.equal(r.messages.at(-1).card.type, 'payment', 'funding already known — straight to payment');
  r = await tap(id, { type: 'pay', method: 'card' });
  const booking = load().bookings.find((x) => x.id === r.messages.at(-1).card.booking.id);
  assert.equal(booking.funding, 'shared');
  assert.ok(load().groupExpenses.some((e) => e.bookingId === booking.id));

  r = await say(id, 'team movie tonight for 30, check theatres');
  r = await tap(id, { type: 'pickCinema', cinemaId: r.messages.at(-1).card.cinemas[0].id });
  r = await tap(id, { type: 'changeDate', date: new Date(Date.now() + 86400000).toISOString().slice(0, 10) });
  const s2 = r.messages.at(-1).card.movies[0].shows[0];
  r = await tap(id, { type: 'pickShow', showKey: s2.key });
  const seatCard = r.messages.at(-1).card;
  const free = seatCard.rows.flatMap((row) => row.seats).filter((x) => !x.sold).map((x) => x.id);
  r = await tap(id, { type: 'confirmSeats', seats: seatCard.suggested.length ? seatCard.suggested : free.slice(0, seatCard.count) });
  assert.equal(r.step, 'corporate');
  r = await tap(id, { type: 'corporate' });
  const corp = load().bookings.find((x) => x.id === r.messages.at(-1).card.booking.id);
  assert.equal(corp.funding, 'corporate');
  assert.equal(corp.payment.method, 'company-card');
});

test('chat: events and other requests', async () => {
  let r = await chat.handle({ actorId: 'u-ananya', location: BLR });
  const id = r.sessionId;
  r = await say(id, 'any comedy shows?');
  assert.equal(r.messages.at(-1).card.type, 'events');
  r = await say(id, '1');
  assert.equal(r.step, 'tier');
  r = await tap(id, r.messages.at(-1).options[0].action);
  assert.equal(r.step, 'count');
  r = await tap(id, { type: 'count', n: 2 });
  r = await tap(id, { type: 'payer', funding: 'reimbursable' });
  r = await tap(id, { type: 'pay', method: 'netbanking' });
  const done = r.messages.at(-1);
  assert.equal(done.card.type, 'ticket');
  const exp = done.options.find((o) => o.action?.type === 'expense');
  assert.ok(exp, 'agent offers to file the expense report');
  r = await tap(id, exp.action);
  assert.match(r.messages[0].text, /routed to Benefits/);

  r = await say(id, 'book a client dinner for 6 tomorrow');
  assert.equal(r.messages.at(-1).card.type, 'proposal');
  assert.equal(r.messages.at(-1).card.draft.category, 'reservations');
});

test('fast providers publish before slow places; a failed provider preserves other results', async () => {
  let releasePlaces;
  const places = new Promise((resolve) => { releasePlaces = resolve; });
  let weatherPublished;
  const weatherReady = new Promise((resolve) => { weatherPublished = resolve; });
  const snapshots = [];
  const ok = (source, data) => ({ source, ok: true, data });
  const pending = live.gather(TOR, {
    geocode: async () => ok('geo', { lat: 43.65, lon: -79.38, countryCode: 'CA' }),
    fx: async () => ok('fx', { rates: { CAD: 0.016 } }),
    places: () => places,
    weather: async () => ok('weather', { days: [{ date: '2026-09-23' }] }),
    holidays: async () => ok('holidays', []),
    movies: async () => { throw new Error('provider unavailable'); },
    sports: async () => ok('sports', []),
    ticketmaster: async () => ({ source: 'Ticketmaster', ok: false, optional: true }),
  }, (snapshot) => {
    snapshots.push(snapshot);
    if (snapshot.weather) weatherPublished();
  });
  await weatherReady;
  const early = snapshots.find((s) => s.weather);
  assert.equal(early.places.cinema, undefined);
  assert.ok(!early.sources.some((s) => s.name === 'places'));
  releasePlaces({ ...ok('places', { cinema: [{ name: 'Real cinema' }] }), cinemasOk: true });
  const result = await pending;
  assert.equal(result.places.cinema[0].name, 'Real cinema');
  assert.equal(result.weather.days.length, 1);
  assert.equal(result.sources.length, 8);
  assert.equal(result.sources.find((s) => s.name === 'Movies').error, 'provider unavailable');
  assert.ok(!early.sources.some((s) => s.name === 'places'), 'published snapshots stay stable');
});
