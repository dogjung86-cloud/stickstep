#!/usr/bin/env bash
# u2 v2 시험 · 세포 모양 카드 오답 후보 2장 발주(공 모양 · 각진 벽돌 모양).
# codex auth의 ChatGPT 내장 image_gen. 단일 배치(병렬 codex 금지 - tmp/ 충돌 실사고).
# 실행 전 반드시 다른 codex exec가 없는지 확인할 것(프로세스명이 아니라 CommandLine의 " exec "로 판별).
# bash qa/order-u2v2-cellshape.sh   → 끝나면 node qa/process-geo.mjs 로 webp 변환.
set -u
cd "$(dirname "$0")/.."
mkdir -p public/bio3/figs

echo "=== u2 v2 세포 모양 카드 2장 ([S0] cell-ball · [S1] cell-brick) ==="
codex exec --skip-git-repo-check -s danger-full-access -m gpt-5.6-sol -c model_reasoning_effort="high" -c mcp_servers="{}" -C "$(pwd)" - <<'PROMPT'
qa/u2v2_cellshape_prompts.txt 와 qa/bio3_prompts.txt 를 읽어라(스타일 블록 정의는 후자 상단에 있다).
u2v2_cellshape_prompts.txt의 [S0][S1] 두 프롬프트 앞에 "스타일 블록 B"를 붙여 내장 image_gen으로 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비는 둘 다 정사각 1:1.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
이미지 안에 글자·숫자·알파벳·라벨·화살표·눈금자 절대 금지(한글 기호는 앱이 나중에 얹는다).
두 장은 public/bio3/figs/cell-nerve.png·cell-rbc.png·cell-epithelial.png 와 같은 화풍·같은 배경 밝기여야 한다
(같은 카드 줄에 나란히 놓고 비교할 그림이다).
[S0]은 반드시 "속이 꽉 찬 공" 한 개로, 가운데가 눌리거나 도넛처럼 보이면 실패다.
[S1]은 반드시 "각진 직사각형 칸이 벽돌처럼 맞물린 판"으로, 둥근 세포가 섞이면 실패다.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/2"를 출력하라.
PROMPT

echo "=== 발주 종료 · node qa/process-geo.mjs 로 webp 변환 후 Read 눈검수 ==="
