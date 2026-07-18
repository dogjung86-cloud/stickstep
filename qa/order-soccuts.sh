#!/usr/bin/env bash
# 사회 Ⅰ 스틱맨 개념 컷 6장 — codex auth의 ChatGPT image_gen 사용(단일 배치, 병렬 codex 금지).
# bash qa/order-soccuts.sh  (app 루트에서) → node qa/process-geo.mjs 로 webp 변환
set -u
cd "$(dirname "$0")/.."
mkdir -p public/soc/cuts

echo "=== BATCH 1/1: soc/cuts 6장 (사회 I) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/soccuts_prompts.txt 파일을 읽어라. [0]~[5] 여섯 개의 이미지 프롬프트가 있다(사회 I 개념 컷).
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·기호 절대 금지.
스틱맨 손이 보이면 손가락은 정확히 5개.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/6"을 출력하라.
PROMPT

echo "=== SOC CUTS ORDER DONE ==="
ls public/soc/cuts 2>/dev/null
