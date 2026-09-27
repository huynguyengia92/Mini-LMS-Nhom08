"""Xuất Product Backlog (2.1.4) ra CSV đúng định dạng Jira Cloud CSV importer."""
import csv, re, sys, unicodedata
from openpyxl import load_workbook

sys.stdout.reconfigure(encoding="utf-8")
SRC = r"D:\MiniLMS\docs\1. PROJECT MANAGEMENT\1.1 PROJECT PLANNING\1.1.4 SEP_Nhom08_ProductBacklog_ver1.0.xlsx"
OUT = r"D:\MiniLMS\docs\_import\jira-product-backlog.csv"


def slug(text):
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn").replace("đ", "d").replace("Đ", "D")
    return re.sub(r"[^A-Za-z0-9]+", "-", text).strip("-")


def summary_of(story):
    """Summary ngắn cho Jira: bỏ vế 'Là <vai trò>,' và cắt tại 'để ...' nếu quá dài."""
    s = re.sub(r"^Là [^,]+,\s*tôi muốn\s*", "", story).strip()
    s = s[0].upper() + s[1:] if s else s
    if len(s) > 110:
        cut = s.rfind(" để ", 0, 110)
        s = (s[:cut] if cut > 40 else s[:107]).rstrip(" ,;") + ("…" if cut <= 40 else "")
    return s


wb = load_workbook(SRC)
ws = wb["Product Backlog"]
header_row = next(r for r in range(1, 12) if ws.cell(r, 1).value == "ID")

rows = []
for r in range(header_row + 1, ws.max_row + 1):
    code = ws.cell(r, 1).value
    if not code or not str(code).startswith("US."):
        continue
    story = str(ws.cell(r, 2).value).strip()
    module = str(ws.cell(r, 3).value).strip()
    points = ws.cell(r, 4).value
    priority = str(ws.cell(r, 5).value).strip()
    sprint = str(ws.cell(r, 6).value).strip()

    rows.append({
        "Summary": f"{code} — {summary_of(story)}",
        "Issue Type": "Story",
        "Description": f"{story}\n\nModule: {module}\nMã yêu cầu trong tài liệu SEP: {code}",
        "Priority": priority,
        "Story Points": points,
        "Sprint": sprint,
        "Labels": slug(module).lower(),
        "Component": module,
    })

import os
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w", newline="", encoding="utf-8-sig") as f:
    writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
    writer.writeheader()
    writer.writerows(rows)

print(f"{len(rows)} user story -> {OUT}")
print("Sprint:", {r['Sprint']: sum(1 for x in rows if x['Sprint'] == r['Sprint']) for r in rows})
print("Tổng story point:", sum(r["Story Points"] for r in rows))
print("\nVí dụ 2 dòng đầu:")
for r in rows[:2]:
    print(" ", r["Summary"], "|", r["Priority"], "|", r["Story Points"], "|", r["Sprint"], "|", r["Labels"])
