#!/usr/bin/env bash
# 로딩 플립북 v2 추가 발주 — 놀이 7컷(loading/7..13) + 공부 정착 컷 수정(study).
# bash qa/order-splash2b.sh  (app 루트에서)
set -u
cd "$(dirname "$0")/.."
mkdir -p public/brand/loading

codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/brand_loading2b_prompts.txt 파일을 읽어라. [0]~[7] 여덟 개의 이미지 프롬프트가 있다.
각 프롬프트 앞에 파일 상단의 "공통 스타일" 블록을 붙여서 내장 image_gen 도구로 정사각 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용.
저장 경로:
- [0] → public/brand/loading/7.png
- [1] → public/brand/loading/8.png
- [2] → public/brand/loading/9.png
- [3] → public/brand/loading/10.png
- [4] → public/brand/loading/11.png
- [5] → public/brand/loading/12.png
- [6] → public/brand/loading/13.png
- [7] → public/brand/study.png (기존 파일 덮어쓰기)
글자 규칙: [0]~[6]에는 글자·숫자·알파벳이 절대 들어가면 안 된다(음표·하트는 허용).
[7]만 예외 — 머리띠에 한글 "공부하자!"가 반드시 또렷하게 적혀 있어야 한다.
[7] 생성 후 이미지를 열어 ① 머리띠 글자가 정확히 "공부하자!"로 읽히는지 ② 책상에 앉은
상반신 구도(머리가 화면의 절반 정도, 하단에 책상·공책)인지 확인하고, 아니면 최대 2회까지
다시 생성해 가장 좋은 것을 저장하라.
각 이미지 생성 후 "IMG i: SAVED <경로>" 한 줄씩 보고하고, 전부 끝나면 "DONE n/8"을 출력하라.
PROMPT

echo "=== ORDER 2B DONE ==="
ls -la public/brand/loading public/brand 2>/dev/null | head -30
