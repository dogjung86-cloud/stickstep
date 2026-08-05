#!/usr/bin/env bash
# 중2 Ⅵ 소화계 해부 일러스트 2장 발주 — 프롬프트 정본은 qa/body_digest_prompts.txt
# 사용: bash qa/order-body-digest.sh   (병렬 codex 금지 — 다른 발주가 없을 때만)
# 발주 뒤: node qa/process-geo.mjs (public/body/digest는 ASPECT_DIRS 등록 필요)
set -u
cd "$(dirname "$0")/.."
mkdir -p public/body/digest

codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
You have an image generation tool available. Use ONLY that built-in tool.
Do NOT use Google ImageFX / Flow / Imagen / Gemini or any web browsing.

Generate 2 images and save them to these EXACT paths (relative to the current directory):
  1 -> public/body/digest/tract.png
  2 -> public/body/digest/villi-wall.png

Shared style (apply to BOTH images):
Clean educational science illustration for a Korean middle-school biology app.
Flat vector-like medical illustration, soft cel shading, gentle warm anatomy palette
(muted rose/coral organs, soft cream background), thin darker outlines of the same hue
(NOT uniform black outlines), subtle top-left key light, no harsh gradients, no glossy
3D render, no photorealism.
ABSOLUTELY NO TEXT, NO LETTERS, NO NUMBERS, NO LABELS, NO WATERMARK anywhere in the image.
No human face, no full body figure, no gore, no blood. Aspect ratio 4:3.
Centered composition with generous margins.

IMAGE 1 (public/body/digest/tract.png):
The human digestive tract shown alone on a plain soft cream background, front view,
anatomically ordered top to bottom and clearly separated so each organ is individually
recognizable: mouth/oral cavity at top, a long narrow esophagus tube, a curved J-shaped
stomach on the viewer's left-of-center, a large lobed liver at upper right of the abdomen,
a small pear-shaped gallbladder tucked under the liver, an elongated pancreas lying behind
and below the stomach, a long coiled small intestine filling the center of the abdomen,
and a wider inverted-U large intestine framing the coiled small intestine on the outside,
ending at a short rectum. Each organ in a slightly different tint of the warm palette so
they read apart at a glance. No body outline silhouette, no bones. No text at all.

IMAGE 2 (public/body/digest/villi-wall.png):
Cutaway view of the inner wall of the small intestine showing why its surface area is huge:
a curved section of intestinal wall opened toward the viewer, its inner surface thrown into
several large circular folds (ridges), and the entire surface of those folds densely
carpeted with countless tiny finger-like projections (villi) standing upright like plush
velvet or a dense field of soft fingers. Emphasize density and repetition of the tiny
projections. Warm pink-coral tissue palette. Do NOT draw any magnifying glass, callout
circle, leader line, ruler or scale bar. No text, no letters, no numbers anywhere.

After saving each file, print exactly: IMG i: SAVED <path>
When both are done print exactly: DONE 2/2
PROMPT
