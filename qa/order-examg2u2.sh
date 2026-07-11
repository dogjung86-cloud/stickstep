#!/usr/bin/env bash
# 단원 종합 평가 g2u2(지권의 변화) 문항용 실사 사진 10장. codex auth의 ChatGPT image_gen 사용(순차 2배치, 병렬 금지).
# bash qa/order-examg2u2.sh  (app 루트에서)
set -u
cd "$(dirname "$0")/.."
mkdir -p public/exam/g2u2

echo "=== BATCH 1/2: exam/g2u2 사진 [0]~[4] (조흔 가루 2색·염산 거품·석영 결정·유문암·반려암) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/examg2u2_prompts.txt 파일을 읽어라. [0][1][2][3][4] 다섯 개의 이미지 프롬프트가 있다(중2 과학 지권의 변화 시험 문항용 실사 사진).
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 정사각 1:1.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·로고 절대 금지.
사람·손·얼굴·신체 금지. 각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/5"를 출력하라.
PROMPT

echo "=== BATCH 2/2: exam/g2u2 사진 [5]~[9] (물고기 화석·양파 풍화 바위·뿌리 쐐기·석회 동굴·토양 단면) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/examg2u2_prompts.txt 파일을 읽어라. [5][6][7][8][9] 다섯 개의 이미지 프롬프트가 있다(중2 과학 지권의 변화 시험 문항용 실사 사진).
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 정사각 1:1.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·로고 절대 금지.
사람·손·얼굴·신체 금지. 각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/5"를 출력하라.
PROMPT

echo "=== 발주 완료 → node qa/process-geo.mjs 로 webp 변환 ==="
