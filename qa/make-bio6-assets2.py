# -*- coding: utf-8 -*-
"""중1 Ⅱ v5(bio6) 4~10번 레슨용 그림 준비. 새 발주가 아니라 이미 있는 그림의 사본과 파생이다.
  - life/: 생물 토큰(흰 바탕 정사각형 320px). v4 브랜치(sci-u2-v4)가 발주해 둔 public/bio5/icons 가운데 여섯 장의 사본
    (박쥐, 갈매기, 다람쥐, 들고양이, 사자, 곰)과, bio3/vary/cats.webp에서 한 마리만 잘라 낸 고양이.
  - levels/: 구성 단계 그림(투명 바탕 480px). v4 브랜치의 public/bio5/figs 네 장(상피세포, 상피조직, 위, 소화계) 사본.
usage: python qa/make-bio6-assets2.py "<v4 워크트리의 public/bio5 경로>"
"""
import sys, os
from PIL import Image
import numpy as np

if len(sys.argv) < 2 or not os.path.isdir(sys.argv[1]):
    sys.exit("v4 워크트리의 public/bio5 경로를 인자로 준다")
V4 = sys.argv[1]
LIFE = "public/bio6/life"
LEVELS = "public/bio6/levels"
os.makedirs(LIFE, exist_ok=True)
os.makedirs(LEVELS, exist_ok=True)

for name in ["bat", "gull", "chipmunk", "wildcat", "lion", "bear"]:
    im = Image.open(os.path.join(V4, "icons", name + ".webp")).convert("RGB").resize((320, 320), Image.LANCZOS)
    im.save(os.path.join(LIFE, name + ".webp"), "WEBP", quality=86, method=6)
    print("life", name, im.size)

for name in ["epi-cell", "epi-tissue", "stomach", "digestive"]:
    im = Image.open(os.path.join(V4, "figs", name + ".webp")).convert("RGBA").resize((480, 480), Image.LANCZOS)
    im.save(os.path.join(LEVELS, name + ".webp"), "WEBP", quality=86, method=6)
    print("levels", name, im.size)

# 고양이: 여섯 마리가 나란히 앉은 그림에서 둘째(주황 줄무늬)만 잘라 낸다.
src = Image.open("public/bio3/vary/cats.webp").convert("RGB")
a = np.asarray(src).astype(np.float32)
bg = a[230, 5].copy()  # 크림색 바탕
x0, x1, y0, y1 = 176, 368, 200, 566
c = a[y0:y1, x0:x1].copy()
lum = 0.3 * c[..., 0] + 0.59 * c[..., 1] + 0.11 * c[..., 2]
xs = np.arange(x0, x1)[None, :].repeat(c.shape[0], axis=0)
ys = np.arange(y0, y1)[:, None].repeat(c.shape[1], axis=1)
from PIL import ImageFilter

plain = c[..., 0] - c[..., 2] < 30  # 주황빛이 없는 곳(옆 고양이와 바탕)
left = (xs < 216) & plain & (lum < 215)  # 왼쪽 검은 고양이의 등(주황 고양이의 흰 주둥이는 남긴다)
right = (((xs > 342) & (ys < 494)) | (xs > 360)) & plain  # 오른쪽 회색 고양이(주황 고양이의 꼬리는 주황빛이라 남는다)
right |= (xs > 340) & (ys < 336)  # 회색 고양이의 얼굴(노란 눈은 주황빛이라 위 규칙에 걸리지 않는다)
m = Image.fromarray(((left | right) * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))
c[np.asarray(m) > 0] = bg
c = np.clip(c * (255.0 / bg), 0, 255)  # 크림색 바탕을 흰색으로
cat = Image.fromarray(c.astype(np.uint8))
side = max(cat.size) + 24
sq = Image.new("RGB", (side, side), (255, 255, 255))
sq.paste(cat, ((side - cat.width) // 2, (side - cat.height) // 2))
sq = sq.resize((320, 320), Image.LANCZOS)
sq.save(os.path.join(LIFE, "cat.webp"), "WEBP", quality=86, method=6)
print("life cat", sq.size, "painted", int(left.sum()), int(right.sum()))
