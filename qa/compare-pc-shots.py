# 전후 견주기판: perf-pc-3d.mjs가 찍은 old/new 무대 그림을 나란히 놓고, 한 부분을 확대해 아래에 붙인다(2026-11-15, 분석용).
# python qa/compare-pc-shots.py <shots 폴더> <출력 폴더> <이름:크롭x,y,w,h:제목> ...
#   이름 = fhd100-u2l2-s3 처럼 shots 파일 이름에서 -old.png/-new.png를 뺀 것. 크롭은 무대 그림 안의 화면 px.
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

shots = Path(sys.argv[1])
out = Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)
FONT = "C:/Windows/Fonts/malgunbd.ttf"
f_big = ImageFont.truetype(FONT, 26)
f_small = ImageFont.truetype(FONT, 20)
BG = (246, 243, 236)
INK = (40, 44, 52)


def board(name: str, crop: tuple[int, int, int, int], title: str, labels=("지금", "시험 수정 뒤")) -> Path:
    a = Image.open(shots / f"{name}-old.png").convert("RGB")
    b = Image.open(shots / f"{name}-new.png").convert("RGB")
    W, H = a.size
    gap = 24
    pad = 24
    x, y, w, h = crop
    k = 3  # 확대 배율(가까이 보기)
    zw, zh = w * k, h * k
    cols_w = max(W, zw)
    total_w = pad * 2 + cols_w * 2 + gap
    total_h = pad + 44 + 34 + H + 40 + zh + pad
    im = Image.new("RGB", (total_w, total_h), BG)
    d = ImageDraw.Draw(im)
    d.text((pad, pad), title, fill=INK, font=f_big)
    for i, (src, lab) in enumerate(((a, labels[0]), (b, labels[1]))):
        ox = pad + i * (cols_w + gap)
        oy = pad + 44
        d.text((ox, oy), lab, fill=INK, font=f_small)
        oy += 34
        im.paste(src, (ox, oy))
        d.rectangle([ox + x, oy + y, ox + x + w, oy + y + h], outline=(230, 60, 60), width=3)
        oy += H + 40
        z = src.crop((x, y, x + w, y + h)).resize((zw, zh), Image.NEAREST)
        im.paste(z, (ox, oy))
        d.rectangle([ox, oy, ox + zw - 1, oy + zh - 1], outline=(230, 60, 60), width=3)
    p = out / f"compare-{name}.png"
    im.save(p, optimize=True)
    return p


for spec in sys.argv[3:]:
    name, c, title = spec.split(":", 2)
    crop = tuple(int(v) for v in c.split(","))
    print(board(name, crop, title))
