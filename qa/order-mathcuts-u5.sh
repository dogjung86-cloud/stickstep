#!/usr/bin/env bash
# 스틱맨 개념 컷 — 중1 수학 Ⅴ 평면도형과 입체도형 14장(u5l1~u5l14) 발주.
# codex auth의 ChatGPT image_gen 사용(순차 2배치, 병렬 금지 — tmp/ 충돌).
# bash qa/order-mathcuts-u5.sh  (app 루트에서)
set -u
cd "$(dirname "$0")/.."
mkdir -p public/math/cuts

echo "=== BATCH 1/2: math/cuts u5l1~u5l7 (평면도형) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/mathcut_prompts.txt 파일을 읽어라. [43][44][45][46][47][48][49] 일곱 개의 이미지 프롬프트가 있다(중1 수학 Ⅴ 대각선·삼각형 각·내각합·외각합·원과 부채꼴·부채꼴 성질·원주율).
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·기호 절대 금지.
스틱맨 손이 보이면 손가락은 정확히 5개. 각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/7"을 출력하라.
PROMPT

echo "=== BATCH 2/2: math/cuts u5l8~u5l14 (입체도형) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/mathcut_prompts.txt 파일을 읽어라. [50][51][52][53][54][55][56] 일곱 개의 이미지 프롬프트가 있다(중1 수학 Ⅴ 다면체·정다면체·회전체·기둥·뿔·구·보스전).
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·기호 절대 금지 —
[56]의 묘비 조각도 글자 없이 도형 그림뿐이어야 한다. 스틱맨 손가락은 정확히 5개.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/7"을 출력하라.
PROMPT

echo "=== MATH U5 CUTS ORDER DONE ==="
ls public/math/cuts 2>/dev/null | grep u5 || true
