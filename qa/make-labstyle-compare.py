# 랩의 다른 느낌 샘플: 판정 자료용 비교 그림을 만든다(지금 랩과 샘플을 나란히, 폰 크기 그대로).
#   python qa/make-labstyle-compare.py <캡처 폴더(qa/shot-labstyle.mjs의 출력)> <출력 폴더>
# 방향마다 한 장: 윗줄 지금 랩, 아랫줄 샘플. 칸은 처음, 조작 중, 판정, 오답 카드, 결론.
import os
import sys
from PIL import Image, ImageDraw, ImageFont

SRC, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)

FONT_B = "C:/Windows/Fonts/malgunbd.ttf"
FONT_R = "C:/Windows/Fonts/malgun.ttf"
f_title = ImageFont.truetype(FONT_B, 34)
f_row = ImageFont.truetype(FONT_B, 26)
f_col = ImageFont.truetype(FONT_R, 22)

# (방향, 제목, [(칸 이름, 시점 파일 이름)])
SHEETS = [
    ("collage", "1. 종이 콜라주: 박쥐는 누구와 더 가까울까? (u2l8)", [("처음", "mount"), ("조작 중", "look-skin"), ("조사 끝", "look-milk"), ("판정에서 틀렸을 때", "ask-wrong"), ("결론", "done")]),
    ("sketch", "2. 손그림 공책: 두 섬의 새는 어떻게 달라질까? (u2l7)", [("처음", "mount"), ("조작 중", "step1"), ("끝까지 밀었을 때", "step3"), ("판정에서 틀렸을 때", "ask-wrong"), ("결론", "done")]),
    ("model", "3. 입체 모형: 세포의 구조, 멈추면 어떻게 될까? (u2l2)", [("처음", "mount"), ("세포막을 멈췄을 때", "off-mem"), ("마이토콘드리아를 멈췄을 때", "off-mito"), ("판정에서 틀렸을 때", "ask-wrong"), ("결론", "done")]),
]
K = 0.5          # 캡처(780×1400)를 줄이는 비율 → 390×700
PW, PH = 390, 700
GAP, PAD, HEAD, ROWHEAD, COLHEAD = 22, 30, 70, 44, 34

for key, title, cols in SHEETS:
    n = len(cols)
    W = PAD * 2 + n * PW + (n - 1) * GAP
    H = PAD + HEAD + 2 * (ROWHEAD + COLHEAD + PH) + GAP + PAD
    sheet = Image.new("RGB", (W, H), "#EEF0F3")
    d = ImageDraw.Draw(sheet)
    d.text((PAD, PAD), title, font=f_title, fill="#191F28")
    y = PAD + HEAD
    for tag, row_name, color in (("now", "지금 랩", "#46546A"), ("new", "샘플", "#087F5B")):
        d.rounded_rectangle((PAD, y, PAD + 150, y + 36), 18, fill=color)
        d.text((PAD + 75, y + 18), row_name, font=f_row, fill="#FFFFFF", anchor="mm")
        y += ROWHEAD
        for i, (cname, label) in enumerate(cols):
            x = PAD + i * (PW + GAP)
            d.text((x + 4, y), cname, font=f_col, fill="#5B6675")
            p = os.path.join(SRC, f"{key}-{tag}-{label}.png")
            if os.path.exists(p):
                im = Image.open(p).convert("RGB").resize((PW, PH), Image.LANCZOS)
                sheet.paste(im, (x, y + COLHEAD))
                d.rectangle((x - 1, y + COLHEAD - 1, x + PW, y + COLHEAD + PH), outline="#CBD2DB")
            else:
                d.rectangle((x, y + COLHEAD, x + PW, y + COLHEAD + PH), outline="#E03131")
                d.text((x + 10, y + COLHEAD + 10), f"없음: {label}", font=f_col, fill="#E03131")
        y += COLHEAD + PH + GAP
    out = os.path.join(OUT, f"compare-{key}.png")
    sheet.save(out)
    print(out, sheet.size)

# 무대만 크게 본 그림(방향마다 지금과 샘플의 무대를 위아래로)
for key, title, cols in SHEETS:
    picks = [c for c in cols if c[1] not in ("ask-wrong", "done")]
    n = len(picks)
    SW, SH = 780, 650   # 제목, 도움말, 무대가 든 부분(캡처 좌표 y 150~800)
    W = PAD * 2 + n * SW + (n - 1) * GAP
    H = PAD + HEAD + 2 * (ROWHEAD + SH) + GAP + PAD
    sheet = Image.new("RGB", (W, H), "#EEF0F3")
    d = ImageDraw.Draw(sheet)
    d.text((PAD, PAD), title + "  (무대만 크게)", font=f_title, fill="#191F28")
    y = PAD + HEAD
    for tag, row_name, color in (("now", "지금 랩", "#46546A"), ("new", "샘플", "#087F5B")):
        d.rounded_rectangle((PAD, y, PAD + 150, y + 36), 18, fill=color)
        d.text((PAD + 75, y + 18), row_name, font=f_row, fill="#FFFFFF", anchor="mm")
        y += ROWHEAD
        for i, (cname, label) in enumerate(picks):
            x = PAD + i * (SW + GAP)
            p = os.path.join(SRC, f"{key}-{tag}-{label}.png")
            if os.path.exists(p):
                im = Image.open(p).convert("RGB").crop((0, 150, 780, 800))
                sheet.paste(im, (x, y))
                d.rectangle((x - 1, y - 1, x + SW, y + SH), outline="#CBD2DB")
        y += SH + GAP
    out = os.path.join(OUT, f"stage-{key}.png")
    sheet.save(out)
    print(out, sheet.size)
