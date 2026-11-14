# 넓은 화면 무대 견주기 격자판(많은 장면을 빨리 훑는 용도): 한 칸 = [폰 | 넓은 화면을 폰 크기로 줄인 것], 한 줄에 세 칸.
# python qa/grid-wide-zoom.py <audit 출력 폴더> [건너뛸 앞 순위 수] [한 장에 몇 칸]
import json, sys, os
from PIL import Image, ImageDraw, ImageFont, ImageChops, ImageStat

root = sys.argv[1]
skip = int(sys.argv[2]) if len(sys.argv) > 2 else 0
per = int(sys.argv[3]) if len(sys.argv) > 3 else 30
data = json.load(open(os.path.join(root, "results.json"), encoding="utf-8"))
try:
    font = ImageFont.truetype("C:/Windows/Fonts/malgun.ttf", 13)
except Exception:
    font = ImageFont.load_default()

rows = []
for r in data["results"]:
    pp = os.path.join(root, "phone", r["name"] + ".png")
    wp = os.path.join(root, "wide", r["name"] + ".png")
    if not (os.path.exists(pp) and os.path.exists(wp)):
        continue
    ph = Image.open(pp).convert("RGB")
    wd = Image.open(wp).convert("RGB").resize(ph.size, Image.LANCZOS)
    score = sum(ImageStat.Stat(ImageChops.difference(ph, wd)).mean) / 3
    rows.append((score, r, ph, wd))
rows.sort(key=lambda x: -x[0])
rows = rows[skip:]

S = 0.62
CW, CH = int(346 * S), int(230 * S)
cell_w, cell_h = CW * 2 + 6, CH + 20
cols = 3
n = 0
for i in range(0, len(rows), per):
    chunk = rows[i : i + per]
    lines = (len(chunk) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * (cell_w + 14), lines * (cell_h + 8) + 6), "white")
    d = ImageDraw.Draw(sheet)
    for j, (score, r, ph, wd) in enumerate(chunk):
        x = (j % cols) * (cell_w + 14) + 4
        y = (j // cols) * (cell_h + 8) + 4
        d.text((x, y), f"{r['name']} {r['type']} {score:.0f}", fill="black", font=font)
        sheet.paste(ph.resize((CW, int(ph.size[1] * CW / ph.size[0])), Image.LANCZOS).crop((0, 0, CW, CH)), (x, y + 18))
        sheet.paste(wd.resize((CW, int(wd.size[1] * CW / wd.size[0])), Image.LANCZOS).crop((0, 0, CW, CH)), (x + CW + 6, y + 18))
    n += 1
    sheet.save(os.path.join(root, f"grid-{n:02d}.png"))
print(f"{len(rows)}칸, {n}장")
