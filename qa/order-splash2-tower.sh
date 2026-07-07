#!/usr/bin/env bash
# 로딩 플립북 v2(8) + 증류탑 용도 일러스트(6) 연속 발주 — codex auth의 ChatGPT image_gen 사용.
# bash qa/order-splash2-tower.sh  (app 루트에서)
set -u
cd "$(dirname "$0")/.."
mkdir -p public/brand/loading public/chem/tower

echo "=== RUN 1: splash loading v2 (8 images) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/brand_loading2_prompts.txt 파일을 읽어라. [0]~[7] 여덟 개의 이미지 프롬프트가 있다.
각 프롬프트 앞에 파일 상단의 "공통 스타일" 블록을 붙여서 내장 image_gen 도구로 정사각 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용.
저장 경로:
- [0]~[6] → public/brand/loading/0.png ~ public/brand/loading/6.png
- [7] → public/brand/study.png
글자 규칙: [0]~[6]에는 글자·숫자가 절대 들어가면 안 된다.
[7]만 예외 — 머리띠에 한글 "공부하자!"가 반드시 또렷하게 적혀 있어야 한다.
[7] 생성 후 이미지를 열어 머리띠 글자가 정확히 "공부하자!"로 읽히는지 확인하고,
글자가 깨졌거나 다른 글자면 최대 2회까지 다시 생성해 가장 좋은 것을 저장하라.
각 이미지 생성 후 "IMG i: SAVED <경로>" 한 줄씩 보고하고, 전부 끝나면 "DONE n/8"을 출력하라.
PROMPT

echo "=== RUN 2: crude tower usage illustrations (6 images) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/tower_prompts.txt 파일을 읽어라. [0]~[5] 여섯 개의 일러스트 프롬프트가 있다.
각 프롬프트 앞에 파일 상단의 "공통 스타일" 블록을 붙여서 내장 image_gen 도구로 정사각 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용.
저장 경로(순서대로):
- [0] → public/chem/tower/lpg.png
- [1] → public/chem/tower/gasoline.png
- [2] → public/chem/tower/kerosene.png
- [3] → public/chem/tower/diesel.png
- [4] → public/chem/tower/heavy.png
- [5] → public/chem/tower/asphalt.png
이미지 안에 글자·숫자가 절대 들어가면 안 된다.
각 이미지 생성 후 "IMG i: SAVED <경로>" 한 줄씩 보고하고, 전부 끝나면 "DONE n/6"을 출력하라.
PROMPT

echo "=== ALL ORDERS DONE ==="
ls -la public/brand/loading public/brand 2>/dev/null | head -22
ls -la public/chem/tower 2>/dev/null | head -10
