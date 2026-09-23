"""Generates docs/Entertainment-OS-Workbook.xlsx from the demo dataset (India, INR).

Run: npm run docs   (or: python3 docs/build_workbook.py)
Blue cells are inputs; black cells are formulas that recalculate in Excel.
"""
import json
import os
import subprocess

from openpyxl import Workbook
from openpyxl.comments import Comment
from openpyxl.formatting.rule import CellIsRule
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

HERE = os.path.dirname(os.path.abspath(__file__))
data = json.loads(subprocess.check_output(["node", os.path.join(HERE, "export-demo.mjs")], cwd=os.path.dirname(HERE)))
P = data["policy"]

FONT = "Arial"
GREEN = "4B3FD1"  # header colour (matches the app's violet)
BLUE = Font(name=FONT, color="0000FF")
BLACK = Font(name=FONT)
BOLD = Font(name=FONT, bold=True)
NOTE = Font(name=FONT, italic=True, color="777777")
HEAD = Font(name=FONT, bold=True, color="FFFFFF")
HEAD_FILL = PatternFill("solid", fgColor=GREEN)
INPUT_FILL = PatternFill("solid", fgColor="FFFF00")
THIN = Side(style="thin", color="D9D5CC")
BOX = Border(top=THIN, bottom=THIN, left=THIN, right=THIN)
# Indian digit grouping (₹1,23,45,678) for non-negative amounts; zero shows as "-".
INR = '[>=10000000]"₹"##\\,##\\,##\\,##0;[>=100000]"₹"##\\,##\\,##0;"₹"#,##0'
INR_SIGNED = '"₹"#,##0.00;-"₹"#,##0.00;"-"'
PCT = '0.0%;(0.0%);"-"'

people = {p["id"]: p for p in data["people"]}
cats = {k: v["label"] for k, v in data["categories"].items()}
groups = {g["id"]: g["name"] for g in data["groups"]}

wb = Workbook()


def header(ws, row, labels, widths=None, freeze=True):
    for i, label in enumerate(labels, 1):
        c = ws.cell(row=row, column=i, value=label)
        c.font, c.fill, c.border = HEAD, HEAD_FILL, BOX
        c.alignment = Alignment(vertical="center", wrap_text=True)
    if widths:
        for i, w in enumerate(widths, 1):
            ws.column_dimensions[get_column_letter(i)].width = w
    if freeze:
        ws.freeze_panes = ws.cell(row=row + 1, column=1)


def put(ws, row, col, value, font=BLACK, fmt=None):
    c = ws.cell(row=row, column=col, value=value)
    c.font, c.border = font, BOX
    if fmt:
        c.number_format = fmt
    return c


def title(ws, text, sub):
    ws["A1"] = text
    ws["A1"].font = Font(name=FONT, bold=True, size=16, color=GREEN)
    ws["A2"] = sub
    ws["A2"].font = NOTE


# ---------------- Read Me ----------------
ws = wb.active
ws.title = "Read Me"
title(ws, "Entertainment OS — Operations Workbook (India & Canada)", f"{data['meta']['company']} · {data['meta']['period']} · all amounts in Indian rupees (₹) · generated from the demo run of the agent pipeline")
rows = [
    ("Sheet", "What it shows"),
    ("Policy", "Approval thresholds and per-person caps in ₹ (inputs). Change them and every booking's approval chain recalculates."),
    ("Bookings", "Every booking: request, city, who booked it, who pays, seats/tickets, amount, status and the approval chain the policy requires."),
    ("Budgets", "Department quarterly budgets vs committed company spend."),
    ("Spend by Person", "Who is spending how much: company-paid, reimbursable, personal, and share of family/friends group spend."),
    ("Expense Reports", "Personally-paid spend claimed back, routed to Finance, HR or Benefits."),
    ("Group Ledger", "Family & friends expenses with each member's share (Splitwise style) and UPI settlements."),
    ("Group Balances", "Net balance per member = paid − share + settlements sent − settlements received."),
    ("Split Calculator", "Try a split: enter an amount, pick a method and weights."),
    ("Locations", "Country → State → City list used by the location picker. 'Other' lets anyone type a place that isn't listed."),
    ("Catalog", "Sample films, their languages and formats, and the event types listed near you (live data replaces the samples when online)."),
    ("Data Sources", "The free public APIs the app uses for live data, what each provides, and the fallbacks."),
    ("Flow", "Step-by-step flow of a request through the agents."),
    ("", ""),
    ("Legend", ""),
    ("Blue text", "Hard-coded input — safe to edit."),
    ("Yellow fill", "Key assumption / cell you are expected to change."),
    ("Black text", "Formula — do not overwrite."),
]
for r, (a, b) in enumerate(rows, 4):
    ws.cell(row=r, column=1, value=a).font = BOLD if a in ("Sheet", "Legend") else BLACK
    ws.cell(row=r, column=2, value=b).font = BLACK
