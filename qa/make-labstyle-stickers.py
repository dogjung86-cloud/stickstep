# 랩의 다른 느낌 샘플(종이 콜라주): 흰 바탕 생물 그림을 "오려 낸 스티커"로 만든다.
#   python qa/make-labstyle-stickers.py
# 하는 일: 바탕(가장자리와 이어진 흰색)을 걷고, 생물의 윤곽에서 바깥으로 조금 물러난 선을 따라 오린다.
#   오린 선은 가위질처럼 살짝 들쭉날쭉하다. 흰 테두리는 원본의 흰 바탕을 그대로 남긴 것이다.
#   새 그림을 만들지 않는다. 있는 발주본(public/bio6/life)을 다시 자를 뿐이다.
# 결과: public/labstyle/collage/<이름>.webp(투명 배경)와 크기 표(콘솔 출력. 랩 코드의 STICKER에 옮겨 적는다).
import os
import sys
import numpy as np
import cv2
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SRC = {
    "gull": "public/bio6/life/gull.webp",
    "bat": "public/bio6/life/bat.webp",
    "chipmunk": "public/bio6/life/chipmunk.webp",
}
OUT = os.path.join(ROOT, "public", "labstyle", "collage")
os.makedirs(OUT, exist_ok=True)

MARGIN = 9.0   # 윤곽에서 물러나는 거리(원본 320px 기준 px)
WOBBLE = 2.6   # 가위질의 들쭉날쭉
UP = 2         # 가장자리를 매끈하게 하려고 키워서 작업한다
PAD = 16       # 원본 둘레에 두르는 흰 여백(px)


def smooth_noise(h, w, seed, cell=46):
    rng = np.random.default_rng(seed)
    small = rng.random((h // cell + 3, w // cell + 3)).astype(np.float32)
    big = cv2.resize(small, (w, h), interpolation=cv2.INTER_CUBIC)
    return big * 2 - 1


for i, (name, rel) in enumerate(SRC.items()):
    im = Image.open(os.path.join(ROOT, rel)).convert("RGB")
    rgb = np.asarray(im).astype(np.uint8)
    # 날개가 그림 끝까지 닿는 생물(박쥐)은 오린 선이 그림 밖으로 나가므로 흰 여백을 먼저 두른다
    rgb = cv2.copyMakeBorder(rgb, PAD, PAD, PAD, PAD, cv2.BORDER_CONSTANT, value=(254, 254, 254))
    rgb = cv2.resize(rgb, (rgb.shape[1] * UP, rgb.shape[0] * UP), interpolation=cv2.INTER_CUBIC)
    h, w = rgb.shape[:2]
    lum = rgb.min(axis=2)  # 가장 어두운 채널: 흰색에서 벗어난 정도
    # 바탕: 네 가장자리와 이어진 거의 흰 곳
    near_white = (lum >= 243).astype(np.uint8)
    ff = near_white.copy()
    mask = np.zeros((h + 2, w + 2), np.uint8)
    for x in range(0, w, 4):
        for y in (0, h - 1):
            if ff[y, x] == 1:
                cv2.floodFill(ff, mask, (x, y), 2)
    for y in range(0, h, 4):
        for x in (0, w - 1):
            if ff[y, x] == 1:
                cv2.floodFill(ff, mask, (x, y), 2)
    subject = (ff != 2).astype(np.uint8)
    # 작은 티끌은 버리고 가장 큰 덩어리와 그 가까이의 것만 남긴다
    n, lab, stats, _ = cv2.connectedComponentsWithStats(subject, 8)
    keep = np.zeros_like(subject)
    big = max(range(1, n), key=lambda k: stats[k, cv2.CC_STAT_AREA])
    for k in range(1, n):
        if stats[k, cv2.CC_STAT_AREA] >= 0.004 * stats[big, cv2.CC_STAT_AREA]:
            keep[lab == k] = 1
    # 윤곽에서 바깥으로 물러난 선(거리 변환 + 들쭉날쭉)
    dist = cv2.distanceTransform((1 - keep).astype(np.uint8), cv2.DIST_L2, 5)
    r = (MARGIN + WOBBLE * smooth_noise(h, w, 7 + i)) * UP
    sticker = (dist <= r).astype(np.uint8)
    # 안쪽 구멍 메우기(다리 사이 같은 좁은 틈은 종이로 남는다)
    inv = (1 - sticker).astype(np.uint8)
    m2 = np.zeros((h + 2, w + 2), np.uint8)
    cv2.floodFill(inv, m2, (0, 0), 2)
    sticker[inv == 1] = 1
    alpha = cv2.GaussianBlur(sticker.astype(np.float32), (0, 0), 1.2 * UP)
    alpha = np.clip((alpha - 0.5) * 4 + 0.5, 0, 1)
    ys, xs = np.where(alpha > 0.02)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    # 종이 빛깔: 아주 옅은 미색을 곱한다(순백 스티커가 화면에서 뜨지 않게)
    paper = np.array([253, 252, 247], np.float32) / 255
    out = np.dstack([np.clip(rgb.astype(np.float32) * paper, 0, 255), alpha * 255]).astype(np.uint8)[y0:y1, x0:x1]
    img = Image.fromarray(out, "RGBA")
    # 화면에서 가장 크게 쓰는 폭이 130px쯤이라 2배면 넉넉하다
    scale = min(1.0, 300 / max(img.size))
    img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
    path = os.path.join(OUT, f"{name}.webp")
    img.save(path, "WEBP", quality=88, method=6)
    print(f"{name}: {img.width}x{img.height} ratio {img.width / img.height:.3f} {os.path.getsize(path) / 1024:.1f}KB")
