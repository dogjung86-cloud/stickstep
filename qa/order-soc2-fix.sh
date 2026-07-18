#!/usr/bin/env bash
# 사회 Ⅱ 컷 재발주 — u2l1 대륙 퍼즐의 실루엣이 아프리카처럼 나온 건 수정(아시아 모양 명시).
# bash qa/order-soc2-fix.sh  (app 루트에서) → node qa/process-geo.mjs 로 webp 변환
# 원 프롬프트는 qa/soc2_prompts.txt [0] — "one big continent"라 모양 지시가 없던 것이 원인.
set -u
cd "$(dirname "$0")/.."
rm -f public/soc/cuts/u2l1.png

codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
내장 image_gen 도구로 이미지 1장을 생성하라. Google 도구 금지. 종횡비 가로 4:3.
저장 경로: public/soc/cuts/u2l1.png (이미 있으면 덮어쓰기 대신 삭제 후 저장).
이미지 안에 글자·숫자·알파벳·기호 절대 금지. 스틱맨 손이 보이면 손가락은 정확히 5개.

스타일: hand-drawn stick figure comic panel, black ink on clean white paper, thin uniform line
weight, xkcd / whiteboard-marker doodle style, minimalist line art, no shading, no gradients,
flat, charming educational. The recurring stick-figure character: plain round circle head, simple
dot eyes, stick arms and legs, exactly five fingers where hands are drawn. Exactly one restrained
accent color, teal, used only where the prompt says; everything else pure black and white.
absolutely no text, no letters, no numbers, no words, no speech bubbles, no captions, no labels,
no symbols anywhere in the image. NOT 3D, NOT photorealistic, NOT glossy render, NOT anime.
Landscape 4:3, single panel, generous white space.

장면: A stick figure kneels on the floor happily assembling a giant five-piece jigsaw puzzle
shaped like the ASIAN continent. The continent silhouette MUST read as Asia: a very WIDE landmass
(clearly wider than tall) with a long, nearly straight northern edge; a triangular peninsula
hanging down from the middle of the southern coast (like the Indian subcontinent); a smaller
boxy peninsula at the far southwest (like Arabia); and a scattered arc of a few small islands
trailing off the southeast corner. It must NOT look like Africa — do NOT draw one tall rounded
blob. Each of the five puzzle pieces has a different simple doodle pattern (tiny mountains, tiny
palm trees, tiny waves, tiny dunes, tiny grass tufts). One piece is still in the figure's raised
hand, about to be placed. Only that hand-held puzzle piece is teal; everything else pure black
and white.

끝나면 "IMG FIX: SAVED public/soc/cuts/u2l1.png"와 "DONE 1/1"을 출력하라.
PROMPT

echo "=== SOC2 FIX ORDER DONE ==="
ls -la public/soc/cuts/u2l1.* 2>/dev/null
