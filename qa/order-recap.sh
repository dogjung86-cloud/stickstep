#!/usr/bin/env bash
# recap 자세히 보강 그림 6장 — codex auth의 ChatGPT image_gen 사용. bash qa/order-recap.sh
set -u
cd "$(dirname "$0")/.."
mkdir -p public/recap

codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/recap_prompts.txt 파일을 읽어라. [0]~[5] 여섯 개의 일러스트 프롬프트가 있다.
각 프롬프트 앞에 "공통 스타일" 블록을 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 이미지 안에 글자·숫자·알파벳 절대 금지.
저장 경로(순서대로):
[0]→public/recap/u4-ice-lattice.png
[1]→public/recap/u5-moon-scale.png
[2]→public/recap/u5-friction-zoom.png
[3]→public/recap/u7-star-trails.png
[4]→public/recap/u7-phase-map.png
[5]→public/recap/g2u1-boiling-pressure.png
각 이미지 생성 후 "IMG i: SAVED <경로>" 한 줄씩 보고하고, 끝나면 "DONE n/6"을 출력하라.
PROMPT

echo "=== RECAP ART DONE ==="
ls public/recap 2>/dev/null
