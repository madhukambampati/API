# Entertainment OS

One agentic operating system for **reservations, private dining & events (PDRs), catering, sports & live events, gifting & merch, and experiences**. It covers:

- **Who booked it**: requester, department and cost center on every booking.
- **Who is spending how much**: company-paid, reimbursable, personal, and each person's share of family/friends spend.
- **Budgets**: department quarterly budgets, personal monthly budgets, and a wellbeing stipend.
- **Approvals**: an ordered chain (Manager → Dept head → Compliance → Finance) built from policy. Nobody approves their own spend.
- **Expense reports**: if you paid with your own money, the Expense agent drafts the report and routes it to **Finance**, **HR** or **Benefits**.
- **Family & friends splits**: Splitwise-style groups with equal, exact, percentage or share splits, balances and a fewest-payments settle-up.

## Run it

```sh
cd entertainment-os
npm start            # http://localhost:4600 (loads demo data on first run)
npm test             # agent test suite
```

The server has no dependencies (Node 18+). Use **Acting as** in the header to switch between requester, manager, department head, Compliance, Finance, HR and Benefits. Demo data can be reset from **Agent activity → Reset demo data**.

### Optional: Claude-powered intake

With `ANTHROPIC_API_KEY` set and `npm install` run (it installs the optional `@anthropic-ai/sdk`), the Concierge agent uses Claude (`claude-opus-5`, structured JSON output, with server-side refusal fallbacks turned on) to turn free text into a booking draft. Without a key it uses the built-in rule engine. Either way, **budget, policy and approval decisions are always made by deterministic code**. You can set `EOS_MODEL` to use a different model, or `EOS_DISABLE_LLM=1` to turn Claude off.

## How the agents fit together

```
request ─► Concierge ─► Budget ─► Policy ─► Approval ─► Booking ─┬─► cost center (company-paid)
                                                                   ├─► Split agent (shared)
                                                                   └─► Expense agent (reimbursable) ─► Finance / HR / Benefits
```

| Agent | File | Responsibility |
|---|---|---|
| Concierge | `src/agents/concierge.js` | Parses the request, then works out category, date, guests, vendor, price, who pays, purpose and group |
| Budget | `src/agents/budget.js` | Checks department, personal or stipend budget (ok / warn / over) |
| Policy | `src/agents/policy.js` | Builds approval chains for bookings and expense reports |
| Approval / Booking | `src/agents/orchestrator.js` | Runs the pipeline, applies decisions, confirms and cancels bookings |
| Split | `src/agents/split.js` | Shares to the cent, balances, debt simplification |
| Expense | `src/agents/expense.js` | Builds, submits and reimburses expense reports |

Policy thresholds, caps and routing are in `src/seed.js` (`POLICY`).

## Documentation

| File | What it is |
|---|---|
| `docs/Entertainment-OS-Handbook.docx` | Handbook for employees and approvers: roles, funding types, the agent pipeline, approval matrix, budgets, expense reports, splitting, worked examples, FAQ |
| `docs/Entertainment-OS-Workbook.xlsx` | Operations workbook: policy inputs, bookings with the approval chain as a live formula, budgets, spend by person, expense reports, group ledger and balances, a split calculator, and the flow |
| `docs/Entertainment-OS-Overview.pptx` | 11-slide overview deck of the flow |

Regenerate them with `npm install && npm run docs`. The generators run the real agent pipeline on the demo requests, so the documents always match the code.

## API

All calls send `x-user: <employee id>`.

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/state` | Everything the UI needs for the acting user |
| POST | `/api/agent/plan` | `{text}`: draft plus budget and approval preview |
| POST | `/api/bookings` | Create a booking from a (possibly edited) draft |
| POST | `/api/bookings/:id/cancel` | Cancel your booking |
| POST | `/api/decisions/:id` | `{decision: approve\|reject, note}` on a booking or expense report |
| POST | `/api/reports` | `{bookingIds, purpose?, notes?, submit?}`: create an expense report |
| POST | `/api/reports/:id/submit` | Submit a draft report |
| POST | `/api/groups` | `{name, type: family\|friends, members}` |
| POST | `/api/groups/:id/expenses` | `{paidBy, amount, description, method, weights}` |
| POST | `/api/groups/:id/settle` | `{from, to, amount}` |
| POST | `/api/demo` | Reload demo data |
