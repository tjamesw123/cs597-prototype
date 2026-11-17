"""Generate the sample PDFs in public/samples/ from src/data/sampleDocuments.json.

The same JSON is imported by the app, so the text the app highlights is exactly
the text drawn in each PDF. Requires: pip install reportlab
Usage: python3 scripts/generate_sample_pdfs.py
"""
import json
import pathlib
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = json.loads((ROOT / "src/data/sampleDocuments.json").read_text(encoding="utf-8"))
OUT = ROOT / "public/samples"
OUT.mkdir(parents=True, exist_ok=True)

NAVY = (0x17 / 255, 0x2B / 255, 0x4D / 255)
GRAY = (0.35, 0.38, 0.45)
BLACK = (0.06, 0.09, 0.16)


def is_section(line: str) -> bool:
    letters = [c for c in line if c.isalpha()]
    return len(line) < 40 and letters and all(c.isupper() for c in letters)


def render(key: str, entry: dict) -> None:
    lines = entry["lines"]
    is_letter = any(l.startswith("Dear ") for l in lines)
    target = OUT / (entry["fileName"] if key.startswith("demo-") else f"{key}.pdf")
    c = canvas.Canvas(str(target), pagesize=letter)
    c.setTitle(entry["fileName"])
    width, height = letter
    x, y = 60, height - 70
    for i, line in enumerate(lines):
        if i == 0:
            c.setFillColorRGB(*NAVY); c.setFont("Helvetica-Bold", 20)
            c.drawString(x, y, line); y -= 20; continue
        if i == 1:
            c.setFillColorRGB(*GRAY); c.setFont("Helvetica", 9.5)
            c.drawString(x, y, line); y -= 26; continue
        if is_letter:
            c.setFillColorRGB(*BLACK); c.setFont("Helvetica", 11)
            c.drawString(x, y, line)
            y -= 22 if line.endswith((",", ".")) else 16
            continue
        if is_section(line):
            y -= 6
            c.setFillColorRGB(*NAVY); c.setFont("Helvetica-Bold", 11)
            c.drawString(x, y, line)
            c.setStrokeColorRGB(0.8, 0.83, 0.88); c.line(x, y - 4, width - x, y - 4)
            y -= 18; continue
        if line.startswith("• "):
            c.setFillColorRGB(*BLACK); c.setFont("Helvetica", 10)
            c.drawString(x + 12, y, line); y -= 14; continue
        c.setFillColorRGB(*BLACK); c.setFont("Helvetica-Bold", 10.5)
        c.drawString(x, y, line); y -= 15
    c.save()
    print("wrote", target.relative_to(ROOT))


for k, v in DATA.items():
    render(k, v)
