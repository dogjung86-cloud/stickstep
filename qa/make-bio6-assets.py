# -*- coding: utf-8 -*-
"""중1 Ⅱ v5(bio6) 파생 그림 만들기. 새 발주가 아니라 이미 있는 현미경 사진풍 그림을 잘라 쓰는 것이다.
  - 원본은 가장자리가 검은 원형 시야로 구워져 있다. 랩의 관찰 창(원형 클립)에 꼭 맞게 원 부분만 정사각형으로 자른다.
  - onion-mirror: 원 안에 내접하는 정사각형(세포만 가득한 부분)을 거울처럼 2×2로 이어 붙인 타일. 랩의 높은 배율과 문제 그림에 쓴다.
    (낮은 배율에서는 거울 이음매의 대칭 무늬가 보여서, 랩이 같은 크기로 그린 무늬를 쓴다.)
  - cheek-plain: 입안 세포의 염색 전 모습(핵을 메우고 명암을 누른 것).
  - elodea-ao: v4 브랜치(sci-u2-v4)의 발주본 public/bio5/micro/elodea-ao.webp 사본을 인자로 받는다.
  - elodea-ao-plain: 같은 자리 검정말잎의 염색 전 모습(붉은 핵만 메운 것).
usage: python qa/make-bio6-assets.py [v4의 elodea-ao.webp 경로]
"""
import sys, os
from PIL import Image
import numpy as np

OUT = "public/bio6/micro"
os.makedirs(OUT, exist_ok=True)

def circle(im):
    a = np.asarray(im.convert("RGB")).astype(int).sum(axis=2)
    ys, xs = np.where(a > 60)
    cx, cy = (xs.min() + xs.max()) / 2, (ys.min() + ys.max()) / 2
    r = ((xs.max() - xs.min()) + (ys.max() - ys.min())) / 4
    return cx, cy, r

def field(src, name, size, shrink=0.985):
    im = Image.open(src).convert("RGB")
    cx, cy, r = circle(im)
    rr = r * shrink
    box = (round(cx - rr), round(cy - rr), round(cx + rr), round(cy + rr))
    out = im.crop(box).resize((size, size), Image.LANCZOS)
    out.save(os.path.join(OUT, name), "WEBP", quality=88, method=6)
    print(name, out.size, "circle", round(cx), round(cy), round(r))

def tile(src, name, size):
    im = Image.open(src).convert("RGB")
    cx, cy, r = circle(im)
    h = r / (2 ** 0.5) * 0.97  # 내접 정사각형의 반변
    box = (round(cx - h), round(cy - h), round(cx + h), round(cy + h))
    out = im.crop(box).resize((size, size), Image.LANCZOS)
    out.save(os.path.join(OUT, name), "WEBP", quality=88, method=6)
    print(name, out.size)

def mirror(name_in, name_out):
    """타일 한 장을 좌우, 상하로 뒤집어 2×2로 붙인다. 이 그림을 반복하면 이음매가 모두 거울 경계라 세포벽이 끊기지 않는다."""
    t = Image.open(os.path.join(OUT, name_in)).convert("RGB")
    w, h = t.size
    big = Image.new("RGB", (w * 2, h * 2))
    big.paste(t, (0, 0))
    big.paste(t.transpose(Image.FLIP_LEFT_RIGHT), (w, 0))
    big.paste(t.transpose(Image.FLIP_TOP_BOTTOM), (0, h))
    big.paste(t.transpose(Image.FLIP_LEFT_RIGHT).transpose(Image.FLIP_TOP_BOTTOM), (w, h))
    big.save(os.path.join(OUT, name_out), "WEBP", quality=84, method=6)
    a = np.asarray(t).reshape(-1, 3).mean(axis=0)
    print(name_out, big.size, "avg rgb", [round(x) for x in a])

tile("public/bio3/micro/onion.webp", "onion-tile.webp", 640)
mirror("onion-tile.webp", "onion-mirror.webp")
os.remove(os.path.join(OUT, "onion-tile.webp"))  # 거울 타일만 쓴다
field("public/bio3/micro/cheek.webp", "cheek.webp", 512)
if len(sys.argv) > 1 and os.path.exists(sys.argv[1]):
    field(sys.argv[1], "elodea-ao.webp", 640, 0.94)


