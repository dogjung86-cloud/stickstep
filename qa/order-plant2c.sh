#!/usr/bin/env bash
# 중2 Ⅴ 3차 발주 — L7 문제 그림용 "꽃·열매 달린 식물" 1장.
set -u
cd "$(dirname "$0")/.."
mkdir -p public/plant2/figs
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/plant2b_prompts.txt 파일을 읽어라. [1] 프롬프트(꽃·열매 달린 식물)를 찾아라.
프롬프트 앞에 파일의 "스타일 블록 B"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 가로 4:3.
저장 경로는 프롬프트의 file= 에 적힌 그대로: public/plant2/figs/plant-flower-fruit.png
이미지 안에 글자·숫자·화살표 절대 금지. 꽃은 줄기 꼭대기에 1개, 열매는 오른쪽 곁가지에 1개,
잎은 좌우 1장씩, 뿌리는 흙 단면 안에 또렷하게. 줄기는 뿌리부터 꽃까지 끊기지 않게 그려라.
생성 후 "IMG 1: SAVED <경로>"를 출력하고, 끝나면 "DONE 1/1"을 출력하라.
PROMPT
echo "=== PLANT2C ORDER DONE ==="
