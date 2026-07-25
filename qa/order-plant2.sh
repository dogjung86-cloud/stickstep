#!/usr/bin/env bash
# 중2 Ⅴ 식물과 에너지(v2) 발주 — 스틱맨 개념 컷 9장 + 교육 일러스트 9장 + 저장 재료 8장.
# codex auth의 ChatGPT 내장 image_gen 사용. 순차 5배치(병렬 금지 — 다른 세션 발주와도 겹치면 안 된다).
# bash qa/order-plant2.sh   (app 루트에서). 발주 후 node qa/process-geo.mjs 로 webp 변환.
set -u
cd "$(dirname "$0")/.."
mkdir -p public/plant2/cuts public/plant2/figs public/plant2/items

echo "=== BATCH 1/5: plant2/cuts 개념 컷 5장 ([0]~[4]) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/plant2_prompts.txt 파일을 읽어라. [0][1][2][3][4] 다섯 개의 스틱맨 컷 프롬프트가 있다.
각 프롬프트 앞에 파일의 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·기호 절대 금지.
스틱맨 손이 보이면 손가락은 정확히 5개. 각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/5"를 출력하라.
PROMPT

echo "=== BATCH 2/5: plant2/cuts 개념 컷 4장 ([5]~[8]) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/plant2_prompts.txt 파일을 읽어라. [5][6][7][8] 네 개의 스틱맨 컷 프롬프트가 있다.
각 프롬프트 앞에 파일의 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·기호 절대 금지.
스틱맨 손이 보이면 손가락은 정확히 5개. 각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/4"를 출력하라.
PROMPT

echo "=== BATCH 3/5: plant2/figs 교육 일러스트 5장 ([9]~[13]) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/plant2_prompts.txt 파일을 읽어라. [9][10][11][12][13] 다섯 개의 교육 일러스트 프롬프트가 있다.
각 프롬프트 앞에 파일의 "스타일 블록 B"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비는 각 프롬프트에 적힌 그대로(1:1·1:1·4:3·4:3·3:4).
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·기호·화살표 절대 금지.
[9]의 초록 알갱이는 세포 안에만 들어 있어야 하고, [10]의 구멍은 반드시 콩팥 모양 세포 두 개가 마주 본 사이에 있어야 한다.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/5"를 출력하라.
PROMPT

echo "=== BATCH 4/5: plant2/figs 교육 일러스트 4장 ([14]~[17]) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/plant2_prompts.txt 파일을 읽어라. [14][15][16][17] 네 개의 교육 일러스트 프롬프트가 있다.
각 프롬프트 앞에 파일의 "스타일 블록 B"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비는 각 프롬프트에 적힌 그대로(전부 4:3).
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·기호·화살표 절대 금지.
[14]의 두 잎 조각은 크기와 모양이 같아야 하고 색만 달라야 한다(왼쪽 진한 청람색, 오른쪽 연한 갈색).
[15]의 전등 세 개는 모양과 크기가 같아야 하고 거리만 달라야 한다.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/4"를 출력하라.
PROMPT

echo "=== BATCH 5/5: plant2/items 저장 재료 8장 ([18]~[25]) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/plant2_prompts.txt 파일을 읽어라. [18]~[25] 여덟 개의 재료 프롬프트가 있다.
각 프롬프트 앞에 파일의 "스타일 블록 C"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 정사각 1:1, 배경은 순백.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·기호 절대 금지.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/8"을 출력하라.
PROMPT

echo "=== PLANT2 ORDER DONE — 이제 node qa/process-geo.mjs 로 webp 변환 ==="
ls -1 public/plant2/cuts public/plant2/figs public/plant2/items 2>/dev/null
