#!/usr/bin/env bash
# 스틱맨 개념 컷 롤아웃 12장 — codex auth의 ChatGPT image_gen 사용(순차 4배치, 병렬 금지 — tmp/ 충돌).
# bash qa/order-cuts.sh  (app 루트에서)
set -u
cd "$(dirname "$0")/.."
mkdir -p public/bio2/cuts public/chem/cuts public/geo/cuts public/atom/cuts

echo "=== BATCH 1/4: bio2/cuts 1장 (중1 II) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/cuts_prompts.txt 파일을 읽어라. [0] 한 개의 이미지 프롬프트가 있다(중1 II 분류).
프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 가로 4:3.
저장 경로는 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·기호 절대 금지.
생성 후 "IMG 0: SAVED <경로>"를 출력하고, 끝나면 "DONE 1/1"을 출력하라.
PROMPT

echo "=== BATCH 2/4: chem/cuts 2장 (중2 I) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/cuts_prompts.txt 파일을 읽어라. [1][2] 두 개의 이미지 프롬프트가 있다(중2 I 순물질/혼합물, 밀도차 분리).
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·기호 절대 금지.
스틱맨 손이 보이면 손가락은 정확히 5개. 각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/2"를 출력하라.
PROMPT

echo "=== BATCH 3/4: geo/cuts 4장 (중2 II) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/cuts_prompts.txt 파일을 읽어라. [3][4][5][6] 네 개의 이미지 프롬프트가 있다(중2 II 광물·풍화·판·판의 경계).
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·기호 절대 금지.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/4"를 출력하라.
PROMPT

echo "=== BATCH 4/4: atom/cuts 5장 (중2 IV) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/cuts_prompts.txt 파일을 읽어라. [7][8][9][10][11] 다섯 개의 이미지 프롬프트가 있다(중2 IV 원소기호·화학식·주기율표·이온식·이온 관찰).
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·기호 절대 금지 —
[8]의 개수는 손가락 2개로만, [9]의 칸은 전부 빈칸으로. 스틱맨 손가락은 정확히 5개.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/5"를 출력하라.
PROMPT

echo "=== CUTS ORDER DONE ==="
ls public/bio2/cuts public/chem/cuts public/geo/cuts public/atom/cuts 2>/dev/null
