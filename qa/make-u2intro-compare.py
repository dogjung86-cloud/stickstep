# 도입 샘플 판정 자료용 비교 그림: 레슨마다 "지금"과 "샘플"의 흐름을 위아래로 놓은 한 장을 만든다.
# python qa/make-u2intro-compare.py <캡처 폴더(shot-u2intro가 만든 것)> <출력 폴더>
import glob
import os
import re
import sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
W = 286  # 폰 한 대의 폭(원본 780px를 줄인다)
PAD, LAB, HEAD = 14, 30, 44
try:
    f_lab = ImageFont.truetype("C:/Windows/Fonts/malgun.ttf", 16)
    f_head = ImageFont.truetype("C:/Windows/Fonts/malgunbd.ttf", 20)
except Exception:
    f_lab = f_head = ImageFont.load_default()

TITLE = {
    "u2l2": ("2 세포의 구조", "지금: 빵 공장에는 세 가지가 꼭 있다", "샘플: 빵 공장, 한 곳이 멈추면?"),
    "u2l4": ("4 모양이 다른 세포들", "지금: 피는 왜 빨간색일까", "샘플: 유난히 긴 세포, 얼마나 길까?"),
    "u2l9": ("9 다섯 개의 왕국, 5계", "지금: 버섯을 스캔했더니 식물이 아니래요", "샘플: 버섯은 어느 바구니에 넣을까?"),
}


# 파일 이름의 시점 이름을 읽기 좋게 띄어 쓴다
NAMES = {
    "예측한뒤": "예측한 뒤", "조금밀었을때": "조금 밀었을 때", "절반넘게": "절반 넘게", "끄는중": "끄는 중",
    "식물바구니가돌려보냄": "식물 바구니가 돌려보냄", "출입문을멈춤": "출입문을 멈춤", "통제실을멈춤": "통제실을 멈춤",
    "발전기를멈춤": "발전기를 멈춤", "답한뒤": "답한 뒤(해설은 화면 아래)", "예측": "예측이 뜬 때",
}


def frames(lesson, kind):
    files = sorted(glob.glob(os.path.join(src, f"{lesson}-{kind}-*.png")))
    out_ = []
    for p in files:
        m = re.search(r"-(\d+)-(.+)\.png$", os.path.basename(p))
        im = Image.open(p).convert("RGB")
        im = im.resize((W, round(im.height * W / im.width)), Image.LANCZOS)
        out_.append((f"{int(m.group(1))} {NAMES.get(m.group(2), m.group(2))}", im))
    return out_


def row(draw, sheet, y, head, items, color):
    draw.rectangle([PAD, y, PAD + 6, y + HEAD - 14], fill=color)
    draw.text((PAD + 14, y + 2), head, fill="#212529", font=f_head)
    y += HEAD
    for i, (lab, im) in enumerate(items):
        x = PAD + i * (W + PAD)
        draw.text((x + 2, y), lab, fill="#495057", font=f_lab)
        sheet.paste(im, (x, y + LAB))
        draw.rectangle([x - 1, y + LAB - 1, x + im.width, y + LAB + im.height], outline="#ADB5BD")
    return y + LAB + max(im.height for _, im in items) + PAD


for lesson, (name, now_t, new_t) in TITLE.items():
    now, new = frames(lesson, "now"), frames(lesson, "new")
    if not now or not new:
        continue
    cols = max(len(now), len(new))
    h = now[0][1].height
    sheet = Image.new("RGB", (PAD + cols * (W + PAD), PAD + 2 * (HEAD + LAB + h + PAD)), "#F1F3F5")
    d = ImageDraw.Draw(sheet)
    y = row(d, sheet, PAD, now_t, now, "#ADB5BD")
    row(d, sheet, y, new_t, new, "#12B886")
    path = os.path.join(out, f"compare-{lesson}.png")
    sheet.save(path)
    print("saved", path, sheet.size)
