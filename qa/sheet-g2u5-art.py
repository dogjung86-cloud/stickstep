# 중2 Ⅴ 랩 그림 캡처(qa/shot-g2u5-art.mjs)를 견주기판으로 붙인다(눈검수와 판정 자료용).
# 실행: python qa/sheet-g2u5-art.py <캡처 폴더> <출력 폴더> [접두(파일 이름 앞에 붙일 말)]
#   stages-<랩>.png   그 랩의 시점별 무대(무대만 자른 것)를 한 줄에
#   screens-<랩>.png  그 랩의 시점별 화면 전체를 한 줄에
#   all-stages.png    열두 판의 무대를 시점별로 한 장에(랩마다 한 줄)
# 고치기 전후를 함께 주면(캡처 폴더를 '전,후'로) 랩마다 위 줄이 전, 아래 줄이 후인 판을 만든다: compare-<랩>.png
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

srcs = [Path(p) for p in sys.argv[1].split(",")]
out = Path(sys.argv[2])
pre = sys.argv[3] if len(sys.argv) > 3 else ""
out.mkdir(parents=True, exist_ok=True)
try:
    font = ImageFont.truetype("C:/Windows/Fonts/malgunbd.ttf", 22)
    small = ImageFont.truetype("C:/Windows/Fonts/malgunbd.ttf", 18)
except OSError:
    font = small = ImageFont.load_default()

LABS = ["scope", "supply", "sensor", "starch", "design", "farm", "dark", "sprout", "light", "cycle", "route", "store"]


def shots(src, lab, kind):
    files = sorted(src.glob(f"{lab}-*-stage.png")) if kind == "stage" else sorted(p for p in src.glob(f"{lab}-*.png") if not p.name.endswith("-stage.png"))
    return files


def mark_of(p):
    s = p.stem.replace("-stage", "")
    return s.split("-", 2)[2] if s.count("-") >= 2 else s


def row_img(files, w, label=None):
    tiles = []
    for p in files:
        im = Image.open(p).convert("RGB")
        h = round(im.height * w / im.width)
        tiles.append((mark_of(p), im.resize((w, h), Image.LANCZOS)))
    if not tiles:
        return None
    th = max(t[1].height for t in tiles)
    lw = 120 if label else 0
    canvas = Image.new("RGB", (lw + len(tiles) * (w + 12) + 12, th + 48), "#E9EDF2")
    d = ImageDraw.Draw(canvas)
    if label:
        d.text((12, 40), label, fill="#191F28", font=font)
    for i, (m, im) in enumerate(tiles):
        x = lw + 12 + i * (w + 12)
        d.text((x, 8), m, fill="#191F28", font=small)
        canvas.paste(im, (x, 40))
    return canvas


def stack(imgs, name):
    imgs = [i for i in imgs if i is not None]
    if not imgs:
        return
    W = max(i.width for i in imgs)
    H = sum(i.height for i in imgs) + 8 * (len(imgs) - 1)
    c = Image.new("RGB", (W, H), "#E9EDF2")
    y = 0
    for i in imgs:
        c.paste(i, (0, y))
        y += i.height + 8
    c.save(out / name)
    print(out / name, c.size)


if len(srcs) == 1:
    src = srcs[0]
    all_rows = []
    for lab in LABS:
        st = shots(src, lab, "stage")
        sc = shots(src, lab, "screen")
        r = row_img(st, 460, lab)
        if r:
            r.save(out / f"{pre}stages-{lab}.png")
            all_rows.append(r)
        r2 = row_img(sc, 390 if "phone" in str(src) else 960)
        if r2:
            r2.save(out / f"{pre}screens-{lab}.png")
    stack(all_rows, f"{pre}all-stages.png")
else:
    a, b = srcs
    for lab in LABS:
        ra = row_img(shots(a, lab, "stage"), 460, "전")
        rb = row_img(shots(b, lab, "stage"), 460, "후")
        stack([ra, rb], f"{pre}compare-{lab}.png")
