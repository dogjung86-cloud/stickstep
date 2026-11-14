# 넓은 화면 무대 견주기판: audit-wide-zoom.mjs가 찍은 무대 그림을 [폰 모양 | 넓은 화면을 폰 크기로 줄인 것]으로 나란히 붙인다.
# 넓은 화면은 무대를 통째로 키우기만 하므로 줄여 놓으면 폰과 같아야 한다. 입자가 작아지거나 자리가 어긋나면 여기서 보인다.
# 차이 점수(두 그림의 평균 밝기 차)로 큰 것부터 늘어놓는다(움직이는 무대는 원래 조금 다르다).
# python qa/sheet-wide-zoom.py <audit 출력 폴더> [한 장에 몇 줄] [단원 접두(쉼표)]
import json, sys, os
from PIL import Image, ImageDraw, ImageFont, ImageChops, ImageStat

root = sys.argv[1]
per = int(sys.argv[2]) if len(sys.argv) > 2 else 8
only = [u for u in (sys.argv[3].split(",") if len(sys.argv) > 3 else []) if u]
data = json.load(open(os.path.join(root, "results.json"), encoding="utf-8"))
try:
    font = ImageFont.truetype("C:/Windows/Fonts/malgun.ttf", 15)
except Exception:
    font = ImageFont.load_default()

rows = []
for r in data["results"]:
    if only and r["unit"] not in only:
        continue
    pp = os.path.join(root, "phone", r["name"] + ".png")
    wp = os.path.join(root, "wide", r["name"] + ".png")
    if not (os.path.exists(pp) and os.path.exists(wp)):
        continue
    ph = Image.open(pp).convert("RGB")
    wd = Image.open(wp).convert("RGB")
    wds = wd.resize(ph.size, Image.LANCZOS)
    diff = ImageStat.Stat(ImageChops.difference(ph, wds)).mean
    score = sum(diff) / 3
    rows.append((score, r, ph, wds))

rows.sort(key=lambda x: -x[0])
W = 2 * 360 + 30
pages = 0
for i in range(0, len(rows), per):
    chunk = rows[i : i + per]
    H = sum(max(c[2].size[1], c[3].size[1]) + 30 for c in chunk) + 10
    sheet = Image.new("RGB", (W, H), "white")
    d = ImageDraw.Draw(sheet)
    y = 5
    for score, r, ph, wds in chunk:
        lab = f"{r['name']}  {r['type']}  차이 {score:.1f}  zoom {r['zoom']}"
        if r["bcr"]:
            lab += f"  측정 {len(set(r['bcr']))}곳"
        d.text((8, y), lab, fill="black", font=font)
        y += 22
        sheet.paste(ph, (5, y))
        sheet.paste(wds, (5 + 360 + 15, y))
        y += max(ph.size[1], wds.size[1]) + 8
    pages += 1
    sheet.save(os.path.join(root, f"sheet-{pages:02d}.png"))
print(f"{len(rows)}줄, {pages}장 → {root}/sheet-NN.png")
for score, r, _, _ in rows[:40]:
    print(f"{score:6.1f}  {r['name']}  {r['type']}  bcr={len(set(r['bcr']))}")
