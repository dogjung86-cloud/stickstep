#!/usr/bin/env bash
# 중1 Ⅱ 재제작 발주 PHASE 1 — 만화 u2l1 7컷 + 스틱맨 개념 컷 10장.
# codex auth의 ChatGPT 내장 image_gen 사용. 순차 3배치(병렬 금지 — tmp/ 충돌 실사고).
# bash qa/order-bio3-p1.sh   (app 루트에서). 발주 후 process-comics.mjs / process-geo.mjs 변환.
set -u
cd "$(dirname "$0")/.."
mkdir -p public/comics/u2l1 public/bio3/cuts public/bio3/figs

echo "=== BATCH 1/3: 만화 u2l1 7컷 ([C0]~[C6]) ==="
codex exec --skip-git-repo-check -s danger-full-access -m gpt-5.6-sol -c model_reasoning_effort="high" -c mcp_servers="{}" -C "$(pwd)" - <<'PROMPT'
qa/bio3_prompts.txt 파일을 읽어라. [C0]~[C6] 일곱 개의 만화 컷 프롬프트가 있다.
각 프롬프트 앞에 파일의 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
이미지 안에 글자·숫자·알파벳·기호·말풍선 절대 금지(한글 말풍선은 앱이 나중에 얹는다).
[C0]~[C4]의 주인공은 어깨까지 오는 곱슬 가발을 쓴 같은 스틱맨으로 7컷 내내 일관되게 그려라.
스틱맨 손이 보이면 손가락은 정확히 5개.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/7"을 출력하라.
PROMPT

echo "=== BATCH 2/3: 개념 컷 u2l1~u2l5 5장 ([K0]~[K4]) ==="
codex exec --skip-git-repo-check -s danger-full-access -m gpt-5.6-sol -c model_reasoning_effort="high" -c mcp_servers="{}" -C "$(pwd)" - <<'PROMPT'
qa/bio3_prompts.txt 파일을 읽어라. [K0][K1][K2][K3][K4] 다섯 개의 스틱맨 개념 컷 프롬프트가 있다.
각 프롬프트 앞에 파일의 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·기호 절대 금지.
스틱맨 손이 보이면 손가락은 정확히 5개.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/5"을 출력하라.
PROMPT

echo "=== BATCH 3/3: 개념 컷 u2l6~u2l10 5장 ([K5]~[K9]) ==="
codex exec --skip-git-repo-check -s danger-full-access -m gpt-5.6-sol -c model_reasoning_effort="high" -c mcp_servers="{}" -C "$(pwd)" - <<'PROMPT'
qa/bio3_prompts.txt 파일을 읽어라. [K5][K6][K7][K8][K9] 다섯 개의 스틱맨 개념 컷 프롬프트가 있다.
각 프롬프트 앞에 파일의 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·기호 절대 금지.
스틱맨 손이 보이면 손가락은 정확히 5개.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/5"을 출력하라.
PROMPT

echo "=== PHASE 1 DONE ==="
ls -1 public/comics/u2l1 public/bio3/cuts 2>/dev/null
