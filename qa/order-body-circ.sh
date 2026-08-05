#!/usr/bin/env bash
# 중2 Ⅵ 이중 순환(허파순환·온몸순환) 다이어그램 재발주 — 사용자 지시 2026-08-06
# "어디가 대동맥이고 폐정맥인지 전혀 알 수 없는 그림" → 교과서형 배치로 다시.
# 라벨(대동맥·폐동맥·폐정맥·대정맥·네 방)은 앱이 한글로 얹으므로 이미지 안 글자 금지.
# 사용: bash qa/order-body-circ.sh   (병렬 codex 금지)
# 발주 뒤: node qa/process-geo.mjs
set -u
cd "$(dirname "$0")/.."
mkdir -p public/body/digest

codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
You have an image generation tool available. Use ONLY that built-in tool.
Do NOT use Google ImageFX / Flow / Imagen / Gemini or any web browsing.

Generate 1 image and save it to this EXACT path (relative to the current directory):
  public/body/digest/circulation.png

A clean textbook-style diagram of the human DOUBLE CIRCULATION for a Korean
middle-school biology app. Flat vector-like medical illustration, soft cel shading,
thin darker outlines of the same hue (NOT uniform black), plain soft cream background,
no glossy 3D render, no photorealism.

Layout (follow exactly, it must be readable as a circuit):
- TOP: a pair of lungs, drawn small and simple, centered.
- MIDDLE: a heart in cross-section drawn as a clear 2x2 grid of FOUR separated chambers.
  The two chambers on the viewer's LEFT are filled BLUE; the two on the viewer's RIGHT
  are filled RED. Upper chambers smaller, lower chambers larger with visibly thicker
  muscular walls, and the LOWER-RIGHT chamber wall clearly the thickest of all.
- BOTTOM: a cluster of rounded body tissue cells, centered.
- FOUR thick tube-shaped vessels, each a separate smooth pipe with an arrowhead showing
  flow direction. THE ATTACHMENT POINT OF EACH PIPE IS CRITICAL — attach exactly as listed:
  (a) BLUE pipe: starts at the **LOWER-LEFT** chamber, runs up the left side to the lungs.
      (It must NOT start at the upper-left chamber.)
  (b) RED pipe: starts at the lungs, runs down the right side into the **UPPER-RIGHT** chamber.
  (c) RED pipe: starts at the **LOWER-RIGHT** chamber, runs down the right side to the tissue cells.
  (d) BLUE pipe: starts at the tissue cells, runs up the left side into the **UPPER-LEFT** chamber.
      (It must NOT enter the lower-left chamber.)
So on the LEFT side the pipe going UP to the lungs leaves the BOTTOM chamber, while the pipe
coming UP from the tissue enters the TOP chamber — the two left pipes attach to DIFFERENT
chambers and must not be swapped.
Keep the four pipes well separated with clear gaps so none of them overlap or cross,
and leave generous empty margin beside each pipe so labels can be placed later.
Blue = oxygen-poor blood, red = oxygen-rich blood.

ABSOLUTELY NO TEXT, NO LETTERS, NO NUMBERS, NO LABELS, NO WATERMARK anywhere.
No human figure, no face, no gore. Aspect ratio 4:3.

After saving print exactly: IMG 1: SAVED public/body/digest/circulation.png
Then print exactly: DONE 1/1
PROMPT
