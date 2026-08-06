#!/usr/bin/env bash
# 사회 Ⅻ 재발주 1건 — u12l5(세 개의 문): 초판이 가운데·오른쪽 원 간판을 빈 원으로 남김(픽토그램 누락).
# bash qa/order-soc12-fix.sh  (app 루트에서) → node qa/process-soc12-only.mjs
set -u
cd "$(dirname "$0")/.."

codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/soc12_prompts.txt 파일의 "스타일 블록 A"를 읽고, 아래 프롬프트 앞에 붙여 내장 image_gen 도구로
이미지 1장을 생성하라. Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 가로 4:3.
저장 경로: public/soc/cuts/u12l5.png (기존 파일 덮어쓰기).
이미지 안에 글자·숫자·말풍선·기호 절대 금지(간판의 그림 픽토그램만 허용).
반드시 지켜라: 세 개의 둥근 간판 각각에 픽토그램이 "모두" 그려져야 한다 — 빈 원 금지.

Three friendly building fronts side by side in a row, each with one big door: the left building has a
triangular roof pediment with four columns, the middle building is a tall flat-roofed hall, the right
building is a smaller round-roofed office. Above each door hangs one round sign, and EVERY one of the
three round signs MUST contain a clearly drawn line pictogram inside it (no empty circles anywhere):
the LEFT sign contains a small wooden gavel pictogram, the MIDDLE sign contains an open book with a
small balance scale pictogram above it, the RIGHT sign contains a pictogram of two hands clasped in a
handshake. One stick figure carrying a shield with a small visible dent stands in front, facing the
three doors, one hand raised about to knock on the middle door. Exactly five fingers on the raised
hand. Only the three round signs (their rims and pictograms) are teal; everything else pure black and
white.

이미지 생성 후 "IMG 5: SAVED public/soc/cuts/u12l5.png"를 출력하고 "DONE 1/1"을 출력하라.
PROMPT

echo "=== SOC12 FIX DONE ==="
ls public/soc/cuts/u12l5.png 2>/dev/null
