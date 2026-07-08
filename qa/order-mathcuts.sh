#!/usr/bin/env bash
# 스틱맨 개념 컷 수학 롤아웃 30장 — codex auth의 ChatGPT image_gen 사용(순차 4배치, 병렬 금지 — tmp/ 충돌).
# bash qa/order-mathcuts.sh  (app 루트에서)
set -u
cd "$(dirname "$0")/.."
mkdir -p public/math/cuts

echo "=== BATCH 1/4: math/cuts u1l1~u1l6 (중1 Ⅰ 전반) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/mathcut_prompts.txt 파일을 읽어라. [0][1][2][3][4][5] 여섯 개의 이미지 프롬프트가 있다(중1 수학 Ⅰ 소수·거듭제곱·소인수분해·공약수·공배수·정수).
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·기호 절대 금지.
스틱맨 손이 보이면 손가락은 정확히 5개. 각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/6"을 출력하라.
PROMPT

echo "=== BATCH 2/4: math/cuts u1l7~u1l12 (중1 Ⅰ 후반) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/mathcut_prompts.txt 파일을 읽어라. [6][7][8][9][10][11] 여섯 개의 이미지 프롬프트가 있다(중1 수학 Ⅰ 절댓값·덧셈·뺄셈·곱셈·분배·계산 순서).
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·기호 절대 금지.
스틱맨 손이 보이면 손가락은 정확히 5개. 각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/6"을 출력하라.
PROMPT

echo "=== BATCH 3/4: math/cuts u2l1~u2l9 (중1 Ⅱ) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/mathcut_prompts.txt 파일을 읽어라. [12][13][14][15][16][17][18][19][20] 아홉 개의 이미지 프롬프트가 있다(중1 수학 Ⅱ 문자와 식).
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·기호 절대 금지 —
[20]의 레시피 카드도 글자 없이 그림 4칸으로만. 스틱맨 손가락은 정확히 5개.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/9"를 출력하라.
PROMPT

echo "=== BATCH 4/4: math/cuts u3l1~u3l9 (중1 Ⅲ) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/mathcut_prompts.txt 파일을 읽어라. [21][22][23][24][25][26][27][28][29] 아홉 개의 이미지 프롬프트가 있다(중1 수학 Ⅲ 좌표평면과 그래프).
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·기호 절대 금지 —
[21]의 바둑판에도 글자 없이 선과 돌만. 스틱맨 손가락은 정확히 5개.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/9"를 출력하라.
PROMPT

echo "=== MATH CUTS ORDER DONE ==="
ls public/math/cuts 2>/dev/null
