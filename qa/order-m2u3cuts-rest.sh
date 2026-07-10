#!/usr/bin/env bash
# 스틱맨 개념 컷 — 중2 수학 Ⅲ 잔여 8장(u3l2·3·4 + u3l6~10). 1차 발주가 과학 세션 codex 발주와의
# 동시 실행 회피로 중단됨(u3l1·u3l5는 확보·검수 완료). 다른 세션 발주가 없을 때만 실행할 것.
# bash qa/order-m2u3cuts-rest.sh  (app 루트에서)
set -u
cd "$(dirname "$0")/.."
mkdir -p public/math2/cuts

echo "=== BATCH 1/2: math2/cuts u3l2·u3l3·u3l4 ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/m2u3cut_prompts.txt 파일을 읽어라. 그중 [1][2][3] 세 개의 이미지 프롬프트만 생성한다(일차함수·평행이동·절편).
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·기호 절대 금지.
스틱맨 손이 보이면 손가락은 정확히 5개. 각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/3"을 출력하라.
PROMPT

echo "=== BATCH 2/2: math2/cuts u3l6~u3l10 ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/m2u3cut_prompts.txt 파일을 읽어라. 그중 [5][6][7][8][9] 다섯 개의 이미지 프롬프트만 생성한다(성질·식 구하기·활용·일차방정식·연립방정식).
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·기호 절대 금지.
스틱맨 손이 보이면 손가락은 정확히 5개. 각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/5"를 출력하라.
PROMPT

echo "=== 발주 완료 → node qa/process-geo.mjs 로 webp 변환 ==="
