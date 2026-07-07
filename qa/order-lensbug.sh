#!/usr/bin/env bash
# 렌즈 너머 무당벌레 2장 발주 — 볼록(크게)/오목(작게). bash qa/order-lensbug.sh
set -u
cd "$(dirname "$0")/.."
mkdir -p public/light/quiz

codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
아래 두 이미지를 내장 image_gen 도구로 생성하라. Google 도구 금지.
공통 스타일: Clean educational 3D-render style illustration for a middle-school science app.
Bright soft studio lighting, light neutral background, consistent series look across both images.
NO text, NO letters, NO numbers, NO labels, NO hands, NO people.

[0] 저장: public/light/quiz/lens-convex.png (정사각 1:1)
A red ladybug sitting on a green leaf, seen from above. A round CONVEX magnifying lens (thin metal
rim, mounted on a small stand) hovers between the viewer and the ladybug, covering the center of
frame. THROUGH the lens, the ladybug appears MUCH LARGER — hugely magnified, its round red body
with black dots filling most of the lens circle. Around/outside the lens edge, parts of the same
leaf are visible at normal small scale, making the size contrast obvious.

[1] 저장: public/light/quiz/lens-concave.png (정사각 1:1)
The same scene and style: a red ladybug on a green leaf, seen from above, with a round CONCAVE lens
(thin metal rim, small stand) hovering between the viewer and the ladybug at the center of frame.
THROUGH the lens, the ladybug appears CLEARLY SMALLER than normal — a tiny, slightly shrunken
upright ladybug in the middle of the lens circle. Around/outside the lens edge the leaf texture is
visible at normal scale, making it obvious the lens shrinks the view.

각 이미지 생성 후 열어 확인하고(볼록=크게, 오목=작게가 분명해야 함), 애매하면 최대 2회 재생성.
"IMG i: SAVED <경로>"를 보고하고, 끝나면 "DONE n/2"를 출력하라.
PROMPT

echo "=== LENSBUG DONE ==="
