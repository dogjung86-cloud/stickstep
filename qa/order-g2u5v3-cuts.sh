#!/usr/bin/env bash
# 중2 Ⅴ v3 개념 컷 8장 발주(concept 첫 블록용) — codex auth의 ChatGPT image_gen.
# bash qa/order-g2u5v3-cuts.sh  (app 루트에서). 발주 후 node qa/process-geo.mjs 로 webp 변환
# (public/plant3/cuts 는 ASPECT_DIRS 등록 완료).
set -u
cd "$(dirname "$0")/.."
mkdir -p public/plant3/cuts

codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/g2u5v3_cuts_prompts.txt 파일을 읽어라. [0]~[7] 여덟 개의 이미지 프롬프트가 있다.
각 프롬프트를 그대로 사용해 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로: public/plant3/cuts/*.png (4:3 가로).
각 이미지 생성 후 "IMG i: SAVED <경로>" 한 줄씩 보고하고, 전부 끝나면 "DONE n/8"을 출력하라.
이미지 안에 글자·숫자·알파벳이 절대 들어가면 안 된다. 스틱맨 손가락은 정확히 5개.
PROMPT
echo "=== g2u5v3 CUTS ORDER DONE ==="
ls -1 public/plant3/cuts
