"""Generates docs/Entertainment-OS-Workbook.xlsx from the demo dataset.

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

FONT = "Arial"
GREEN = "2F6B3F"
TILE = "E4F1DF"
BLUE = Font(name=FONT, color="0000FF")
BLACK = Font(name=FONT)
BOLD = Font(name=FONT, bold=True)
HEAD = Font(name=FONT, bold=True, color="FFFFFF")
HEAD_FILL = PatternFill("solid", fgColor=GREEN)
INPUT_FILL = PatternFill("solid", fgColor="FFFF00")
THIN = Side(style="thin", color="D9D5CC")
BOX = Border(top=THIN, bottom=THIN, left=THIN, right=THIN)
USD = '$#,##0;($#,##0);"-"'
USD2 = '$#,##0.00;($#,##0.00);"-"'
PCT = '0.0%;(0.0%);"-"'

people = {p["id"]: p for p in data["people"]}
depts = {d["id"]: d for d in data["departments"]}
cats = {
    "reservations": "Reservations",
    "pdr": "Private dining & events",
    "catering": "Catering",
    "sports": "Sports & live events",
    "gifting": "Gifting & merch",
    "experiences": "Experiences",
}

wb = Workbook()


def header(ws, row, labels, widths=None):
    for i, label in enumerate(labels, 1):
        c = ws.cell(row=row, column=i, value=label)
        c.font, c.fill, c.border = HEAD, HEAD_FILL, BOX
        c.alignment = Alignment(vertical="center", wrap_text=True)
    if widths:
        for i, w in enumerate(widths, 1):
            ws.column_dimensions[get_column_letter(i)].width = w
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
    ws["A2"].font = Font(name=FONT, italic=True, color="777777")


# ---------------- Read Me ----------------
ws = wb.active
ws.title = "Read Me"
title(ws, "Entertainment OS — Operations Workbook", f"{data['meta']['company']} · {data['meta']['period']} · generated from the demo run of the agent pipeline")
rows = [
    ("Sheet", "What it shows"),
    ("Policy", "Approval thresholds and per-attendee caps (inputs). Change them to re-run the approval logic on every booking."),
    ("Bookings", "Every booking: who booked it, category, vendor, amount, who pays, status and the approval chain the policy requires."),
    ("Budgets", "Department quarterly budgets vs committed company spend."),
    ("Spend by Person", "Who is spending how much: company-paid, reimbursable, personal, and share of family/friends group spend."),
    ("Expense Reports", "Personally-paid spend claimed back, with routing to Finance, HR or Benefits."),
    ("Group Ledger", "Family & friends expenses with each member's share (Splitwise style)."),
    ("Group Balances", "Net balance per member = paid − share ± settlements."),
    ("Split Calculator", "Try a split: enter an amount, pick a method and weights."),
    ("Flow", "Step-by-step flow of a request through the agents."),
    ("", ""),
    ("Legend", ""),
    ("Blue text", "Hard-coded input — safe to edit."),
    ("Yellow fill", "Key assumption / cell you are expected to fill in."),
    ("Black text", "Formula — do not overwrite."),
]
for r, (a, b) in enumerate(rows, 4):
    ws.cell(row=r, column=1, value=a).font = BOLD if r in (4, 15) else BLACK
    ws.cell(row=r, column=2, value=b).font = BLACK
ws["A16"].font = BLUE
ws["A17"].fill = INPUT_FILL
ws.column_dimensions["A"].width = 20
ws.column_dimensions["B"].width = 110

# ---------------- Policy ----------------
ws = wb.create_sheet("Policy")
title(ws, "Policy inputs", "Source: src/seed.js → POLICY (values set by Finance). Edit the blue cells.")
thresholds = [
    ("Auto-approve limit ($)", 250, "Company spend at or below this, within budget and caps, is auto-approved."),
    ("Manager limit ($)", 2500, "Above this the department head is added."),
    ("Department head limit ($)", 10000, "Above this Finance (CFO) is added."),
]
header(ws, 4, ["Threshold", "Value", "Meaning"], [32, 14, 80])
ws.freeze_panes = None
for i, (k, v, m) in enumerate(thresholds, 5):
    put(ws, i, 1, k)
    c = put(ws, i, 2, v, BLUE, USD)
    c.fill = INPUT_FILL
    put(ws, i, 3, m)
ws["A10"] = "Per-attendee caps (company spend)"
ws["A10"].font = BOLD
for i, lab in enumerate(["Category key", "Cap per attendee ($)", "Category"], 1):
    c = ws.cell(row=11, column=i, value=lab)
    c.font, c.fill, c.border = HEAD, HEAD_FILL, BOX
caps = {"reservations": 150, "pdr": 175, "catering": 60, "sports": 600, "gifting": 100, "experiences": 900}
for i, (k, v) in enumerate(caps.items(), 12):
    put(ws, i, 1, k)
    put(ws, i, 2, v, BLUE, USD)
    put(ws, i, 3, cats[k])
ws["A19"] = "Compliance review categories (client-facing only)"
ws["A19"].font = BOLD
put(ws, 20, 1, "sports", BLUE)
put(ws, 21, 1, "gifting", BLUE)
AUTO, MGR, HEADL = "Policy!$B$5", "Policy!$B$6", "Policy!$B$7"
CAPS = "Policy!$A$12:$B$17"

# ---------------- Bookings ----------------
ws = wb.create_sheet("Bookings")
cols = ["Booking", "Date", "Category key", "Category", "Title", "Vendor", "Booked by", "Dept", "Who pays", "Purpose", "Client-facing", "Guests", "Amount ($)", "Per attendee ($)", "Cap ($)", "Over cap?", "Policy approval chain", "Approvals in system", "Status", "Group"]
header(ws, 1, cols, [9, 11, 12, 22, 42, 30, 15, 9, 13, 11, 8, 8, 12, 12, 9, 9, 40, 44, 16, 16])
groups = {g["id"]: g["name"] for g in data["groups"]}
bookings = sorted(data["bookings"], key=lambda b: b["id"])
for r, b in enumerate(bookings, 2):
    chain = " → ".join(f"{s['role']} ({people[s['approverId']]['name']}: {s['status']})" for s in b["approvals"]) or "None"
    vals = [b["id"], b["date"], b["category"], b["categoryLabel"], b["title"], b["vendor"], people[b["bookedBy"]]["name"], b["costCenterDept"] or people[b["bookedBy"]].get("dept", ""), b["funding"], b["purpose"], "Yes" if b["clientFacing"] else "No", b["partySize"]]
    for c, v in enumerate(vals, 1):
        put(ws, r, c, v, BLUE if c in (9, 11, 12) else BLACK)
    put(ws, r, 13, b["amount"], BLUE, USD2)
    put(ws, r, 14, f"=IF(L{r}>0,M{r}/L{r},0)", fmt=USD2)
    put(ws, r, 15, f"=IFERROR(INDEX(Policy!$B$12:$B$17,MATCH(C{r},Policy!$A$12:$A$17,0)),0)", fmt=USD)
    put(ws, r, 16, f'=IF(AND(I{r}="corporate",N{r}>O{r}),"Yes","No")')
    put(
        ws, r, 17,
        f'=IF(I{r}<>"corporate","None (not company money)",'
        f'IF(AND(M{r}<={AUTO},P{r}="No"),"Auto-approved",'
        f'"Manager"&IF(OR(M{r}>{MGR},P{r}="Yes")," → Dept head","")'
        f'&IF(AND(K{r}="Yes",OR(C{r}=Policy!$A$20,C{r}=Policy!$A$21))," → Compliance","")'
        f'&IF(M{r}>{HEADL}," → Finance","")))',
    )
    put(ws, r, 18, chain)
    put(ws, r, 19, b["status"])
    put(ws, r, 20, groups.get(b["groupId"], ""))
last_b = len(bookings) + 1
ws.cell(row=last_b + 2, column=1, value="Note: column Q applies the Policy sheet thresholds. Column R is what the agents recorded; it also skips self-approval (an approver who is the requester is replaced by their manager) and adds Finance when a department budget is exceeded.").font = Font(name=FONT, italic=True, color="777777")
dv = DataValidation(type="list", formula1='"corporate,reimbursable,personal,shared"', allow_blank=False)
ws.add_data_validation(dv)
dv.add(f"I2:I{last_b}")
ws.conditional_formatting.add(f"P2:P{last_b}", CellIsRule(operator="equal", formula=['"Yes"'], fill=PatternFill("solid", fgColor="FBE9E9")))
BK = lambda col: f"Bookings!${col}$2:${col}${last_b}"  # noqa: E731

# ---------------- Budgets ----------------
ws = wb.create_sheet("Budgets")
header(ws, 1, ["Dept key", "Department", "Cost center", "Budget owner", "Quarterly budget ($)", "Committed ($)", "Remaining ($)", "Utilisation"], [10, 26, 12, 18, 18, 16, 16, 12])
for r, d in enumerate(data["departments"], 2):
    put(ws, r, 1, d["id"])
    put(ws, r, 2, d["name"])
    put(ws, r, 3, d["costCenter"])
    put(ws, r, 4, people[d["headId"]]["name"])
    c = put(ws, r, 5, d["quarterlyBudget"], BLUE, USD)
    c.fill = INPUT_FILL
    live = " + ".join(
        f'SUMIFS({BK("M")},{BK("H")},A{r},{BK("I")},"corporate",{BK("S")},"{s}")' for s in ("pending_approval", "approved", "confirmed")
    )
    put(ws, r, 6, f"={live}", fmt=USD)
    put(ws, r, 7, f"=E{r}-F{r}", fmt=USD)
    put(ws, r, 8, f"=IF(E{r}>0,F{r}/E{r},0)", fmt=PCT)
n = len(data["departments"]) + 1
put(ws, n + 1, 2, "Total", BOLD)
for col in "EFG":
    put(ws, n + 1, "EFG".index(col) + 5, f"=SUM({col}2:{col}{n})", BOLD, USD)
put(ws, n + 1, 8, f"=IF(E{n+1}>0,F{n+1}/E{n+1},0)", BOLD, PCT)
ws.cell(row=n + 3, column=1, value="Committed = company-paid bookings awaiting approval, approved or confirmed (Bookings sheet).").font = Font(name=FONT, italic=True, color="777777")

# ---------------- Group Ledger ----------------
ws = wb.create_sheet("Group Ledger")
members = [pid for g in data["groups"] for pid in g["members"]]
members = list(dict.fromkeys(members))
header(ws, 1, ["Expense", "Date", "Group", "Description", "Paid by", "Amount ($)", "Method"] + [people[m]["name"] for m in members] + ["Check"], [9, 11, 16, 44, 14, 12, 9] + [13] * len(members) + [9])
exps = data["groupExpenses"]
for r, e in enumerate(exps, 2):
    for c, v in enumerate([e["id"], e["date"], groups[e["groupId"]], e["description"], people[e["paidBy"]]["name"]], 1):
        put(ws, r, c, v)
    put(ws, r, 6, e["amount"], BLUE, USD2)
    put(ws, r, 7, e["method"])
    shares = {s["personId"]: s["amount"] for s in e["shares"]}
    for i, m in enumerate(members):
        put(ws, r, 8 + i, shares.get(m, 0), BLUE, USD2)
    first, lastc = get_column_letter(8), get_column_letter(7 + len(members))
    put(ws, r, 8 + len(members), f'=IF(ROUND(SUM({first}{r}:{lastc}{r})-F{r},2)=0,"OK","Mismatch")')
last_e = max(len(exps) + 1, 2)
ws.cell(row=last_e + 2, column=1, value="Shares are computed by the Split agent in whole cents so each row adds up exactly (Check column).").font = Font(name=FONT, italic=True, color="777777")

# Settlements below ledger
srow = last_e + 4
ws.cell(row=srow, column=1, value="Settlements").font = BOLD
for i, lab in enumerate(["Settlement", "Group", "From", "To", "Amount ($)"], 1):
    c = ws.cell(row=srow + 1, column=i, value=lab)
    c.font, c.fill, c.border = HEAD, HEAD_FILL, BOX
for r, s in enumerate(data["settlements"], srow + 2):
    put(ws, r, 1, s["id"])
    put(ws, r, 2, groups[s["groupId"]])
    put(ws, r, 3, people[s["from"]]["name"])
    put(ws, r, 4, people[s["to"]]["name"])
    put(ws, r, 5, s["amount"], BLUE, USD2)
s_first, s_last = srow + 2, max(srow + 1 + len(data["settlements"]), srow + 2)

# ---------------- Group Balances ----------------
ws = wb.create_sheet("Group Balances")
header(ws, 1, ["Group", "Member", "Paid ($)", "Share ($)", "Settlements sent ($)", "Settlements received ($)", "Net balance ($)", "Position"], [16, 18, 12, 12, 18, 20, 16, 14])
r = 2
for g in data["groups"]:
    for m in g["members"]:
        name = people[m]["name"]
        col = get_column_letter(8 + members.index(m))
        put(ws, r, 1, g["name"])
        put(ws, r, 2, name)
        put(ws, r, 3, f"=SUMIFS('Group Ledger'!$F$2:$F${last_e},'Group Ledger'!$C$2:$C${last_e},A{r},'Group Ledger'!$E$2:$E${last_e},B{r})", fmt=USD2)
        put(ws, r, 4, f"=SUMIFS('Group Ledger'!${col}$2:${col}${last_e},'Group Ledger'!$C$2:$C${last_e},A{r})", fmt=USD2)
        put(ws, r, 5, f"=SUMIFS('Group Ledger'!$E${s_first}:$E${s_last},'Group Ledger'!$B${s_first}:$B${s_last},A{r},'Group Ledger'!$C${s_first}:$C${s_last},B{r})", fmt=USD2)
        put(ws, r, 6, f"=SUMIFS('Group Ledger'!$E${s_first}:$E${s_last},'Group Ledger'!$B${s_first}:$B${s_last},A{r},'Group Ledger'!$D${s_first}:$D${s_last},B{r})", fmt=USD2)
        put(ws, r, 7, f"=C{r}-D{r}+E{r}-F{r}", fmt=USD2)
        put(ws, r, 8, f'=IF(ROUND(G{r},2)>0,"gets back",IF(ROUND(G{r},2)<0,"owes","settled"))')
        r += 1
ws.cell(row=r + 1, column=1, value="Net balance = paid − own share + settlements sent − settlements received. Positive: is owed money. Negative: owes money. Each group sums to zero.").font = Font(name=FONT, italic=True, color="777777")

# ---------------- Spend by Person ----------------
ws = wb.create_sheet("Spend by Person")
header(ws, 1, ["Person", "Title", "Employee", "Company-paid ($)", "Reimbursable ($)", "Personal ($)", "Paid for groups ($)", "Own group share ($)", "Out of pocket ($)", "Total influenced ($)"], [18, 28, 10, 16, 16, 14, 18, 18, 16, 18])
live_status = ("pending_approval", "approved", "confirmed")


def live_sum(r, funding):
    return " + ".join(f'SUMIFS({BK("M")},{BK("G")},$A{r},{BK("I")},"{funding}",{BK("S")},"{s}")' for s in live_status)


for r, p in enumerate(data["people"], 2):
    put(ws, r, 1, p["name"])
    put(ws, r, 2, p["title"])
    put(ws, r, 3, "Yes" if p["employee"] else "Guest")
    put(ws, r, 4, f"={live_sum(r, 'corporate')}", fmt=USD2)
    put(ws, r, 5, f"={live_sum(r, 'reimbursable')}", fmt=USD2)
    put(ws, r, 6, f"={live_sum(r, 'personal')}", fmt=USD2)
    put(ws, r, 7, f"=SUMIFS('Group Ledger'!$F$2:$F${last_e},'Group Ledger'!$E$2:$E${last_e},A{r})", fmt=USD2)
    if p["id"] in members:
        col = get_column_letter(8 + members.index(p["id"]))
        put(ws, r, 8, f"=SUM('Group Ledger'!{col}2:{col}{last_e})", fmt=USD2)
    else:
        put(ws, r, 8, 0, fmt=USD2)
    put(ws, r, 9, f"=E{r}+F{r}+H{r}", fmt=USD2)
    put(ws, r, 10, f"=D{r}+E{r}+F{r}+G{r}", fmt=USD2)
np_ = len(data["people"]) + 1
put(ws, np_ + 1, 1, "Total", BOLD)
for ci in range(4, 11):
    L = get_column_letter(ci)
    put(ws, np_ + 1, ci, f"=SUM({L}2:{L}{np_})", BOLD, USD2)
ws.cell(row=np_ + 3, column=1, value="Only live bookings count (awaiting approval, approved, confirmed). Out of pocket = reimbursable + personal + own share of group spend.").font = Font(name=FONT, italic=True, color="777777")

# ---------------- Expense Reports ----------------
ws = wb.create_sheet("Expense Reports")
header(ws, 1, ["Report", "Owner", "Type", "Routed to", "Lines", "Bookings", "Total ($)", "Claimable ($)", "Approval chain", "Status", "Submitted"], [9, 16, 32, 11, 7, 18, 12, 13, 46, 12, 20])
for r, rep in enumerate(data["reports"], 2):
    chain = " → ".join(f"{s['role']} ({people[s['approverId']]['name']}: {s['status']})" for s in rep["approvals"])
    for c, v in enumerate([rep["id"], people[rep["ownerId"]]["name"], rep["purposeLabel"], rep["routeTo"], len(rep["lines"]), ", ".join(rep["bookingIds"])], 1):
        put(ws, r, c, v)
    put(ws, r, 7, rep["total"], BLUE, USD2)
    put(ws, r, 8, rep["claimable"], BLUE, USD2)
    put(ws, r, 9, chain)
    put(ws, r, 10, rep["status"])
    put(ws, r, 11, rep["submittedAt"])
rr = len(data["reports"]) + 3
ws.cell(row=rr, column=1, value="Routing rules").font = BOLD
for i, (a, b) in enumerate([("Client / business", "Manager → Finance"), ("Team morale, celebrations & offsites", "Manager → HR"), ("Lifestyle & wellbeing stipend", "Benefits (capped at stipend balance)")], rr + 1):
    put(ws, i, 1, a)
    put(ws, i, 3, b)

# ---------------- Split Calculator ----------------
ws = wb.create_sheet("Split Calculator")
title(ws, "Split calculator", "Enter the amount and method (yellow). Weights: exact $, percent, or share units. 'equal' ignores weights.")
put(ws, 4, 1, "Amount ($)", BOLD)
c = put(ws, 4, 2, 300, BLUE, USD2)
c.fill = INPUT_FILL
put(ws, 5, 1, "Method", BOLD)
c = put(ws, 5, 2, "shares", BLUE)
c.fill = INPUT_FILL
dv2 = DataValidation(type="list", formula1='"equal,exact,percent,shares"')
ws.add_data_validation(dv2)
dv2.add("B5")
header(ws, 7, ["Member", "Weight (input)", "Share ($)"], [22, 16, 14])
ws.freeze_panes = None
for i, (nm, w) in enumerate([("Maya", 2), ("Daniel", 1), ("Lucy", 1), ("Guest", 0)], 8):
    put(ws, i, 1, nm, BLUE)
    put(ws, i, 2, w, BLUE)
    put(
        ws, i, 3,
        f'=IF($B$5="equal",IF(COUNTA($A$8:$A$11)>0,$B$4/COUNTA($A$8:$A$11),0),'
        f'IF($B$5="exact",B{i},IF($B$5="percent",$B$4*B{i}/100,IF(SUM($B$8:$B$11)>0,$B$4*B{i}/SUM($B$8:$B$11),0))))',
        fmt=USD2,
    )
put(ws, 12, 1, "Total of shares", BOLD)
put(ws, 12, 3, "=SUM(C8:C11)", BOLD, USD2)
put(ws, 13, 1, "Check", BOLD)
put(ws, 13, 3, '=IF(ROUND(C12-B4,2)=0,"Adds up","Does not add up")', BOLD)
ws["A15"] = "Example: $300 with shares 2:1:1:0 → $150 / $75 / $75 / $0. The app rounds to cents and hands leftover cents to the largest weights."
ws["A15"].font = Font(name=FONT, italic=True, color="777777")
ws["B4"].comment = Comment("Example value — replace with your bill total.", "Entertainment OS")

# ---------------- Flow ----------------
ws = wb.create_sheet("Flow")
header(ws, 1, ["Step", "Agent / actor", "What happens", "Output", "Where to see it in the app"], [6, 20, 60, 40, 26])
flow = [
    (1, "Requester", "Types a plain-language request, e.g. 'Client dinner for 4 tonight'.", "Free-text request", "Home → prompt"),
    (2, "Concierge agent", "Detects category, date, guests, vendor, price, funding (company / reimbursable / personal / shared) and purpose; matches a family or friends group.", "Priced booking draft", "Home → Booking draft"),
    (3, "Budget agent", "Checks the right pot: department quarterly budget, wellbeing stipend or personal monthly budget.", "ok / warn / over + notes", "Home → Budget agent card"),
    (4, "Policy agent", "Builds the approval chain from thresholds, caps, compliance categories and budget status; removes self-approval.", "Ordered approvers or auto-approval", "Home → Policy agent card"),
    (5, "Requester", "Edits anything on the draft and confirms.", "Booking created", "Bookings"),
    (6, "Approval agent", "Notifies the current approver; each approves or rejects in order; rejection stops the chain.", "Approved / rejected", "Approvals inbox"),
    (7, "Booking agent", "Confirms with the vendor, issues a confirmation code, sends invites.", "Confirmed booking", "Bookings → details"),
    (8, "Split agent", "Shared bookings: posts to the group ledger, computes shares, balances and fewest-payments settle-up.", "Group ledger entry", "Family & friends"),
    (9, "Expense agent", "Reimbursable bookings: become claimable; report drafted with receipts and routed to Finance, HR or Benefits.", "Expense report", "Expense reports"),
    (10, "Finance / HR / Benefits", "Final approval; reimbursement paid; stipend reduced for wellbeing claims.", "Reimbursed", "Expense reports / Budgets & spend"),
]
for r, row in enumerate(flow, 2):
    for c, v in enumerate(row, 1):
        put(ws, r, c, v).alignment = Alignment(wrap_text=True, vertical="top")

for sheet in wb.worksheets:
    sheet.sheet_view.showGridLines = sheet.title in ("Bookings", "Group Ledger")

out = os.path.join(HERE, "Entertainment-OS-Workbook.xlsx")
wb.save(out)
print("wrote", out)
