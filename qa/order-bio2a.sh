#!/usr/bin/env bash
# 중1 II 상호작용 아트 A — 세포 2 + 동물 단계 4. bash qa/order-bio2a.sh
set -u
cd "$(dirname "$0")/.."
mkdir -p public/bio2/cells public/bio2/levels

codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/bio2a_prompts.txt 파일을 읽어라. [0]~[5] 여섯 개의 일러스트 프롬프트가 있다.
각 프롬프트 앞에 "공통 스타일" 블록을 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 이미지 안에 글자·숫자·알파벳·라벨 절대 금지.
저장 경로(순서대로):
[0]→public/bio2/cells/animal.png
[1]→public/bio2/cells/plant.png
[2]→public/bio2/levels/muscle-cell.png
[3]→public/bio2/levels/muscle-tissue.png
[4]→public/bio2/levels/heart.png
[5]→public/bio2/levels/circulatory.png
각 이미지 생성 후 "IMG i: SAVED <경로>" 한 줄씩 보고하고, 끝나면 "DONE n/6"을 출력하라.
PROMPT

echo "=== BIO2A DONE ==="
ls public/bio2/cells public/bio2/levels 2>/dev/null
