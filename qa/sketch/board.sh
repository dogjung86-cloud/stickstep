#!/usr/bin/env bash
# 만화 한 편의 앱 화면 캡처를 한 장으로 모은다.
# 사용: bash qa/sketch/board.sh <레슨 id> "<지도 노드 이름>" "<단원 탭 머리글자>" <출력 png>
#   예: bash qa/sketch/board.sh u3l3 "열의 이동" "III." "D:/Brilliant Science/output/sketch-art-sample/만화/u3l3.png"
set -e
ID="$1"; LABEL="$2"; UNIT="$3"; OUT="$4"
DIR="qa/shots/board-$ID"
rm -rf "$DIR"
ONLY=390x700 NOVIDEO=1 COMIC="$ID:$LABEL" UNIT="$UNIT" PORT="${PORT:-5537}" node qa/shot-sketch.mjs "$DIR" | tail -2
N=$(ls "$DIR" | grep -c "^$ID-cut")
COLS=4; ROWS=$(( (N + COLS - 1) / COLS ))
mkdir -p "$(dirname "$OUT")"
ffmpeg -y -loglevel error -start_number 1 -i "$DIR/$ID-cut%d-390x700-now.png" -vf "scale=585:-1,tile=${COLS}x${ROWS}:padding=12:margin=12:color=0xF3F5F8" -frames:v 1 "$OUT"
echo "board: $OUT ($N컷)"
