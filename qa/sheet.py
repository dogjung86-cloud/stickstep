# 캡처 여러 장을 한 줄(또는 여러 줄)로 붙여 한 장으로 만든다.
# python qa/sheet.py <출력.png> <열 수> <축소 폭> <그림1> <그림2> ... [--labels 가|나|다]
import sys
from PIL import Image, ImageDraw, ImageFont

out, cols, w = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
args = sys.argv[4:]
labels = None
if "--labels" in args:
    i = args.index("--labels")
    labels = args[i + 1].split("|")
    args = args[:i]
ims = [Image.open(p).convert("RGB") for p in args]
ims = [im.resize((w, round(im.height * w / im.width)), Image.LANCZOS) for im in ims]
pad, lab = 14, 30 if labels else 0
rows = (len(ims) + cols - 1) // cols
h = max(im.height for im in ims)
sheet = Image.new("RGB", (cols * (w + pad) + pad, rows * (h + pad + lab) + pad), "#E9ECEF")
d = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype("C:/Windows/Fonts/malgunbd.ttf", 17)
except Exception:
    font = ImageFont.load_default()
for i, im in enumerate(ims):
    x = pad + (i % cols) * (w + pad)
    y = pad + (i // cols) * (h + pad + lab)
    if labels and i < len(labels):
        d.text((x + 2, y + 3), labels[i], fill="#212529", font=font)
    sheet.paste(im, (x, y + lab))
    d.rectangle([x - 1, y + lab - 1, x + im.width, y + lab + im.height], outline="#ADB5BD")
sheet.save(out)
print("saved", out, sheet.size)
