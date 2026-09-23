# Entertainment OS

One agentic operating system for **movies, events near you (music, sports, tech, comedy, theatre, food), dining, private dining & events (PDRs), catering, gifting & merch, and experiences**. It covers:

- **Chat concierge (opening screen)**: say *"I'm planning to go for a movie today, can you check the theatres?"* and the agents list the theatres near you. Pick one to see its films and showtimes, and the agent preselects the best seats. It asks who pays, then opens the payment page (UPI / card / netbanking in India; card, wallet or Interac in Canada) and issues the ticket. Events and other requests work the same way.
- **Live data from free public APIs**: real cinemas, restaurants and venues from OpenStreetMap, films from the iTunes chart (or TMDB), sports fixtures from TheSportsDB, weather from Open-Meteo, exchange rates from Frankfurter and holidays from Nager.Date. Anything unavailable falls back to labelled sample data.
- **Location**: a Country → State → City picker covering all 36 Indian states and union territories (100 cities), all 13 Canadian provinces and territories (35 cities), and a few other countries. Every level has an **Other** option so any place can be typed in. Movies, cinemas, events and venues follow the chosen city.
- **Movies**: films ranked with the state's language first, showtimes by cinema and format (2D / 3D / IMAX / Recliner), and a seat map. Seats are held on booking and released if the booking is cancelled or rejected.
- **Events near you**: the next six weeks of events in the city, filtered by type, with ticket tiers and quantities.
- **Who booked it**: requester, department and cost center on every booking.
- **Who is spending how much**: company-paid, reimbursable, personal, and each person's share of family/friends spend.
- **Budgets**: department quarterly budgets, personal monthly budgets, and a wellbeing allowance.
- **Approvals**: an ordered chain (Manager → Dept head → Compliance → Finance) built from policy. Nobody approves their own spend.
- **Expense reports**: if you paid with your own money, the Expense agent drafts the report and routes it to **Finance**, **HR** or **Benefits**.
- **Family & friends splits**: Splitwise-style groups with equal, exact, percentage or share splits, balances and a fewest-payments settle-up.

It runs in one of two editions:

- **Canada (default)**: Toronto is the starting location. The picker shows Canada's 13 provinces and territories and 35 cities, plus "Other". Everything is priced in Canadian dollars (movie tickets C$15–24, hockey seats C$95–450), and payment is by card, Interac or wallet.
- **India** (`EOS_REGION=IN`): Bengaluru is the starting location, with all 36 states and union territories. Everything is in ₹, and payment is by UPI, card or netbanking.

## Run it

```sh
cd entertainment-os
npm start              # Canada edition → http://localhost:4600
npm run start:india    # India edition
npm run check-live     # which free data sources can this machine reach?
npm test               # agent tests for both editions
```

If you see gradient placeholder posters and "sample" tags instead of real cinemas and films, run `npm run check-live`. It lists each free API with ✅ or ❌ and the error, for example a firewall or proxy blocking the request.

The server has no dependencies (Node 18+). Use **Acting as** in the sidebar to switch between requester, manager, department head, Compliance, Finance, HR and Benefits. Demo data can be reset from **Agent activity → Reset demo data**.

### Two modes

By default the app runs in **real-data-only mode**: it shows only what a provider actually
published — a real cinema's name, address and a link to its own website; real films (as metadata,
not proof a nearby theatre is screening them); sports fixtures only when the venue or provider city
confirms they're local; unpublished prices left blank rather than estimated. There is no chat
concierge, no booking, no seats, no payment, and no invented movie/theatre pairing anywhere —
because no free API publishes which films a specific real theatre is actually showing (that's
exactly the data theatre chains sell access to through their own booking systems). Every write
endpoint (bookings, payments, reports, groups) returns `409` in this mode. See
`test/real-data.test.js`.

Set `EOS_DEMO=1` for the **demo edition** instead: the chat concierge, booking, seat selection,
simulated payment, budgets, approvals, expense reports and splits all work, as described below —
this is the agentic-OS demo this app was built to showcase. Cinemas, films and events still come
from the free APIs when reachable; showtimes, seat maps and prices are always simulated on top of
them (a real theatre, an invented showing), and it's labelled as such throughout the UI.

```sh
EOS_DEMO=1 npm start     # the full agentic-OS demo (chat, booking, payment, approvals, splits)
```

### Live data (free, no sign-up)

When the machine running the app has internet access, the app uses these free public APIs:

| Data | Source | Key |
|---|---|---|
| City coordinates | OpenStreetMap Nominatim | none |
| Cinemas, restaurants, stadiums, theatres, venues, caterers, gift shops, attractions | OpenStreetMap Overpass, with Nominatim search as backup | none |
| Recent films + posters | Wikidata (recent releases) + Wikipedia page images | none |
| Popular films + posters (fallback) | Apple iTunes movie chart (country store) | none |
| Films actually in cinemas | TMDB `now_playing` | optional free key: `TMDB_API_KEY` |
| Sports fixtures (IPL, ISL, NHL, NBA, MLB, MLS, CFL, …) | TheSportsDB | none (public key) |
| Concerts & shows with prices | Ticketmaster Discovery | optional free key: `TICKETMASTER_API_KEY` |
| Weather (16 days) | Open-Meteo | none |
| Exchange rates | Frankfurter (ECB) | none |
| Public holidays | Nager.Date (India: built-in list) | none |

```sh
TMDB_API_KEY=... TICKETMASTER_API_KEY=... npm start   # both optional
EOS_OFFLINE=1 npm start                               # never call the network
```

Results appear progressively as each provider responds. The open page checks for updates every minute (every four seconds during initial loading); failed sources are retried after three minutes and successful bundles after thirty minutes. These are periodically refreshed public listings, not a real-time ticket inventory feed. The Live data card shows when the server last checked the bundle.

Responses are cached in `data/live-cache.json` (weather 1 h, places 7 days), so the services are used politely. The **Live data** card on the home page shows which sources are connected. Showtimes, seat maps and payments are always simulated: no free API publishes them, and the payment gateway (`src/agents/payment.js`) is a demo that never moves money or asks for card numbers.

### Optional: Claude-powered intake

With `ANTHROPIC_API_KEY` set and `npm install` run (it installs the optional `@anthropic-ai/sdk`), the Concierge agent uses Claude (`claude-opus-5`, structured JSON output, with server-side refusal fallbacks turned on) to turn free text into a booking draft. Examples: "3 tickets for Orbit 9 IMAX tomorrow evening", "Stand-up comedy with friends this weekend, split", "Client dinner for 6 in Pune tomorrow". Without a key it uses the built-in rule engine. Either way, **budget, policy and approval decisions are always made by deterministic code**. You can set `EOS_MODEL` to use a different model, or `EOS_DISABLE_LLM=1` to turn Claude off.

## Deploying to Vercel

```sh
npm i -g vercel
cd entertainment-os
vercel login
vercel --prod
```

That's it — `vercel.json` and `api/index.js` are already set up, and no environment variables are
required (the app detects Vercel and stores its data under `/tmp` automatically). Live data (real
cinemas, films, fixtures) works there since Vercel has normal internet access, unlike this
sandbox.

With no environment variables set, this deploys in **real-data-only mode** (see "Two modes"
above): real theatres with a link to their own website, no invented showtimes or bookings. Add
`EOS_DEMO=1` as an environment variable (Project → Settings → Environment Variables, then
redeploy) for the chat/booking/payment demo instead.

**Read this before treating it as more than a demo/preview link.** This app is designed to run as
one long-running process (`npm start`) that keeps chat sessions, the live-data cache and bookings
in memory, backed by a JSON file. Vercel runs it instead as a stateless serverless function: no
persistent disk (data resets on every cold start) and no shared memory between concurrent
invocations. In practice that means:

- Browsing (movies, theatres, events, the concierge chat within one exchange) works fine.
- A booking, approval or split made in one request may not be there on a later request if it
  lands on a different function instance, and demo data can reset itself unpredictably.

For the real thing — actual persistence, chat sessions that survive, one consistent store — run it
as the long-running process it's built for: `npm start` on a host that keeps a process alive
(Render, Railway, Fly.io, a VPS, your own machine). Vercel is the fastest way to get a shareable
URL up; it is not a substitute for that.

### Optional: MongoDB, for real persistence on Vercel

Set `MONGODB_URI` (Vercel → Project → Settings → Environment Variables) and bookings, approvals,
splits and expense reports survive across Vercel's separate invocations instead of resetting —
this is the one thing that actually fixes the caveat above, without changing anything else about
how the app is built (still plain Node, still the same JSON-shaped in-memory store; MongoDB is
only read once per cold start and written to in the background after each save).

A free cluster takes about five minutes:
1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas/register) (no credit
   card needed for the free tier).
2. Create a cluster on the **M0 Free** tier.
3. Under **Network Access**, allow access from anywhere (`0.0.0.0/0`) — simplest for a demo; Vercel's
   serverless functions don't have a fixed IP to allowlist instead.