ws["A19"].font = BLUE
ws["A20"].fill = INPUT_FILL
ws.column_dimensions["A"].width = 20
ws.column_dimensions["B"].width = 118

# ---------------- Policy ----------------
ws = wb.create_sheet("Policy")
title(ws, "Policy inputs (₹)", "Source: src/seed.js → POLICY, set by Finance. Edit the blue cells; Bookings column T recalculates.")
header(ws, 4, ["Threshold", "Value (₹)", "Meaning"], [34, 16, 84], freeze=False)
thresholds = [
    ("Auto-approve limit", P["autoApproveLimit"], "Company spend at or below this, within budget and caps, is auto-approved."),
    ("Manager limit", P["managerLimit"], "Above this the department head is added."),
    ("Department head limit", P["deptHeadLimit"], "Above this Finance (CFO) is added."),
]
for i, (k, v, m) in enumerate(thresholds, 5):
    put(ws, i, 1, k)
    c = put(ws, i, 2, v, BLUE, INR)
    c.fill = INPUT_FILL
    put(ws, i, 3, m)
ws["A10"] = "Per-person caps (company money)"
ws["A10"].font = BOLD
for i, lab in enumerate(["Category key", "Cap per person (₹)", "Category"], 1):
    c = ws.cell(row=11, column=i, value=lab)
    c.font, c.fill, c.border = HEAD, HEAD_FILL, BOX
caps = list(P["perAttendeeCap"].items())
for i, (k, v) in enumerate(caps, 12):
    put(ws, i, 1, k)
    put(ws, i, 2, v, BLUE, INR)
    put(ws, i, 3, cats[k])
cap_last = 11 + len(caps)
comp_row = cap_last + 2
ws.cell(row=comp_row, column=1, value="Compliance review categories (client-facing only)").font = BOLD
comp_cells = []
for i, k in enumerate(P["complianceCategories"], comp_row + 1):
    put(ws, i, 1, k, BLUE)
    comp_cells.append(f"Policy!$A${i}")
AUTO, MGR, HEADL = "Policy!$B$5", "Policy!$B$6", "Policy!$B$7"

