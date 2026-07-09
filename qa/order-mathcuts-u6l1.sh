#!/usr/bin/env bash
# 스틱맨 개념 컷 — 수학 Ⅵ L1 재구성용 추가 2장(u6l1a 대푯값 낚시 대회, u6l1b 중앙값 줄서기) 발주.
# codex auth의 ChatGPT image_gen 사용(단일 배치, 병렬 금지 — tmp/ 충돌).
# bash qa/order-mathcuts-u6l1.sh  (app 루트에서)
set -u
cd "$(dirname "$0")/.."
mkdir -p public/math/cuts

echo "=== BATCH 1/1: math/cuts u6l1a·u6l1b (통계 L1 추가) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/mathcut_prompts.txt 파일을 읽어라. [64][65] 두 개의 이미지 프롬프트가 있다(중1 수학 Ⅵ 대푯값 낚시 대회·중앙값 키순 줄서기).
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·기호 절대 금지.
스틱맨 손이 보이면 손가락은 정확히 5개. 각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/2"을 출력하라.
PROMPT

echo "=== MATH U6L1 EXTRA CUTS ORDER DONE ==="
ls public/math/cuts 2>/dev/null | grep u6l1 || true
