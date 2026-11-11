# 중1 Ⅶ v5 눈검수 그림: check-u7v5.mjs가 남긴 캡처를 레슨마다 한 장으로 붙인다.
# python qa/u7v5-sheets.py <캡처 폴더> <출력 폴더>
import os, sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
try:
    font = ImageFont.truetype("C:/Windows/Fonts/malgunbd.ttf", 18)
except Exception:
    font = ImageFont.load_default()

LESSONS = {
    "u7l1": [("0ask", "도입 처음"), ("0mid", "도입 조작 중"), ("0done", "도입 끝"), ("1first", "랩 처음"), ("3table", "특징 표"), ("4wrong", "틀리게 적은 직후"), ("5done", "결론")],
    "u7l2": [("0ask", "도입 처음"), ("0mid", "도입 조작 중"), ("0done", "도입 끝"), ("1first", "랩 처음"), ("2wrongcut", "엉뚱한 자리"), ("3ask", "판정"), ("4wrong", "틀린 직후"), ("5done", "결론")],
    "u7l3": [("1first", "랩 처음"), ("2spot", "흑점 누름"), ("2corona", "가려진 채 흑점 많음"), ("3ask", "판정"), ("4wrong", "틀린 직후"), ("5done", "결론")],
    "u7l4": [("0ask", "도입 처음"), ("0mid", "도입 조작 중"), ("0done", "도입 끝")],
    "u7l4a": [("1first", "별 랩 처음"), ("2south", "남쪽 하늘"), ("2pole", "북극성 찾기"), ("3ask", "판정"), ("4wrong", "틀린 직후"), ("5done", "결론")],
    "u7l4b": [("1first", "별자리 랩 처음"), ("2july", "7월 찾음"), ("3ask", "판정"), ("4wrong", "틀린 직후"), ("5done", "결론")],
    "u7l5": [("0ask", "도입 처음"), ("0mid", "도입 조작 중"), ("0done", "도입 끝"), ("1first", "랩 처음"), ("2half", "네 장 찍음"), ("3ask", "판정"), ("4wrong", "틀린 직후"), ("5done", "결론")],
    "u7l6": [("0ask", "도입 처음"), ("0mid", "도입 조작 중"), ("0done", "도입 끝"), ("1first", "랩 처음"), ("3ask", "판정"), ("4wrong", "틀린 직후"), ("3ask2", "둘째 판정"), ("5done", "결론")],
}
W, PAD, LAB = 330, 12, 28
for name, marks in LESSONS.items():
    ims = []
    for m, label in marks:
        p = os.path.join(src, f"{name}-{m}.png")
        if os.path.exists(p):
            im = Image.open(p).convert("RGB")
            ims.append((im.resize((W, round(im.height * W / im.width)), Image.LANCZOS), label))
    if not ims:
        continue
    h = max(im.height for im, _ in ims)
    sheet = Image.new("RGB", (len(ims) * (W + PAD) + PAD, h + LAB + PAD * 2), "#E9ECEF")
    d = ImageDraw.Draw(sheet)
    for i, (im, label) in enumerate(ims):
        x = PAD + i * (W + PAD)
        d.text((x + 2, PAD), label, fill="#333", font=font)
        sheet.paste(im, (x, PAD + LAB))
    sheet.save(os.path.join(out, f"{name}.png"))

# 가로 화면(세로로 찍힌 것을 돌려 놓는다)
land = [("u7l1-2card", "u7l1 천체 카드"), ("u7l1-2alldone", "u7l1 다 만난 뒤"), ("u7l6-2solar", "u7l6 일식"), ("u7l6-2ground", "u7l6 땅에서 본 모습"), ("u7l6-2lunar", "u7l6 월식과 끝 알림")]
ims = []
for f, label in land:
    p = os.path.join(src, f + ".png")
    if os.path.exists(p):
        im = Image.open(p).convert("RGB").rotate(90, expand=True)
        ims.append((im.resize((620, round(im.height * 620 / im.width)), Image.LANCZOS), label))
if ims:
    h = ims[0][0].height
    cols = 3
    rows = (len(ims) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * (620 + PAD) + PAD, rows * (h + LAB + PAD) + PAD), "#E9ECEF")
    d = ImageDraw.Draw(sheet)
    for i, (im, label) in enumerate(ims):
        x, y = PAD + (i % cols) * (620 + PAD), PAD + (i // cols) * (h + LAB + PAD)
        d.text((x + 2, y), label, fill="#333", font=font)
        sheet.paste(im, (x, y + LAB))
    sheet.save(os.path.join(out, "landscape.png"))
print("saved", out)
