#!/usr/bin/env bash
# 주기율표 만화 4·6컷 재발주 — 표 칸 안에 "실제 원소 기호"를 넣는 버전.
# (만화의 '이미지 안 글자 금지' 규칙의 의도적 예외 — 사용자 요청. 기호 외 다른 글자는 여전히 금지)
# bash qa/order-g2u4l4-sym.sh  (app 루트에서)
set -u
cd "$(dirname "$0")/.."
mkdir -p public/comics/g2u4l4

codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
아래 두 이미지를 내장 image_gen 도구로 생성하라. Google 도구 금지.
스타일(두 장 공통): hand-drawn stick figure comic panel, black ink on clean white paper, thin uniform
line weight, xkcd / whiteboard-marker doodle style, minimalist line art, no shading, flat, charming
educational. Square 1:1, single panel, generous white space. NOT 3D, NOT photorealistic, NOT anime.
글자 규칙: 원소 기호(H, He, Li 같은 1~2글자)만 허용. 그 외 단어·문장·숫자·말풍선 절대 금지.

[4] 저장: public/comics/g2u4l4/4.png (덮어쓰기)
The bearded stick-figure Mendeleev (big bushy beard, long wild hair, plain coat) stands confidently
beside a large wall board showing a hand-drawn grid of element cards, about 4 columns x 4 rows.
Most cards each contain ONE large clear hand-written element symbol: H, Li, Be, B, C, N, O, F, Na,
Mg, Al, Si, K, Ca. Exactly TWO cells in the grid are EMPTY, drawn only as dashed-outline rectangles
(teal dashed lines, the only color) — one empty cell below Al, one below Si. Mendeleev points firmly
at one dashed empty cell with a long pointer stick, chin up, confident smile. Two skeptical
stick-figure onlookers at the side shrug with palms up. The element symbols must be large, legible,
correctly spelled, one per cell. No other text anywhere.

[6] 저장: public/comics/g2u4l4/6.png (덮어쓰기)
The recurring stick-figure scientist in modern look (round head, two tiny round glasses, short lab
coat) stands proudly pointing with a pointer stick at a large wall chart of the periodic table,
drawn in the iconic castle-like silhouette using ONLY the first 20 elements, big cells so the
symbols stay legible: top row H (far left) and He (far right); second row Li, Be on the left and
B, C, N, O, F, Ne on the right; third row Na, Mg on the left and Al, Si, P, S, Cl, Ar on the right;
fourth row K, Ca on the far left. Each cell contains its ONE large clear hand-written element
symbol, correctly spelled. The leftmost vertical column (H, Li, Na, K) is tinted teal — the only
color. Proud teacher mood. No other text anywhere.

각 생성 후 이미지를 열어 기호 철자가 정확한지(H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca)
확인하고, 철자가 깨졌으면 최대 2회 다시 생성해 가장 정확한 것을 저장하라.
각 이미지 생성 후 "IMG i: SAVED <경로>"를 보고하고, 끝나면 "DONE n/2"를 출력하라.
PROMPT

echo "=== G2U4L4 SYM DONE ==="
