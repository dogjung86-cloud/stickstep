#!/usr/bin/env bash
# his4x 재발주 fix — h1u4l10(루터) 7컷 전체: 1차본이 그림책 볼륨 톤으로 이탈(y4·y5 두드러짐).
# Ⅲ 구텐베르크 만화(h1u3l10)와 직접 연결되는 서사라 스타일 통일 필수.
# 반드시 본 발주 "HIS4X ORDER DONE" 마커 확인 후 실행(병렬 codex 금지).
# bash qa/order-his4x-fix.sh → ONLY=h1u4l10 node qa/process-comics.mjs
set -u
cd "$(dirname "$0")/.."

codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/his4x_prompts.txt 파일을 읽어라. [y0]~[y6] 일곱 개의 만화 컷 프롬프트가 있다(h1u4l10).
각 프롬프트 앞에 파일의 "스타일 블록 C"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로(기존 png 덮어쓰기).
스타일 강제(1차본이 그림책 아동 삽화풍으로 이탈한 재발주다 — 반드시 지켜라):
인물은 미니멀 스틱 피겨만 허용. 머리 = 속이 빈 단순한 원, 눈 = 작은 점 2개, 입 = 작은 선/타원.
머리카락은 최소 외곽선이나 얇은 실루엣만 — 빽빽한 머리숱·통통한 뺨·상세한 이목구비 절대 금지.
발주 전에 public/comics/h1u3l10/2.webp 와 public/comics/h1u3l10/4.webp 를 열어 인물 스타일을
확인하고 그 스타일 그대로 그려라(직접 연결되는 인쇄술 만화의 합격 기준본 — 같은 톤이어야 한다).
핵심 계약: 이미지 안에 글자·숫자·말풍선 절대 금지(문서·전단은 추상 잔줄만), 인물은 말하는 연기만,
상단 1/3 여백. 전투·유혈 절대 금지. 십자가·성상 등 종교 상징물 절대 금지(성당은 문·탑 외관만).
루터·성직자·구교·신교 모두 희화 절대 금지(개그는 인쇄소 조수·시민 몫).
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/7"을 출력하라.
PROMPT

echo "=== HIS4X FIX DONE ==="
ls public/comics/h1u4l10 2>/dev/null
