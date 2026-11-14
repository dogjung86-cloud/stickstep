# 중2 Ⅵ 레슨 2 소화기관 랩, 융털 랩 캡처(qa/shot-g2u6-digest.mjs)를 한 장씩으로 붙인다(눈검수용).
# 실행: python qa/sheet-g2u6-digest.py <캡처 폴더> <출력 폴더>
#   sheet-phone.png  폰(390×700) 시점 14장, 5열
#   sheet-pc.png     PC(1440×900) 시점 4장, 2열
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

src = Path(sys.argv[1])
out = Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)
try:
    font = ImageFont.truetype("C:/Windows/Fonts/malgunbd.ttf", 22)
except OSError:
    font = ImageFont.load_default()

PHONE = ["organ-1-start", "organ-2-mouth", "organ-3-eso", "organ-4-stomach-miss", "organ-5-bile-miss",
         "organ-6-pancreas", "organ-7-final", "organ-8-large", "organ-9-judge-wrong", "organ-10-done",
         "villi-1-start", "villi-2-w0", "villi-2-w1", "villi-2-w2"]
PC = ["organ-4-stomach-miss", "organ-7-final", "organ-9-judge-wrong", "villi-2-w2"]


def sheet(prefix, names, cols, w, name):
    tiles = []
    for n in names:
        p = src / f"{prefix}-{n}.png"
        if not p.exists():
            continue
        im = Image.open(p).convert("RGB")
        h = round(im.height * w / im.width)
        im = im.resize((w, h), Image.LANCZOS)
        tiles.append((n, im))
    if not tiles:
        return
    th = max(t[1].height for t in tiles) + 36
    rows = (len(tiles) + cols - 1) // cols
    canvas = Image.new("RGB", (cols * (w + 16) + 16, rows * (th + 16) + 16), "#E9EDF2")
    d = ImageDraw.Draw(canvas)
    for i, (n, im) in enumerate(tiles):
        x = 16 + (i % cols) * (w + 16)
        y = 16 + (i // cols) * (th + 16)
        d.text((x, y), f"{i + 1}. {n}", fill="#191F28", font=font)
        canvas.paste(im, (x, y + 32))
    canvas.save(out / name)
    print(out / name, canvas.size)


sheet("phone", PHONE, 5, 390, "sheet-phone.png")
sheet("pc", PC, 2, 900, "sheet-pc.png")
