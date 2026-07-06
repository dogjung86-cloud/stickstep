#!/usr/bin/env bash
# 생물 아이콘 14종 발주 — codex auth의 ChatGPT 내장 image_gen 사용.
# bash qa/order-bio-icons.sh  (app 루트에서)
set -u
cd "$(dirname "$0")/.."
mkdir -p public/bio

echo "=== bio icons (14 images) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/bio_icons_prompts.txt 파일을 읽어라. [key] 형식으로 14개의 생물 아이콘 프롬프트가 있다.
각 프롬프트 앞에 파일 상단의 "공통 스타일" 블록을 붙여서 내장 image_gen 도구로 1:1 정사각 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 배경은 반드시 순백색, 이미지 안에 글자·숫자·라벨 절대 금지.
저장 경로는 대괄호 안의 key 그대로: public/bio/<key>.png
  예) [bacteria] → public/bio/bacteria.png
14개 key: bacteria, amoeba, paramecium, algae, mushroom, mold, yeast, pine, fern, flower, fish, bee, bird
(주의: 프롬프트는 14줄이지만 key는 13개 — bacteria가 대장균·젖산균 공용. 13개 파일을 만들면 된다.)
각 이미지 생성 후 "IMG <key>: SAVED <경로>" 한 줄씩 보고하고, 전부 끝나면 "DONE n/13"을 출력하라.
PROMPT

echo "=== BIO ICONS DONE ==="
ls -la public/bio 2>/dev/null | head -20
