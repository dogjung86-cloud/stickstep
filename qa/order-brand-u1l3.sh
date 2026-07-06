#!/usr/bin/env bash
# 브랜드 에셋(9+1) + u1l3 만화(7) 연속 발주 — codex auth의 ChatGPT image_gen 사용.
# bash qa/order-brand-u1l3.sh  (app 루트에서)
set -u
cd "$(dirname "$0")/.."
mkdir -p public/brand/loading public/comics/u1l3

echo "=== RUN 1: brand set (9 images) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/brand_imagen_prompts.txt 파일을 읽어라. [0]~[8] 아홉 개의 이미지 프롬프트가 있다.
각 프롬프트 앞에 파일 상단의 "공통 스타일" 블록을 붙여서(단, [8]은 자체 스타일만 사용)
내장 image_gen 도구로 이미지를 생성하라. Google 도구 금지, 반드시 내장 image_gen만 사용.
저장 경로:
- [0]~[6] → public/brand/loading/0.png ~ public/brand/loading/6.png (정사각)
- [7] → public/brand/study.png (정사각)
- [8] → public/brand/icon.png (정사각, 1024 이상)
각 이미지 생성 후 "IMG i: SAVED <경로>" 한 줄씩 보고하고, 전부 끝나면 "DONE n/9"를 출력하라.
이미지 안에 글자·숫자가 절대 들어가면 안 된다.
PROMPT

echo "=== RUN 2: u1l3 comic (7 images) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/u1l3_imagen_prompts.txt 파일을 읽어라. [0]~[6] 일곱 개의 만화 컷 프롬프트가 있다.
각 프롬프트 앞에 파일 상단의 "공통 스타일" 블록을 붙여서 내장 image_gen 도구로 4:3 가로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용.
저장 경로: public/comics/u1l3/0.png ~ public/comics/u1l3/6.png
각 이미지 생성 후 "IMG i: SAVED <경로>" 한 줄씩 보고하고, 전부 끝나면 "DONE n/7"을 출력하라.
이미지 안에 글자·숫자가 절대 들어가면 안 된다.
PROMPT

echo "=== ALL ORDERS DONE ==="
ls -la public/brand/loading public/brand 2>/dev/null | head -20
ls -la public/comics/u1l3 2>/dev/null | head -12