# ---------------- Bookings ----------------
ws = wb.create_sheet("Bookings")
cols = ["Booking", "Date", "Category key", "Category", "Request (as typed)", "Title", "Vendor / venue", "City", "State", "Booked by", "Dept", "Who pays", "Purpose", "Client-facing", "Guests / tickets", "Amount (₹)", "Per person (₹)", "Cap (₹)", "Over cap?", "Policy approval chain", "Approvals recorded by the agents", "Status", "Group", "Seats / tickets"]
widths = [9, 11, 12, 18, 44, 40, 34, 12, 14, 14, 9, 13, 11, 8, 9, 14, 13, 10, 9, 42, 50, 16, 14, 26]
header(ws, 1, cols, widths)
bookings = sorted(data["bookings"], key=lambda b: b["id"])
comp_test = "OR(" + ",".join(f"C{{r}}={c}" for c in comp_cells) + ")"
for r, b in enumerate(bookings, 2):
    chain = " → ".join(f"{s['role']} ({people[s['approverId']]['name']}: {s['status']})" for s in b["approvals"]) or "None"
    d = b.get("details") or {}
    seats = f"{d['format']} · {', '.join(d['seats'])}" if d.get("kind") == "movie" else f"{d['qty']} × {d['tier']}" if d.get("kind") == "event" else ""
    vals = [b["id"], b["date"], b["category"], b["categoryLabel"], b.get("request") or "", b["title"], b["vendor"], b["location"]["city"], b["location"].get("state", ""), people[b["bookedBy"]]["name"], b["costCenterDept"] or people[b["bookedBy"]].get("dept", ""), b["funding"], b["purpose"], "Yes" if b["clientFacing"] else "No", b["partySize"]]
    for c, v in enumerate(vals, 1):
        put(ws, r, c, v, BLUE if c in (12, 14, 15) else BLACK)
    put(ws, r, 16, b["amount"], BLUE, INR)
    put(ws, r, 17, f"=IF(O{r}>0,P{r}/O{r},0)", fmt=INR)
    put(ws, r, 18, f"=IFERROR(INDEX(Policy!$B$12:$B${cap_last},MATCH(C{r},Policy!$A$12:$A${cap_last},0)),0)", fmt=INR)
    put(ws, r, 19, f'=IF(AND(L{r}="corporate",Q{r}>R{r}),"Yes","No")')
    put(
        ws, r, 20,
        f'=IF(L{r}<>"corporate","None (not company money)",'
        f'IF(AND(P{r}<={AUTO},S{r}="No"),"Auto-approved",'
        f'"Manager"&IF(OR(P{r}>{MGR},S{r}="Yes")," → Dept head","")'
        f'&IF(AND(N{r}="Yes",{comp_test.format(r=r)})," → Compliance","")'
        f'&IF(P{r}>{HEADL}," → Finance","")))',
    )
    put(ws, r, 21, chain)
    put(ws, r, 22, b["status"])
    put(ws, r, 23, groups.get(b["groupId"], ""))
    put(ws, r, 24, seats)
last_b = len(bookings) + 1
ws.cell(row=last_b + 2, column=1, value="Column T applies the Policy sheet. Column U is what the agents recorded; it also skips self-approval (the requester's own step moves to their manager and duplicates are dropped) and adds Finance when a department budget is exceeded.").font = NOTE
dv = DataValidation(type="list", formula1='"corporate,reimbursable,personal,shared"', allow_blank=False)
ws.add_data_validation(dv)
dv.add(f"L2:L{last_b}")
ws.conditional_formatting.add(f"S2:S{last_b}", CellIsRule(operator="equal", formula=['"Yes"'], fill=PatternFill("solid", fgColor="FBE9E9")))
BK = lambda col: f"Bookings!${col}$2:${col}${last_b}"  # noqa: E731
LIVE = ("pending_approval", "approved", "confirmed")

# ---------------- Budgets ----------------
ws = wb.create_sheet("Budgets")
header(ws, 1, ["Dept key", "Department", "Cost center", "Budget owner", "Quarterly budget (₹)", "Committed (₹)", "Remaining (₹)", "Utilisation"], [10, 26, 12, 18, 20, 18, 18, 12])
for r, d in enumerate(data["departments"], 2):
    put(ws, r, 1, d["id"])
    put(ws, r, 2, d["name"])
    put(ws, r, 3, d["costCenter"])
    put(ws, r, 4, people[d["headId"]]["name"])
    c = put(ws, r, 5, d["quarterlyBudget"], BLUE, INR)
    c.fill = INPUT_FILL
    live = " + ".join(f'SUMIFS({BK("P")},{BK("K")},A{r},{BK("L")},"corporate",{BK("V")},"{s}")' for s in LIVE)
    put(ws, r, 6, f"={live}", fmt=INR)
    put(ws, r, 7, f"=E{r}-F{r}", fmt=INR)
    put(ws, r, 8, f"=IF(E{r}>0,F{r}/E{r},0)", fmt=PCT)
n = len(data["departments"]) + 1
put(ws, n + 1, 2, "Total", BOLD)
for ci, col in enumerate("EFG", 5):
    put(ws, n + 1, ci, f"=SUM({col}2:{col}{n})", BOLD, INR)
put(ws, n + 1, 8, f"=IF(E{n+1}>0,F{n+1}/E{n+1},0)", BOLD, PCT)
ws.cell(row=n + 3, column=1, value="Committed = company-paid bookings awaiting approval, approved or confirmed (Bookings sheet).").font = NOTE

