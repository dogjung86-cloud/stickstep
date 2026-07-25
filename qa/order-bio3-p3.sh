#!/usr/bin/env bash
# 중1 Ⅱ 재제작 발주 PHASE 3 — 실사용 피드백 반영: 식물세포 육각형 재발주 + 동물세포 한 세트 재발주.
# bash qa/order-bio3-p3.sh  → 눈검수 후 node qa/process-geo.mjs
set -u
cd "$(dirname "$0")/.."
mkdir -p public/bio3/figs

echo "=== BATCH 1/1: 세포 2종 한 세트 재발주 ([H0][H1]) ==="
codex exec --skip-git-repo-check -s danger-full-access -m gpt-5.6-sol -c model_reasoning_effort="high" -c mcp_servers="{}" -C "$(pwd)" - <<'PROMPT'
qa/bio3_prompts3.txt 와 qa/bio3_prompts.txt 를 읽어라(스타일 블록 정의는 후자 상단에 있다).
bio3_prompts3.txt의 [H0][H1] 두 프롬프트 앞에 "스타일 블록 B"를 붙여 내장 image_gen으로 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 둘 다 정사각 1:1.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로(기존 파일을 덮어쓴다).

가장 중요한 요구 두 가지다:
1) [H0] 식물세포는 **반드시 육각형**이어야 한다. 모서리가 둥근 사각형이나 원형이면 실패다.
   위아래 변이 수평인 정육각형에 가깝게, 여섯 모서리가 전부 또렷한 직선 각으로 그려라.
   두꺼운 세포벽과 그 안쪽을 따라가는 얇은 세포막이 **두 겹으로 구분되어** 보여야 한다.
2) [H1] 동물세포에는 두꺼운 벽도, 직선 모서리도, 초록색 구조도 절대 넣지 마라.
   두 그림은 나란히 놓고 비교할 것이므로 **크기·시점·선 굵기·조명 방향·채색 방식이 한 세트**로 보여야 한다.

이미지 안에 글자·숫자·알파벳·라벨·화살표 절대 금지(한글 라벨은 앱이 나중에 얹는다).
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/2"를 출력하라.
PROMPT

echo "=== PHASE 3 DONE ==="
ls -1 public/bio3/figs
