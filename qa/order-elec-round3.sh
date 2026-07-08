#!/usr/bin/env bash
# 3차 피드백 발주(순차): 병렬 컷 v3(세로 물길 — 물이 위→아래) + 그네 자석 직립 2상태(코일은 SVG 오버레이).
# bash qa/order-elec-round3.sh  (app 루트에서)
set -u
cd "$(dirname "$0")/.."
rm -f public/elec/cuts/parallel.png public/elec/cuts/parallel.webp
rm -f public/elec/figs/swingtab-a.png public/elec/figs/swingtab-a.webp
rm -f public/elec/figs/swingtab-b.png public/elec/figs/swingtab-b.webp

codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
내장 image_gen 도구로 이미지 3장을 순서대로 생성하라(Google 도구 금지). 이미지 안 글자·숫자·라벨·화살표 절대 금지.

[0] 저장: public/elec/cuts/parallel.png (landscape 4:3)
hand-drawn stick figure comic panel, black ink on clean white paper, thin uniform line weight,
xkcd / whiteboard-marker doodle style, minimalist line art, no shading, flat, charming educational.
Front view of two VERTICAL water channel systems side by side, water flowing from TOP to BOTTOM
(downhill), with a small stick figure standing between them pointing at each.
LEFT system: one single straight VERTICAL channel; TWO waterwheels are mounted on this same
channel, one above the other (in series), water passing the upper wheel first then the lower wheel.
RIGHT system: a vertical channel that splits into TWO parallel vertical branch channels; EACH
branch has exactly ONE waterwheel at the MIDDLE of that branch (two wheels total, side by side at
the same height, one per branch — NOT at the split, NOT at the merge); the branches merge back
into one channel at the bottom. The water inside the channels is the only colored element, teal;
everything else pure black and white. absolutely no text.
검수: 물길이 세로(위→아래)인지, 오른쪽은 가지마다 방아 1개(같은 높이)인지 확인 후 아니면 재생성.

[1] 저장: public/elec/figs/swingtab-a.png (square 1:1)
Clean modern educational 3D-style illustration for a middle-school science textbook, soft studio
lighting, gentle shadows, plain light background, crisp edges, realistic materials.
A large U-shaped horseshoe magnet standing UPRIGHT in a three-quarter view, like the letter C:
its curved gray steel body on the LEFT, and its two straight parallel arms pointing to the RIGHT,
one arm directly above the other with a wide gap between them. The end section of the TOP arm is
painted BLUE and the end section of the BOTTOM arm is painted RED; the rest of the magnet is bare
gray steel. Nothing else in the scene — NO coil, NO wire, NO stand, NO desk. Centered, large.
absolutely no text, no arrows, no people, no hands.

[2] 저장: public/elec/figs/swingtab-b.png (square 1:1)
Exactly the same upright U-shaped horseshoe magnet scene as the previous image, same pose, same
camera, same lighting — but with the arm colors SWAPPED: the end section of the TOP arm painted
RED and the end section of the BOTTOM arm painted BLUE. Nothing else in the scene — NO coil,
NO wire, NO stand, NO desk. absolutely no text, no arrows, no people, no hands.

각 이미지 생성 후 "IMG i: SAVED <경로>" 한 줄씩 보고하고, 전부 끝나면 "DONE n/3"을 출력하라.
PROMPT

echo "=== ROUND3 DONE ==="
ls -la public/elec/cuts/parallel.png public/elec/figs/swingtab-a.png public/elec/figs/swingtab-b.png 2>/dev/null
