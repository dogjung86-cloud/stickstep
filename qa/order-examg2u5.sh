#!/usr/bin/env bash
# g2u5 v2 시험 신규 사진 8장(기공 현미경상·포일 가린 잎·수초 기포·에탄올 중탕·센서 밀폐 용기·
# 아이오딘 반응 잎·발아 콩 대조·감자 단면). codex auth의 ChatGPT image_gen 사용(순차 2배치, 병렬 금지).
# 실행 전 반드시 다른 세션의 codex exec 부재를 확인할 것(CommandLine의 " exec "로 판별 —
# 데스크톱 앱 상주 서버 app-server는 codex.exe로 영원히 떠 있어 프로세스명만 보면 무한 대기한다).
# bash qa/order-examg2u5.sh  (app 루트에서)
set -u
cd "$(dirname "$0")/.."
mkdir -p public/exam/g2u5

echo "=== BATCH 1/2: exam/g2u5 사진 [0]~[3] (기공·포일 잎·수초 기포·에탄올 중탕) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/examg2u5_prompts.txt 파일을 읽어라. [0][1][2][3] 네 개의 이미지 프롬프트가 있다(중2 과학 식물과 에너지 시험 문항용 실사 사진).
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 정사각 1:1.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·로고·눈금 절대 금지.
사람·손·얼굴·신체 금지(반사된 모습 포함). 계측기 표시창은 반드시 빈 화면.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/4"을 출력하라.
PROMPT

echo "=== BATCH 2/2: exam/g2u5 사진 [4]~[7] (센서 밀폐 용기·아이오딘 잎·발아 콩·감자 단면) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/examg2u5_prompts.txt 파일을 읽어라. [4][5][6][7] 네 개의 이미지 프롬프트가 있다(중2 과학 식물과 에너지 시험 문항용 실사 사진).
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 정사각 1:1.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·로고·눈금 절대 금지.
사람·손·얼굴·신체 금지(반사된 모습 포함). 계측기 표시창은 반드시 빈 화면.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/4"을 출력하라.
PROMPT

echo "=== 발주 완료 → node qa/process-geo.mjs 로 webp 변환 (SQUARE_DIRS에 public/exam/g2u5 등록 필요) ==="
