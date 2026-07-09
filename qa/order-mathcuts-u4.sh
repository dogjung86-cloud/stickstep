#!/usr/bin/env bash
# 스틱맨 개념 컷 — 중1 수학 Ⅳ 기본 도형 13장(u4l1~u4l13) 발주.
# codex auth의 ChatGPT image_gen 사용(순차 2배치, 병렬 금지 — tmp/ 충돌).
# bash qa/order-mathcuts-u4.sh  (app 루트에서)
set -u
cd "$(dirname "$0")/.."
mkdir -p public/math/cuts

echo "=== BATCH 1/2: math/cuts u4l1~u4l7 (기본 도형 전반) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/mathcut_prompts.txt 파일을 읽어라. [30][31][32][33][34][35][36] 일곱 개의 이미지 프롬프트가 있다(중1 수학 Ⅳ 점선면·선분·각·맞꼭지각·수직·평행·꼬인 위치).
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·기호 절대 금지.
스틱맨 손이 보이면 손가락은 정확히 5개. 각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/7"을 출력하라.
PROMPT

echo "=== BATCH 2/2: math/cuts u4l8~u4l13 (평행선 성질·작도·합동) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/mathcut_prompts.txt 파일을 읽어라. [37][38][39][40][41][42] 여섯 개의 이미지 프롬프트가 있다(중1 수학 Ⅳ 동위각·평행선 성질·작도·삼각형·합동·합동 활용).
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·기호 절대 금지 —
[41]의 도장 무늬도 글자가 아니라 단순한 꽃 그림이어야 한다. 스틱맨 손가락은 정확히 5개.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/6"을 출력하라.
PROMPT

echo "=== MATH U4 CUTS ORDER DONE ==="
ls public/math/cuts 2>/dev/null | grep u4 || true
