#!/usr/bin/env bash
# 단원 종합 평가 u6 v2 신규 사진 2장(hot-car-bag·suction-cup). codex auth의 ChatGPT image_gen 사용(1배치, 병렬 금지).
# bash qa/order-examu6v2.sh  (app 루트에서)
set -u
cd "$(dirname "$0")/.."
mkdir -p public/exam/u6

echo "=== BATCH 1/1: exam/u6 v2 사진 [0]~[1] (여름 차 안 부푼 봉지·진공 흡착 걸이) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/examu6v2_prompts.txt 파일을 읽어라. [0][1] 두 개의 이미지 프롬프트가 있다(중1 과학 기체 시험 문항용 실사 사진).
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 정사각 1:1.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·로고·계기판·눈금 절대 금지.
사람·손·얼굴·신체 금지(반사된 모습 포함). [0]은 봉지가 빵빵하게 부풀어야 하고 계기판·숫자가 화면에 없어야 한다.
[1]은 흡착 컵이 타일에 납작 밀착된 모습이 뚜렷해야 한다.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/2"를 출력하라.
PROMPT

echo "=== 발주 완료 → node qa/process-geo.mjs 로 webp 변환 ==="
