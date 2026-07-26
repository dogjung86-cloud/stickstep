#!/usr/bin/env bash
# 도전 탭 게임 카드 키 비주얼 4종 — codex auth의 ChatGPT image_gen 사용(1배치, 병렬 codex 금지 확인 후 실행).
# bash qa/order-gamecards.sh  (app 루트에서) → node qa/process-gamecards.mjs 로 webp 변환
set -u
cd "$(dirname "$0")/.."
mkdir -p public/game/cards

echo "=== BATCH 1/1: gamecards [0]~[3] (cosmo·rush·laser·stroke) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/gamecard_prompts.txt 파일을 읽어라. [0][1][2][3] 네 개의 게임 카드 키 비주얼 프롬프트가 있다.
각 프롬프트 앞에 파일 위쪽 "스타일 블록 G"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 3:2(1536x1024).
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳 절대 금지.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "GAMECARDS ORDER DONE n/4"를 출력하라.
PROMPT

echo "=== 발주 완료 → node qa/process-gamecards.mjs 로 webp 변환 ==="
