#!/usr/bin/env bash
# 중1 Ⅱ 재제작 발주 PHASE 2 — 세포 구조 3 + 현미경 관찰 6 + 생태계 5 + 변이 3 = 17장.
# codex auth의 ChatGPT 내장 image_gen. 순차 4배치(병렬 codex 금지 — tmp/ 충돌 실사고).
# bash qa/order-bio3-p2.sh   → 끝나면 node qa/process-geo.mjs 로 webp 변환.
set -u
cd "$(dirname "$0")/.."
mkdir -p public/bio3/figs public/bio3/micro public/bio3/eco public/bio3/vary

echo "=== BATCH 1/4: 세포 구조·현미경 3장 ([F0]~[F2]) ==="
codex exec --skip-git-repo-check -s danger-full-access -m gpt-5.6-sol -c model_reasoning_effort="high" -c mcp_servers="{}" -C "$(pwd)" - <<'PROMPT'
qa/bio3_prompts2.txt 와 qa/bio3_prompts.txt 를 읽어라(스타일 블록 정의는 후자 상단에 있다).
bio3_prompts2.txt의 [F0][F1][F2] 세 개 프롬프트 앞에 "스타일 블록 B"를 붙여 내장 image_gen으로 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비는 각 프롬프트 괄호에 적힌 그대로.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
이미지 안에 글자·숫자·알파벳·라벨·화살표·눈금자 절대 금지(한글 라벨은 앱이 나중에 얹는다).
동물세포에는 세포벽과 초록색 구조를 절대 그리지 마라. 식물세포는 반드시 각진 상자 모양에
두꺼운 바깥벽과 초록 알갱이가 함께 보여야 한다(둘을 한눈에 구분할 수 있어야 한다).
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/3"을 출력하라.
PROMPT

echo "=== BATCH 2/4: 현미경 관찰 6장 ([M0]~[M5]) ==="
codex exec --skip-git-repo-check -s danger-full-access -m gpt-5.6-sol -c model_reasoning_effort="high" -c mcp_servers="{}" -C "$(pwd)" - <<'PROMPT'
qa/bio3_prompts2.txt 와 qa/bio3_prompts.txt 를 읽어라(스타일 블록 정의는 후자 상단에 있다).
bio3_prompts2.txt의 [M0][M1][M2][M3][M4][M5] 여섯 개 프롬프트 앞에 "스타일 블록 C"를 붙여
내장 image_gen으로 생성하라. Google 도구 금지. 종횡비 전부 정사각 1:1.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
이미지 안에 글자·숫자·알파벳·라벨·화살표·눈금자·십자선 절대 금지.
적혈구는 반드시 가운데가 오목하게 파인 원반으로 그려라(공 모양이나 민무늬 원은 실패다).
입안 상피세포에는 단단한 직선 벽을 그리지 마라(그건 식물세포 특징이다).
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/6"을 출력하라.
PROMPT

echo "=== BATCH 3/4: 생태계 5장 ([E0]~[E4]) ==="
codex exec --skip-git-repo-check -s danger-full-access -m gpt-5.6-sol -c model_reasoning_effort="high" -c mcp_servers="{}" -C "$(pwd)" - <<'PROMPT'
qa/bio3_prompts2.txt 와 qa/bio3_prompts.txt 를 읽어라(스타일 블록 정의는 후자 상단에 있다).
bio3_prompts2.txt의 [E0][E1][E2][E3][E4] 다섯 개 프롬프트 앞에 "스타일 블록 B"를 붙여
내장 image_gen으로 생성하라. Google 도구 금지. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
이미지 안에 글자·숫자·알파벳·라벨 절대 금지. 사람·건물·간판·도로는 넣지 마라.
각 생태계에 실제로 사는 생물만 그려라.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/5"을 출력하라.
PROMPT

echo "=== BATCH 4/4: 변이 3장 ([V0]~[V2]) ==="
codex exec --skip-git-repo-check -s danger-full-access -m gpt-5.6-sol -c model_reasoning_effort="high" -c mcp_servers="{}" -C "$(pwd)" - <<'PROMPT'
qa/bio3_prompts2.txt 와 qa/bio3_prompts.txt 를 읽어라(스타일 블록 정의는 후자 상단에 있다).
bio3_prompts2.txt의 [V0][V1][V2] 세 개 프롬프트 앞에 "스타일 블록 B"를 붙여
내장 image_gen으로 생성하라. Google 도구 금지. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
이미지 안에 글자·숫자·알파벳·라벨 절대 금지.
세 장 모두 "같은 종류인데 개체마다 조금씩 다르다"가 한눈에 읽혀야 한다 —
종류 자체가 달라 보이면 실패다. 모양·크기·구조는 같게, 무늬와 색만 다르게 그려라.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/3"을 출력하라.
PROMPT

echo "=== PHASE 2 DONE ==="
ls -1 public/bio3/figs public/bio3/micro public/bio3/eco public/bio3/vary 2>/dev/null
