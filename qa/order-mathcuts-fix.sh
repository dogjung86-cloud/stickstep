#!/usr/bin/env bash
# u1l1 재발주 — 벽돌 9개(3×3=합성수 반례)로 그려진 초판을 7개(진짜 소수) 구도로 교정.
# bash qa/order-mathcuts-fix.sh  (app 루트에서)
set -u
cd "$(dirname "$0")/.."

codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/mathcut_prompts.txt 파일 위쪽 "스타일 블록 A"를 그대로 앞에 붙여, 아래 프롬프트로 내장 image_gen 이미지를 1장 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 가로 4:3. 이미지 안에 글자·숫자·기호 절대 금지.
저장 경로: public/math/cuts/u1l1.png (기존 파일 덮어쓰기)

Two stick figures arranging small identical bricks on the ground. The left figure has arranged exactly eight bricks into a neat filled rectangle of two even rows of four, and stands proud with arms on hips. The right figure has exactly seven bricks: the top row has four bricks, but the bottom row has only three bricks and one obvious empty gap where the eighth brick would complete the rectangle; a dashed outline marks that one empty missing spot, and the figure scratches their head staring at it. Count the bricks carefully: left figure exactly eight bricks total, right figure exactly seven bricks total plus one dashed empty outline. Only that dashed empty outline is teal; everything else pure black and white.

생성 후 "IMG 0: SAVED public/math/cuts/u1l1.png"를 출력하고 "DONE 1/1"을 출력하라.
PROMPT
echo "=== FIX DONE ==="