def unstained(name_in, name_out):
    """염색하기 전의 모습(파생 그림). 푸르게 물든 핵을 둘레 색으로 메우고, 색을 빼고, 명암을 눌러
    세포 윤곽만 아주 옅게 남긴다(염색 전 입안 세포는 거의 투명해서 핵이 잘 보이지 않는다)."""
    from PIL import ImageFilter, ImageOps
    im = Image.open(os.path.join(OUT, name_in)).convert("RGB")
    a = np.asarray(im).astype(np.float32)
    r, b = a[..., 0], a[..., 2]
    lum = 0.3 * a[..., 0] + 0.59 * a[..., 1] + 0.11 * a[..., 2]
    nuc = (lum < 125) & (b - r > 40)  # 진하고 푸른 점 = 핵
    m = Image.fromarray((nuc * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(11)).filter(ImageFilter.GaussianBlur(3))
    filled = Image.composite(im.filter(ImageFilter.MedianFilter(41)), im, m)
    g = np.asarray(ImageOps.grayscale(filled)).astype(np.float32)
    inside = g > 60  # 원형 시야 안쪽
    bg = np.percentile(g[inside], 92)
    out = bg + (g - bg) * 0.42  # 명암을 눌러 흐릿하게
    out = np.clip(out + (247 - bg), 0, 255)
    # 핵이 있던 자리는 아주 옅은 그림자로만 남긴다(전혀 없는 것은 아니다)
    out = out - (np.asarray(m).astype(np.float32) / 255.0) * 7
    out[~inside] = 0
    rgb = np.stack([out, out * 0.995, out * 0.985], axis=-1).clip(0, 255).astype(np.uint8)
    Image.fromarray(rgb).save(os.path.join(OUT, name_out), "WEBP", quality=88, method=6)
    print(name_out, "nucleus px", int(nuc.sum()))


unstained("cheek.webp", "cheek-plain.webp")


def _blur(a, r):
    """2차원 배열의 상자 흐림 세 번(가우스 흐림에 가깝다). PIL 필터는 실수 배열을 못 다뤄 직접 한다."""
    k = 2 * r + 1

    def one(x):
        c = np.cumsum(np.pad(x, ((0, 0), (r + 1, r)), mode="edge"), axis=1, dtype=np.float64)
        return (c[:, k:] - c[:, :-k]) / k

    for _ in range(3):
        a = one(one(a).T).T
    return a


def leaf_unstained(name_in, name_out):
    """아세트올세인으로 물들기 전의 검정말잎(파생 그림). 붉은 핵만 둘레의 옅은 바탕색으로 메운다.
    세포벽과 엽록체는 그대로라서, 같은 자리의 세포를 '물만' 과 '염색 뒤' 로 나란히 견줄 수 있다."""
    from PIL import ImageFilter
    im = Image.open(os.path.join(OUT, name_in)).convert("RGB")
    a = np.asarray(im).astype(np.float64)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    lum = 0.3 * r + 0.59 * g + 0.11 * b
    red = (r - g > 17) & (r > 92)  # 붉은 기가 도는 곳(핵과 그 번짐)
    core = (r - g > 45) & (r > 120)  # 핵의 한가운데
    near = np.asarray(Image.fromarray((core * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(33))) > 0
    hole = red & near
    m = np.asarray(Image.fromarray((hole * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.GaussianBlur(2.6))).astype(np.float64) / 255.0
    # 메울 색: 핵 둘레의 옅은 바탕(밝고 색이 옅은 곳)만 모아 낸 가까운 평균
    pale = (lum > 150) & ((a.max(axis=2) - a.min(axis=2)) < 46) & ~red
    w = _blur(pale.astype(np.float64), 16)
    fill = np.stack([_blur(a[..., i] * pale, 16) / np.maximum(w, 1e-3) for i in range(3)], axis=-1)
    fill[w < 0.02] = np.median(a[pale].reshape(-1, 3), axis=0)  # 둘레에 옅은 곳이 없으면 전체 중앙값
    # 바탕의 잔 알갱이 결(고정 난수)
    rng = np.random.RandomState(7)
    grain = _blur(rng.normal(0, 1, lum.shape), 1) * 13.0 + _blur(rng.normal(0, 1, lum.shape), 4) * 22.0
    fill = fill + grain[..., None]
    out = a * (1 - m[..., None]) + fill * m[..., None]
    Image.fromarray(out.clip(0, 255).astype(np.uint8)).save(os.path.join(OUT, name_out), "WEBP", quality=88, method=6)
    print(name_out, "hole px", int(hole.sum()), "pale px", int(pale.sum()))


leaf_unstained("elodea-ao.webp", "elodea-ao-plain.webp")
