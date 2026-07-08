#!/usr/bin/env bash
# swing.png 3차 — 2차분은 코일 그네가 자석 틈 밖(오른쪽)에 떠 있고 사각형이 비뚤 —
# 아래변이 두 팔 "사이"에 정확히 들어간 반듯한 직사각 코일로 재발주.
# bash qa/order-elec-fix2.sh  (app 루트에서)
set -u
cd "$(dirname "$0")/.."
rm -f public/elec/figs/swing.png public/elec/figs/swing.webp

codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
내장 image_gen 도구로 이미지 1장을 생성하라(Google 도구 금지). 저장: public/elec/figs/swing.png (landscape 4:3)
프롬프트:
Clean modern educational 3D-style illustration for a middle-school science textbook, soft studio
lighting, gentle shadows, light neutral background, crisp edges, realistic materials.
Physics demonstration on a light wooden desk, seen straight from the front:
a U-shaped horseshoe magnet lying sideways, its two straight parallel arms stacked vertically —
TOP arm painted red, BOTTOM arm painted blue — with a clear horizontal gap between them,
open ends pointing to the RIGHT.
A trapeze swing made of one bent copper wire hangs from a horizontal support bar above:
two straight vertical copper wires coming down, joined at the bottom by one straight horizontal
copper bar — a neat, clean, symmetric rectangle shape.
CRITICAL GEOMETRY: the swing's bottom horizontal copper bar is inserted INTO the horizontal gap
of the magnet — the red top arm is directly ABOVE the copper bar and the blue bottom arm is
directly BELOW the copper bar, so the bar sits sandwiched between the two arms near their open
ends, touching neither. Two thin insulated wires run from the swing's top to a small yellow
battery in a black holder on the desk to the right.
Before saving, verify: (1) the copper bar passes between the red and blue arms, (2) the swing is
a tidy rectangle, (3) no text, no letters, no numbers, no labels, no arrows, no people, no hands.
If any check fails, regenerate.
생성 후 "IMG 0: SAVED public/elec/figs/swing.png" 보고, "DONE 1/1" 출력.
PROMPT

echo "=== SWING FIX2 DONE ==="
ls -la public/elec/figs/swing.png 2>/dev/null
