#!/usr/bin/env bash
# 단원 종합 평가 u3(열) 문항용 실사 사진 8장. codex auth의 ChatGPT image_gen 사용(순차 2배치, 병렬 금지).
# bash qa/order-examu3.sh  (app 루트에서)
set -u
cd "$(dirname "$0")/.."
mkdir -p public/exam/u3

echo "=== BATCH 1/2: exam/u3 사진 [0]~[3] (열화상 숟가락·열화상 창문·전깃줄 여름/겨울) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/examu3_prompts.txt 파일을 읽어라. [0][1][2][3] 네 개의 이미지 프롬프트가 있다(중1 과학 열 시험 문항용 실사 사진).
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 정사각 1:1.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·로고·계기 눈금·UI 오버레이 절대 금지.
사람·손·얼굴·신체 금지(반사된 모습 포함). [2]는 전깃줄이 뚜렷하게 처져야 하고 [3]은 팽팽해야 한다.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/4"를 출력하라.
PROMPT

echo "=== BATCH 2/2: exam/u3 사진 [4]~[7] (철로 틈·다리 이음매·냄비 쌍·서리 벤치) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/examu3_prompts.txt 파일을 읽어라. [4][5][6][7] 네 개의 이미지 프롬프트가 있다(중1 과학 열 시험 문항용 실사 사진).
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 정사각 1:1.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·로고 절대 금지.
사람·손·얼굴·신체 금지(반사된 모습 포함). [4]는 두 레일 끝 사이 틈이 뚜렷해야 한다.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/4"를 출력하라.
PROMPT

echo "=== 발주 완료 → node qa/process-geo.mjs 로 webp 변환 ==="
