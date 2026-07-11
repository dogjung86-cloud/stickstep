#!/usr/bin/env bash
# 유저 프로필 스틱맨 아바타 12종 — codex auth의 ChatGPT image_gen 사용(순차 2배치, 병렬 금지).
# bash qa/order-avatars.sh  (app 루트에서) → node qa/process-avatars.mjs 로 webp 변환
set -u
cd "$(dirname "$0")/.."
mkdir -p public/avatars

echo "=== BATCH 1/2: avatars [0]~[5] (ponytail·afro·bob·spiky·pigtails·beanie) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/avatar2_prompts.txt 파일을 읽어라. [0][1][2][3][4][5] 여섯 개의 아바타 프롬프트가 있다(유저 프로필용 학생 스틱맨 흉상).
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 정사각 1:1.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳 절대 금지(음표 기호는 허용).
각 프롬프트는 서로 다른 캐릭터다 — 같은 얼굴 반복 금지, 실험복·과학자 소품 금지.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/6"을 출력하라.
PROMPT

echo "=== BATCH 2/2: avatars [6]~[11] (specs·longhair·headset·cap·perm·sprout) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/avatar2_prompts.txt 파일을 읽어라. [6][7][8][9][10][11] 여섯 개의 아바타 프롬프트가 있다(유저 프로필용 학생 스틱맨 흉상).
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 정사각 1:1.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳 절대 금지(음표 기호는 허용).
각 프롬프트는 서로 다른 캐릭터다 — 같은 얼굴 반복 금지, 실험복·과학자 소품 금지.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/6"을 출력하라.
PROMPT

echo "=== 발주 완료 → node qa/process-avatars.mjs 로 webp 변환 ==="
