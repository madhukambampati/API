# Entertainment OS

One agentic operating system, built for **India** (amounts in ₹), for **movies, events near you (music, sports, tech, comedy, theatre, food), dining, private dining & events (PDRs), catering, gifting & merch, and experiences**. It covers:

- **Location**: a Country → State → City picker covering all 36 Indian states and union territories, 100 Indian cities and a few other countries. Every level has an **Other** option so any place can be typed in. Movies, cinemas, events and venues follow the chosen city.
- **Movies**: films ranked with the state's language first, showtimes by cinema and format (2D / 3D / IMAX / Recliner), and a seat map. Seats are held on booking and released if the booking is cancelled or rejected.
- **Events near you**: the next six weeks of events in the city, filtered by type, with ticket tiers and quantities.
- **Who booked it**: requester, department and cost center on every booking.
- **Who is spending how much**: company-paid, reimbursable, personal, and each person's share of family/friends spend.
- **Budgets**: department quarterly budgets, personal monthly budgets, and a wellbeing allowance.
- **Approvals**: an ordered chain (Manager → Dept head → Compliance → Finance) built from policy. Nobody approves their own spend.
- **Expense reports**: if you paid with your own money, the Expense agent drafts the report and routes it to **Finance**, **HR** or **Benefits**.
- **Family & friends splits**: Splitwise-style groups with equal, exact, percentage or share splits, balances and a fewest-payments settle-up.

## Run it

```sh
cd entertainment-os
npm start            # http://localhost:4600 (loads demo data on first run)
npm test             # agent test suite
```

The server has no dependencies (Node 18+). Use **Acting as** in the sidebar to switch between requester, manager, department head, Compliance, Finance, HR and Benefits. Demo data can be reset from **Agent activity → Reset demo data**.

### Optional: Claude-powered intake

With `ANTHROPIC_API_KEY` set and `npm install` run (it installs the optional `@anthropic-ai/sdk`), the Concierge agent uses Claude (`claude-opus-5`, structured JSON output, with server-side refusal fallbacks turned on) to turn free text into a booking draft. Examples: "3 tickets for Orbit 9 IMAX tomorrow evening", "Stand-up comedy with friends this weekend, split", "Client dinner for 6 in Pune tomorrow". Without a key it uses the built-in rule engine. Either way, **budget, policy and approval decisions are always made by deterministic code**. You can set `EOS_MODEL` to use a different model, or `EOS_DISABLE_LLM=1` to turn Claude off.

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

Policy thresholds (₹), caps and routing are in `src/seed.js` (`POLICY`). Locations are in `src/locations.js`. Movies, cinemas, showtimes, seat maps, events and venues are generated per city in `src/catalog.js`. All names there are fictional demo data.

## Documentation

| File | What it is |
|---|---|
| `docs/Entertainment-OS-Handbook.docx` | Handbook for employees and approvers: location picker, movies, events, funding types, agent pipeline, roles, budgets, approval matrix (₹), expense reports, splitting, worked examples, FAQ |
| `docs/Entertainment-OS-Workbook.xlsx` | Operations workbook (₹): policy inputs, bookings (city, seats/tickets, approval chain as a live formula), budgets, spend by person, expense reports, group ledger and balances, split calculator, locations, catalog, and the flow |
| `docs/Entertainment-OS-Overview.pptx` | 13-slide overview deck: categories, location picker, movies & events, agent pipeline, approvals, expenses, splits, demo numbers |

Regenerate them with `npm install && npm run docs`. The generators run the real agent pipeline on the demo requests, so the documents always match the code.

## API

All calls send `x-user: <employee id>`.

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/state` | Everything the UI needs for the acting user |
| GET | `/api/locations` | Country → state → city list |
| GET | `/api/discover?country&state&city` | Movies, events and venues for a location |
| GET | `/api/showtimes?movie&date&country&state&city` | Shows by cinema, with format and price |
| GET | `/api/seats?show=<key>` | Seat map for a show (sold seats included) |
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