# ---------------- Group Ledger ----------------
ws = wb.create_sheet("Group Ledger")
members = list(dict.fromkeys(pid for g in data["groups"] for pid in g["members"]))
header(ws, 1, ["Expense", "Date", "Group", "Description", "Paid by", "Amount (₹)", "Method"] + [people[m]["name"] for m in members] + ["Check"], [9, 11, 16, 44, 14, 13, 9] + [13] * len(members) + [10])
exps = data["groupExpenses"]
first_m, last_m = get_column_letter(8), get_column_letter(7 + len(members))
for r, e in enumerate(exps, 2):
    for c, v in enumerate([e["id"], e["date"], groups[e["groupId"]], e["description"], people[e["paidBy"]]["name"]], 1):
        put(ws, r, c, v)
    put(ws, r, 6, e["amount"], BLUE, INR_SIGNED)
    put(ws, r, 7, e["method"])
    shares = {s["personId"]: s["amount"] for s in e["shares"]}
    for i, m in enumerate(members):
        put(ws, r, 8 + i, shares.get(m, 0), BLUE, INR_SIGNED)
    put(ws, r, 8 + len(members), f'=IF(ROUND(SUM({first_m}{r}:{last_m}{r})-F{r},2)=0,"OK","Mismatch")')
last_e = max(len(exps) + 1, 2)
ws.cell(row=last_e + 2, column=1, value="Shares are computed by the Split agent in whole paise, so each row adds up exactly (Check column).").font = NOTE
srow = last_e + 4
ws.cell(row=srow, column=1, value="Settlements (UPI payments recorded)").font = BOLD
for i, lab in enumerate(["Settlement", "Group", "From", "To", "Amount (₹)"], 1):
    c = ws.cell(row=srow + 1, column=i, value=lab)
    c.font, c.fill, c.border = HEAD, HEAD_FILL, BOX
for r, s in enumerate(data["settlements"], srow + 2):
    put(ws, r, 1, s["id"])
    put(ws, r, 2, groups[s["groupId"]])
    put(ws, r, 3, people[s["from"]]["name"])
    put(ws, r, 4, people[s["to"]]["name"])
    put(ws, r, 5, s["amount"], BLUE, INR_SIGNED)
s_first, s_last = srow + 2, max(srow + 1 + len(data["settlements"]), srow + 2)

# ---------------- Group Balances ----------------
ws = wb.create_sheet("Group Balances")
header(ws, 1, ["Group", "Member", "Paid (₹)", "Share (₹)", "Settlements sent (₹)", "Settlements received (₹)", "Net balance (₹)", "Position"], [16, 18, 13, 13, 20, 22, 16, 14])
r = 2
GL = "'Group Ledger'"
for g in data["groups"]:
    for m in g["members"]:
        col = get_column_letter(8 + members.index(m))
        put(ws, r, 1, g["name"])
        put(ws, r, 2, people[m]["name"])
        put(ws, r, 3, f"=SUMIFS({GL}!$F$2:$F${last_e},{GL}!$C$2:$C${last_e},A{r},{GL}!$E$2:$E${last_e},B{r})", fmt=INR_SIGNED)
        put(ws, r, 4, f"=SUMIFS({GL}!${col}$2:${col}${last_e},{GL}!$C$2:$C${last_e},A{r})", fmt=INR_SIGNED)
        put(ws, r, 5, f"=SUMIFS({GL}!$E${s_first}:$E${s_last},{GL}!$B${s_first}:$B${s_last},A{r},{GL}!$C${s_first}:$C${s_last},B{r})", fmt=INR_SIGNED)
        put(ws, r, 6, f"=SUMIFS({GL}!$E${s_first}:$E${s_last},{GL}!$B${s_first}:$B${s_last},A{r},{GL}!$D${s_first}:$D${s_last},B{r})", fmt=INR_SIGNED)
        put(ws, r, 7, f"=C{r}-D{r}+E{r}-F{r}", fmt=INR_SIGNED)
        put(ws, r, 8, f'=IF(ROUND(G{r},2)>0,"gets back",IF(ROUND(G{r},2)<0,"owes","settled"))')
        r += 1
ws.cell(row=r + 1, column=1, value="Positive: is owed money. Negative: owes money. Each group sums to zero.").font = NOTE

