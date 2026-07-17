#!/usr/bin/env bash
# 중2 VI 동물과 에너지 발주 — 스틱맨 개념 컷 6장 + 인체 해부 일러스트 6장.
# codex auth의 ChatGPT 내장 image_gen 사용. 순차 3배치(병렬 금지 — tmp/ 충돌 실사고).
# bash qa/order-body.sh   (app 루트에서). 발주 후 node qa/process-geo.mjs 로 webp 변환.
set -u
cd "$(dirname "$0")/.."
mkdir -p public/body/cuts public/body/figs

echo "=== BATCH 1/3: body/cuts 스틱맨 개념 컷 6장 ([0]~[5]) ==="
codex exec --skip-git-repo-check -s danger-full-access -m gpt-5.6-sol -c model_reasoning_effort="high" -c mcp_servers="{}" -C "$(pwd)" - <<'PROMPT' < /dev/null
qa/body_prompts.txt 파일을 읽어라. [0]~[5] 여섯 개의 스틱맨 컷 프롬프트가 있다.
각 프롬프트 앞에 파일의 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·기호 절대 금지.
스틱맨 손이 보이면 손가락은 정확히 5개. 각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/6"을 출력하라.
PROMPT

echo "=== BATCH 2/3: body/figs 해부 일러스트 3장 ([6]~[8]) ==="
codex exec --skip-git-repo-check -s danger-full-access -m gpt-5.6-sol -c model_reasoning_effort="high" -c mcp_servers="{}" -C "$(pwd)" - <<'PROMPT' < /dev/null
qa/body_prompts.txt 파일을 읽어라. [6][7][8] 세 개의 해부 일러스트 프롬프트가 있다(소화계·심장·콩팥단위).
각 프롬프트 앞에 파일의 "스타일 블록 B"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비는 각 프롬프트에 적힌 그대로(3:4·1:1·4:3).
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·기호·화살표 절대 금지.
심장 그림은 아래쪽 두 방(심실)의 벽이 위쪽 두 방보다 두껍게, 특히 왼쪽 심실 벽이 가장 두껍게 그려라.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/3"을 출력하라.
PROMPT

echo "=== BATCH 3/3: body/figs 해부 일러스트 3장 ([9]~[11]) ==="
codex exec --skip-git-repo-check -s danger-full-access -m gpt-5.6-sol -c model_reasoning_effort="high" -c mcp_servers="{}" -C "$(pwd)" - <<'PROMPT' < /dev/null
qa/body_prompts.txt 파일을 읽어라. [9][10][11] 세 개의 해부 일러스트 프롬프트가 있다(허파꽈리·호흡계·배설계).
각 프롬프트 앞에 파일의 "스타일 블록 B"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비는 각 프롬프트에 적힌 그대로(1:1·3:4·3:4).
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·기호·화살표 절대 금지.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/3"을 출력하라.
PROMPT

echo "=== BODY ORDER DONE — 이제 node qa/process-geo.mjs 로 webp 변환 ==="
ls -1 public/body/cuts public/body/figs 2>/dev/null
