#!/usr/bin/env bash
# 단원 종합 평가 u5(힘의 작용) 문항용 실사 사진 8장. codex auth의 ChatGPT image_gen 사용(순차 2배치, 병렬 금지).
# bash qa/order-examu5.sh  (app 루트에서)
set -u
cd "$(dirname "$0")/.."
mkdir -p public/exam/u5

echo "=== BATCH 1/2: exam/u5 사진 [0]~[3] (볼링·폭포·용수철·축구화) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/examu5_prompts.txt 파일을 읽어라. [0][1][2][3] 네 개의 이미지 프롬프트가 있다(중1 과학 힘의 작용 시험 문항용 실사 사진).
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 정사각 1:1.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·로고 절대 금지.
사람·손·얼굴·신체 금지. 각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/4"를 출력하라.
PROMPT

echo "=== BATCH 2/2: exam/u5 사진 [4]~[7] (스노 체인·하키 퍽·화물선·열기구) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/examu5_prompts.txt 파일을 읽어라. [4][5][6][7] 네 개의 이미지 프롬프트가 있다(중1 과학 힘의 작용 시험 문항용 실사 사진).
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 정사각 1:1.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·로고 절대 금지.
사람·손·얼굴·신체 금지. 각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/4"를 출력하라.
PROMPT

echo "=== 발주 완료 → node qa/process-geo.mjs 로 webp 변환 ==="
