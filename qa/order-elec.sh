#!/usr/bin/env bash
# 중2 VII 전기와 자기 발주 17장 — codex auth의 ChatGPT image_gen 사용(순차 3배치, 병렬 금지).
# bash qa/order-elec.sh  (app 루트에서)
set -u
cd "$(dirname "$0")/.."
mkdir -p public/elec/hook public/elec/figs public/elec/cuts

echo "=== BATCH 1/3: hook 6장 ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/elec_prompts.txt 파일을 읽어라. [0]~[5] 여섯 개의 이미지 프롬프트가 있다(훅 3장면 × calm/zap 2상태).
각 프롬프트 앞에 파일 맨 위 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비는 각 항목 표기(전부 정사각 1:1).
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
같은 장면의 calm/zap 쌍은 구도·소품 배치가 최대한 같아 보이게 생성하라.
이미지 안에 글자·숫자·알파벳 절대 금지.
각 이미지 생성 후 "IMG i: SAVED <경로>" 한 줄씩 보고하고, 전부 끝나면 "DONE n/6"을 출력하라.
PROMPT

echo "=== BATCH 2/3: figs 5장 ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/elec_prompts.txt 파일을 읽어라. [6]~[10] 다섯 개의 이미지 프롬프트가 있다(교과서 일러스트).
각 프롬프트 앞에 파일 맨 위 "스타일 블록 B"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비는 각 항목 표기([6]은 2:1, 나머지 4:3).
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
이미지 안에 글자·숫자·알파벳·라벨·화살표 절대 금지. [7][8]의 손은 손가락이 정확히 5개여야 한다 —
생성 후 손가락 개수를 스스로 검수하고 이상하면 다시 생성하라.
각 이미지 생성 후 "IMG i: SAVED <경로>" 한 줄씩 보고하고, 전부 끝나면 "DONE n/5"를 출력하라.
PROMPT

echo "=== BATCH 3/3: cuts 6장 ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/elec_prompts.txt 파일을 읽어라. [11]~[16] 여섯 개의 이미지 프롬프트가 있다(스틱맨 개념 컷).
각 프롬프트 앞에 파일 맨 위 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비는 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
이미지 안에 글자·숫자·알파벳 절대 금지.
각 이미지 생성 후 "IMG i: SAVED <경로>" 한 줄씩 보고하고, 전부 끝나면 "DONE n/6"을 출력하라.
PROMPT

echo "=== ELEC ORDER DONE ==="
ls public/elec/hook public/elec/figs public/elec/cuts 2>/dev/null
