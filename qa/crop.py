# 캡처에서 한 부분을 잘라 여러 장을 격자로 붙인다(무대만 크게 보는 용도).
# python qa/crop.py <출력.png> <열 수> <x> <y> <w> <h> <그림1> <그림2> ... [--labels 가|나]
import sys
from PIL import Image, ImageDraw, ImageFont

out, cols = sys.argv[1], int(sys.argv[2])
x, y, w, h = [int(v) for v in sys.argv[3:7]]
args = sys.argv[7:]
labels = None
if "--labels" in args:
    i = args.index("--labels")
    labels = args[i + 1].split("|")
    args = args[:i]
ims = [Image.open(p).convert("RGB").crop((x, y, x + w, y + h)) for p in args]
pad, lab = 12, 28 if labels else 0
rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (cols * (w + pad) + pad, rows * (h + pad + lab) + pad), "#E9ECEF")
d = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype("C:/Windows/Fonts/malgunbd.ttf", 18)
except Exception:
    font = ImageFont.load_default()
for i, im in enumerate(ims):
    px = pad + (i % cols) * (w + pad)
    py = pad + (i // cols) * (h + pad + lab)
    if labels and i < len(labels):
        d.text((px + 2, py + 2), labels[i], fill="#212529", font=font)
    sheet.paste(im, (px, py + lab))
sheet.save(out)
print("saved", out, sheet.size)
