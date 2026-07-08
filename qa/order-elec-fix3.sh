#!/usr/bin/env bash
# swing.png 4차 — 코일 아래변이 자석 틈 "안"으로: 가림(오클루전) 단서로 삽입을 강제.
# bash qa/order-elec-fix3.sh  (app 루트에서)
set -u
cd "$(dirname "$0")/.."
rm -f public/elec/figs/swing.png public/elec/figs/swing.webp

codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
내장 image_gen 도구로 이미지 1장을 생성하라(Google 도구 금지). 저장: public/elec/figs/swing.png (landscape 4:3)
프롬프트:
Clean modern educational 3D-style illustration for a middle-school science textbook, soft studio
lighting, gentle shadows, light neutral background, crisp edges, realistic materials.
Physics demonstration on a light wooden desk, seen from the front at a very slight three-quarter angle:
a U-shaped horseshoe magnet lying sideways at the CENTER of the frame, its two straight parallel
arms stacked vertically — TOP arm painted red, BOTTOM arm painted blue — with a clear horizontal
slot-like gap between the two arms, the open ends of the arms pointing to the RIGHT.
A rectangular trapeze swing bent from a single copper wire hangs on two vertical copper wires from
a horizontal metal support bar above. The swing hangs DIRECTLY OVER the open ends of the magnet
arms, so that its bottom horizontal copper bar dips INTO the slot between the red top arm and the
blue bottom arm. COMPOSITION KEY: the left half of the copper bottom bar is INSIDE the slot and
partially HIDDEN BEHIND the red top arm's right end, while the right half of the bar sticks out of
the slot and remains fully visible — this occlusion makes it obvious that the bar passes through
the gap. The red arm is directly above the hidden part of the bar; the blue arm is directly below it.
Two thin insulated wires (one red, one black) run from the swing's upper corners to a small yellow
battery in a black holder on the desk at the right.
Verify before saving: (1) part of the copper bottom bar is occluded by the red arm, (2) the bar
visibly passes between red and blue arms, (3) the swing is a tidy rectangle, (4) no text, no
letters, no numbers, no labels, no arrows, no people, no hands. If any check fails, regenerate.
생성 후 "IMG 0: SAVED public/elec/figs/swing.png" 보고, "DONE 1/1" 출력.
PROMPT

echo "=== SWING FIX3 DONE ==="
ls -la public/elec/figs/swing.png 2>/dev/null