# ---------------- Spend by Person ----------------
ws = wb.create_sheet("Spend by Person")
header(ws, 1, ["Person", "Title", "Employee", "Company-paid (₹)", "Reimbursable (₹)", "Personal (₹)", "Paid for groups (₹)", "Own group share (₹)", "Out of pocket (₹)", "Total handled (₹)"], [18, 30, 10, 17, 17, 14, 19, 19, 17, 18])


def live_sum(r, funding):
    return " + ".join(f'SUMIFS({BK("P")},{BK("J")},$A{r},{BK("L")},"{funding}",{BK("V")},"{s}")' for s in LIVE)


for r, p in enumerate(data["people"], 2):
    put(ws, r, 1, p["name"])
    put(ws, r, 2, p["title"])
    put(ws, r, 3, "Yes" if p["employee"] else "Guest")
    put(ws, r, 4, f"={live_sum(r, 'corporate')}", fmt=INR_SIGNED)
    put(ws, r, 5, f"={live_sum(r, 'reimbursable')}", fmt=INR_SIGNED)
    put(ws, r, 6, f"={live_sum(r, 'personal')}", fmt=INR_SIGNED)
    put(ws, r, 7, f"=SUMIFS({GL}!$F$2:$F${last_e},{GL}!$E$2:$E${last_e},A{r})", fmt=INR_SIGNED)
    if p["id"] in members:
        col = get_column_letter(8 + members.index(p["id"]))
        put(ws, r, 8, f"=SUM({GL}!{col}2:{col}{last_e})", fmt=INR_SIGNED)
    else:
        put(ws, r, 8, 0, fmt=INR_SIGNED)
    put(ws, r, 9, f"=E{r}+F{r}+H{r}", fmt=INR_SIGNED)
    put(ws, r, 10, f"=D{r}+E{r}+F{r}+G{r}", fmt=INR_SIGNED)
np_ = len(data["people"]) + 1
put(ws, np_ + 1, 1, "Total", BOLD)
for ci in range(4, 11):
    L = get_column_letter(ci)
    put(ws, np_ + 1, ci, f"=SUM({L}2:{L}{np_})", BOLD, INR_SIGNED)
ws.cell(row=np_ + 3, column=1, value="Only live bookings count (awaiting approval, approved, confirmed). Out of pocket = reimbursable + personal + own share of group spend.").font = NOTE

# ---------------- Expense Reports ----------------
ws = wb.create_sheet("Expense Reports")
header(ws, 1, ["Report", "Owner", "Type", "Routed to", "Lines", "Bookings", "Total (₹)", "Claimable (₹)", "Approval chain", "Status", "Submitted"], [9, 16, 34, 11, 7, 18, 13, 14, 48, 12, 22])
for r, rep in enumerate(data["reports"], 2):
    chain = " → ".join(f"{s['role']} ({people[s['approverId']]['name']}: {s['status']})" for s in rep["approvals"])
    for c, v in enumerate([rep["id"], people[rep["ownerId"]]["name"], rep["purposeLabel"], rep["routeTo"], len(rep["lines"]), ", ".join(rep["bookingIds"])], 1):
        put(ws, r, c, v)
    put(ws, r, 7, rep["total"], BLUE, INR)
    put(ws, r, 8, rep["claimable"], BLUE, INR)
    put(ws, r, 9, chain)
    put(ws, r, 10, rep["status"])
    put(ws, r, 11, rep["submittedAt"])
rr = len(data["reports"]) + 3
ws.cell(row=rr, column=1, value="Routing rules").font = BOLD
for i, (a, b) in enumerate([("Client / business", "Manager → Finance"), ("Team morale, celebrations & offsites", "Manager → HR"), ("Lifestyle & wellbeing allowance", "Benefits (capped at the allowance balance)")], rr + 1):
    put(ws, i, 1, a)
    put(ws, i, 3, b)

