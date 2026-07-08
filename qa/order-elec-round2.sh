#!/usr/bin/env bash
# 2차 피드백 발주 3장(순차): 병렬 컷 v2(방아 위치) · 그네 자석 단독(코일은 SVG 오버레이 하이브리드) ·
# 전동기 구조(교과서 그림 VII-15 모작, 화살표·손 인셋 없이 — 방향 표기는 SVG 오버레이).
# bash qa/order-elec-round2.sh  (app 루트에서)
set -u
cd "$(dirname "$0")/.."
rm -f public/elec/cuts/parallel.png public/elec/cuts/parallel.webp
rm -f public/elec/figs/swingbase.png public/elec/figs/swingbase.webp
rm -f public/elec/figs/motor2.png public/elec/figs/motor2.webp

codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
내장 image_gen 도구로 이미지 3장을 순서대로 생성하라(Google 도구 금지). 이미지 안 글자·숫자·라벨 절대 금지.

[0] 저장: public/elec/cuts/parallel.png (landscape 4:3)
hand-drawn stick figure comic panel, black ink on clean white paper, thin uniform line weight,
xkcd / whiteboard-marker doodle style, minimalist line art, no shading, flat, charming educational.
Top-down doodle view of two water channel systems side by side, with a small stick figure standing
between them pointing at each. LEFT system: one single straight channel with TWO waterwheels placed
one after another along the SAME channel (in series). RIGHT system: a channel that splits into two
parallel branch channels; EACH branch has exactly ONE waterwheel at the MIDDLE of that branch (so
two wheels total, one per branch, sitting ON the branch paths — NOT at the split point, NOT at the
merge point); then the branches merge back into one channel. The water inside the channels is the
only colored element, teal; everything else pure black and white. absolutely no text.
검수: 오른쪽 시스템에서 물레방아가 각 가지의 중간에 하나씩 있는지 확인하고 아니면 재생성.

[1] 저장: public/elec/figs/swingbase.png (landscape 4:3)
Clean modern educational 3D-style illustration for a middle-school science textbook, soft studio
lighting, gentle shadows, light neutral background, crisp edges, realistic materials.
Physics demonstration on a light wooden desk, seen straight from the front: a U-shaped horseshoe
magnet lying on its side at the center-left, its two straight parallel arms stacked vertically —
TOP arm painted red, BOTTOM arm painted blue — with a clear, dark, empty horizontal slot between
the two arms, open ends pointing to the RIGHT. Above the desk, a horizontal stainless support bar
held by two vertical posts with black bases spans the scene. A small yellow battery in a black
holder sits on the desk at the right. IMPORTANT: there is NO wire, NO copper coil, NO swing, NO
cable anywhere in this image — just the magnet, the empty support stand, and the battery holder.
absolutely no text, no arrows, no people, no hands.

[2] 저장: public/elec/figs/motor2.png (landscape 4:3)
Clean modern educational 3D-style illustration for a middle-school science textbook, soft studio
lighting, gentle shadows, light neutral background, crisp edges, realistic materials.
A simple DC electric motor demonstration model in a slightly elevated three-quarter view:
on the LEFT a large red rectangular magnet block with its flat pole face toward the center;
on the RIGHT a large blue rectangular magnet block with its flat pole face toward the center;
BETWEEN the two blocks floats a single rectangular loop coil of copper wire whose plane lies
HORIZONTAL (flat like a table top), its long sides running left-to-right toward each magnet face.
From the near edge of the coil, the two wire ends bend downward at the front-center into a small
copper split-ring commutator on an axle, with two small dark brush contacts touching it, mounted
on a low gray stand; from the brushes two thin insulated wires run forward toward the bottom edge
of the frame. absolutely no text, no letters, no arrows, no hands, no people.
검수: 코일 평면이 수평(눕힘)인지, 양옆 자석 면 사이에 있는지 확인하고 아니면 재생성.

각 이미지 생성 후 "IMG i: SAVED <경로>" 한 줄씩 보고하고, 전부 끝나면 "DONE n/3"을 출력하라.
PROMPT

echo "=== ROUND2 DONE ==="
ls -la public/elec/cuts/parallel.png public/elec/figs/swingbase.png public/elec/figs/motor2.png 2>/dev/null
