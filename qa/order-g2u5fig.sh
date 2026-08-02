#!/usr/bin/env bash
# g2u5 v2 시험 도해 베이스 일러스트 4종(잎 단면·엽록체·마이토콘드리아·전체 식물).
# 사용자 지시(파일럿 카드 001·002·022·027·035·038의 그림 격상)로 발주한다.
# 하이브리드 방침: 발주 라스터는 "글자 없는 그림"만 담고, 기호(㉠㉡)·물질 이름 칩·화살표는
# 앱이 SVG로 얹는다(codex는 한글을 못 그리고, 이 문항들은 라벨이 곧 과제다).
# codex auth의 ChatGPT image_gen 사용(순차 1배치, 병렬 금지 · 실행 전 " exec " 부재 확인).
# bash qa/order-g2u5fig.sh  (app 루트에서)
set -u
cd "$(dirname "$0")/.."
mkdir -p public/exam/g2u5fig

echo "=== BATCH 1/1: exam/g2u5fig 도해 베이스 [0]~[3] ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/g2u5fig_prompts.txt 파일을 읽어라. [0][1][2][3] 네 개의 이미지 프롬프트가 있다
(중2 과학 식물과 에너지 시험 문항의 도해 베이스 일러스트).
각 프롬프트 앞에 파일 위쪽 "스타일 블록 B"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용.
종횡비는 각 프롬프트의 aspect= 에 적힌 대로 하라([0] 4:3, [1] 1:1, [2] 1:1, [3] 3:4).
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
이미지 안에 글자·숫자·알파벳·기호·화살표·지시선·라벨 절대 금지. 사람·손 금지. 배경은 순백.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/4"을 출력하라.
PROMPT

echo "=== 발주 완료 → node qa/process-geo.mjs 로 webp 변환(ASPECT_DIRS 등록 필요) ==="
