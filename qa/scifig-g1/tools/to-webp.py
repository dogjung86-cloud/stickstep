# PNG를 webp로 바꾼다(그림 빌드가 부른다).
# python to-webp.py <입력 png> <출력 webp> [품질=86] [출력 가로 픽셀, 0이면 그대로]
import sys
from PIL import Image

src, dst = sys.argv[1], sys.argv[2]
q = int(sys.argv[3]) if len(sys.argv) > 3 else 86
ow = int(sys.argv[4]) if len(sys.argv) > 4 else 0
im = Image.open(src).convert("RGB")
if ow and im.width != ow:
    im = im.resize((ow, round(im.height * ow / im.width)), Image.LANCZOS)
im.save(dst, "WEBP", quality=q, method=6)
