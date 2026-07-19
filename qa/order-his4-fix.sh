#!/usr/bin/env bash
# h1u4 재발주 — l3-4(마르코 폴로 귀향 컷)만: 1차본이 베네치아 귀향인데 동아시아풍(기와지붕·장독)으로
# 나와 기각(눈검수). 유럽 배경을 문장으로 명시해 단일 컷 재발주한다.
# 실행 전제: qa/his4-order.log의 "HIS4 ORDER DONE" 마커 확인(병렬 codex 금지 절차).
# bash qa/order-his4-fix.sh  (app 루트에서)
set -u
cd "$(dirname "$0")/.."

codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/his4_prompts.txt 파일을 읽어라. "스타일 블록 C"와 [a4] 프롬프트를 찾아라.
[a4]의 장면 지시를 다음 수정 사항과 합쳐 내장 image_gen 도구로 이미지 1장을 생성하라(Google 도구 금지).
수정 사항(중요): 배경은 반드시 유럽 베네치아풍 — European stone house with an arched doorway and
shuttered window, Venetian canal and arched bridge skyline in the background. Absolutely NOT East Asian:
no curved tiled roofs with upturned eaves, no Korean/Chinese storage jars, no lanterns.
나머지 계약은 그대로: 이미지 안 글자·숫자·말풍선 절대 금지, 인물은 말하는 연기(입 벌림·손짓)만,
상단 1/3 여백, 주인공 가로 중앙, 4:3 가로, teal 원포인트는 솔기에서 쏟아지는 보석.
저장 경로: public/comics/h1u4l3/4.png (덮어쓰기).
저장 후 "IMG a4: SAVED public/comics/h1u4l3/4.png"를 출력하고 "FIX DONE 1/1"을 출력하라.
PROMPT

echo "=== HIS4 FIX DONE ==="