# ---------------- Split Calculator ----------------
ws = wb.create_sheet("Split Calculator")
title(ws, "Split calculator", "Enter the amount and method (yellow). Weights: exact ₹, percent, or share units. 'equal' ignores weights.")
put(ws, 4, 1, "Amount (₹)", BOLD)
c = put(ws, 4, 2, 3000, BLUE, INR_SIGNED)
c.fill = INPUT_FILL
c.comment = Comment("Example value — replace with your bill total.", "Entertainment OS")
put(ws, 5, 1, "Method", BOLD)
c = put(ws, 5, 2, "shares", BLUE)
c.fill = INPUT_FILL
dv2 = DataValidation(type="list", formula1='"equal,exact,percent,shares"')
ws.add_data_validation(dv2)
dv2.add("B5")
header(ws, 7, ["Member", "Weight (input)", "Share (₹)"], [24, 16, 16], freeze=False)
for i, (nm, w) in enumerate([("Ananya", 2), ("Rohan", 1), ("Diya", 1), ("Guest", 0)], 8):
    put(ws, i, 1, nm, BLUE)
    put(ws, i, 2, w, BLUE)
    put(
        ws, i, 3,
        f'=IF($B$5="equal",IF(COUNTA($A$8:$A$11)>0,$B$4/COUNTA($A$8:$A$11),0),'
        f'IF($B$5="exact",B{i},IF($B$5="percent",$B$4*B{i}/100,IF(SUM($B$8:$B$11)>0,$B$4*B{i}/SUM($B$8:$B$11),0))))',
        fmt=INR_SIGNED,
    )
put(ws, 12, 1, "Total of shares", BOLD)
put(ws, 12, 3, "=SUM(C8:C11)", BOLD, INR_SIGNED)
put(ws, 13, 1, "Check", BOLD)
put(ws, 13, 3, '=IF(ROUND(C12-B4,2)=0,"Adds up","Does not add up")', BOLD)
ws["A15"] = "Example: ₹3,000 with shares 2:1:1:0 → ₹1,500 / ₹750 / ₹750 / ₹0. The app rounds to the paisa and gives leftover paise to the largest weights."
ws["A15"].font = NOTE

# ---------------- Locations ----------------
ws = wb.create_sheet("Locations")
header(ws, 1, ["Country", "State / region", "City"], [22, 40, 24])
r = 2
for country, states in data["locations"].items():
    for state, cities in states.items():
        for city in cities:
            put(ws, r, 1, country)
            put(ws, r, 2, state)
            put(ws, r, 3, city)
            r += 1
put(ws, r, 1, "Other…", BOLD)
put(ws, r, 2, "Other… (type any state or region)", BOLD)
put(ws, r, 3, "Other… (type any city)", BOLD)
ws.cell(row=r + 2, column=1, value=f"{data['locationCounts']['indiaStates']} Indian states & union territories, {data['locationCounts']['indiaCities']} Indian cities, plus {data['locationCounts']['countries'] - 1} other countries. Every level has an 'Other' option for typing a place that isn't listed.").font = NOTE

# ---------------- Catalog ----------------
ws = wb.create_sheet("Catalog")
header(ws, 1, ["Film", "Language", "Genre", "Certificate", "Runtime", "Formats"], [28, 12, 20, 11, 10, 24])
for r, m in enumerate(data["movieCatalog"], 2):
    for c, v in enumerate([m["title"], m["language"], m["genre"], m["cert"], m["runtime"], " / ".join(m["formats"])], 1):
        put(ws, r, c, v)
er = len(data["movieCatalog"]) + 3
ws.cell(row=er, column=1, value="Event types near you").font = BOLD
for i, (k, v) in enumerate(data["eventTypes"].items(), er + 1):
    put(ws, i, 1, v)
    put(ws, i, 2, k)
ws.cell(row=er + len(data["eventTypes"]) + 2, column=1, value="Films, cinemas, events and venues are fictional demo data, generated for whichever city is selected.").font = NOTE

