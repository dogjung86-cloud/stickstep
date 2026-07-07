#!/usr/bin/env bash
# 지권 추가 발주 6장 — codex auth의 ChatGPT image_gen 사용. bash qa/order-geo2.sh
set -u
cd "$(dirname "$0")/.."
mkdir -p public/geo/drift public/geo/figs

codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/geo2_prompts.txt 파일을 읽어라. [0]~[5] 여섯 개의 일러스트 프롬프트가 있다.
각 프롬프트 앞에 "공통 스타일" 블록을 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 이미지 안에 글자·숫자·알파벳 절대 금지.
저장 경로(순서대로):
[0]→public/geo/drift/stage-pangaea.png
[1]→public/geo/drift/stage-break.png
[2]→public/geo/drift/stage-drift.png
[3]→public/geo/drift/stage-now.png
[4]→public/geo/figs/worldmap.png
[5]→public/geo/figs/plate-section.png
[4]는 대륙 모양이 실제 지리와 알아볼 수 있게 닮아야 한다 — 생성 후 이미지를 열어
남북아메리카·아프리카·유라시아·오스트레일리아가 실제와 닮았는지 확인하고,
많이 다르면 최대 2회 다시 생성해 가장 정확한 것을 저장하라.
각 이미지 생성 후 "IMG i: SAVED <경로>" 한 줄씩 보고하고, 끝나면 "DONE n/6"을 출력하라.
PROMPT

echo "=== GEO2 DONE ==="
ls public/geo/drift public/geo/figs 2>/dev/null
