#!/usr/bin/env bash
# 중2 Ⅵ v3 — g2u6l3 하비 만화 7컷 발주. codex auth의 ChatGPT image_gen.
# bash qa/order-g2u6v3-comics.sh  (app 루트에서). 발주 후 node qa/process-comics.mjs 로 webp 변환.
set -u
cd "$(dirname "$0")/.."
mkdir -p public/comics/g2u6l3

codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/g2u6v3_comic_prompts.txt 파일을 읽어라. [0]~[6] 일곱 개의 이미지 프롬프트가 있다.
각 프롬프트를 그대로 사용해 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로: public/comics/g2u6l3/*.png (4:3 가로).
각 이미지 생성 후 "IMG i: SAVED <경로>" 한 줄씩 보고하고, 전부 끝나면 "DONE n/7"을 출력하라.
이미지 안에 글자·숫자·알파벳이 절대 들어가면 안 된다. 스틱맨 손가락은 정확히 5개.
주인공(곱슬머리+넓은 칼라 학자)의 생김새를 모든 컷에서 일관되게 유지하라.
PROMPT
echo "=== g2u6v3 COMICS ORDER DONE ==="
ls -1 public/comics/g2u6l3
