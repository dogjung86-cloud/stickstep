#!/usr/bin/env bash
# 중2 III 거울 문제 사진 2장 + 중2 IV 전기영동 장치 사진 1장 발주 — codex auth의 ChatGPT image_gen 사용.
# bash qa/order-lightatom.sh  (app 루트에서)
set -u
cd "$(dirname "$0")/.."
mkdir -p public/light/quiz public/atom/quiz

codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/lightatom_prompts.txt 파일을 읽어라. [0]~[2] 세 개의 이미지 프롬프트가 있다.
각 프롬프트 앞에 맨 위 "공통 스타일" 블록을 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로:
[0]→public/light/quiz/mirror-convex.png (정사각)
[1]→public/light/quiz/mirror-concave.png (정사각)
[2]→public/atom/quiz/ionmove.png (가로 2:1)
이미지 안에 글자·숫자·알파벳·사람·얼굴 절대 금지.
각 이미지 생성 후 "IMG i: SAVED <경로>" 한 줄씩 보고하고, 전부 끝나면 "DONE n/3"을 출력하라.
PROMPT

echo "=== LIGHTATOM DONE ==="
ls public/light/quiz public/atom/quiz 2>/dev/null
