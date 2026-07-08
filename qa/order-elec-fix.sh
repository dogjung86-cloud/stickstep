#!/usr/bin/env bash
# swing.png 재발주 — 1차분은 자석 두 팔이 좌우 나란(자기장 ∥ 코일 아래변, 힘=0)이라 물리 불합격.
# 위팔 N(빨강)·아래팔 S(파랑) 상하 적층 + 그 틈을 코일 아래변이 가로지르는 교과서 구도로 교정.
# bash qa/order-elec-fix.sh  (app 루트에서)
set -u
cd "$(dirname "$0")/.."
rm -f public/elec/figs/swing.png public/elec/figs/swing.webp

codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
내장 image_gen 도구로 이미지 1장을 생성하라(Google 도구 금지). 저장: public/elec/figs/swing.png (landscape 4:3)
프롬프트:
Clean modern educational 3D-style illustration for a middle-school science textbook, soft studio
lighting, gentle shadows, light neutral background, crisp edges, realistic materials.
A classic physics demonstration apparatus on a light wooden desk, seen from the front:
a U-shaped horseshoe magnet lying on its side so that its two straight pole arms are stacked
VERTICALLY — the TOP arm painted red and the BOTTOM arm painted blue, with a narrow horizontal
gap between the two stacked arms, the open ends of both arms pointing toward the right.
A small rectangular swing made of a single loop of copper wire hangs like a trapeze on two thin
wires from a horizontal metal support bar above; the swing's bottom horizontal copper segment
passes sideways through the horizontal gap BETWEEN the red top arm and the blue bottom arm,
without touching them. Two thin insulated wires run from the top of the swing to a small yellow
battery in a black holder on the desk to the right.
absolutely no text, no letters, no numbers, no labels, no arrows, no people, no hands.
생성 후 "IMG 0: SAVED public/elec/figs/swing.png" 보고, "DONE 1/1" 출력.
PROMPT

echo "=== SWING FIX DONE ==="
ls -la public/elec/figs/swing.png 2>/dev/null
