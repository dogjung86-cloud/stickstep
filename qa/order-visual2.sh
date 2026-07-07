#!/usr/bin/env bash
# 2차 비주얼 발주 8장 — 원자 훅 3(정사각) + 전기영동 후 1(2:1) + recap 실사 4(4:3).
# bash qa/order-visual2.sh  (app 루트에서)
set -u
cd "$(dirname "$0")/.."
mkdir -p public/atom/hook public/atom/quiz public/recap

codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/visual2_prompts.txt 파일을 읽어라. [0]~[7] 여덟 개의 이미지 프롬프트가 있다.
각 프롬프트 앞에 해당하는 "공통 스타일"(A 또는 B) 블록을 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용.
저장 경로와 종횡비는 각 프롬프트의 file= 에 적힌 그대로.
이미지 안에 글자·숫자·알파벳·사람·얼굴 절대 금지.
[2]는 전자·궤도·타원이 절대 들어가면 안 된다(핵 덩어리만) — 생성 후 이미지를 열어 확인하고,
전자나 궤도 고리가 보이면 최대 2회 다시 생성해 조건을 지킨 것을 저장하라.
각 이미지 생성 후 "IMG i: SAVED <경로>" 한 줄씩 보고하고, 전부 끝나면 "DONE n/8"을 출력하라.
PROMPT

echo "=== VISUAL2 DONE ==="
