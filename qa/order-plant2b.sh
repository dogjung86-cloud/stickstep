#!/usr/bin/env bash
# 중2 Ⅴ 2차 발주 — 문제 그림용 식물 전체 일러스트 1장(L2 문제 1 배경).
# bash qa/order-plant2b.sh   (app 루트에서). 발주 후 node qa/process-geo.mjs 로 webp 변환.
set -u
cd "$(dirname "$0")/.."
mkdir -p public/plant2/figs

codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/plant2b_prompts.txt 파일을 읽어라. [0] 한 개의 교육 일러스트 프롬프트가 있다.
프롬프트 앞에 파일의 "스타일 블록 B"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 가로 4:3.
저장 경로는 프롬프트의 file= 에 적힌 그대로: public/plant2/figs/whole-plant.png
이미지 안에 글자·숫자·알파벳·기호·화살표 절대 금지. 잎은 정확히 4장, 줄기는 뿌리부터 꼭대기까지
끊기지 않게, 뿌리는 흙 단면 안에서 또렷하게 보이도록 그려라. 화분·꽃·열매·태양은 넣지 마라.
생성 후 "IMG 0: SAVED <경로>"를 출력하고, 끝나면 "DONE 1/1"을 출력하라.
PROMPT

echo "=== PLANT2B ORDER DONE ==="
ls -1 public/plant2/figs/whole-plant.* 2>/dev/null
