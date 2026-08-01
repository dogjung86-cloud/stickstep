#!/usr/bin/env bash
# g2u4 v2 시험 신규 사진 3장(구리 전선·수액 팩·설탕물vs소금물 쌍). codex auth의 ChatGPT image_gen 사용(순차 1배치, 병렬 금지).
# bash qa/order-examg2u4v2.sh  (app 루트에서)
set -u
cd "$(dirname "$0")/.."
mkdir -p public/exam/g2u4

echo "=== BATCH 1/1: exam/g2u4 v2 사진 [0]~[2] (구리 전선·수액 팩·무색 용액 두 컵) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/examg2u4v2_prompts.txt 파일을 읽어라. [0][1][2] 세 개의 이미지 프롬프트가 있다(중2 과학 물질의 구성 시험 문항용 실사 사진).
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 정사각 1:1.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·로고 절대 금지.
사람·손·얼굴·신체 금지(반사된 모습 포함). 각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/3"을 출력하라.
PROMPT

echo "=== 발주 완료 → node qa/process-geo.mjs 로 webp 변환 ==="