# ---------------- Data Sources ----------------
ws = wb.create_sheet("Data Sources")
header(ws, 1, ["Data", "Free source", "Key needed?", "Cache", "Used for"], [30, 36, 16, 12, 60])
sources = [
    ("City coordinates", "OpenStreetMap Nominatim", "No", "30 days", "Map position of any city, including typed-in 'Other' places"),
    ("Real places", "OpenStreetMap Overpass", "No", "7 days", "Cinemas, restaurants, stadiums, theatres, event venues, hotels, caterers, gift shops, attractions"),
    ("Films", "Apple iTunes movie chart (country store)", "No", "6 hours", "Popular films with posters; TMDB replaces it when TMDB_API_KEY is set"),
    ("Films in cinemas", "TMDB now playing", "Free key (TMDB_API_KEY)", "6 hours", "Films actually showing in the country's cinemas"),
    ("Sports fixtures", "TheSportsDB (public key 123)", "No", "3 hours", "IPL, ISL; NHL, NBA, MLB, MLS, CFL; Premier League"),
    ("Concerts & shows", "Ticketmaster Discovery", "Free key (TICKETMASTER_API_KEY)", "3 hours", "Real events and ticket price ranges near the city"),
    ("Weather", "Open-Meteo", "No", "1 hour", "16-day forecast on the home page and events; also gives the city's time zone"),
    ("Exchange rates", "Frankfurter (ECB)", "No", "12 hours", "₹ shown alongside C$, US$, £, S$"),
    ("Public holidays", "Nager.Date (India: built-in list)", "No", "7 days", "Upcoming holidays, filtered by Canadian province"),
    ("Showtimes, seat maps, payments", "Simulated", "—", "—", "No free API publishes them; the payment gateway is a demo"),
]
for r, row in enumerate(sources, 2):
    for c, v in enumerate(row, 1):
        put(ws, r, c, v).alignment = Alignment(wrap_text=True, vertical="top")
ws.cell(row=len(sources) + 3, column=1, value="If a source can't be reached, that part of the app falls back to labelled sample data. Set EOS_OFFLINE=1 to never call the network.").font = NOTE

# ---------------- Flow ----------------
ws = wb.create_sheet("Flow")
header(ws, 1, ["Step", "Agent / actor", "What happens", "Output", "Where in the app"], [6, 20, 64, 40, 26])
flow = [
    (0, "Chat agent", "Opening screen: the user types e.g. 'I'm planning to go for a movie today, can you check the theatres?'. The chat lists theatres near the city, then the films and showtimes at the chosen theatre, a seat map with the best seats preselected, who pays, the payment page, and the ticket.", "Conversation that calls the agents below", "Discover · Concierge chat"),
    (1, "Requester", "Picks Country → State → City (or 'Other' and types it), then browses Movies / Events / Dining, or types a request such as '3 tickets for Orbit 9 IMAX tomorrow evening'.", "Location + request", "Top bar · Discover"),
    (2, "Concierge agent", "Works out the category, city, date and party size; picks the show and best seats together, the event and ticket tier, or the venue; prices it; proposes who pays; matches a family/friends group.", "Priced booking draft", "Checkout · Concierge"),
    (3, "Budget agent", "Checks the right pot: department quarterly budget, wellbeing allowance or personal monthly budget.", "ok / warn / over + notes", "Checkout · Budget agent"),
    (4, "Policy agent", "Builds the approval chain from ₹ thresholds, per-person caps, compliance categories and budget status; removes self-approval.", "Ordered approvers or auto-approval", "Checkout · Policy agent"),
    (5, "Requester", "Changes who pays / group / purpose if needed and confirms. Movie seats are held immediately.", "Booking created", "Bookings"),
    (6, "Approval agent", "Notifies the current approver; each approves or rejects in order; a rejection stops the chain and releases seats.", "Approved / rejected", "Approvals"),
    (7, "Booking agent", "Confirms with the cinema, organiser or venue and issues m-tickets, e-tickets or a confirmation code.", "Confirmed booking", "Bookings → details"),
    (8, "Split agent", "Shared bookings: posts to the group ledger, computes shares, balances and a fewest-payments settle-up (UPI).", "Group ledger entry", "Family & friends"),
    (9, "Expense agent", "Reimbursable bookings become claimable; the report is drafted with receipts and routed to Finance, HR or Benefits.", "Expense report", "Expense reports"),
    (10, "Finance / HR / Benefits", "Final approval; reimbursement with payroll; the wellbeing allowance is reduced for wellbeing claims.", "Reimbursed", "Expense reports / Budgets & spend"),
]
for r, row in enumerate(flow, 2):
    for c, v in enumerate(row, 1):
        put(ws, r, c, v).alignment = Alignment(wrap_text=True, vertical="top")

for sheet in wb.worksheets:
    sheet.sheet_view.showGridLines = sheet.title in ("Bookings", "Group Ledger", "Locations")

out = os.path.join(HERE, "Entertainment-OS-Workbook.xlsx")
wb.save(out)
print("wrote", out)