4. Under **Database Access**, create a database user with a password.
5. Click **Connect → Drivers**, copy the connection string (`mongodb+srv://user:pass@.../`).
6. In Vercel, add it as the `MONGODB_URI` environment variable and redeploy (`vercel --prod`).

Without it, the app works exactly as described above (file-backed, resets between invocations on
Vercel). A wrong or unreachable `MONGODB_URI` fails fast (3s) and falls back to that same
behaviour rather than breaking the app.

## How the agents fit together

```
location + request ─► Concierge ─► Budget ─► Policy ─► Approval ─► Booking ─┬─► cost center (company-paid)
                                                                              ├─► Split agent (shared)
                                                                              └─► Expense agent (reimbursable) ─► Finance / HR / Benefits
```

| Agent | File | Responsibility |
|---|---|---|
| Concierge | `src/agents/concierge.js` | Parses the request and city, then picks the show and best seats together, the event and ticket tier, or the venue; prices it; suggests who pays; matches a group. Re-checks ticket prices and seats on the server |
| Budget | `src/agents/budget.js` | Checks department, personal or wellbeing-allowance budget (ok / warn / over) |
| Policy | `src/agents/policy.js` | Builds approval chains for bookings and expense reports |
| Approval / Booking | `src/agents/orchestrator.js` | Runs the pipeline, applies decisions, confirms and cancels bookings |
| Split | `src/agents/split.js` | Shares to the paisa, balances, debt simplification |
| Expense | `src/agents/expense.js` | Builds, submits and reimburses expense reports |
| Payment | `src/agents/payment.js` | Simulated gateway: validates UPI / card / netbanking / Interac, issues a payment reference |
| Chat | `src/agents/chat.js` | Conversation state machine: theatres → films → seats → who pays → payment → ticket, plus events and proposals |
| Live data | `src/live/` | Free-API providers, response normalisers, cache and offline fallback |

Policy thresholds (₹), caps and routing are in `src/seed.js` (`POLICY`). Locations are in `src/locations.js`. Movies, cinemas, showtimes, seat maps, events and venues are generated per city in `src/catalog.js`. All names there are fictional demo data.

## Documentation

| File | What it is |
|---|---|
| `docs/Entertainment-OS-Handbook.docx` | Handbook for employees and approvers: location picker, movies, events, funding types, agent pipeline, roles, budgets, approval matrix (₹), expense reports, splitting, worked examples, FAQ |
| `docs/Entertainment-OS-Workbook.xlsx` | Operations workbook (₹): policy inputs, bookings (city, seats/tickets, approval chain as a live formula), budgets, spend by person, expense reports, group ledger and balances, split calculator, locations, catalog, and the flow |
| `docs/Entertainment-OS-Overview.pptx` | 14-slide overview deck: categories, location picker, movies & events, chat concierge & live data, agent pipeline, approvals, expenses, splits, demo numbers |

Regenerate them with `npm install && npm run docs`. The generators run the real agent pipeline on the demo requests, so the documents always match the code.

## API

All calls send `x-user: <employee id>`.

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/state` | Everything the UI needs for the acting user |
| GET | `/api/locations` | Country → state → city list |
| GET | `/api/discover?country&state&city` | Movies, cinemas, events, venues, weather, holidays, FX and live-source status for a location |
| GET | `/api/showtimes?movie&date&country&state&city` | Shows by cinema, with format and price |
| GET | `/api/seats?show=<key>` | Seat map for a show (sold seats included) |
| POST | `/api/chat` | `{sessionId?, text? , action?, location}`: talk to the chat concierge; returns agent messages with cards (theatres, films, seats, payment, ticket) |
| POST | `/api/agent/plan` | `{text, location}`: draft plus budget and approval preview |
| POST | `/api/agent/preview` | Budget and approval preview for a draft built in the UI (seats, tickets, venue) |
| POST | `/api/bookings` | Create a booking from a (possibly edited) draft |
| POST | `/api/bookings/:id/cancel` | Cancel your booking |
| POST | `/api/decisions/:id` | `{decision: approve\|reject, note}` on a booking or expense report |
| POST | `/api/reports` | `{bookingIds, purpose?, notes?, submit?}`: create an expense report |
| POST | `/api/reports/:id/submit` | Submit a draft report |
| POST | `/api/groups` | `{name, type: family\|friends, members}` |
| POST | `/api/groups/:id/expenses` | `{paidBy, amount, description, method, weights}` |
| POST | `/api/groups/:id/settle` | `{from, to, amount}` |
| POST | `/api/demo` | Reload demo data |
