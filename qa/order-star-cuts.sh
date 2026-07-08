#!/usr/bin/env bash
# 중2 VIII 스틱맨 개념 컷 6장 발주 — codex auth의 ChatGPT image_gen 사용.
# bash qa/order-star-cuts.sh  (app 루트에서)
set -u
cd "$(dirname "$0")/.."
mkdir -p public/star/cuts

codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/star_cuts_prompts.txt 파일을 읽어라. [0]~[5] 여섯 개의 이미지 프롬프트가 있다.
각 프롬프트를 그대로 사용해 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비는 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로: public/star/cuts/<이름>.png.
각 이미지 생성 후 "IMG i: SAVED <경로>" 한 줄씩 보고하고, 전부 끝나면 "DONE n/6"을 출력하라.
이미지 안에 글자·숫자가 절대 들어가면 안 된다.
PROMPT
